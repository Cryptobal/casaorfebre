/**
 * Remediación del incidente de auto-confirmación.
 *
 * El cron `auto-confirm-receipt` (versión anterior al fix del PR #41) marcó por
 * error varios OrderItem como DELIVERED por inactividad (>10 días sin que el
 * comprador confirmara recepción). Eso preparó pagos y disparó mails de
 * "venta/pago" a orfebres sin que hubiera entregas reales.
 *
 * Este script revierte ese daño en los datos. NO envía correos (eso lo hace
 * `send-apology-email.ts` en un paso posterior).
 *
 * Modo seguro por defecto: DRY-RUN. No escribe nada salvo que se pase --apply.
 *
 * Uso:
 *   npx tsx scripts/remediate-auto-confirm-incident.ts                # dry-run
 *   npx tsx scripts/remediate-auto-confirm-incident.ts --apply        # aplica
 *   npx tsx scripts/remediate-auto-confirm-incident.ts --since-hours 96
 */

import "dotenv/config";
import { prisma } from "@/lib/prisma";

const APPLY = process.argv.includes("--apply");

function parseSinceHours(): number {
  const idx = process.argv.indexOf("--since-hours");
  if (idx !== -1 && process.argv[idx + 1]) {
    const n = Number(process.argv[idx + 1]);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error(`--since-hours inválido: ${process.argv[idx + 1]}`);
    }
    return n;
  }
  return 72; // default
}

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

async function main() {
  const sinceHours = parseSinceHours();
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

  console.log("=".repeat(72));
  console.log(
    `Remediación incidente auto-confirmación — modo ${
      APPLY ? "APPLY (escribe en BD)" : "DRY-RUN (no escribe nada)"
    }`,
  );
  console.log(
    `Ventana: autoReceivedAt >= ${since.toISOString()} (--since-hours ${sinceHours})`,
  );
  console.log("=".repeat(72));

  // Identificación estricta de items afectados:
  //  - fulfillmentStatus DELIVERED (lo dejó el cron buggy)
  //  - autoReceivedAt dentro de la ventana (lo setea el cron)
  //  - receivedAt === null  → el comprador NUNCA confirmó. Esto excluye
  //    entregas legítimas (donde receivedAt está poblado).
  const affected = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: "DELIVERED",
      autoReceivedAt: { gte: since },
      receivedAt: null,
    },
    include: {
      artisan: {
        select: {
          displayName: true,
          user: { select: { email: true } },
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          userId: true,
        },
      },
    },
    orderBy: { autoReceivedAt: "asc" },
  });

  if (affected.length === 0) {
    console.log(
      "\nNo se encontraron items afectados con el criterio indicado. Nada que hacer.",
    );
    return;
  }

  // Clasificación.
  const toRevert: typeof affected = []; // se revierten normalmente
  const paymentsToHold: typeof affected = []; // payoutStatus PENDING|RELEASED → HELD
  const paidAlert: typeof affected = []; // payoutStatus PAID → NO TOCAR, alerta manual

  for (const item of affected) {
    if (item.payoutStatus === "PAID") {
      paidAlert.push(item);
      continue;
    }
    toRevert.push(item);
    if (item.payoutStatus === "PENDING" || item.payoutStatus === "RELEASED") {
      paymentsToHold.push(item);
    }
  }

  // ---- Reporte detallado ----
  console.log(`\nItems afectados encontrados: ${affected.length}`);
  console.log(`  • A revertir (DELIVERED → AUTO_CONFIRMED): ${toRevert.length}`);
  console.log(
    `  • Pagos a devolver a HELD (estaban PENDING/RELEASED): ${paymentsToHold.length}`,
  );
  console.log(`  • ⚠️  ALERTA PAID (revisión manual, NO se tocan): ${paidAlert.length}`);

  console.log("\n--- Detalle de items a revertir ---");
  for (const it of toRevert) {
    const holdNote =
      it.payoutStatus === "PENDING" || it.payoutStatus === "RELEASED"
        ? ` | pago ${it.payoutStatus} → HELD (payoutAt → null)`
        : ` | pago ${it.payoutStatus} (sin cambio de payoutStatus)`;
    console.log(
      `  [${it.id}] Pedido #${it.order.orderNumber} | ${it.artisan.displayName}` +
        ` | "${it.productName}" | payout ${clp.format(it.artisanPayout)}` +
        ` | payoutEligibleAt → null${holdNote}`,
    );
  }

  if (paidAlert.length > 0) {
    console.log("\n--- ⚠️  ALERTA: items con payoutStatus PAID (NO se modifican) ---");
    console.log(
      "    Estos representan plata YA transferida por piezas no confirmadas.",
    );
    console.log("    Requieren revisión manual / recuperación de fondos.");
    for (const it of paidAlert) {
      console.log(
        `  ⚠️  [${it.id}] Pedido #${it.order.orderNumber} | ${it.artisan.displayName}` +
          ` | "${it.productName}" | payout PAGADO ${clp.format(it.artisanPayout)}` +
          ` | payoutAt ${it.payoutAt ? it.payoutAt.toISOString() : "—"}` +
          ` | email ${it.artisan.user?.email ?? "—"}`,
      );
    }
  }

  // ---- Pedidos a revertir (DELIVERED → PAID) ----
  // Un pedido se revierte si está DELIVERED y, tras revertir sus items afectados,
  // ya NO todos sus items quedan en DELIVERED.
  const orderIds = [...new Set(toRevert.map((it) => it.order.id))];
  const ordersToRevert: {
    id: string;
    orderNumber: string;
  }[] = [];

  for (const orderId of orderIds) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        items: { select: { id: true, fulfillmentStatus: true } },
      },
    });
    if (!order || order.status !== "DELIVERED") continue;

    const revertedIds = new Set(
      toRevert.filter((it) => it.order.id === orderId).map((it) => it.id),
    );
    // Estado proyectado tras la reversión.
    const allStillDelivered = order.items.every((oi) =>
      revertedIds.has(oi.id) ? false : oi.fulfillmentStatus === "DELIVERED",
    );
    if (!allStillDelivered) {
      ordersToRevert.push({ id: order.id, orderNumber: order.orderNumber });
    }
  }

  console.log(`\n--- Pedidos a revertir (DELIVERED → PAID): ${ordersToRevert.length} ---`);
  for (const o of ordersToRevert) {
    console.log(`  Pedido #${o.orderNumber} (${o.id}): DELIVERED → PAID`);
  }

  // ---- Aplicar (solo con --apply) ----
  if (APPLY) {
    console.log("\n>>> Aplicando cambios en la base de datos...");
    let revertedItems = 0;
    let heldPayments = 0;

    for (const it of toRevert) {
      const revertPayment =
        it.payoutStatus === "PENDING" || it.payoutStatus === "RELEASED";
      await prisma.orderItem.update({
        where: { id: it.id },
        data: {
          fulfillmentStatus: "AUTO_CONFIRMED",
          payoutEligibleAt: null,
          ...(revertPayment ? { payoutStatus: "HELD", payoutAt: null } : {}),
          // receivedAt, autoReceivedAt y deliveredAt se conservan como evidencia.
        },
      });
      revertedItems++;
      if (revertPayment) heldPayments++;
    }

    let revertedOrders = 0;
    for (const o of ordersToRevert) {
      await prisma.order.update({
        where: { id: o.id },
        data: { status: "PAID" },
      });
      revertedOrders++;
    }

    console.log(">>> Cambios aplicados.");
    console.log(`    Items revertidos a AUTO_CONFIRMED: ${revertedItems}`);
    console.log(`    Pagos devueltos a HELD: ${heldPayments}`);
    console.log(`    Pedidos revertidos a PAID: ${revertedOrders}`);
    if (paidAlert.length > 0) {
      console.log(
        `    ⚠️  Items PAID NO tocados (revisión manual): ${paidAlert.length}`,
      );
    }
  }

  // ---- Emails únicos de orfebres afectados (para el Paso 2) ----
  const emails = [
    ...new Set(
      affected
        .map((it) => it.artisan.user?.email)
        .filter((e): e is string => !!e),
    ),
  ];

  console.log("\n" + "=".repeat(72));
  console.log(`Orfebres afectados (emails únicos): ${emails.length}`);
  for (const e of emails) console.log(`  ${e}`);
  console.log("\nFormato para el script de disculpa (--emails):");
  console.log(`  ${emails.join(",")}`);
  console.log("=".repeat(72));

  if (!APPLY) {
    console.log(
      "\nDRY-RUN: no se modificó nada. Si la lista de arriba es correcta, vuelve a",
    );
    console.log(
      "correr con --apply:\n  npx tsx scripts/remediate-auto-confirm-incident.ts --apply",
    );
  }
}

main()
  .catch((e) => {
    console.error("\nError durante la remediación:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

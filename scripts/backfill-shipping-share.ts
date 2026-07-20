/**
 * Backfill de OrderItem.shippingShare para pedidos históricos.
 *
 * El campo `shippingShare` se empezó a poblar en el checkout a partir del
 * traspaso del costo de envío al orfebre. Los pedidos anteriores tienen
 * `shippingShare = 0`, por lo que la nómina, los emails y las vistas
 * orfebre/admin mostraban solo el payout del producto (sin el despacho).
 *
 * Este script reconstruye el share por ítem, prorrateando la tarifa de envío
 * por la participación del ítem en el subtotal del pedido:
 *
 *   share = round( (productPrice * quantity / order.subtotal) * base )
 *
 * donde `base` es:
 *   - `order.shippingCost`      si el comprador pagó envío (> 0)
 *   - `zone.price` de la zona activa que cubre `order.shippingRegion`
 *                              si el pedido tuvo envío gratis (shippingCost = 0)
 *
 * Si no hay zona activa que cubra la región de un pedido con envío gratis, el
 * share queda en 0 y se reporta para revisión manual.
 *
 * Modo seguro por defecto: DRY-RUN. No escribe nada salvo que se pase --apply.
 *
 * Uso:
 *   npx tsx scripts/backfill-shipping-share.ts            # dry-run (solo reporta)
 *   npx tsx scripts/backfill-shipping-share.ts --apply    # aplica en la BD
 */

import "dotenv/config";
import { prisma } from "@/lib/prisma";

const APPLY = process.argv.includes("--apply");

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

async function main() {
  console.log("=".repeat(72));
  console.log(
    `Backfill shippingShare — modo ${
      APPLY ? "APPLY (escribe en BD)" : "DRY-RUN (no escribe nada)"
    }`,
  );
  console.log("=".repeat(72));

  // Zonas activas para reconstruir la tarifa base en pedidos con envío gratis.
  const zones = await prisma.shippingZone.findMany({ where: { isActive: true } });
  const zonePriceForRegion = (region: string): number | null => {
    const zone = zones.find((z) => z.regions.includes(region));
    return zone ? zone.price : null;
  };

  // Solo ventas reales: excluye pedidos nunca pagados (PENDING_PAYMENT) y
  // cancelados, igual que las vistas de finanzas.
  const items = await prisma.orderItem.findMany({
    where: {
      shippingShare: 0,
      order: { status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] } },
    },
    include: { order: true },
    orderBy: { createdAt: "asc" },
  });

  if (items.length === 0) {
    console.log(
      "\nNo hay items con shippingShare = 0 en pedidos válidos. Nada que hacer.",
    );
    return;
  }

  type Plan = {
    id: string;
    orderNumber: string;
    productName: string;
    share: number;
  };
  const toWrite: Plan[] = [];
  const noZone: {
    orderNumber: string;
    productName: string;
    region: string;
  }[] = [];

  for (const item of items) {
    const order = item.order;
    const itemTotal = item.productPrice * item.quantity;

    let base: number;
    if (order.shippingCost > 0) {
      base = order.shippingCost;
    } else {
      const zonePrice = zonePriceForRegion(order.shippingRegion);
      if (zonePrice === null) {
        // Sin zona activa que cubra la región: no podemos reconstruir la tarifa.
        // El share queda en 0 (default) y se reporta.
        noZone.push({
          orderNumber: order.orderNumber,
          productName: item.productName,
          region: order.shippingRegion,
        });
        continue;
      }
      base = zonePrice;
    }

    const share =
      order.subtotal > 0 ? Math.round((itemTotal / order.subtotal) * base) : 0;
    toWrite.push({
      id: item.id,
      orderNumber: order.orderNumber,
      productName: item.productName,
      share,
    });
  }

  // ---- Reporte ----
  console.log(`\nItems candidatos (shippingShare = 0): ${items.length}`);
  console.log(`  • Con share reconstruido: ${toWrite.length}`);
  console.log(
    `  • Sin zona activa para su región (share = 0, no se escribe): ${noZone.length}`,
  );

  console.log("\n--- Detalle: orderNumber | producto | share calculado ---");
  for (const p of toWrite) {
    console.log(`  #${p.orderNumber} | ${p.productName} | ${clp.format(p.share)}`);
  }

  if (noZone.length > 0) {
    console.log(
      "\n--- ⚠️  Sin zona activa que cubra la región (share queda en 0) ---",
    );
    for (const n of noZone) {
      console.log(`  #${n.orderNumber} | ${n.productName} | región "${n.region}"`);
    }
  }

  // ---- Aplicar (solo con --apply) ----
  if (APPLY) {
    console.log("\n>>> Aplicando cambios en la base de datos...");
    let written = 0;
    for (const p of toWrite) {
      // El default ya es 0; solo escribimos shares con valor.
      if (p.share === 0) continue;
      await prisma.orderItem.update({
        where: { id: p.id },
        data: { shippingShare: p.share },
      });
      written++;
    }
    console.log(`>>> Cambios aplicados. Items actualizados: ${written}`);
    if (noZone.length > 0) {
      console.log(
        `    ⚠️  Items sin zona (share = 0, sin cambios): ${noZone.length}`,
      );
    }
  } else {
    console.log(
      "\nDRY-RUN: no se modificó nada. Si la tabla de arriba es correcta, vuelve a",
    );
    console.log(
      "correr con --apply:\n  npx tsx scripts/backfill-shipping-share.ts --apply",
    );
  }
}

main()
  .catch((e) => {
    console.error("\nError durante el backfill:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

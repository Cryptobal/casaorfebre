/**
 * Mail de disculpa a los orfebres afectados por el incidente de auto-confirmación.
 *
 * Varios orfebres recibieron correos automáticos de "entrega"/"pago" disparados
 * por un error técnico interno (cron auto-confirm-receipt, versión previa al fix
 * del PR #41). No hubo venta, entrega ni pago real. Este script les envía una
 * aclaración y disculpa.
 *
 * Modo seguro por defecto: DRY-RUN. No envía nada salvo que se pase --send.
 *
 * Destinatarios:
 *   --emails "a@x.cl,b@y.cl"   lista separada por comas
 *   --from-file               lee scripts/affected-emails.json (array de strings)
 *
 * Uso:
 *   npx tsx scripts/send-apology-email.ts --emails "a@x.cl,b@y.cl"            # dry-run
 *   npx tsx scripts/send-apology-email.ts --emails "a@x.cl,b@y.cl" --send     # envía
 *   npx tsx scripts/send-apology-email.ts --from-file --send
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { sendEmail } from "@/lib/emails/templates";

const SEND = process.argv.includes("--send");
const FINANZAS_URL = "https://casaorfebre.cl/portal/orfebre/finanzas";
const SUBJECT = "Aclaración importante sobre un correo que recibiste — Casa Orfebre";

function getRecipients(): string[] {
  const emails: string[] = [];

  const idx = process.argv.indexOf("--emails");
  if (idx !== -1 && process.argv[idx + 1]) {
    emails.push(
      ...process.argv[idx + 1]
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    );
  }

  if (process.argv.includes("--from-file")) {
    const file = path.join(process.cwd(), "scripts", "affected-emails.json");
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`${file} debe ser un array de strings (emails).`);
    }
    emails.push(...parsed.map((e: unknown) => String(e).trim()).filter(Boolean));
  }

  // Deduplicar (case-insensitive en el dominio, preservando la primera forma).
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const e of emails) {
    const key = e.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(e);
    }
  }
  return unique;
}

function buildHtml(): string {
  // NO se envuelve en otro layout: sendEmail ya aplica el layout de marca.
  return `
    <p style="margin:0 0 16px;">Hola,</p>

    <p style="margin:0 0 16px;">
      Hace unos días pudiste haber recibido uno o más correos automáticos
      nuestros avisando sobre la <strong>entrega</strong> o el <strong>pago</strong>
      de alguna de tus piezas. Te escribimos para aclararlo cuanto antes.
    </p>

    <p style="margin:0 0 16px;">
      Esos correos se enviaron por <strong>un error técnico interno</strong> y
      <strong>no reflejan una venta, entrega ni pago real</strong>. Ningún monto
      fue cobrado, transferido ni modificado, y el estado real de tus piezas no
      cambió.
    </p>

    <p style="margin:0 0 24px;">
      Lamentamos mucho la confusión que esto pudo haberte causado. Ya corregimos
      el problema para que no vuelva a ocurrir.
    </p>

    <p style="margin:0 0 16px;">
      Puedes revisar el estado real de tus piezas y pagos cuando quieras en tu
      portal:
    </p>

    <p style="margin:0 0 24px;">
      <a href="${FINANZAS_URL}"
         style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">
        Ver el estado real en mi portal
      </a>
    </p>

    <p style="margin:0 0 24px;">
      Y si tienes cualquier duda, puedes simplemente responder este correo y te
      ayudamos personalmente.
    </p>

    <p style="margin:0;">
      Un abrazo,<br/>
      <strong>Carlos y Camila</strong>
    </p>
  `;
}

async function main() {
  const recipients = getRecipients();
  const html = buildHtml();

  console.log("=".repeat(72));
  console.log(
    `Mail de disculpa — modo ${
      SEND ? "SEND (envía de verdad)" : "DRY-RUN (no envía nada)"
    }`,
  );
  console.log("=".repeat(72));
  console.log(`Asunto: ${SUBJECT}`);
  console.log(`Destinatarios (${recipients.length}):`);
  for (const r of recipients) console.log(`  ${r}`);

  if (recipients.length === 0) {
    console.log(
      "\nNo hay destinatarios. Usa --emails \"a@x.cl,b@y.cl\" o --from-file.",
    );
    return;
  }

  if (!SEND) {
    console.log("\n--- Vista previa del cuerpo (HTML) ---");
    console.log(html.trim());
    console.log(
      "\nDRY-RUN: no se envió nada. Para enviar de verdad, añade --send.",
    );
    return;
  }

  console.log("\n>>> Enviando uno por uno...");
  let sent = 0;
  let failed = 0;
  for (const to of recipients) {
    try {
      const res = await sendEmail(to, SUBJECT, html);
      if (res) {
        console.log(`  ✓ ${to}`);
        sent++;
      } else {
        // sendEmail devuelve null si Resend reportó error (ya lo logueó).
        console.log(`  ✗ ${to} (Resend reportó error)`);
        failed++;
      }
    } catch (e) {
      console.log(`  ✗ ${to} — ${e instanceof Error ? e.message : String(e)}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(72));
  console.log(`Resumen: enviados ${sent} / fallidos ${failed} / total ${recipients.length}`);
  console.log("=".repeat(72));
}

main().catch((e) => {
  console.error("\nError en el envío de disculpas:", e);
  process.exitCode = 1;
});

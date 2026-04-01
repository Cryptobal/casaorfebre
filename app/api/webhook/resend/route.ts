import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Resend webhook event types we handle
type ResendEventType =
  | "email.delivered"
  | "email.opened"
  | "email.bounced"
  | "email.complained"
  | "email.failed";

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    created_at: string;
  };
}

function verifySignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  // Resend uses svix for webhooks — signature format: "v1,<base64>"
  const parts = signature.split(" ");
  for (const part of parts) {
    const [version, sig] = part.split(",");
    if (version !== "v1") continue;
    // For svix, we need the timestamp from svix-timestamp header + payload
    // But simplified: just check the hmac
    try {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("base64");
      if (sig === expected) return true;
    } catch {
      continue;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (secret) {
      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error("Resend webhook: missing svix headers");
        return NextResponse.json({ error: "Missing headers" }, { status: 401 });
      }

      // Svix signature: sign "msgId.timestamp.body" with the secret
      const signedContent = `${svixId}.${svixTimestamp}.${body}`;
      const secretBytes = Buffer.from(
        secret.startsWith("whsec_") ? secret.slice(6) : secret,
        "base64",
      );
      const expectedSignature = crypto
        .createHmac("sha256", secretBytes)
        .update(signedContent)
        .digest("base64");

      const signatures = svixSignature.split(" ");
      const isValid = signatures.some((sig) => {
        const [, sigValue] = sig.split(",");
        return sigValue === expectedSignature;
      });

      if (!isValid) {
        console.error("Resend webhook: invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const event: ResendWebhookPayload = JSON.parse(body);
    const emailId = event.data.email_id;

    if (!emailId) {
      return NextResponse.json({ ok: true });
    }

    switch (event.type) {
      case "email.delivered": {
        await prisma.promoCode.updateMany({
          where: { emailMessageId: emailId },
          data: { deliveredAt: new Date() },
        });
        break;
      }

      case "email.opened": {
        // Only update if not already progressed past OPENED
        await prisma.promoCode.updateMany({
          where: {
            emailMessageId: emailId,
            openedAt: null,
          },
          data: {
            openedAt: new Date(),
            invitationStatus: "OPENED",
          },
        });
        // If already opened, just note the re-open (no status change)
        break;
      }

      case "email.bounced":
      case "email.failed": {
        await prisma.promoCode.updateMany({
          where: { emailMessageId: emailId },
          data: { invitationStatus: "EXPIRED" },
        });
        break;
      }

      case "email.complained": {
        await prisma.promoCode.updateMany({
          where: { emailMessageId: emailId },
          data: { isActive: false },
        });
        break;
      }
    }

    console.log(`Resend webhook processed: ${event.type} for ${emailId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Resend webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

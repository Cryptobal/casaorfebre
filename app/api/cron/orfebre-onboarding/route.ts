import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emails/templates";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

function daysSince(date: Date | null): number {
  if (!date) return 0;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/* ================================================================== */
/*  EMAIL TEMPLATES                                                    */
/* ================================================================== */

function welcomeEmail(displayName: string): { subject: string; html: string } {
  return {
    subject: `¡Bienvenido a Casa Orfebre, ${displayName}!`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
        <div style="text-align:center;margin:0 0 24px;">
          <span style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:6px 20px;border-radius:20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Bienvenido</span>
        </div>
        <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a18;text-align:center;margin:0 0 16px;line-height:1.3;">
          ¡Felicidades, ${displayName}!
        </h1>
        <p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.7;margin:0 0 24px;">
          Tu cuenta de orfebre ha sido aprobada. Ahora puedes publicar tus piezas y empezar a vender en la plataforma de joyería artesanal más importante de Chile.
        </p>
        <div style="background:#FAFAF8;border:1px solid #e8e4de;border-radius:12px;padding:28px 24px;margin:0 0 28px;">
          <p style="font-size:11px;color:#8B7355;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;text-align:center;font-weight:600;">Tu primer paso</p>
          <div style="font-size:14px;color:#4a4a48;padding:8px 0;border-bottom:1px solid #f0ece6;">
            <span style="color:#8B7355;margin-right:8px;">&#10003;</span> Publica tu primera pieza con fotos y descripción
          </div>
          <div style="font-size:14px;color:#4a4a48;padding:8px 0;border-bottom:1px solid #f0ece6;">
            <span style="color:#8B7355;margin-right:8px;">&#10003;</span> Nuestra IA te ayuda a optimizar fotos y textos
          </div>
          <div style="font-size:14px;color:#4a4a48;padding:8px 0;">
            <span style="color:#8B7355;margin-right:8px;">&#10003;</span> Tu pieza aparecerá en Google Shopping automáticamente
          </div>
        </div>
        <p style="text-align:center;margin:0 0 24px;">
          <a href="${appUrl}/portal/orfebre/productos/nuevo" style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">Publicar mi primera pieza</a>
        </p>
        <p style="font-size:12px;color:#9e9a90;text-align:center;margin:0;">
          ¿Necesitas ayuda? Responde a este correo y te asistiremos personalmente.
        </p>
      </div>
    `,
  };
}

function helpEmail(displayName: string): { subject: string; html: string } {
  return {
    subject: `${displayName}, ¿necesitas ayuda para publicar tu primera pieza?`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
        <div style="text-align:center;margin:0 0 24px;">
          <span style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:6px 20px;border-radius:20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Te ayudamos</span>
        </div>
        <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a18;text-align:center;margin:0 0 16px;line-height:1.3;">
          ${displayName}, tu vitrina te espera
        </h1>
        <p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.7;margin:0 0 24px;">
          Notamos que aún no has publicado tu primera pieza. Sabemos que el primer paso puede parecer difícil, pero estamos aquí para ayudarte.
        </p>
        <div style="background:#FAFAF8;border-left:3px solid #8B7355;padding:16px 20px;margin:0 0 24px;border-radius:0 8px 8px 0;">
          <p style="font-size:14px;color:#1a1a18;margin:0;line-height:1.6;font-style:italic;">
            Publicar una pieza toma menos de 5 minutos. Solo necesitas una foto y una breve descripción — nuestra IA se encarga del resto.
          </p>
        </div>
        <div style="background:#FAFAF8;border:1px solid #e8e4de;border-radius:12px;padding:28px 24px;margin:0 0 28px;">
          <p style="font-size:11px;color:#8B7355;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;text-align:center;font-weight:600;">Tips rápidos</p>
          <div style="font-size:14px;color:#4a4a48;padding:8px 0;border-bottom:1px solid #f0ece6;">
            <span style="color:#8B7355;margin-right:8px;">&#10003;</span> Fotografía tu pieza con luz natural sobre fondo neutro
          </div>
          <div style="font-size:14px;color:#4a4a48;padding:8px 0;border-bottom:1px solid #f0ece6;">
            <span style="color:#8B7355;margin-right:8px;">&#10003;</span> Incluye materiales y dimensiones en la descripción
          </div>
          <div style="font-size:14px;color:#4a4a48;padding:8px 0;">
            <span style="color:#8B7355;margin-right:8px;">&#10003;</span> Pon un precio justo — puedes cambiarlo después
          </div>
        </div>
        <p style="text-align:center;margin:0 0 24px;">
          <a href="${appUrl}/portal/orfebre/productos/nuevo" style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">Crear mi primera pieza</a>
        </p>
        <p style="font-size:12px;color:#9e9a90;text-align:center;margin:0;">
          ¿Problemas técnicos? Responde a este correo y te asistiremos en minutos.
        </p>
      </div>
    `,
  };
}

function personalEmail(displayName: string): { subject: string; html: string } {
  return {
    subject: `${displayName}, un mensaje personal del equipo de Casa Orfebre`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
        <div style="text-align:center;margin:0 0 24px;">
          <span style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:6px 20px;border-radius:20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Mensaje personal</span>
        </div>
        <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a18;text-align:center;margin:0 0 16px;line-height:1.3;">
          ${displayName}, queremos saber de ti
        </h1>
        <p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.7;margin:0 0 24px;">
          Ha pasado una semana desde que aprobamos tu cuenta y aún no has publicado tu primera pieza. Queremos asegurarnos de que todo esté bien.
        </p>
        <div style="background:#1a1a18;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
          <p style="font-size:14px;color:#FAFAF8;margin:0;line-height:1.6;text-align:center;">
            Si algo te detiene — dudas sobre precios, problemas con fotos, o cualquier otra cosa — simplemente responde este correo. Nuestro equipo te ayudará personalmente.
          </p>
        </div>
        <p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.7;margin:0 0 24px;">
          Tu talento merece ser visto. Estamos aquí para que eso suceda.
        </p>
        <p style="text-align:center;margin:0 0 24px;">
          <a href="${appUrl}/portal/orfebre/productos/nuevo" style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">Publicar mi primera pieza</a>
        </p>
        <div style="height:1px;background:#e8e4de;margin:24px 0;"></div>
        <p style="font-size:12px;color:#9e9a90;text-align:center;margin:0;">
          Este es nuestro último recordatorio automático. Si prefieres no recibir más emails de onboarding, no necesitas hacer nada.
        </p>
      </div>
    `,
  };
}

/* ================================================================== */
/*  CRON HANDLER                                                       */
/* ================================================================== */

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find artisans in onboarding flow
    const artisans = await prisma.artisan.findMany({
      where: {
        status: "APPROVED",
        onboardingStep: { in: ["WELCOME", "FIRST_PRODUCT"] },
      },
      include: {
        user: { select: { email: true } },
        products: {
          where: { status: "APPROVED" },
          select: { id: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    let welcomeEmails = 0;
    let helpEmails = 0;
    let personalEmails = 0;
    let needsAttention = 0;
    let progressedToFirstProduct = 0;
    let progressedToActive = 0;
    let skipped = 0;

    for (const artisan of artisans) {
      const approvedDays = daysSince(artisan.approvedAt);
      const productCount = artisan.products.length;
      const email = artisan.user?.email;

      if (!email) {
        skipped++;
        continue;
      }

      // Artisan has products
      if (productCount > 0) {
        // Progress from WELCOME to FIRST_PRODUCT
        if (artisan.onboardingStep === "WELCOME") {
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: { onboardingStep: "FIRST_PRODUCT" },
          });
          progressedToFirstProduct++;
          continue;
        }

        // Check if enough time has passed since first product to mark ACTIVE
        const firstProduct = artisan.products[0];
        if (firstProduct && daysSince(firstProduct.createdAt) >= 7) {
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: { onboardingStep: "ACTIVE" },
          });
          progressedToActive++;
          continue;
        }

        skipped++;
        continue;
      }

      // Artisan has 0 products — send onboarding emails based on schedule
      const emailsSent = artisan.onboardingEmailsSent;

      if (emailsSent === 0 && approvedDays >= 1) {
        // Day 1: Welcome email
        const { subject, html } = welcomeEmail(artisan.displayName);
        try {
          await sendEmail(email, subject, html);
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: {
              onboardingEmailsSent: 1,
              lastOnboardingEmailAt: new Date(),
            },
          });
          welcomeEmails++;
        } catch {
          skipped++;
        }
      } else if (emailsSent === 1 && approvedDays >= 3) {
        // Day 3: Help email
        const { subject, html } = helpEmail(artisan.displayName);
        try {
          await sendEmail(email, subject, html);
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: {
              onboardingEmailsSent: 2,
              lastOnboardingEmailAt: new Date(),
            },
          });
          helpEmails++;
        } catch {
          skipped++;
        }
      } else if (emailsSent === 2 && approvedDays >= 7) {
        // Day 7: Personal email
        const { subject, html } = personalEmail(artisan.displayName);
        try {
          await sendEmail(email, subject, html);
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: {
              onboardingEmailsSent: 3,
              lastOnboardingEmailAt: new Date(),
            },
          });
          personalEmails++;
        } catch {
          skipped++;
        }
      } else if (emailsSent === 3 && approvedDays >= 14) {
        // Day 14: Mark as needs attention
        await prisma.artisan.update({
          where: { id: artisan.id },
          data: { onboardingStep: "NEEDS_ATTENTION" },
        });
        needsAttention++;
      } else {
        skipped++;
      }

      // Rate limiting: 200ms between emails
      await new Promise((r) => setTimeout(r, 200));
    }

    return NextResponse.json({
      message: "Onboarding processed",
      total: artisans.length,
      welcomeEmails,
      helpEmails,
      personalEmails,
      needsAttention,
      progressedToFirstProduct,
      progressedToActive,
      skipped,
    });
  } catch (e) {
    console.error("[CRON] Onboarding processing error:", e);
    return NextResponse.json(
      { error: "Failed to process onboarding" },
      { status: 500 },
    );
  }
}

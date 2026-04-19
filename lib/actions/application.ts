"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "@/lib/emails/base-layout";

export async function submitApplication(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const firstName = (formData.get("firstName") as string)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string)?.trim() ?? "";
  const name = `${firstName} ${lastName}`.trim();
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const region = (formData.get("region") as string)?.trim() || null;
  const location = ((formData.get("location") as string) || "").trim();
  const specialtyRaw = ((formData.get("specialty") as string) || "").trim();
  const bio = ((formData.get("bio") as string) || "").trim();
  const materialsRaw = ((formData.get("materials") as string) || "").trim();
  const experience = ((formData.get("experience") as string) || "").trim() || null;
  const portfolioUrl = ((formData.get("portfolioUrl") as string) || "").trim() || null;
  const phoneRaw = (formData.get("phone") as string) || "";
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  /** Chile: celular sin código de país = 9 dígitos (ej. 912345678) → E.164 +56912345678 */
  const phone = phoneDigits.length === 9 ? `+56${phoneDigits}` : null;

  // Consentimientos (Ley 21.719)
  const consentTerms = formData.get("consentTerms") === "on";
  const consentSocialMedia = formData.get("consentSocialMedia") === "on";
  const consentMarketing = formData.get("consentMarketing") === "on";

  if (!consentTerms) {
    return { error: "Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar." };
  }
  const selectedPlan = ((formData.get("selectedPlan") as string) || "").trim() || null;
  const promoCodeRaw = ((formData.get("promoCode") as string) || "").trim().toUpperCase() || null;
  const isPioneerCandidate = formData.get("isPioneerCandidate") === "1";
  const yearsExperienceRaw = (formData.get("yearsExperience") as string) || "";
  const yearsExperienceParsed = yearsExperienceRaw ? parseInt(yearsExperienceRaw, 10) : null;
  const yearsExperience =
    yearsExperienceParsed !== null && !isNaN(yearsExperienceParsed) ? yearsExperienceParsed : null;
  const awardsRaw = (formData.get("awards") as string) || "";
  const awards = awardsRaw.split("|||").map((a) => a.trim()).filter(Boolean);

  const categoriesRaw = (formData.get("categories") as string) || "";
  const categories = categoriesRaw
    .split(",")
    .map((c: string) => c.trim())
    .filter(Boolean);

  let portfolioImages: string[] = [];
  const portfolioImageUrlsRaw = (formData.get("portfolioImageUrls") as string) || "[]";
  try {
    const parsed = JSON.parse(portfolioImageUrlsRaw) as unknown;
    if (Array.isArray(parsed)) {
      portfolioImages = parsed
        .filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u))
        .slice(0, 6);
    }
  } catch {
    portfolioImages = [];
  }

  if (
    !firstName ||
    !lastName ||
    !email ||
    !region ||
    !location ||
    !specialtyRaw ||
    !bio ||
    !materialsRaw
  ) {
    return { error: "Todos los campos marcados son requeridos" };
  }

  if (phoneDigits.length !== 9 || !phone) {
    return { error: "El celular debe tener exactamente 9 dígitos" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email no válido" };
  }

  const materials = materialsRaw
    .split(",")
    .map((m: string) => m.trim())
    .filter(Boolean);

  if (materials.length === 0) {
    return { error: "Indica al menos un material con el que trabajas" };
  }

  /**
   * `specialty` viene del TagSelect como lista separada por comas.
   * La columna es String, así que la guardamos unida con ", " para lectura humana.
   */
  const specialty = specialtyRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

  if (!specialty) {
    return { error: "Selecciona al menos una especialidad en orfebrería" };
  }

  try {
    // Check for existing pending application
    const existing = await prisma.artisanApplication.findFirst({
      where: { email, status: "PENDING" },
    });
    if (existing) {
      return { error: "Ya tienes una postulación pendiente de revisión" };
    }

    // Validate promo code if provided
    if (promoCodeRaw) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCodeRaw },
      });
      if (
        !promo ||
        !promo.isActive ||
        promo.expiresAt < new Date() ||
        promo.currentUses >= promo.maxUses
      ) {
        return { error: "Código promocional inválido o expirado" };
      }
    }

    await prisma.artisanApplication.create({
      data: {
        name,
        email,
        region,
        location,
        specialty,
        bio,
        materials,
        experience,
        portfolioUrl,
        phone,
        categories,
        portfolioImages,
        selectedPlan,
        promoCode: promoCodeRaw,
        isPioneerCandidate,
        yearsExperience,
        awards,
        status: "PENDING",
        consentTerms: true,
        consentTermsAt: new Date(),
        consentMarketing,
        consentMarketingAt: consentMarketing ? new Date() : null,
        consentSocialMedia,
        consentSocialMediaAt: consentSocialMedia ? new Date() : null,
      },
    });

    // Track invitation funnel: mark code as APPLIED
    if (promoCodeRaw) {
      try {
        await prisma.promoCode.updateMany({
          where: {
            code: promoCodeRaw,
            invitationStatus: { in: ["SENT", "OPENED"] },
          },
          data: {
            appliedAt: new Date(),
            invitationStatus: "APPLIED",
          },
        });
      } catch (e) {
        console.error("[submitApplication] promo update failed:", e);
      }
    }
  } catch (err) {
    console.error("[submitApplication] DB error:", err);
    return {
      error:
        "No pudimos guardar tu postulación en este momento. Por favor vuelve a intentarlo en unos minutos o escríbenos a contacto@casaorfebre.cl.",
    };
  }

  // Non-critical side effects: emails. Must never block success response.
  // RESEND_API_KEY may not be configured; we swallow and log everything.
  let resendClient: ReturnType<typeof getResend> | null = null;
  try {
    resendClient = getResend();
  } catch (e) {
    console.warn("[submitApplication] Resend not configured, skipping emails:", e);
  }

  if (resendClient) {
    // Send confirmation email to applicant
    try {
      await resendClient.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Recibimos tu postulación — Casa Orfebre",
        html: emailLayout(
          `<p style="margin:0 0 16px;">Hola ${name},</p>
           <p style="margin:0 0 16px;">Recibimos tu postulación como orfebre en <strong>Casa Orfebre</strong>. Nuestro equipo la revisará en los próximos 3 a 7 días hábiles.</p>
           <p style="margin:0 0 16px;">Te notificaremos por email cuando tengamos una respuesta. ¡Gracias por tu interés!</p>`
        ),
      });
    } catch (e) {
      console.error("[submitApplication] Confirmation email failed:", e);
    }

    // Notify admins of new application
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });
      for (const admin of admins) {
        try {
          await resendClient.emails.send({
            from: FROM_EMAIL,
            to: admin.email,
            subject: `Nueva postulación${isPioneerCandidate ? " (Pionero)" : ""} de orfebre: ${name}`,
            html: emailLayout(
              `<p style="margin:0 0 16px;">Se recibió una nueva postulación de orfebre${isPioneerCandidate ? " <strong>al Programa Pioneros</strong>" : ""}.</p>
               <p style="margin:0 0 8px;"><strong>Nombre:</strong> ${name}</p>
               <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
               <p style="margin:0 0 8px;"><strong>Ciudad:</strong> ${location}</p>
               <p style="margin:0 0 8px;"><strong>Especialidad:</strong> ${specialty}</p>
               <p style="margin:0 0 16px;"><strong>Materiales:</strong> ${materials.join(", ")}</p>
               <p style="margin:0 0 0;">
                 <a href="https://casaorfebre.cl/portal/admin/postulaciones" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Revisar postulación</a>
               </p>`
            ),
          });
        } catch (e) {
          console.error(`[submitApplication] Admin email failed for ${admin.email}:`, e);
        }
      }
    } catch (e) {
      console.error("[submitApplication] Admin notification failed:", e);
    }
  }

  try {
    revalidatePath("/portal/admin/postulaciones");
    revalidatePath("/portal");
  } catch (e) {
    console.error("[submitApplication] revalidate failed:", e);
  }

  return { success: true };
}

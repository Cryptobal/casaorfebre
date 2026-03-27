"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "@/lib/emails/base-layout";

export async function submitApplication(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const region = (formData.get("region") as string) || null;
  const location = formData.get("location") as string;
  const specialty = formData.get("specialty") as string;
  const bio = formData.get("bio") as string;
  const materialsRaw = formData.get("materials") as string;
  const experience = (formData.get("experience") as string) || null;
  const portfolioUrl = (formData.get("portfolioUrl") as string) || null;
  const phoneRaw = (formData.get("phone") as string) || null;
  const phone = phoneRaw ? `+569${phoneRaw.replace(/\D/g, "")}` : null;
  const selectedPlan = (formData.get("selectedPlan") as string) || null;
  const yearsExperienceRaw = formData.get("yearsExperience") as string;
  const yearsExperience = yearsExperienceRaw ? parseInt(yearsExperienceRaw, 10) : null;
  const awardsRaw = (formData.get("awards") as string) || "";
  const awards = awardsRaw.split("|||").filter(Boolean);

  if (!name || !email || !region || !location || !specialty || !bio || !materialsRaw || !phoneRaw) {
    return { error: "Todos los campos marcados son requeridos" };
  }

  if (phoneRaw && phoneRaw.replace(/\D/g, "").length !== 8) {
    return { error: "El teléfono debe tener 8 dígitos después del +56 9" };
  }

  if (!email.includes("@")) {
    return { error: "Email no válido" };
  }

  const materials = materialsRaw
    .split(",")
    .map((m: string) => m.trim())
    .filter(Boolean);

  if (materials.length === 0) {
    return { error: "Indica al menos un material con el que trabajas" };
  }

  // Check for existing pending application
  const existing = await prisma.artisanApplication.findFirst({
    where: { email, status: "PENDING" },
  });
  if (existing) {
    return { error: "Ya tienes una postulación pendiente de revisión" };
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
      portfolioImages: [],
      selectedPlan,
      yearsExperience: yearsExperience !== null && !isNaN(yearsExperience) ? yearsExperience : null,
      awards,
      status: "PENDING",
    },
  });

  // Send confirmation email to applicant
  try {
    await resend.emails.send({
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
    console.error("Confirmation email failed:", e);
  }

  // Notify admin of new application
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    for (const admin of admins) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: admin.email,
        subject: `Nueva postulación de orfebre: ${name}`,
        html: emailLayout(
          `<p style="margin:0 0 16px;">Se recibió una nueva postulación de orfebre.</p>
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
    }
  } catch (e) {
    console.error("Admin notification email failed:", e);
  }

  revalidatePath("/portal/admin/postulaciones");
  return { success: true };
}

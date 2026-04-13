"use server";

import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "@/lib/emails/base-layout";
import { auth } from "@/lib/auth";

const SUBJECTS = [
  "Consulta general",
  "Problema con un pedido",
  "Quiero vender en Casa Orfebre",
  "Prensa y colaboraciones",
  "Otro",
] as const;

export async function sendContactForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const subject = formData.get("subject") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !subject || !message) {
    return { error: "Todos los campos son obligatorios." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El email ingresado no es válido." };
  }

  if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
    return { error: "Selecciona un asunto válido." };
  }

  if (message.length > 1000) {
    return { error: "El mensaje no puede superar los 1000 caracteres." };
  }

  try {
    // Try to link to a registered user — prefer session, fall back to email lookup
    let userId: string | null = null;
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingUser) userId = existingUser.id;
    }

    // Persist in database
    await prisma.contactSubmission.create({
      data: { name, email, subject, message, userId },
    });

    // Send email to ALL admin users (existing behavior)
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    const htmlContent = emailLayout(`
        <p style="margin:0 0 16px;"><strong>Nuevo mensaje de contacto</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;font-weight:600;width:120px;">Nombre</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;font-weight:600;">Email</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;font-weight:600;">Asunto</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;">${subject}</td>
          </tr>
        </table>
        <p style="margin:0 0 8px;font-weight:600;">Mensaje:</p>
        <p style="margin:0;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      `);

    for (const admin of admins) {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: admin.email,
        replyTo: email,
        subject: `[Contacto] ${subject} — ${name}`,
        html: htmlContent,
      });

      if (error) {
        console.error(`Contact form email failed for ${admin.email}:`, error);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Contact form error:", err);
    return { error: "No se pudo enviar el mensaje. Intenta nuevamente." };
  }
}

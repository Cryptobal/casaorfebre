"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendBuyerWelcomeEmail, sendVerificationEmail } from "@/lib/emails/templates";
import crypto from "crypto";

export async function resendVerificationEmail() {
  const { auth: getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session?.user?.id) return { error: "No autorizado" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Usuario no encontrado" };
  if (user.emailVerified) return { error: "Tu email ya está verificado" };

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: token, verificationTokenExpires: expires },
  });

  try {
    await sendVerificationEmail(user.email, { name: user.name || "Usuario", token });
  } catch (e) {
    console.error("Resend verification email failed:", e);
    return { error: "Error al enviar el email. Intenta nuevamente." };
  }

  return { success: true };
}

function safeInternalPath(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "/";
  if (!url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}

export async function loginWithGoogle(formData?: FormData) {
  const callbackUrl = safeInternalPath(formData?.get("callbackUrl") as string | undefined);
  await signIn("google", { redirectTo: callbackUrl });
}

export async function loginWithCredentials(
  _prevState: { error: string } | null,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
  } catch {
    return { error: "Email o contraseña incorrectos" };
  }
  revalidatePath("/", "layout");
  redirect(safeInternalPath(formData.get("callbackUrl") as string | undefined));
}

export async function register(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "Todos los campos son requeridos" };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomUUID();
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: "BUYER",
      verificationToken,
      verificationTokenExpires,
    },
  });

  // Send welcome + verification emails (non-blocking)
  try {
    await sendBuyerWelcomeEmail(email, { name });
    await sendVerificationEmail(email, { name, token: verificationToken });
  } catch (e) {
    console.error("Email failed:", e);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: "Cuenta creada. Inicia sesión manualmente." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

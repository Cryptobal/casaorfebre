"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sendBuyerWelcomeEmail } from "@/lib/emails/templates";

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

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: "BUYER",
    },
  });

  // Send welcome email (non-blocking)
  try {
    await sendBuyerWelcomeEmail(email, { name });
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

  redirect("/");
}

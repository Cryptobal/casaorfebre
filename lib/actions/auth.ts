"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  sendBuyerWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/emails/templates";
import { generateUniqueReferralCode, trackReferral } from "@/lib/actions/referral";
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

const GENERIC_RESET_MSG =
  "Si existe una cuenta con ese correo, te enviamos un enlace para crear o cambiar tu contraseña.";

export async function requestPasswordReset(
  _prevState: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData,
) {
  const emailRaw = formData.get("email") as string | null;
  const email = emailRaw?.trim().toLowerCase();
  if (!email) {
    return { error: "Ingresa tu correo electrónico" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return { success: true, message: GENERIC_RESET_MSG };
  }

  const token = crypto.randomUUID();
  const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires },
  });

  try {
    await sendPasswordResetEmail(user.email, {
      name: user.name || "Usuario",
      token,
    });
  } catch (e) {
    console.error("Password reset email failed:", e);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: null, passwordResetExpires: null },
    });
    return { error: "No pudimos enviar el correo. Intenta de nuevo más tarde." };
  }

  return { success: true, message: GENERIC_RESET_MSG };
}

export async function resetPasswordWithToken(
  _prevState: { error?: string } | null,
  formData: FormData,
) {
  const token = formData.get("token") as string | null;
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  if (!token?.trim()) {
    return { error: "Enlace inválido" };
  }
  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token.trim(),
      passwordResetExpires: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!user) {
    return {
      error:
        "El enlace expiró o no es válido. Solicita un nuevo correo desde «Olvidé mi contraseña».",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  revalidatePath("/", "layout");
  redirect("/login?reset=success");
}

export async function loginWithCredentials(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const callbackUrlRaw = formData.get("callbackUrl") as string | undefined;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    // Re-throw Next.js redirect signals (they are not auth errors)
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("NEXT_REDIRECT")) throw err;
    return { error: "Email o contraseña incorrectos" };
  }

  revalidatePath("/", "layout");

  // If there's an explicit callbackUrl use it; otherwise send admins to the
  // admin portal and everyone else to their buyer dashboard.
  const explicitCallback = safeInternalPath(callbackUrlRaw);
  if (explicitCallback !== "/") {
    redirect(explicitCallback);
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  const role = dbUser?.role ?? "BUYER";
  if (role === "ADMIN") redirect("/portal/admin");
  if (role === "ARTISAN") redirect("/portal/orfebre/productos");
  redirect("/portal/comprador/pedidos");
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
  const referralCode = await generateUniqueReferralCode(name);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: "BUYER",
      verificationToken,
      verificationTokenExpires,
      referralCode,
    },
  });

  // Track referral if ref code was provided
  const refCode = formData.get("ref") as string | null;
  if (refCode) {
    await trackReferral(refCode, user.id);
  }

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

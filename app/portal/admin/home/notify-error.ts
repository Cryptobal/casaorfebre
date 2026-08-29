"use client";

import { showToast } from "@/components/ui/toast";

export function notifyHomeActionError(error: string) {
  if (error === "No autorizado") {
    showToast({
      message: "Sesión expirada. Vuelve a iniciar sesión.",
      actionLabel: "Entrar",
      actionHref: "/login?callbackUrl=/portal/admin/home",
    });
    return;
  }
  showToast({ message: error });
}

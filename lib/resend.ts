import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error(
        "RESEND_API_KEY is not set — emails cannot be sent without it.",
      );
    }
    _resend = new Resend(key);
  }
  return _resend;
}

/** @deprecated use getResend() — kept for backward compat */
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    if (typeof prop === "symbol") return undefined;
    return (getResend() as unknown as Record<string, unknown>)[prop];
  },
});

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Casa Orfebre <contacto@casaorfebre.cl>";

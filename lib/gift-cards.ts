import { prisma } from "@/lib/prisma";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion

export async function generateGiftCardCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 16; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    const existing = await prisma.giftCard.findUnique({ where: { code } });
    if (!existing) return code;
  }

  throw new Error("Failed to generate unique gift card code after 10 attempts");
}

/** Format a 16-char code as XXXX-XXXX-XXXX-XXXX for display */
export function formatGiftCardCode(code: string): string {
  const clean = code.replace(/-/g, "").toUpperCase();
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}`;
}

/** Strip dashes from display format to get DB format */
export function normalizeGiftCardCode(code: string): string {
  return code.replace(/-/g, "").toUpperCase().trim();
}

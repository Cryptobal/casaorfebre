import { prisma } from "@/lib/prisma";
import { CreditTransactionType } from "@prisma/client";

/**
 * Obtiene o crea el registro de créditos de un orfebre.
 * Idempotente: si no existe, lo crea con saldo 0.
 */
export async function getOrCreateCredits(artisanId: string) {
  const existing = await prisma.artisanCredits.findUnique({ where: { artisanId } });
  if (existing) return existing;
  return prisma.artisanCredits.create({ data: { artisanId, balance: 0 } });
}

/**
 * Devuelve el saldo actual de créditos de un orfebre.
 */
export async function getCreditBalance(artisanId: string): Promise<number> {
  const credits = await getOrCreateCredits(artisanId);
  return credits.balance;
}

/**
 * Añade créditos (asignación mensual, compra o ajuste). Transaccional.
 * Registra la transacción para auditoría.
 */
export async function addCredits(
  artisanId: string,
  amount: number,
  type: CreditTransactionType,
  reason?: string
) {
  if (amount <= 0) throw new Error("El monto a añadir debe ser positivo");
  return prisma.$transaction(async (tx) => {
    const credits = await tx.artisanCredits.upsert({
      where: { artisanId },
      create: { artisanId, balance: 0 },
      update: {},
    });
    const newBalance = credits.balance + amount;
    const updated = await tx.artisanCredits.update({
      where: { id: credits.id },
      data: { balance: newBalance },
    });
    await tx.creditTransaction.create({
      data: { creditsId: credits.id, amount, type, reason, balanceAfter: newBalance },
    });
    return updated;
  });
}

/**
 * Consume créditos (canje por foto o post). Transaccional.
 * Lanza error si el saldo es insuficiente. Devuelve el nuevo saldo.
 */
export async function consumeCredits(
  artisanId: string,
  amount: number,
  type: CreditTransactionType,
  reason?: string
): Promise<number> {
  if (amount <= 0) throw new Error("El monto a consumir debe ser positivo");
  return prisma.$transaction(async (tx) => {
    const credits = await tx.artisanCredits.findUnique({ where: { artisanId } });
    if (!credits || credits.balance < amount) {
      throw new Error("Créditos insuficientes");
    }
    const newBalance = credits.balance - amount;
    await tx.artisanCredits.update({
      where: { id: credits.id },
      data: { balance: newBalance },
    });
    await tx.creditTransaction.create({
      data: { creditsId: credits.id, amount: -amount, type, reason, balanceAfter: newBalance },
    });
    return newBalance;
  });
}

/**
 * Devuelve la cantidad de créditos mensuales que corresponde al plan activo
 * del orfebre. Sigue el patrón de resolución de plan de lib/plan-limits.ts.
 * Esencial (sin plan) = 0.
 */
export async function getMonthlyCreditAllocation(artisanId: string): Promise<number> {
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });
  if (!artisan) throw new Error("Artisan not found");
  const activePlan = artisan.subscriptions[0]?.plan;
  return activePlan?.monthlyCredits ?? 0;
}

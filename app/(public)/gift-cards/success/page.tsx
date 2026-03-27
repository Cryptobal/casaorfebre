import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { formatGiftCardCode } from "@/lib/gift-cards";

export const metadata: Metadata = {
  title: "Gift Card Enviada — Casa Orfebre",
};

export default async function GiftCardSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  // Find the most recent gift card purchased by this user
  const giftCard = await prisma.giftCard.findFirst({
    where: { purchaserId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      code: true,
      amount: true,
      recipientEmail: true,
      recipientName: true,
      message: true,
      expiresAt: true,
    },
  });

  if (!giftCard) {
    // Gift card might not have been created yet (webhook delay)
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mb-6 text-5xl">⏳</div>
        <h1 className="text-2xl font-light text-text">
          Procesando tu Gift Card...
        </h1>
        <p className="mt-3 text-text-secondary">
          Estamos procesando tu pago. En unos momentos el destinatario
          recibirá un email con su Gift Card.
        </p>
        <p className="mt-2 text-sm text-text-tertiary">
          También te enviaremos una confirmación a tu email.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/gift-cards"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Comprar otra Gift Card
          </Link>
          <Link
            href="/coleccion"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-background"
          >
            Seguir explorando
          </Link>
        </div>
      </main>
    );
  }

  const displayCode = formatGiftCardCode(giftCard.code);
  const expiresLabel = giftCard.expiresAt.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="mb-6 text-5xl">🎉</div>
      <h1 className="text-2xl font-light text-text">
        ¡Gift Card enviada!
      </h1>
      <p className="mt-3 text-text-secondary">
        Enviamos una Gift Card de{" "}
        <span className="font-medium text-text">
          {formatCLP(giftCard.amount)}
        </span>{" "}
        a{" "}
        <span className="font-medium text-text">
          {giftCard.recipientEmail}
        </span>
      </p>

      {/* Preview card */}
      <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-2xl border border-border shadow-sm">
        <div className="bg-gradient-to-br from-[#f5f3ef] to-[#ebe7e0] p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            casa orfebre
          </p>
          <p className="mt-1 text-xs text-text-tertiary">Gift Card</p>
          <p className="mt-4 text-4xl font-bold text-accent">
            {formatCLP(giftCard.amount)}
          </p>
          {giftCard.message && (
            <p className="mx-auto mt-4 max-w-xs text-sm italic text-text-secondary">
              &ldquo;{giftCard.message}&rdquo;
            </p>
          )}
          {giftCard.recipientName && (
            <p className="mt-3 text-sm text-text-secondary">
              Para:{" "}
              <span className="font-medium text-text">
                {giftCard.recipientName}
              </span>
            </p>
          )}
          <div className="mx-auto mt-6 max-w-[250px] rounded-lg bg-white/60 px-4 py-3">
            <p className="text-xs text-text-tertiary">Código</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wider text-text">
              {displayCode}
            </p>
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            Válida hasta {expiresLabel}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-text-tertiary">
        El destinatario recibirá un email con las instrucciones para usar su
        Gift Card.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/gift-cards"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Comprar otra Gift Card
        </Link>
        <Link
          href="/coleccion"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-background"
        >
          Seguir explorando
        </Link>
      </div>
    </main>
  );
}

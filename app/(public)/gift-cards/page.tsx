import type { Metadata } from "next";
import { GiftCardForm } from "./gift-card-form";

export const metadata: Metadata = {
  title: "Gift Cards — Casa Orfebre",
  description: "Regala joyería artesanal chilena. El destinatario elige la pieza que más le guste.",
  alternates: { canonical: "/gift-cards" },
};

export default function GiftCardsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-light tracking-tight text-text sm:text-4xl">
          Gift Cards Casa Orfebre
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-text-secondary">
          Regala joyería artesanal chilena. El destinatario elige la pieza que más le guste.
        </p>
      </div>

      <GiftCardForm />
    </main>
  );
}

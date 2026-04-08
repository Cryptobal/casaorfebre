import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BuyerConsentForm } from "./buyer-consent-form";

export const metadata = {
  title: "Privacidad y consentimientos",
};

export default async function BuyerPrivacyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      consentMarketing: true,
      consentMarketingAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-light text-text">
        Privacidad y consentimientos
      </h1>
      <p className="mt-3 text-sm font-light text-text-secondary">
        Gestiona tus preferencias de privacidad conforme a la Ley N° 21.719
        de Protección de Datos Personales.
      </p>

      <div className="mt-8">
        <BuyerConsentForm
          consentMarketing={user.consentMarketing}
          consentMarketingAt={user.consentMarketingAt?.toISOString() ?? null}
        />
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif text-lg font-light text-text">
          Tus derechos
        </h2>
        <p className="mt-2 text-sm font-light text-text-secondary">
          Conforme a la Ley N° 21.719, tienes derecho a acceder, rectificar,
          eliminar, oponerte, solicitar la portabilidad y el bloqueo temporal
          de tus datos personales. Para ejercer estos derechos, contacta a{" "}
          <a
            href="mailto:contacto@casaorfebre.cl"
            className="text-accent underline-offset-2 hover:underline"
          >
            contacto@casaorfebre.cl
          </a>
          .
        </p>
      </div>

      {/* ── Zona de peligro ── */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif text-lg font-light text-text">
          Zona de peligro
        </h2>
        <p className="mt-2 text-sm font-light text-text-secondary">
          La eliminación de tu cuenta es irreversible. Se eliminarán todos
          tus datos personales conforme a la Ley N° 21.719 de Protección de
          Datos Personales.
        </p>
        <div className="mt-4">
          <a
            href="/portal/comprador/cuenta/eliminar"
            className="inline-flex items-center rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Eliminar mi cuenta
          </a>
        </div>
      </section>
    </div>
  );
}

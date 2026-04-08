import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConsentForm } from "./consent-form";

export const metadata = {
  title: "Privacidad y consentimientos",
};

export default async function ArtisanPrivacyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: {
      consentTerms: true,
      consentTermsAt: true,
      consentMarketing: true,
      consentMarketingAt: true,
      consentSocialMedia: true,
      consentSocialMediaAt: true,
    },
  });

  if (!artisan) redirect("/portal");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-light text-text">
        Privacidad y consentimientos
      </h1>
      <p className="mt-3 text-sm font-light text-text-secondary">
        Gestiona tus preferencias de privacidad conforme a la Ley N° 21.719
        de Protección de Datos Personales. Puedes revocar los consentimientos
        opcionales en cualquier momento.
      </p>

      <div className="mt-8">
        <ConsentForm
          consentTerms={artisan.consentTerms}
          consentTermsAt={artisan.consentTermsAt?.toISOString() ?? null}
          consentMarketing={artisan.consentMarketing}
          consentMarketingAt={artisan.consentMarketingAt?.toISOString() ?? null}
          consentSocialMedia={artisan.consentSocialMedia}
          consentSocialMediaAt={artisan.consentSocialMediaAt?.toISOString() ?? null}
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
    </div>
  );
}

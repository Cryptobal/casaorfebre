import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { BankingForm } from "./banking-form";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-text">Mi Perfil</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Edita tu informacion publica como orfebre.
      </p>

      <div className="mt-6">
        <ProfileForm
          artisan={{
            displayName: artisan.displayName,
            bio: artisan.bio,
            story: artisan.story,
            specialty: artisan.specialty,
            materials: artisan.materials,
            location: artisan.location,
            region: artisan.region,
            videoUrl: artisan.videoUrl,
            profileImage: artisan.profileImage,
            slug: artisan.slug,
            yearsExperience: artisan.yearsExperience,
            awards: artisan.awards,
          }}
        />
      </div>

      {/* Banking data */}
      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-serif text-xl font-light">Datos bancarios</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Necesarios para recibir tus pagos por transferencia bancaria
        </p>
        <div className="mt-4">
          <BankingForm
            initialData={{
              bankRut: artisan.bankRut,
              bankHolderName: artisan.bankHolderName,
              bankName: artisan.bankName,
              bankAccountType: artisan.bankAccountType,
              bankAccountNumber: artisan.bankAccountNumber,
            }}
          />
        </div>
      </div>
    </div>
  );
}

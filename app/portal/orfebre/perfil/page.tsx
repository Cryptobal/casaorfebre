import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { BankingForm } from "./banking-form";
import { getActiveSpecialties, getActiveMaterials } from "@/lib/queries/catalog";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    include: {
      specialties: { select: { id: true, name: true } },
      products: {
        where: { status: "APPROVED" },
        select: { categories: { select: { id: true, name: true } } },
      },
    },
  });

  if (!artisan) redirect("/");

  const [catalogSpecialties, catalogMaterials] = await Promise.all([
    getActiveSpecialties(),
    getActiveMaterials(),
  ]);

  // Derive unique categories from artisan's approved products
  const categoryMap = new Map<string, string>();
  for (const product of artisan.products) {
    for (const cat of product.categories) {
      categoryMap.set(cat.id, cat.name);
    }
  }
  const artisanCategories = Array.from(categoryMap, ([id, name]) => ({ id, name }));

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
            specialtyIds: artisan.specialties.map((s) => s.id),
            materials: artisan.materials,
            location: artisan.location,
            region: artisan.region,
            videoUrl: artisan.videoUrl,
            profileImage: artisan.profileImage,
            slug: artisan.slug,
            yearsExperience: artisan.yearsExperience,
            awards: artisan.awards,
            categories: artisanCategories,
          }}
          catalogSpecialties={catalogSpecialties}
          catalogMaterials={catalogMaterials}
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

      {/* ── Zona de peligro ── */}
      <section className="mt-16 border-t border-border pt-8">
        <h2 className="font-serif text-lg font-light text-text">
          Zona de peligro
        </h2>
        <p className="mt-2 text-sm font-light text-text-secondary">
          La eliminación de tu cuenta es irreversible. Se eliminarán todos
          tus datos personales, fotografías y contenido conforme a la Ley N°
          21.719 de Protección de Datos Personales.
        </p>
        <div className="mt-4">
          <a
            href="/portal/orfebre/cuenta/eliminar"
            className="inline-flex items-center rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Eliminar mi cuenta
          </a>
        </div>
      </section>
    </div>
  );
}

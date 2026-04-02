import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogEditor } from "@/app/portal/admin/blog/_components/blog-editor";

export default async function NuevoArticuloOrfebrePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!artisan) redirect("/");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl font-light">Nuevo artículo</h1>
      <p className="mt-1 text-sm text-text-secondary mb-8">
        Escribe sobre tu oficio, técnicas o la historia detrás de tus piezas
      </p>
      <BlogEditor />
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Panel Administrativo</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Bienvenido, {session.user.name ?? session.user.email}
      </p>
      <p className="mt-6 inline-block rounded-full border border-border px-6 py-2 text-xs uppercase tracking-widest text-text-tertiary">
        Próximamente
      </p>
    </div>
  );
}

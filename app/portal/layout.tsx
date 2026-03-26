import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-shrink-0 border-r border-border bg-surface p-6 md:block">
        <p className="mb-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">Portal</p>
        <nav className="space-y-2">
          {session.user.role === "ADMIN" && (
            <Link href="/portal/admin" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Admin</Link>
          )}
          {session.user.role === "ARTISAN" && (
            <Link href="/portal/orfebre" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Taller</Link>
          )}
          <Link href="/portal/comprador" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Pedidos</Link>
        </nav>
      </aside>
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
}

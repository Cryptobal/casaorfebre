import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PortalMobileNav } from "@/components/portal/portal-mobile-nav";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

const ADMIN_LINKS = [
  { href: "/portal/admin", label: "Dashboard" },
  { href: "/portal/admin/postulaciones", label: "Postulaciones" },
  { href: "/portal/admin/productos", label: "Productos" },
  { href: "/portal/admin/fotos", label: "Fotos" },
  { href: "/portal/admin/orfebres", label: "Orfebres" },
  { href: "/portal/admin/compradores", label: "Compradores" },
  { href: "/portal/admin/planes", label: "Planes" },
  { href: "/portal/admin/pedidos", label: "Pedidos" },
  { href: "/portal/admin/disputas", label: "Disputas" },
  { href: "/portal/admin/devoluciones", label: "Devoluciones" },
  { href: "/portal/admin/catalogo", label: "Catálogo" },
  { href: "/portal/admin/gift-cards", label: "Gift Cards" },
  { href: "/portal/admin/finanzas", label: "Finanzas" },
  { href: "/portal/admin/mensajes", label: "Mensajes" },
  { href: "/portal/admin/materiales-precio", label: "Materiales Ref." },
];

const ARTISAN_LINKS = [
  { href: "/portal/orfebre", label: "Mi Taller" },
  { href: "/portal/orfebre/productos", label: "Mis Piezas" },
  { href: "/portal/orfebre/pedidos", label: "Pedidos" },
  { href: "/portal/orfebre/preguntas", label: "Preguntas" },
  { href: "/portal/orfebre/mensajes", label: "Mensajes" },
  { href: "/portal/orfebre/finanzas", label: "Finanzas" },
  { href: "/portal/orfebre/estadisticas", label: "Estadísticas" },
  { href: "/portal/orfebre/herramientas/calculadora", label: "Calculadora" },
  { href: "/portal/orfebre/perfil", label: "Mi Perfil" },
];

const BUYER_LINKS = [
  { href: "/portal/comprador/pedidos", label: "Mis Pedidos" },
  { href: "/portal/comprador/gift-cards", label: "Gift Cards" },
  { href: "/portal/comprador/mensajes", label: "Mensajes" },
  { href: "/portal/comprador/favoritos", label: "Favoritos" },
  { href: "/portal/comprador/listas", label: "Mis Listas" },
  { href: "/portal/comprador/referidos", label: "Invita Amigos" },
  { href: "/portal/comprador/perfil", label: "Mi Cuenta" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Determine effective role (consider activeRole for admin testers)
  const realRole = session.user.role;
  let role = realRole;
  const email = session.user.email || "";
  const isRoleSwitcher = ROLE_SWITCHER_EMAILS.includes(email) && realRole === "ADMIN";

  if (isRoleSwitcher) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeRole: true },
    });
    if (user?.activeRole) {
      role = user.activeRole;
    }
  }

  // When role-switching, show ONLY the active role's sidebar.
  // When NOT role-switching (normal user), show role links + buyer links.
  const showBuyerSection = !isRoleSwitcher || role === "BUYER";

  const mobileTitle =
    role === "ADMIN" ? "Admin" : role === "ARTISAN" ? "Mi Taller" : "Mi Cuenta";

  const mobileLinks = [
    ...(role === "ADMIN" ? ADMIN_LINKS : []),
    ...(role === "ARTISAN" ? ARTISAN_LINKS : []),
    ...(showBuyerSection ? BUYER_LINKS : []),
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-shrink-0 border-r border-border bg-surface p-6 md:block">
        <Link href="/" className="mb-6 flex items-center gap-2 text-text-secondary transition-colors hover:text-text">
          <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={100} height={24} />
        </Link>
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">Portal</p>
        <nav className="space-y-2">
          {role === "ADMIN" && (
            <>
              <Link href="/portal/admin" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Dashboard</Link>
              <Link href="/portal/admin/postulaciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Postulaciones</Link>
              <Link href="/portal/admin/productos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Productos</Link>
              <Link href="/portal/admin/fotos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Fotos</Link>
              <Link href="/portal/admin/orfebres" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Orfebres</Link>
              <Link href="/portal/admin/planes" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Planes</Link>
              <Link href="/portal/admin/pedidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Pedidos</Link>
              <Link href="/portal/admin/disputas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Disputas</Link>
              <Link href="/portal/admin/devoluciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Devoluciones</Link>
              <Link href="/portal/admin/catalogo" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Catálogo</Link>
              <Link href="/portal/admin/compradores" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Compradores</Link>
              <Link href="/portal/admin/gift-cards" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Gift Cards</Link>
              <Link href="/portal/admin/finanzas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Finanzas</Link>
              <Link href="/portal/admin/mensajes" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mensajes</Link>
              <Link href="/portal/admin/materiales-precio" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Materiales Ref.</Link>
            </>
          )}
          {role === "ARTISAN" && (
            <>
              <Link href="/portal/orfebre" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Taller</Link>
              <Link href="/portal/orfebre/productos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Piezas</Link>
              <Link href="/portal/orfebre/pedidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Pedidos</Link>
              <Link href="/portal/orfebre/preguntas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Preguntas</Link>
              <Link href="/portal/orfebre/mensajes" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mensajes</Link>
              <Link href="/portal/orfebre/finanzas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Finanzas</Link>
              <Link href="/portal/orfebre/estadisticas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Estadísticas</Link>
              <Link href="/portal/orfebre/herramientas/calculadora" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Calculadora</Link>
              <Link href="/portal/orfebre/perfil" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Perfil</Link>
            </>
          )}
          {showBuyerSection && (
            <>
              {(role === "ADMIN" || role === "ARTISAN") && (
                <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">Comprador</p>
              )}
              <Link href="/portal/comprador/pedidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Pedidos</Link>
              <Link href="/portal/comprador/gift-cards" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Gift Cards</Link>
              <Link href="/portal/comprador/mensajes" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mensajes</Link>
              <Link href="/portal/comprador/favoritos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Favoritos</Link>
              <Link href="/portal/comprador/listas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Listas</Link>
              <Link href="/portal/comprador/referidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Invita Amigos</Link>
              <Link href="/portal/comprador/perfil" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Cuenta</Link>
            </>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-tertiary transition-colors hover:text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver al sitio
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
          <PortalMobileNav title={mobileTitle} links={mobileLinks} />
          <Link href="/" className="flex items-center">
            <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={90} height={20} />
          </Link>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

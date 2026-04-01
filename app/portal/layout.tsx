import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PortalMobileNav } from "@/components/portal/portal-mobile-nav";
import { SupportBanner } from "@/components/portal/support-banner";
import { getArtisanPendingFulfillmentCount } from "@/lib/queries/orders";
import { OrfebreTour } from "@/components/guided-tour/OrfebreTour";
import { BuyerPortalTour } from "@/components/guided-tour/BuyerPortalTour";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

const ADMIN_LINKS = [
  { href: "/portal/admin", label: "Dashboard" },
  { href: "/portal/admin/invitaciones", label: "Invitaciones" },
  { href: "/portal/admin/postulaciones", label: "Postulaciones" },
  { href: "/portal/admin/productos", label: "Productos" },
  { href: "/portal/admin/fotos", label: "Fotos" },
  { href: "/portal/admin/orfebres", label: "Orfebres" },
  { href: "/portal/admin/compradores", label: "Compradores" },
  { href: "/portal/admin/planes", label: "Planes" },
  { href: "/portal/admin/suscripciones", label: "Suscripciones" },
  { href: "/portal/admin/pedidos", label: "Pedidos" },
  { href: "/portal/admin/disputas", label: "Disputas" },
  { href: "/portal/admin/devoluciones", label: "Devoluciones" },
  { href: "/portal/admin/pagos", label: "Pagos" },
  { href: "/portal/admin/catalogo", label: "Catálogo" },
  { href: "/portal/admin/gift-cards", label: "Gift Cards" },
  { href: "/portal/admin/finanzas", label: "Finanzas" },
  { href: "/portal/admin/mensajes", label: "Mensajes" },
  { href: "/portal/admin/preguntas", label: "Preguntas" },
  { href: "/portal/admin/despacho", label: "Despacho" },
  { href: "/portal/admin/materiales-precio", label: "Materiales Ref." },
  { href: "/portal/admin/analytics", label: "Analytics" },
];

const ARTISAN_LINKS = [
  { href: "/portal/orfebre", label: "Mi Taller" },
  { href: "/portal/orfebre/productos", label: "Mis Piezas" },
  { href: "/portal/orfebre/colecciones", label: "Colecciones" },
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

  let pendingPostulaciones = 0;
  let pendingProductModeration = 0;
  let pendingOrfebreApplications = 0;
  let pendingPhotos = 0;
  let newPaidOrders = 0;
  let artisanPendingOrders = 0;
  let artisanUnansweredQuestions = 0;
  let artisanUnreadMessages = 0;
  let buyerActiveOrders = 0;

  if (session.user.role === "ADMIN") {
    [pendingPostulaciones, pendingProductModeration, pendingOrfebreApplications, pendingPhotos, newPaidOrders] = await Promise.all([
      prisma.artisanApplication.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.artisan.count({ where: { status: "PENDING" } }),
      prisma.productImage.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.orderItem.count({ where: { fulfillmentStatus: "PENDING", order: { status: "PAID" } } }),
    ]);
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

  // Buyer badge: count active orders (paid but not yet delivered/completed)
  if (showBuyerSection) {
    buyerActiveOrders = await prisma.order.count({
      where: {
        userId: session.user.id,
        status: { in: ["PAID", "PARTIALLY_SHIPPED", "SHIPPED"] },
      },
    });
  }

  // Fetch artisan counters for sidebar badges
  if (role === "ARTISAN") {
    const artisan = await prisma.artisan.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (artisan) {
      [artisanPendingOrders, artisanUnansweredQuestions, artisanUnreadMessages] = await Promise.all([
        getArtisanPendingFulfillmentCount(artisan.id),
        prisma.productQuestion.count({ where: { artisanId: artisan.id, answer: null } }),
        prisma.message.count({
          where: {
            conversation: { artisanId: artisan.id },
            senderId: { not: session.user.id },
            isRead: false,
          },
        }),
      ]);
    }
  }

  const mobileTitle =
    role === "ADMIN" ? "Admin" : role === "ARTISAN" ? "Mi Taller" : "Mi Cuenta";

  const mobileLinks = [
    ...(role === "ADMIN"
      ? ADMIN_LINKS.map((l) => {
          if (l.href === "/portal/admin/postulaciones") return { ...l, badge: pendingPostulaciones };
          if (l.href === "/portal/admin/productos") return { ...l, badge: pendingProductModeration };
          if (l.href === "/portal/admin/fotos") return { ...l, badge: pendingPhotos };
          if (l.href === "/portal/admin/orfebres") return { ...l, badge: pendingOrfebreApplications };
          if (l.href === "/portal/admin/pedidos") return { ...l, badge: newPaidOrders };
          return l;
        })
      : []),
    ...(role === "ARTISAN"
      ? ARTISAN_LINKS.map((l) => {
          if (l.href === "/portal/orfebre/pedidos") return { ...l, badge: artisanPendingOrders };
          if (l.href === "/portal/orfebre/preguntas") return { ...l, badge: artisanUnansweredQuestions };
          if (l.href === "/portal/orfebre/mensajes") return { ...l, badge: artisanUnreadMessages };
          return l;
        })
      : []),
    ...(showBuyerSection ? BUYER_LINKS.map((l) => {
          if (l.href === "/portal/comprador/pedidos") return { ...l, badge: buyerActiveOrders };
          return l;
        }) : []),
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
              <Link href="/portal/admin/invitaciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Invitaciones</Link>
              <Link
                href="/portal/admin/postulaciones"
                className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
              >
                <span>Postulaciones</span>
                {pendingPostulaciones > 0 && (
                  <span className="min-w-[1.25rem] rounded-full bg-accent px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                    {pendingPostulaciones > 99 ? "99+" : pendingPostulaciones}
                  </span>
                )}
              </Link>
              <SidebarLink href="/portal/admin/productos" label="Productos" count={pendingProductModeration} />
              <SidebarLink href="/portal/admin/fotos" label="Fotos" count={pendingPhotos} />
              <SidebarLink href="/portal/admin/orfebres" label="Orfebres" count={pendingOrfebreApplications} />
              <Link href="/portal/admin/planes" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Planes</Link>
              <Link href="/portal/admin/suscripciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Suscripciones</Link>
              <SidebarLink href="/portal/admin/pedidos" label="Pedidos" count={newPaidOrders} />
              <Link href="/portal/admin/disputas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Disputas</Link>
              <Link href="/portal/admin/devoluciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Devoluciones</Link>
              <Link href="/portal/admin/catalogo" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Catálogo</Link>
              <Link href="/portal/admin/compradores" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Compradores</Link>
              <Link href="/portal/admin/gift-cards" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Gift Cards</Link>
              <Link href="/portal/admin/finanzas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Finanzas</Link>
              <Link href="/portal/admin/mensajes" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mensajes</Link>
              <Link href="/portal/admin/preguntas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Preguntas</Link>
              <Link href="/portal/admin/despacho" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Despacho</Link>
              <Link href="/portal/admin/materiales-precio" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Materiales Ref.</Link>
              <Link href="/portal/admin/analytics" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Analytics</Link>
            </>
          )}
          {role === "ARTISAN" && (
            <>
              <Link href="/portal/orfebre" data-tour="orfebre-dashboard" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Taller</Link>
              <Link href="/portal/orfebre/productos" data-tour="orfebre-productos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Piezas</Link>
              <Link href="/portal/orfebre/colecciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Colecciones</Link>
              <SidebarLink href="/portal/orfebre/pedidos" label="Pedidos" count={artisanPendingOrders} dataTour="orfebre-pedidos" />
              <SidebarLink href="/portal/orfebre/preguntas" label="Preguntas" count={artisanUnansweredQuestions} dataTour="orfebre-preguntas" />
              <SidebarLink href="/portal/orfebre/mensajes" label="Mensajes" count={artisanUnreadMessages} dataTour="orfebre-mensajes" />
              <Link href="/portal/orfebre/finanzas" data-tour="orfebre-finanzas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Finanzas</Link>
              <Link href="/portal/orfebre/estadisticas" data-tour="orfebre-estadisticas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Estadísticas</Link>
              <Link href="/portal/orfebre/herramientas/calculadora" data-tour="orfebre-calculadora" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Calculadora</Link>
              <Link href="/portal/orfebre/perfil" data-tour="orfebre-perfil" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Perfil</Link>
            </>
          )}
          {showBuyerSection && (
            <>
              {(role === "ADMIN" || role === "ARTISAN") && (
                <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">Comprador</p>
              )}
              <SidebarLink href="/portal/comprador/pedidos" label="Mis Pedidos" count={buyerActiveOrders} dataTour="buyer-pedidos" />
              <Link href="/portal/comprador/gift-cards" data-tour="buyer-giftcards" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Gift Cards</Link>
              <Link href="/portal/comprador/mensajes" data-tour="buyer-mensajes" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mensajes</Link>
              <Link href="/portal/comprador/favoritos" data-tour="buyer-favoritos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Favoritos</Link>
              <Link href="/portal/comprador/listas" data-tour="buyer-listas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Listas</Link>
              <Link href="/portal/comprador/referidos" data-tour="buyer-referidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Invita Amigos</Link>
              <Link href="/portal/comprador/perfil" data-tour="buyer-perfil" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Cuenta</Link>
            </>
          )}

          <div className="mt-6 border-t border-border pt-4 space-y-2">
            {role === "ARTISAN" && <OrfebreTour />}
            {showBuyerSection && role === "BUYER" && <BuyerPortalTour />}
            <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-tertiary transition-colors hover:text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver al sitio
            </Link>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
          <PortalMobileNav title={mobileTitle} links={mobileLinks} />
          <Link href="/" className="flex items-center">
            <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={90} height={20} />
          </Link>
          {role === "ARTISAN" && <OrfebreTour />}
          {showBuyerSection && role === "BUYER" && <BuyerPortalTour />}
        </div>

        <div className="max-w-full min-w-0 p-4 pb-16 sm:p-6 sm:pb-16 lg:p-8 lg:pb-16">{children}</div>
      </div>
      <SupportBanner />
    </div>
  );
}

function SidebarLink({ href, label, count, dataTour }: { href: string; label: string; count: number; dataTour?: string }) {
  return (
    <Link
      href={href}
      data-tour={dataTour}
      className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
    >
      <span>{label}</span>
      {count > 0 && (
        <span className="min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

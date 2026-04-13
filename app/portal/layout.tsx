import type { Metadata } from "next";
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
import { PortalChatbot } from "@/components/chat/portal-chatbot";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

const ADMIN_LINKS = [
  { href: "/portal/admin", label: "Dashboard" },
  { href: "/portal/admin/invitaciones", label: "Invitaciones" },
  { href: "/portal/admin/postulaciones", label: "Postulaciones" },
  { href: "/portal/admin/productos", label: "Productos", ai: true },
  { href: "/portal/admin/fotos", label: "Fotos", ai: true },
  { href: "/portal/admin/orfebres", label: "Orfebres", ai: true },
  { href: "/portal/admin/compradores", label: "Compradores" },
  { href: "/portal/admin/planes", label: "Planes" },
  { href: "/portal/admin/suscripciones", label: "Suscripciones" },
  { href: "/portal/admin/pedidos", label: "Pedidos" },
  { href: "/portal/admin/disputas", label: "Disputas" },
  { href: "/portal/admin/devoluciones", label: "Devoluciones" },
  { href: "/portal/admin/pagos", label: "Pagos" },
  { href: "/portal/admin/catalogo", label: "Catálogo" },
  { href: "/portal/admin/colecciones", label: "Colecciones", ai: true },
  { href: "/portal/admin/gift-cards", label: "Gift Cards" },
  { href: "/portal/admin/finanzas", label: "Finanzas" },
  { href: "/portal/admin/mensajes", label: "Mensajes" },
  { href: "/portal/admin/preguntas", label: "Preguntas" },
  { href: "/portal/admin/contacto", label: "Contacto" },
  { href: "/portal/admin/despacho", label: "Despacho" },
  { href: "/portal/admin/materiales-precio", label: "Materiales Ref." },
  { href: "/portal/admin/analytics", label: "Analytics", ai: true },
  { href: "/portal/admin/blog", label: "Blog", ai: true },
  { href: "/portal/admin/pipeline", label: "Pipeline", ai: true },
];

const ARTISAN_LINKS = [
  { href: "/portal/orfebre", label: "Mi Taller" },
  { href: "/portal/orfebre/productos", label: "Mis Piezas", ai: true },
  { href: "/portal/orfebre/colecciones", label: "Colecciones", ai: true },
  { href: "/portal/orfebre/pedidos", label: "Pedidos" },
  { href: "/portal/orfebre/preguntas", label: "Preguntas", ai: true },
  { href: "/portal/orfebre/mensajes", label: "Mensajes" },
  { href: "/portal/orfebre/finanzas", label: "Finanzas" },
  { href: "/portal/orfebre/estadisticas", label: "Estadísticas", ai: true },
  { href: "/portal/orfebre/herramientas/calculadora", label: "Calculadora", ai: true },
  { href: "/portal/orfebre/ia", label: "Asistente IA", ai: true },
  { href: "/portal/orfebre/blog", label: "Blog" },
  { href: "/portal/orfebre/perfil", label: "Mi Perfil" },
  { href: "/portal/orfebre/privacidad", label: "Privacidad" },
];

const BUYER_LINKS = [
  { href: "/portal/comprador/pedidos", label: "Mis Pedidos" },
  { href: "/portal/comprador/gift-cards", label: "Gift Cards" },
  { href: "/portal/comprador/mensajes", label: "Mensajes" },
  { href: "/portal/comprador/favoritos", label: "Favoritos", ai: true },
  { href: "/portal/comprador/listas", label: "Mis Listas" },
  { href: "/portal/comprador/referidos", label: "Invita Amigos" },
  { href: "/portal/comprador/perfil", label: "Mi Cuenta" },
  { href: "/portal/comprador/privacidad", label: "Privacidad" },
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
  let openDisputes = 0;
  let pendingReturns = 0;
  let lateShipments = 0;
  let bypassConversations = 0;
  let unansweredQuestions = 0;
  let pendingContactForms = 0;
  let artisanPendingOrders = 0;
  let artisanUnansweredQuestions = 0;
  let artisanUnreadMessages = 0;
  let buyerActiveOrders = 0;

  if (session.user.role === "ADMIN") {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    [
      pendingPostulaciones,
      pendingProductModeration,
      pendingOrfebreApplications,
      pendingPhotos,
      newPaidOrders,
      openDisputes,
      pendingReturns,
      lateShipments,
      bypassConversations,
      unansweredQuestions,
      pendingContactForms,
    ] = await Promise.all([
      prisma.artisanApplication.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.artisan.count({ where: { status: "PENDING" } }),
      prisma.productImage.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.orderItem.count({ where: { fulfillmentStatus: "PENDING", order: { status: "PAID" } } }),
      prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
      prisma.returnRequest.count({ where: { status: { in: ["REQUESTED", "APPROVED"] } } }),
      prisma.orderItem.count({ where: { fulfillmentStatus: { in: ["PENDING", "PREPARING"] }, createdAt: { lt: fiveDaysAgo }, order: { status: { not: "PENDING_PAYMENT" } } } }),
      prisma.conversation.count({ where: { hasBypassAttempt: true, status: "ACTIVE", deletedAt: null } }),
      prisma.productQuestion.count({ where: { answer: null, createdAt: { lte: fortyEightHoursAgo } } }),
      prisma.contactSubmission.count({ where: { status: "PENDING" } }),
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
          if (l.href === "/portal/admin/disputas") return { ...l, badge: openDisputes };
          if (l.href === "/portal/admin/devoluciones") return { ...l, badge: pendingReturns };
          if (l.href === "/portal/admin/despacho") return { ...l, badge: lateShipments };
          if (l.href === "/portal/admin/mensajes") return { ...l, badge: bypassConversations };
          if (l.href === "/portal/admin/preguntas") return { ...l, badge: unansweredQuestions };
          if (l.href === "/portal/admin/contacto") return { ...l, badge: pendingContactForms };
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
    ...(showBuyerSection
      ? BUYER_LINKS.map((l) => {
          if (l.href === "/portal/comprador/pedidos") return { ...l, badge: buyerActiveOrders };
          return l;
        })
      : []),
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
              {ADMIN_LINKS.map((link) => {
                const badgeCounts: Record<string, number> = {
                  "/portal/admin/postulaciones": pendingPostulaciones,
                  "/portal/admin/productos": pendingProductModeration,
                  "/portal/admin/fotos": pendingPhotos,
                  "/portal/admin/orfebres": pendingOrfebreApplications,
                  "/portal/admin/pedidos": newPaidOrders,
                  "/portal/admin/disputas": openDisputes,
                  "/portal/admin/devoluciones": pendingReturns,
                  "/portal/admin/despacho": lateShipments,
                  "/portal/admin/mensajes": bypassConversations,
                  "/portal/admin/preguntas": unansweredQuestions,
                  "/portal/admin/contacto": pendingContactForms,
                };
                const count = badgeCounts[link.href] ?? 0;
                if (count > 0 || link.ai) {
                  return <SidebarLink key={link.href} href={link.href} label={link.label} count={count} ai={link.ai} />;
                }
                return (
                  <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">
                    {link.label}
                  </Link>
                );
              })}
            </>
          )}
          {role === "ARTISAN" && (
            <>
              {ARTISAN_LINKS.map((link) => {
                const badgeCounts: Record<string, number> = {
                  "/portal/orfebre/pedidos": artisanPendingOrders,
                  "/portal/orfebre/preguntas": artisanUnansweredQuestions,
                  "/portal/orfebre/mensajes": artisanUnreadMessages,
                };
                const dataTours: Record<string, string> = {
                  "/portal/orfebre": "orfebre-dashboard",
                  "/portal/orfebre/productos": "orfebre-productos",
                  "/portal/orfebre/pedidos": "orfebre-pedidos",
                  "/portal/orfebre/preguntas": "orfebre-preguntas",
                  "/portal/orfebre/mensajes": "orfebre-mensajes",
                  "/portal/orfebre/finanzas": "orfebre-finanzas",
                  "/portal/orfebre/estadisticas": "orfebre-estadisticas",
                  "/portal/orfebre/herramientas/calculadora": "orfebre-calculadora",
                  "/portal/orfebre/perfil": "orfebre-perfil",
                };
                const count = badgeCounts[link.href] ?? 0;
                const tour = dataTours[link.href];
                if (count > 0 || link.ai) {
                  return <SidebarLink key={link.href} href={link.href} label={link.label} count={count} dataTour={tour} ai={link.ai} />;
                }
                return (
                  <Link key={link.href} href={link.href} data-tour={tour} className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">
                    {link.label}
                  </Link>
                );
              })}
            </>
          )}
          {showBuyerSection && (
            <>
              {(role === "ADMIN" || role === "ARTISAN") && (
                <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">Comprador</p>
              )}
              {BUYER_LINKS.map((link) => {
                const badgeCounts: Record<string, number> = {
                  "/portal/comprador/pedidos": buyerActiveOrders,
                };
                const dataTours: Record<string, string> = {
                  "/portal/comprador/pedidos": "buyer-pedidos",
                  "/portal/comprador/gift-cards": "buyer-giftcards",
                  "/portal/comprador/mensajes": "buyer-mensajes",
                  "/portal/comprador/favoritos": "buyer-favoritos",
                  "/portal/comprador/listas": "buyer-listas",
                  "/portal/comprador/referidos": "buyer-referidos",
                  "/portal/comprador/perfil": "buyer-perfil",
                };
                const count = badgeCounts[link.href] ?? 0;
                const tour = dataTours[link.href];
                if (count > 0 || link.ai) {
                  return <SidebarLink key={link.href} href={link.href} label={link.label} count={count} dataTour={tour} ai={link.ai} />;
                }
                return (
                  <Link key={link.href} href={link.href} data-tour={tour} className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">
                    {link.label}
                  </Link>
                );
              })}
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
      {(role === "ARTISAN" || role === "BUYER" || role === "ADMIN") && (
        <PortalChatbot portalContext={role === "ADMIN" ? "admin" : role === "ARTISAN" ? "orfebre" : "comprador"} />
      )}
      <SupportBanner />
    </div>
  );
}

function AiBadge() {
  return (
    <span className="ml-1 inline-flex items-center rounded-full border border-[#8B7355]/30 bg-[#8B7355]/10 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-[#8B7355]">
      AI
    </span>
  );
}

function SidebarLink({ href, label, count, dataTour, ai }: { href: string; label: string; count: number; dataTour?: string; ai?: boolean }) {
  return (
    <Link
      href={href}
      data-tour={dataTour}
      className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
    >
      <span className="flex items-center">
        {label}
        {ai && <AiBadge />}
      </span>
      {count > 0 && (
        <span className="min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

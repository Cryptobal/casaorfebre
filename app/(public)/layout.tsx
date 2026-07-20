import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { ShoppingChatbot } from "@/components/chat/shopping-chatbot";
import { ReferralTracker } from "@/components/shared/referral-tracker";
import { EmailVerificationBanner } from "@/components/shared/email-verification-banner";
import { Toaster } from "@/components/ui/toast";

// Layout 100% estático: no llama a auth() ni a Prisma.
// Esto permite que las páginas hijas (home, /coleccion/[slug], categorías, etc.)
// puedan ser cacheadas por Vercel y respetar su `revalidate`, lo que es
// crítico para que Google las indexe.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <EmailVerificationBanner />
      <main id="main-content" className="min-h-[calc(100dvh-4rem)] pb-[104px] md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
      <Toaster />
      <ShoppingChatbot />
      {/* ReferralTracker usa useSearchParams; Suspense permite prerender estático del layout. */}
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
    </>
  );
}

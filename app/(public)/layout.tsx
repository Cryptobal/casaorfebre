import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShoppingChatbot } from "@/components/chat/shopping-chatbot";
import { ReferralTracker } from "@/components/shared/referral-tracker";
import { EmailVerificationBanner } from "@/components/shared/email-verification-banner";

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
      <Navbar />
      <EmailVerificationBanner />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
      <ShoppingChatbot />
      {/* ReferralTracker usa useSearchParams; Suspense permite prerender estático del layout. */}
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
    </>
  );
}

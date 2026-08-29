import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReferralTracker } from "@/components/shared/referral-tracker";
import { EmailVerificationBanner } from "@/components/shared/email-verification-banner";
import { Toaster } from "@/components/ui/toast";

// Layout 100% estático: no llama a auth() ni a Prisma.
// En modo atelier la home es un one-pager cacheable; el blog sigue usando este layout.
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
      <main id="main-content" className="min-h-dvh">
        {children}
      </main>
      <Footer />
      <Toaster />
      {/* ReferralTracker usa useSearchParams; Suspense permite prerender estático del layout. */}
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
    </>
  );
}

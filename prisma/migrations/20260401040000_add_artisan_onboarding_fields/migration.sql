-- Artisan onboarding tracking (Growth Engine / nurturing)
ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "onboardingStep" TEXT DEFAULT 'WELCOME';
ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "onboardingEmailsSent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "lastOnboardingEmailAt" TIMESTAMP(3);

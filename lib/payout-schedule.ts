/**
 * Payout schedule helpers — calculates payout eligibility dates
 * based on artisan's membership plan.
 */

interface ArtisanWithSubscription {
  subscriptions?: Array<{
    status: string;
    plan: { payoutFrequency: string };
  }>;
}

/**
 * Returns the number of days after confirmed receipt before payout is released.
 * Matches MembershipPlan.payoutFrequency values in the database.
 */
export function getPayoutDaysForArtisan(artisan: ArtisanWithSubscription): number {
  const activeSub = artisan.subscriptions?.find((s) => s.status === "ACTIVE");
  if (!activeSub) return 14; // Default (esencial)

  switch (activeSub.plan.payoutFrequency) {
    case "48h":
      return 2; // Maestro
    case "semanal":
      return 7; // Artesano
    case "quincenal":
      return 14; // Esencial
    default:
      return 14;
  }
}

export function getPlanNameForFrequency(payoutFrequency: string): string {
  switch (payoutFrequency) {
    case "48h":
      return "Maestro";
    case "semanal":
      return "Artesano";
    case "quincenal":
      return "Esencial";
    default:
      return "Esencial";
  }
}

export function calculatePayoutEligibleDate(receivedAt: Date, payoutDays: number): Date {
  const eligible = new Date(receivedAt);
  eligible.setDate(eligible.getDate() + payoutDays);
  return eligible;
}

/**
 * Shared configuration helpers.
 * MP_SANDBOX defaults to true (sandbox) when not explicitly set to "false".
 * This prevents accidental production charges if the env var is missing.
 */
export const isSandbox = () => process.env.MP_SANDBOX !== "false";

/** Admin notification emails — configurable via ADMIN_NOTIFICATION_EMAILS env var. */
export const getAdminEmails = (): string[] =>
  (
    process.env.ADMIN_NOTIFICATION_EMAILS ||
    "carlos.irigoyen@gmail.com,camilatorrespuga@gmail.com"
  )
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

/**
 * Shared configuration helpers.
 * MP_SANDBOX defaults to true (sandbox) when not explicitly set to "false".
 * This prevents accidental production charges if the env var is missing.
 */
export const isSandbox = () => process.env.MP_SANDBOX !== "false";

/** Message francais commun quand Supabase limite l'envoi d'e-mails/codes. */
export const OTP_RATE_LIMIT_MESSAGE =
  "Un code vous a déjà été envoyé. Veuillez patienter avant de renouveler la demande.";

/** Detecte une limite de debit Supabase Auth (HTTP 429, code
 * over_email_send_rate_limit / over_request_rate_limit, ou message du type
 * "email rate limit exceeded" / "you can only request this after N seconds"). */
export function isSupabaseRateLimitError(
  error: { status?: number; code?: string; message?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.status === 429) return true;
  if (error.code && /rate_limit/i.test(error.code)) return true;
  return /rate limit|after \d+ seconds|too many requests/i.test(error.message ?? "");
}

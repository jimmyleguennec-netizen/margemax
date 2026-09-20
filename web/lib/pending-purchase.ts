// Memo cote navigateur d'un achat DEMARRE (redirection vers Stripe), pour que
// le dashboard sache qu'un retour de paiement est attendu et le verifie
// contre les VRAIES lignes credit_purchases -- jamais une celebration sans
// achat confirme par le webhook. Sans effet sur le paiement lui-meme.
const PENDING_KEY = "margemax_pending_purchase";
const CELEBRATED_KEY = "margemax_celebrated_purchase_id";

export type PendingPurchase = { packKey: string; credits: number; ts: number };

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export function markPurchaseStarted(packKey: string, credits: number): void {
  safe(() =>
    window.localStorage.setItem(PENDING_KEY, JSON.stringify({ packKey, credits, ts: Date.now() }))
  );
}

export function readPendingPurchase(): PendingPurchase | null {
  return safe(() => {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPurchase;
    // Au-dela de 2 h, un achat "en attente" est considere abandonne.
    return Date.now() - parsed.ts < 2 * 60 * 60 * 1000 ? parsed : null;
  });
}

export function clearPendingPurchase(): void {
  safe(() => window.localStorage.removeItem(PENDING_KEY));
}

export function wasCelebrated(purchaseId: number | string): boolean {
  return safe(() => window.localStorage.getItem(CELEBRATED_KEY) === String(purchaseId)) ?? false;
}

export function markCelebrated(purchaseId: number | string): void {
  safe(() => window.localStorage.setItem(CELEBRATED_KEY, String(purchaseId)));
}

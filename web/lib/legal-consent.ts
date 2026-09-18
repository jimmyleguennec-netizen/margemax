/**
 * Source unique de verite pour le texte de consentement "execution
 * immediate + renonciation au droit de retractation" (art. L.221-28 du
 * Code de la consommation), partagee entre le composant d'affichage
 * (CheckoutConsentDialog) et la route API qui enregistre le consentement
 * (/api/consent/checkout). Toute modification du libelle doit incrementer
 * CGV_CONSENT_VERSION pour que les enregistrements passes restent
 * distinguables du texte actuellement affiche.
 */
export const CGV_CONSENT_VERSION = "cgv-2026-09-18";

export const IMMEDIATE_EXECUTION_WAIVER_LABEL =
  "Je demande expressément que l'exécution du service commence immédiatement, " +
  "et je renonce expressément à mon droit de rétractation de 14 jours pour cet achat " +
  "(article L.221-28 du Code de la consommation).";

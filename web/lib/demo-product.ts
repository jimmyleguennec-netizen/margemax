/**
 * Produit de demonstration du Dashboard ("Voir une analyse exemple") :
 * re-analyse periodiquement en direct (voir app/api/demo/route.ts) au lieu
 * de chiffres fixes qui deviendraient faux. Modifiable sans deploiement de
 * code via la variable d'environnement DEMO_PRODUCT_URL (Vercel).
 */
export const DEMO_PRODUCT_URL =
  process.env.DEMO_PRODUCT_URL?.trim() ||
  "https://fr.aliexpress.com/item/1005006478208156.html";

/** Duree pendant laquelle le resultat reste en cache avant un nouveau scrape. */
export const DEMO_REFRESH_SECONDS = 60 * 60;

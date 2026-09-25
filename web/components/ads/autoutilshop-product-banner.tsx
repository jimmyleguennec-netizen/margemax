/**
 * Banniere promotionnelle d'un produit phare d'AutOutilShop (autoutilshop.fr).
 * Toute la banniere est un lien : clic sur l'image, le titre ou le bouton =
 * fiche produit ouverte dans un nouvel onglet (MargeMax reste ouvert).
 *
 * Produit, prix et image sont centralises dans FEATURED_PRODUCT ci-dessous
 * (donnees copiees de la page d'accueil d'autoutilshop.fr, section "Nos
 * essentiels") : a mettre a jour ici si le produit phare change.
 */
const FEATURED_PRODUCT = {
  name: "Spray de protection carrosserie effet brillant",
  price: "24,90 €",
  url: "https://autoutilshop.fr/produit/spray-protection-carosserie-voiture/",
  imageUrl: "https://autoutilshop.fr/wp-content/uploads/2026/05/9144612424128.jpg",
  imageAlt: "Spray protection carrosserie AutOutilShop, flacon 50 ml effet brillant nano-revêtement",
} as const;

export function AutoutilshopProductBanner({ className = "" }: { className?: string }) {
  return (
    <a
      href={FEATURED_PRODUCT.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${FEATURED_PRODUCT.name} sur AutOutilShop.fr — Acheter maintenant (s'ouvre dans un nouvel onglet)`}
      className={`group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-left shadow-[0_0_30px_-12px_rgba(34,211,238,0.5)] transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_36px_-8px_rgba(217,70,239,0.55)] ${className}`}
    >
      <p className="border-b border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/50">
        Publicité · AutOutilShop.fr
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FEATURED_PRODUCT.imageUrl}
        alt={FEATURED_PRODUCT.imageAlt}
        loading="lazy"
        decoding="async"
        className="aspect-square w-full bg-white object-cover"
      />
      <div className="space-y-2 p-3">
        <p className="text-sm font-semibold leading-snug text-white">
          Découvre l&apos;outil indispensable auto
        </p>
        <p className="text-xs leading-snug text-white/70">{FEATURED_PRODUCT.name}</p>
        <p className="text-base font-bold text-cyan-300">{FEATURED_PRODUCT.price}</p>
        <span className="block rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white transition-transform duration-300 group-hover:scale-[1.03]">
          Acheter maintenant
        </span>
      </div>
    </a>
  );
}

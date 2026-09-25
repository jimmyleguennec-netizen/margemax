/**
 * Banniere promotionnelle d'un produit phare d'AutOutilShop (autoutilshop.fr).
 * Toute la banniere est un lien : clic sur l'image, le titre ou le bouton =
 * fiche produit ouverte dans un nouvel onglet (MargeMax reste ouvert).
 *
 * Couleurs de la marque AutOutilShop (rouge #BD0303, secondaire #D32F2F, fond
 * #0B0B0B, bouton en pilule) : l'encart se distingue ainsi du reste de MargeMax.
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
      className={`group block overflow-hidden rounded-xl border-2 border-[#BD0303] bg-[#0B0B0B] text-left shadow-[0_0_24px_-10px_rgba(189,3,3,0.7)] transition-all duration-300 hover:border-[#D32F2F] hover:shadow-[0_0_30px_-6px_rgba(211,47,47,0.75)] ${className}`}
    >
      <p className="border-b border-[#BD0303]/40 bg-[#BD0303]/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/60">
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
        <p className="text-base font-bold text-[#FF5A5A]">{FEATURED_PRODUCT.price}</p>
        <span className="block rounded-full bg-[#BD0303] px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white transition-all duration-300 group-hover:scale-[1.03] group-hover:bg-[#D32F2F]">
          Acheter maintenant
        </span>
      </div>
    </a>
  );
}

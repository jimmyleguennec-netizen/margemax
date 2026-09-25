"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Carrousel promotionnel de produits phares d'AutOutilShop (autoutilshop.fr).
 * Chaque diapositive est un lien : clic sur l'image, le titre ou le bouton =
 * fiche produit ouverte dans un nouvel onglet (MargeMax reste ouvert).
 *
 * Couleurs de la marque AutOutilShop (rouge #BD0303, secondaire #D32F2F, fond
 * #0B0B0B, bouton en pilule) : l'encart se distingue ainsi du reste de MargeMax.
 *
 * Produits, prix et images : donnees copiees de la page d'accueil
 * d'autoutilshop.fr (section "Nos essentiels") -- a mettre a jour ici si la
 * selection change.
 */
type FeaturedProduct = {
  title: string;
  subtitle: string;
  price: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
};

const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    title: "Une carrosserie qui brille",
    subtitle: "Spray de protection carrosserie effet brillant",
    price: "24,90 €",
    url: "https://autoutilshop.fr/produit/spray-protection-carosserie-voiture/",
    imageUrl: "https://autoutilshop.fr/wp-content/uploads/2026/05/9144612424128.jpg",
    imageAlt: "Spray protection carrosserie AutOutilShop, flacon 50 ml effet brillant nano-revêtement",
    buttonText: "Acheter maintenant",
  },
  {
    title: "Un habitacle impeccable",
    subtitle: "Aspirateur voiture sans fil 6000 Pa",
    price: "22,90 €",
    url: "https://autoutilshop.fr/produit/aspirateur-voiture-sans-fil/",
    imageUrl: "https://autoutilshop.fr/wp-content/uploads/2026/05/aspirateur_4096_final-1.jpg",
    imageAlt: "Aspirateur voiture sans fil AutOutilShop, aspiration 6000 Pa pour habitacle et sièges",
    buttonText: "Voir le produit",
  },
  {
    title: "Découvre l'outil indispensable auto",
    subtitle: "Jeu de clés BTR et Torx",
    price: "dès 24,90 €",
    url: "https://autoutilshop.fr/produit/jeu-de-cle-allen-btr-ou-torx-outils-voiture/",
    imageUrl: "https://autoutilshop.fr/wp-content/uploads/2026/05/1618549342663.jpg",
    imageAlt: "Jeu de clés Allen BTR et Torx pour les petites réparations auto",
    buttonText: "Acheter maintenant",
  },
  {
    title: "Fini la crevaison qui gâche la journée",
    subtitle: "Kit de réparation de crevaison pour pneu",
    price: "12,90 €",
    url: "https://autoutilshop.fr/produit/kit-reparation-pneu-voiture/",
    imageUrl: "https://autoutilshop.fr/wp-content/uploads/2026/05/kit_reparation_pneu_4195_final.jpg",
    imageAlt: "Kit de réparation crevaison pneu AutOutilShop avec mèches, outils et colle",
    buttonText: "Acheter maintenant",
  },
];

const AUTO_ADVANCE_MS = 4000;

export function AutoutilshopProductBanner({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = FEATURED_PRODUCTS.length;

  // Respect de "reduire les animations" : pas de defilement automatique.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Defilement automatique toutes les 4 s, en pause au survol/focus. Le
  // minuteur est recree a chaque changement d'index (un clic manuel relance
  // donc le delai complet) et nettoye au demontage.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, index, count]);

  const product = FEATURED_PRODUCTS[index];
  const previous = () => setIndex((current) => (current - 1 + count) % count);
  const next = () => setIndex((current) => (current + 1) % count);

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Produits AutOutilShop"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`group relative overflow-hidden rounded-xl border-2 border-[#BD0303] bg-[#0B0B0B] text-left shadow-[0_0_24px_-10px_rgba(189,3,3,0.7)] transition-all duration-300 hover:border-[#D32F2F] hover:shadow-[0_0_30px_-6px_rgba(211,47,47,0.75)] ${className}`}
    >
      <p className="border-b border-[#BD0303]/40 bg-[#BD0303]/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/60">
        Publicité · AutOutilShop.fr
      </p>

      <a
        key={product.url}
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${product.subtitle} sur AutOutilShop.fr — ${product.buttonText} (s'ouvre dans un nouvel onglet)`}
        className="group/slide block animate-in fade-in duration-300"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full bg-white object-cover"
        />
        <div className="space-y-2 p-3 pb-2">
          <p className="min-h-[2.5rem] text-sm font-semibold leading-snug text-white">
            {product.title}
          </p>
          <p className="min-h-[2rem] text-xs leading-snug text-white/70">{product.subtitle}</p>
          <p className="text-base font-bold text-[#FF5A5A]">{product.price}</p>
          <span className="block rounded-full bg-[#BD0303] px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white transition-all duration-300 group-hover/slide:scale-[1.03] group-hover/slide:bg-[#D32F2F]">
            {product.buttonText}
          </span>
        </div>
      </a>

      {/* Fleches : calque de la taille de l'image (carre), en dehors du lien
          (pas de bouton dans un lien) ; toujours visibles. */}
      <div className="pointer-events-none absolute inset-x-0 top-[1.75rem] flex aspect-square items-center justify-between px-1.5">
        <button
          type="button"
          onClick={previous}
          aria-label="Produit précédent"
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-90 transition hover:bg-[#BD0303] focus-visible:bg-[#BD0303]"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Produit suivant"
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-90 transition hover:bg-[#BD0303] focus-visible:bg-[#BD0303]"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-3" role="tablist" aria-label="Choisir un produit">
        {FEATURED_PRODUCTS.map((item, i) => (
          <button
            key={item.url}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Produit ${i + 1} sur ${count} : ${item.subtitle}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-4 bg-[#BD0303]" : "w-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

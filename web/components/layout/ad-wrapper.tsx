import { AutoutilshopProductBanner } from "@/components/ads/autoutilshop-product-banner";

/**
 * Habillage lateral ("skyscraper") du dashboard : la banniere AutOutilShop est
 * fixee dans la marge droite de l'ecran, SANS modifier la mise en page du
 * contenu (position fixed : aucun overflow-hidden ni changement de flux, donc
 * la Navbar sticky n'est pas affectee). Masquee sous 1280 px (`hidden
 * xl:block`) : jamais de banniere sur mobile/tablette.
 */
export function AdWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <aside
        aria-label="Publicité"
        className="pointer-events-auto fixed right-4 top-28 z-20 hidden w-[200px] xl:block 2xl:right-8"
      >
        <AutoutilshopProductBanner />
      </aside>
    </>
  );
}

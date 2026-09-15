import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "CGV / CGU — MargeMax",
};

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente et d'utilisation"
      updatedAt="[à compléter]"
    >
      <LegalSection title="Objet">
        <p>
          Les présentes conditions régissent l&apos;utilisation du service
          MargeMax et l&apos;achat de packs de crédits prépayés permettant
          d&apos;analyser des produits AliExpress (prix, livraison, frais
          d&apos;importation réels, marge et ROI).
        </p>
      </LegalSection>

      <LegalSection title="Fonctionnement des crédits">
        <p>
          Les crédits sont vendus par packs, sans abonnement ni engagement.
          Un crédit correspond à une analyse complète d&apos;un produit.
          Les crédits achetés n&apos;expirent pas. Aucun crédit n&apos;est
          débité en cas d&apos;échec d&apos;analyse (produit indisponible,
          page inaccessible...).
        </p>
      </LegalSection>

      <LegalSection title="Prix et paiement">
        <p>
          Les prix des packs de crédits sont indiqués en euros, toutes taxes
          comprises. Le paiement est traité par Stripe, prestataire de
          paiement tiers ; MargeMax ne stocke aucune donnée de carte
          bancaire.
        </p>
      </LegalSection>

      <LegalSection title="Droit de rétractation">
        <p>
          [À compléter selon le régime applicable -- le droit de
          rétractation prévu par le Code de la consommation peut ne pas
          s&apos;appliquer une fois le service numérique pleinement exécuté
          avec l&apos;accord exprès du client, conformément à l&apos;article
          L221-28 du Code de la consommation. À faire valider par un
          professionnel du droit.]
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          MargeMax fournit une aide à la décision basée sur des données
          extraites d&apos;AliExpress. MargeMax ne garantit pas la
          disponibilité permanente des produits ni l&apos;exactitude absolue
          des informations tierces affichées, et ne saurait être tenu
          responsable des décisions commerciales prises sur cette base.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative à ces conditions, contactez-nous via
          le formulaire de contact du site ou à [adresse email de contact].
        </p>
      </LegalSection>
    </LegalPage>
  );
}

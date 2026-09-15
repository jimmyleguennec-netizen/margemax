import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "CGV / CGU — MargeMax",
};

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente et d'utilisation"
      updatedAt="15 septembre 2026"
    >
      <LegalSection title="Objet">
        <p>
          Les présentes conditions générales de vente et d&apos;utilisation
          (« CGV/CGU ») ont pour objet de définir les modalités et
          conditions dans lesquelles la société AutOutilShop SAS, éditrice
          du service MargeMax, fournit à ses clients des services
          d&apos;analyse de données de sourcing e-commerce -- notamment le
          calcul du coût réel d&apos;un produit (prix, livraison, frais
          d&apos;importation) et de la marge associée -- au moyen d&apos;un
          système de crédits à l&apos;acte.
        </p>
        <p>
          Toute utilisation du service MargeMax implique l&apos;acceptation
          sans réserve des présentes CGV/CGU.
        </p>
      </LegalSection>

      <LegalSection title="Tarification et fonctionnement des crédits">
        <p>
          L&apos;accès aux fonctionnalités d&apos;analyse de MargeMax
          s&apos;effectue exclusivement au moyen de crédits prépayés, vendus
          par packs, sans abonnement ni engagement de durée ni
          renouvellement automatique. Le client règle un paiement ponctuel
          via Stripe pour chaque pack de crédits acheté.
        </p>
        <p>
          Les crédits achetés n&apos;ont aucune date d&apos;expiration et
          restent valables à vie sur le compte du client, quelle que soit la
          fréquence d&apos;utilisation du service.
        </p>
      </LegalSection>

      <LegalSection title="Droit de rétractation">
        <p>
          Conformément à l&apos;article L.221-28 du Code de la consommation,
          le droit de rétractation ne peut être exercé pour les contrats de
          fourniture d&apos;un service pleinement exécuté avant la fin du
          délai de rétractation et dont l&apos;exécution a commencé après
          accord préalable exprès du consommateur et renoncement exprès à
          son droit de rétractation.
        </p>
        <p>
          En conséquence, le client reconnaît et accepte expressément que
          son droit de rétractation ne pourra plus être exercé dès lors que
          l&apos;exécution du service a commencé, c&apos;est-à-dire dès
          qu&apos;au moins un crédit du pack acheté a été consommé pour
          réaliser une analyse.
        </p>
        <p>
          Si aucun crédit du pack acheté n&apos;a été consommé, le client
          peut demander le remboursement intégral de son achat dans un délai
          de 14 jours à compter de la date de la commande, en écrivant à{" "}
          <a
            href="mailto:contact@autoutilshop.com"
            className="text-cyan-300 hover:underline"
          >
            contact@autoutilshop.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          MargeMax fournit des données indicatives (prix, frais de
          livraison, frais d&apos;importation, disponibilité) collectées en
          temps réel sur des plateformes tierces, notamment AliExpress. Ces
          données peuvent évoluer à tout moment du fait des vendeurs tiers,
          indépendamment de la volonté d&apos;AutOutilShop SAS.
        </p>
        <p>
          En conséquence, AutOutilShop SAS ne saurait être tenue responsable
          des variations de prix, de frais de livraison, de taxes ou de
          niveaux de stock appliquées par les vendeurs tiers postérieurement
          à une analyse réalisée sur MargeMax, ni des décisions commerciales
          prises par le client sur la base de ces données.
        </p>
      </LegalSection>

      <LegalSection title="Médiation de la consommation">
        <p>
          Conformément aux articles L.616-1 et R.616-1 du Code de la
          consommation, tout client consommateur dispose du droit de
          recourir gratuitement à un médiateur de la consommation en vue de
          la résolution amiable d&apos;un litige. Les coordonnées du
          médiateur compétent sont communiquées sur simple demande à{" "}
          <a
            href="mailto:contact@autoutilshop.com"
            className="text-cyan-300 hover:underline"
          >
            contact@autoutilshop.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative aux présentes CGV/CGU, le client peut
          contacter AutOutilShop SAS via le formulaire de contact du site ou
          à l&apos;adresse{" "}
          <a
            href="mailto:contact@autoutilshop.com"
            className="text-cyan-300 hover:underline"
          >
            contact@autoutilshop.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

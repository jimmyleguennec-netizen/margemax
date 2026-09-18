import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "CGV / CGU — MargeMax",
};

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente et d'utilisation"
      updatedAt="18 septembre 2026"
    >
      <LegalSection title="Objet">
        <p>
          Les présentes conditions générales de vente et d&apos;utilisation
          (« CGV/CGU ») ont pour objet de définir les modalités et
          conditions dans lesquelles la société AutOutilShop SAS, éditrice
          du service MargeMax, fournit à ses clients des services
          d&apos;analyse de données de sourcing e-commerce — notamment le
          calcul du coût d&apos;un produit (prix, livraison, frais
          d&apos;importation, confirmés ou estimés selon les données
          disponibles) et de la marge associée — au moyen d&apos;un
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
          MargeMax est une prestation de services (analyse de sourcing à la
          demande), et non un contenu numérique au sens du Code de la
          consommation. Le client consommateur dispose donc, par défaut,
          d&apos;un délai de rétractation de 14 jours à compter de la date
          de la commande, conformément à l&apos;article L.221-18 du Code de
          la consommation.
        </p>
        <p>
          Ce droit peut être perdu par exception, mais uniquement dans les
          conditions strictes prévues par l&apos;article L.221-28 : le
          client doit avoir demandé expressément, avant la fin du délai de
          14 jours, que l&apos;exécution du service commence immédiatement,
          et avoir expressément renoncé à son droit de rétractation pour
          cet achat précis. Cette demande et cette renonciation doivent
          résulter d&apos;une action distincte et non précochée du client au
          moment de la commande — elles ne peuvent pas résulter de la seule
          acceptation générale des présentes CGV/CGU.
        </p>
        <p>
          Depuis le 18 septembre 2026, cette action distincte est demandée
          au client sous la forme d&apos;une case à cocher dédiée,
          non précochée, affichée juste avant chaque paiement, associant
          explicitement la demande d&apos;exécution immédiate et la
          renonciation au droit de rétractation pour l&apos;achat en cours.
          Le consentement est horodaté et conservé. Pour toute commande
          passée avant cette date, aucune renonciation n&apos;a été
          recueillie et le délai de rétractation de 14 jours s&apos;est
          appliqué pleinement.
        </p>
        <p>
          Le paiement d&apos;un pack de crédits déclenche l&apos;ajout
          immédiat des crédits correspondants sur le compte du client — ce
          n&apos;est que le <strong className="text-white">début</strong>{" "}
          de l&apos;exécution du service, pas son exécution complète. Le
          service lui-même (l&apos;analyse de sourcing) ne s&apos;exécute
          qu&apos;au fur et à mesure que le client utilise chacun de ses
          crédits. Cette distinction, pertinente au regard des articles
          L.221-25 et L.221-28 du Code de la consommation, n&apos;a pas
          encore été formellement validée par un professionnel du droit —
          en cas de doute sur vos droits pour une commande précise, contactez
          AutOutilShop SAS avant d&apos;utiliser vos crédits.
        </p>
        <p>
          Pour exercer ce droit ou pour toute question, le client peut
          écrire à{" "}
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
          la résolution amiable d&apos;un litige, après une réclamation
          écrite préalable restée infructueuse auprès d&apos;AutOutilShop
          SAS.
        </p>
        <p className="text-white/50">
          Le nom, l&apos;adresse postale et le site internet du médiateur de
          la consommation désigné par AutOutilShop SAS sont en cours de
          finalisation et seront publiés sur cette page.
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

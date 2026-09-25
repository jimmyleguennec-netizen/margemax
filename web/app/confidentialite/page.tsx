import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité — MargeMax",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updatedAt="25 septembre 2026">
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées
          sur MargeMax est la société AutOutilShop SAS, 4 rue Gustave
          Delory, 11100 Narbonne, France --{" "}
          <a
            href="mailto:contact@autoutilshop.fr"
            className="text-cyan-300 hover:underline"
          >
            contact@autoutilshop.fr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Données collectées">
        <p>
          Dans le cadre de la création et de l&apos;utilisation d&apos;un
          compte MargeMax, sont collectées : l&apos;adresse email du client,
          ainsi que ses données de connexion et d&apos;utilisation du
          service (historique des analyses réalisées, solde et
          consommation de crédits).
        </p>
      </LegalSection>

      <LegalSection title="Finalité du traitement">
        <p>
          Ces données sont utilisées exclusivement pour la gestion du compte
          utilisateur, l&apos;attribution et le suivi des crédits, ainsi que
          la sécurisation des accès au service, via la plateforme
          d&apos;authentification Supabase.
        </p>
        <p>
          Le traitement des paiements est géré exclusivement par Stripe,
          prestataire de paiement tiers : AutOutilShop SAS ne collecte ni ne
          conserve aucune donnée de carte bancaire.
        </p>
      </LegalSection>

      <LegalSection title="Destinataires des données">
        <p>
          Les données personnelles sont traitées par AutOutilShop SAS et par
          ses sous-traitants techniques : Supabase (authentification et
          hébergement des données de compte) et Stripe (traitement des
          paiements). Aucune donnée personnelle de compte n&apos;est cédée,
          louée ou vendue à des tiers à des fins commerciales.
        </p>
        <p>
          Les données d&apos;usage et les cookies publicitaires peuvent par
          ailleurs être traités par nos partenaires de régie publicitaire
          (par exemple Google AdSense) et de paiement (Stripe), uniquement
          pour assurer le fonctionnement du service et l&apos;affichage
          d&apos;annonces.
        </p>
      </LegalSection>

      <LegalSection title="Cookies et publicité">
        <p>
          <strong className="text-white">
            Publicités tiers et Google AdSense :
          </strong>{" "}
          Nous utilisons Google AdSense pour afficher des annonces sur notre
          site. Google utilise des cookies pour diffuser des publicités en
          fonction des visites antérieures des utilisateurs sur notre site ou
          sur d&apos;autres pages web. Vous pouvez désactiver la publicité
          personnalisée dans les paramètres de votre compte Google.
        </p>
      </LegalSection>

      <LegalSection title="Conformité RGPD — vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données
          (RGPD) et à la loi Informatique et Libertés, tout utilisateur
          dispose d&apos;un droit d&apos;accès, de rectification et de
          suppression des données le concernant, ainsi que d&apos;un droit
          à la portabilité et d&apos;un droit d&apos;opposition pour motif
          légitime.
        </p>
        <p>
          Ces droits peuvent être exercés à tout moment sur simple demande
          adressée à{" "}
          <a
            href="mailto:contact@autoutilshop.fr"
            className="text-cyan-300 hover:underline"
          >
            contact@autoutilshop.fr
          </a>
          . Une réponse sera apportée dans les meilleurs délais et au plus
          tard dans le délai légal d&apos;un mois.
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          AutOutilShop SAS met en œuvre les mesures techniques et
          organisationnelles appropriées pour assurer la sécurité et la
          confidentialité des données personnelles traitées, et s&apos;appuie
          à cet effet sur des prestataires reconnus (Supabase, Stripe,
          Vercel).
        </p>
      </LegalSection>
    </LegalPage>
  );
}

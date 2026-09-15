import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité — MargeMax",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updatedAt="[à compléter]">
      <LegalSection title="Données collectées">
        <p>
          MargeMax collecte : votre adresse email et mot de passe (compte,
          via Supabase Auth), l&apos;historique de vos recherches et
          analyses effectuées depuis votre compte, et les informations de
          paiement traitées directement par Stripe (jamais stockées par
          MargeMax).
        </p>
      </LegalSection>

      <LegalSection title="Finalité du traitement">
        <p>
          Ces données sont utilisées pour fournir le service (authentification,
          gestion des crédits, historique d&apos;analyses), améliorer le
          produit, et répondre à vos demandes via le formulaire de contact.
        </p>
      </LegalSection>

      <LegalSection title="Sous-traitants">
        <p>
          Supabase (authentification et base de données), Stripe (paiement),
          [ajouter tout autre sous-traitant -- ex. hébergeur, service
          d&apos;emailing].
        </p>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>[À compléter -- durée de conservation des données de compte et d'historique.]</p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
          de rectification, d&apos;effacement et de portabilité de vos
          données. Pour exercer ces droits, contactez-nous à [adresse email
          de contact dédiée RGPD].
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          [À compléter selon les cookies effectivement utilisés -- cookies
          de session Supabase nécessaires au fonctionnement du service, et
          tout cookie de mesure d&apos;audience éventuellement ajouté.]
        </p>
      </LegalSection>
    </LegalPage>
  );
}

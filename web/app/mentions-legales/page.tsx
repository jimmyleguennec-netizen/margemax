import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales — MargeMax",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updatedAt="[à compléter]">
      <LegalSection title="Éditeur du site">
        <p>
          Le site MargeMax est édité par [Raison sociale / Nom du porteur de
          projet], [forme juridique -- ex. SASU, auto-entreprise...],
          immatriculée sous le numéro SIRET [numéro SIRET], dont le siège
          social est situé [adresse complète].
        </p>
        <p>
          Directeur de la publication : [Nom du responsable].
          <br />
          Contact : [adresse email de contact].
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par [nom de l&apos;hébergeur -- ex. Vercel Inc.],
          [adresse de l&apos;hébergeur].
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus présents sur MargeMax (textes, logos,
          interface, code) est protégé par le droit de la propriété
          intellectuelle. Toute reproduction non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données personnelles est détaillé dans notre{" "}
          <a href="/confidentialite" className="text-cyan-300 hover:underline">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

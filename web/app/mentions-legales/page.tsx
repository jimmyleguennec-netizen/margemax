import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales — MargeMax",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updatedAt="18 septembre 2026">
      <LegalSection title="Éditeur du site">
        <p>
          Le site et le service MargeMax sont édités par la société{" "}
          <strong className="text-white">AutOutilShop SAS</strong>, société
          par actions simplifiée au capital social de 251 €, dont le siège
          social est situé au 4 rue Gustave Delory, 11100 Narbonne, France.
        </p>
        <p>
          SIREN : 107 057 432 — SIRET : 107 057 432 00018 — RCS Narbonne —
          TVA intracommunautaire : FR70107057432.
        </p>
        <p className="text-white/70">
          Numéro de téléphone : en cours
          de finalisation, il sera publié sur cette page. Pour toute
          question sur l&apos;identité de l&apos;éditeur d&apos;ici là,
          contactez{" "}
          <a
            href="mailto:contact@autoutilshop.fr"
            className="text-cyan-300 hover:underline"
          >
            contact@autoutilshop.fr
          </a>
          .
        </p>
        <p>
          Contact :{" "}
          <a
            href="mailto:contact@autoutilshop.fr"
            className="text-cyan-300 hover:underline"
          >
            contact@autoutilshop.fr
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>
          Le président et directeur de la publication est{" "}
          <strong className="text-white">Jimmy Le Guennec</strong>,
          représentant légal de la société AutOutilShop SAS.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site MargeMax est hébergé par Vercel Inc., dont le siège social
          est situé au 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis (
          <a
            href="https://vercel.com"
            className="text-cyan-300 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments composant la plateforme MargeMax —
          notamment son code source, son design, ses interfaces, ses
          animations, son logo et l&apos;ensemble des contenus visuels ou
          textuels qui y figurent — est la propriété exclusive
          d&apos;AutOutilShop SAS ou de ses partenaires, et est protégé à ce
          titre par le droit d&apos;auteur, le droit des marques et, plus
          généralement, l&apos;ensemble des dispositions applicables en
          matière de propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou
          adaptation de tout ou partie des éléments du site, quel que soit le
          moyen ou le procédé utilisé, est interdite sans l&apos;autorisation
          écrite préalable d&apos;AutOutilShop SAS.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données personnelles des utilisateurs du site
          MargeMax est détaillé dans notre{" "}
          <a href="/confidentialite" className="text-cyan-300 hover:underline">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

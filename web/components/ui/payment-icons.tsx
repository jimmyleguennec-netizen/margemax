// Icones de moyens de paiement -- SVG vectoriels dessines a la main
// plutot qu'une bibliotheque externe (react-icons n'est pas installe dans
// ce projet, et il n'y a pas de Node/npm disponible dans cet
// environnement pour ajouter une dependance et regenerer
// package-lock.json en toute securite -- voir passation.md). Chaque icone
// reste une representation simplifiee et reconnaissable de la marque
// (formes/couleurs caracteristiques), pas une reproduction pixel-perfect
// du fichier de logo officiel.
//
// Toutes les icones partagent la meme hauteur (h-8, cf. footer.tsx) et un
// fond clair uniforme : les vrais logos de moyens de paiement (Visa,
// Mastercard...) sont concus pour un fond clair -- les poser directement
// sur le fond sombre du footer les rendrait illisibles/denatures.

type PaymentIconProps = {
  className?: string;
};

function Chip({
  className,
  bg = "bg-white",
  label,
  children,
}: {
  className?: string;
  bg?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex h-8 items-center justify-center rounded-md px-2.5 shadow-sm ${bg} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

export function VisaIcon({ className }: PaymentIconProps) {
  return (
    <Chip className={className} label="Visa">
      <svg viewBox="0 0 48 20" className="h-3 w-auto" aria-hidden="true">
        <text
          x="24"
          y="15"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontStyle="italic"
          fontWeight="700"
          fontSize="16"
          fill="#1A1F71"
          letterSpacing="-0.5"
        >
          VISA
        </text>
      </svg>
    </Chip>
  );
}

export function MastercardIcon({ className }: PaymentIconProps) {
  return (
    <Chip className={className} label="Mastercard">
      <svg viewBox="0 0 40 24" className="h-5 w-auto" aria-hidden="true">
        <circle cx="16" cy="12" r="10" fill="#EB001B" />
        <circle cx="26" cy="12" r="10" fill="#F79E1B" />
        <path
          d="M21 4.5a9.98 9.98 0 0 1 0 15 9.98 9.98 0 0 1 0-15Z"
          fill="#FF5F00"
        />
      </svg>
    </Chip>
  );
}

export function CarteBancaireIcon({ className }: PaymentIconProps) {
  return (
    <Chip className={className} label="Carte Bancaire">
      <svg viewBox="0 0 48 20" className="h-4 w-auto" aria-hidden="true">
        <path d="M2 4h20a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V4Z" fill="#0055A4" />
        <path d="M23 4h20a3 3 0 0 1 3 3v3H23V4Z" fill="#FF7900" opacity="0.9" />
        <text
          x="14"
          y="14.5"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="800"
          fontSize="9"
          fill="#fff"
        >
          CB
        </text>
      </svg>
    </Chip>
  );
}

export function StripeIcon({ className }: PaymentIconProps) {
  return (
    <Chip className={className} bg="bg-[#635BFF]" label="Stripe">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          d="M13.5 7.9c0-1 .85-1.4 2.25-1.4 2 0 4.55.6 6.55 1.7V2.4C20.1 1.5 17.9 1 15.75 1 10.6 1 7.15 3.7 7.15 8.25c0 7 9.65 5.9 9.65 8.9 0 1.2-1.05 1.6-2.5 1.6-2.15 0-4.9-.9-7.1-2.1v5.9c2.4 1 4.85 1.5 7.1 1.5 5.3 0 8.9-2.65 8.9-7.25 0-7.55-9.65-6.2-9.65-8.9Z"
          fill="#fff"
        />
      </svg>
    </Chip>
  );
}

export function ApplePayIcon({ className }: PaymentIconProps) {
  return (
    <Chip className={className} bg="bg-black" label="Apple Pay">
      <svg viewBox="0 0 60 24" className="h-4 w-auto" aria-hidden="true">
        {/* Pictogramme pomme simplifie (corps + feuille + queue), pas une
            reproduction du fichier de logo Apple -- forme geometrique
            volontairement simple pour rester nette a cette taille. */}
        <ellipse cx="8.5" cy="14.5" rx="6.5" ry="7" fill="#fff" />
        <rect x="7.7" y="2.5" width="1.6" height="4" rx="0.8" fill="#fff" />
        <path d="M9.3 4c1.8-.3 3.2.7 3.5 2.2-1.8.4-3.2-.6-3.5-2.2Z" fill="#fff" />
        <text
          x="21"
          y="17"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="600"
          fontSize="13"
          fill="#fff"
        >
          Pay
        </text>
      </svg>
    </Chip>
  );
}

export function GooglePayIcon({ className }: PaymentIconProps) {
  return (
    <Chip className={className} label="Google Pay">
      <svg viewBox="0 0 60 24" className="h-4 w-auto" aria-hidden="true">
        <g>
          <path
            d="M13 12.2c0-.6-.05-1.2-.15-1.7H7v3.3h3.4a2.9 2.9 0 0 1-1.25 1.9v1.6h2a6 6 0 0 0 1.85-4.5Z"
            fill="#4285F4"
          />
          <path
            d="M7 18c1.65 0 3.05-.55 4.05-1.5l-2-1.6c-.55.4-1.25.6-2.05.6-1.6 0-2.9-1.05-3.4-2.5H1.5v1.65A6.95 6.95 0 0 0 7 18Z"
            fill="#34A853"
          />
          <path
            d="M3.6 12.9a4.15 4.15 0 0 1 0-2.7V8.55H1.5a6.95 6.95 0 0 0 0 6.2L3.6 12.9Z"
            fill="#FBBC04"
          />
          <path
            d="M7 7.3c.9 0 1.7.3 2.35.9l1.75-1.7C10.05 5.5 8.65 5 7 5a6.95 6.95 0 0 0-5.5 3.55L3.6 10.2C4.1 8.75 5.4 7.3 7 7.3Z"
            fill="#EA4335"
          />
        </g>
        <text
          x="21"
          y="16"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="500"
          fontSize="12"
          fill="#3C4043"
        >
          Pay
        </text>
      </svg>
    </Chip>
  );
}

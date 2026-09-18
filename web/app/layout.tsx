import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MargeMax — Trouvez vos meilleures opportunités de sourcing",
  description:
    "MargeMax analyse vos produits AliExpress et calcule marge, ROI et coûts d'importation récupérés ou estimés selon les données disponibles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark overflow-x-hidden" suppressHydrationWarning>
      <body className={`${inter.variable} overflow-x-hidden bg-background font-sans text-foreground antialiased`}>
        {/* Desactive la restauration de scroll native du navigateur
            (rechargement de page, retour arriere) le plus tot possible --
            sans ca, un rechargement sur une page longue (dashboard,
            landing) rouvrait a l'ancienne position de defilement au lieu
            du haut de page, un "saut d'ecran" deroutant. Script inline
            (pas un useEffect client) pour s'executer avant meme
            l'hydratation React. */}
        <script
          dangerouslySetInnerHTML={{
            // Le if(!location.hash) evite de casser un lien direct vers une
            // ancre (ex. /#pricing, /#contact depuis le menu du dashboard) :
            // uniquement le rechargement/retour arriere SANS ancre doit
            // etre force en haut de page.
            __html:
              "try{if('scrollRestoration' in history){history.scrollRestoration='manual';}if(!window.location.hash){window.scrollTo(0,0);}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}

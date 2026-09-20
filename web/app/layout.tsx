import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/motion-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MargeMax — Trouve tes meilleures opportunités de sourcing",
  description:
    "MargeMax analyse tes produits AliExpress et calcule marge, ROI et coûts d'importation récupérés ou estimés selon les données disponibles.",
};

// viewportFit "cover" + interactiveWidget "resizes-content" : a l'ouverture du
// clavier, le viewport de mise en page se redimensionne (au lieu de
// laisser la page etre recouverte ou decalee). Le zoom utilisateur reste
// autorise (accessibilite) : le zoom automatique d'iOS au focus est evite en
// portant les champs a 16 px (voir globals.css).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#05050a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark overflow-x-hidden" suppressHydrationWarning>
      <body className={`${inter.variable} overflow-x-clip bg-background font-sans text-foreground antialiased`}>
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
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

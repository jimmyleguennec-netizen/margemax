import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/motion-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://www.margemax.com";
const SITE_TITLE = "MargeMax — Trouve tes meilleures opportunités de sourcing";
const SITE_DESCRIPTION =
  "MargeMax analyse tes produits AliExpress et calcule marge, ROI et coûts d'importation récupérés ou estimés selon les données disponibles.";

export const metadata: Metadata = {
  // Adresse officielle : toutes les URL relatives des metadonnees (canonique,
  // Open Graph, icones) se resolvent contre ce domaine.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "MargeMax",
  // "./" = URL de la page courante resolue sur metadataBase : "/" pour
  // l'accueil, "/cgv" pour les CGV, etc. Une canonique fixe sur l'accueil
  // heritee par TOUTES les pages dirait a Google que /cgv, /mentions-legales
  // ... sont des doublons de la page d'accueil et les ferait desindexer.
  alternates: { canonical: "./" },
  // Fichiers app/favicon.ico, app/icon.png et app/apple-icon.png (servis
  // par Next sous /favicon.ico, /icon.png, /apple-icon.png).
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "MargeMax",
    locale: "fr_FR",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/logo-margemax.png",
        width: 1254,
        height: 1254,
        alt: "Logo MargeMax",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/logo-margemax.png"],
  },
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
    <html lang="fr" className="dark overflow-x-clip" suppressHydrationWarning>
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

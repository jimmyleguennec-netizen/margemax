import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { MotionProvider } from "@/components/motion-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Identifiant AdSense (public, deja present dans public/ads.txt). Surcharge possible
// via NEXT_PUBLIC_ADSENSE_CLIENT_ID (format "ca-pub-XXXXXXXXXXXXXXXX").
const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "ca-pub-9592641407372261";

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
  // Search Console : balise meta (jeton ci-dessous) + fichier de verification
  // public/google5cc6340a4389f791.html (a conserver).
  verification: {
    google: "gJcfuk7q5PrqMQwIS7V4pDk__BcxwG6kdAU-zv-PS2c",
  },
  // Balise de verification AdSense (visible dans le HTML statique pour le robot de Google).
  other: { "google-adsense-account": ADSENSE_CLIENT_ID },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "MargeMax",
    locale: "fr_FR",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
      <head>
        {/* Script AdSense : verification du site (landing page) et annonces. */}
        <Script
          id="adsense-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
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

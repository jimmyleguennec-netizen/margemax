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
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MargeMax — Trouvez vos meilleures opportunités de sourcing",
  description:
    "MargeMax analyse vos produits AliExpress et calcule instantanément marge, ROI et coûts réels d'importation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}

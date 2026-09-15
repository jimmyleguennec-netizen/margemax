import Link from "next/link";

import { InteractiveGrid } from "@/components/ui/interactive-grid";

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <InteractiveGrid>
      <div className="min-h-screen bg-[#05050a]">
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="container flex h-16 items-center">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            >
              Marge<span className="text-cyan-400">Max</span>
            </Link>
          </div>
        </header>

        <main className="container max-w-3xl py-16">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Dernière mise à jour : {updatedAt}
          </p>

          <div className="prose-invert mt-10 space-y-8 text-white/70">
            {children}
          </div>
        </main>

        <footer className="border-t border-white/10 py-8">
          <div className="container flex flex-col items-center justify-between gap-4 text-sm text-white/40 sm:flex-row">
            <p>© {new Date().getFullYear()} MargeMax. Tous droits réservés.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/mentions-legales" className="hover:text-white">
                Mentions légales
              </Link>
              <Link href="/cgv" className="hover:text-white">
                CGV / CGU
              </Link>
              <Link href="/confidentialite" className="hover:text-white">
                Confidentialité
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </InteractiveGrid>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

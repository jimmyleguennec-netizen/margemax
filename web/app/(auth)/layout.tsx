import Link from "next/link";

import { InteractiveGrid } from "@/components/ui/interactive-grid";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InteractiveGrid>
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-[#05050a] px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[120px]"
        />

        <Link
          href="/"
          className="relative z-10 text-xl font-bold tracking-tight text-white drop-shadow-[0_0_14px_rgba(34,211,238,0.6)]"
        >
          Marge<span className="text-cyan-400">Max</span>
        </Link>

        <div className="relative z-10 pointer-events-auto w-full flex flex-col items-center">
          {children}
        </div>
      </div>
    </InteractiveGrid>
  );
}

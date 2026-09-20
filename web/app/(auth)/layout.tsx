import Link from "next/link";

import { InteractiveGrid } from "@/components/ui/interactive-grid";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InteractiveGrid hideOnMobile>
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-8 overflow-x-clip bg-[#05050a] bg-[image:radial-gradient(60%_40%_at_15%_20%,rgba(34,211,238,0.12),transparent),radial-gradient(60%_40%_at_85%_80%,rgba(217,70,239,0.12),transparent)] md:bg-none px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px] hidden md:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[120px] hidden md:block"
        />

        <Link href="/" className="relative z-10">
          <Logo className="h-20 md:h-24" />
        </Link>

        <div className="relative z-10 pointer-events-auto w-full flex flex-col items-center">
          {children}
        </div>
      </div>
    </InteractiveGrid>
  );
}

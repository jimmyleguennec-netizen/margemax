import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-[#05050a] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <Link
        href="/"
        className="text-xl font-bold tracking-tight text-white drop-shadow-[0_0_14px_rgba(34,211,238,0.6)]"
      >
        Marge<span className="text-cyan-400">Max</span>
      </Link>

      {children}
    </div>
  );
}

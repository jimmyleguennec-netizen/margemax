import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center blur-3xl"
      >
        <div className="h-[320px] w-[560px] rounded-full bg-gradient-to-tr from-primary/30 via-primary/5 to-transparent" />
      </div>

      <Link href="/" className="text-xl font-bold tracking-tight">
        Marge<span className="text-primary">Max</span>
      </Link>

      {children}
    </div>
  );
}

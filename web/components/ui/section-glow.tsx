import { cn } from "@/lib/utils";

export function SectionGlow({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
    </div>
  );
}

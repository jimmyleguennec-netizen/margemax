import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-margemax.png"
      alt="MargeMax Logo"
      width={280}
      height={80}
      priority
      className={cn(
        "h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] md:h-16",
        className
      )}
    />
  );
}

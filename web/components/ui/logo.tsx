import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-margemax.png"
      alt="MargeMax Logo"
      width={140}
      height={40}
      priority
      className={cn(
        "h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]",
        className
      )}
    />
  );
}

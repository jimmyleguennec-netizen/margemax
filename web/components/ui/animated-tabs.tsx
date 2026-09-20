"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type AnimatedTabItem = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export function AnimatedTabs({
  tabs,
  value,
  onValueChange,
  layoutId = "animated-tab-indicator",
  className,
}: {
  tabs: AnimatedTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  layoutId?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        const Icon = tab.icon;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "text-white"
                : "text-white/70 hover:-translate-y-px hover:text-white/80"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-500/90 to-fuchsia-500/90 shadow-[0_0_18px_-2px_rgba(34,211,238,0.7)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

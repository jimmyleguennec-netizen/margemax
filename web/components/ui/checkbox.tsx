"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function Checkbox({
  id,
  name,
  label,
  defaultChecked = false,
  checked: checkedProp,
  onChange,
}: {
  id: string;
  name?: string;
  label: React.ReactNode;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : internalChecked;

  function toggle() {
    const next = !checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer select-none items-center gap-2.5"
    >
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={toggle}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <motion.span
          initial={false}
          animate={{
            scale: checked ? [1, 1.25, 1] : 1,
            borderColor: checked ? "rgba(34,211,238,1)" : "rgba(34,211,238,0.3)",
            backgroundColor: checked
              ? "rgba(34,211,238,0.15)"
              : "rgba(255,255,255,0.03)",
            boxShadow: checked
              ? "0 0 14px -1px rgba(34,211,238,0.9)"
              : "0 0 0px rgba(34,211,238,0)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="flex h-5 w-5 items-center justify-center rounded-md border"
        >
          <motion.svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <motion.path
              d="M4 12.5L9.5 18L20 6"
              stroke="#22d3ee"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.span>
      </span>
      <span className="text-sm text-white/60">{label}</span>
    </label>
  );
}

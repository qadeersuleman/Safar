"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
};

/** Bada, mobile-friendly input (16px font => iOS zoom nahi karta) + error animation */
const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, icon: Icon, error, hint, type = "text", className, id, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? rest.name;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-ink-200">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          className={cn("input", Icon && "pl-12", isPassword && "pr-14", error && "input-error")}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-ink-300 transition hover:bg-ink-700 hover:text-white"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mt-2 flex items-center gap-1.5 text-sm text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.p>
        ) : hint ? (
          <p className="mt-2 text-xs text-ink-400">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

export default Field;

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FormAlert({ message, type = "error" }: { message: string | null; type?: "error" | "success" }) {
  const ok = type === "success";
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className={cn(
            "overflow-hidden rounded-2xl border text-sm",
            ok ? "border-mint/40 bg-mint/10 text-mint" : "border-red-500/40 bg-red-500/10 text-red-300",
          )}
        >
          <div className="flex items-start gap-3 p-4">
            {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
            <p className="leading-relaxed">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

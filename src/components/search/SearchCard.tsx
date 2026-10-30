"use client";

import { forwardRef, useState, useTransition, type SelectHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, ArrowUpDown, CalendarDays, ChevronDown, Loader2, MapPin } from "lucide-react";
import type { Stop } from "@/lib/types";
import { cn, todayPKT } from "@/lib/utils";

const schema = z
  .object({
    from: z.string().min(1, "Choose where you are leaving from"),
    to: z.string().min(1, "Choose your destination"),
    date: z.string().min(1, "Pick a travel date"),
  })
  .refine((v) => !v.from || !v.to || v.from !== v.to, { path: ["to"], message: "Destination must be different" })
  .refine((v) => !v.date || v.date >= todayPKT(), { path: ["date"], message: "Date cannot be in the past" });

type Values = z.infer<typeof schema>;

type Props = {
  stops: Stop[];
  defaultFrom?: string;
  defaultTo?: string;
  defaultDate?: string;
  className?: string;
};

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
}

export default function SearchCard({ stops, defaultFrom = "", defaultTo = "", defaultDate, className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [today] = useState(() => todayPKT());

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { from: defaultFrom, to: defaultTo, date: defaultDate || today },
  });

  const [swapped, setSwapped] = useState(0);
  const date = watch("date");

  function swap() {
    const { from, to } = getValues();
    setValue("from", to, { shouldValidate: !!to });
    setValue("to", from, { shouldValidate: !!from });
    setSwapped((n) => n + 1);
  }

  function onSubmit(v: Values) {
    startTransition(() => {
      router.push(`/search?from=${v.from}&to=${v.to}&date=${v.date}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("glass rounded-[28px] p-4 shadow-card sm:p-6", className)}
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_auto] lg:items-start">
        <Select label="From" error={errors.from?.message} stops={stops} {...register("from")} />

        <motion.button
          type="button"
          onClick={swap}
          aria-label="Swap cities"
          whileTap={{ scale: 0.88 }}
          animate={{ rotate: swapped * 180 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative z-10 -my-1 flex h-11 w-11 items-center justify-center justify-self-center rounded-full border border-brand-500/40 bg-brand-500/15 text-brand-300 hover:bg-brand-500 hover:text-white md:col-span-2 lg:col-span-1 lg:mt-[34px]"
        >
          <ArrowUpDown className="h-5 w-5 lg:rotate-90" />
        </motion.button>

        <Select label="To" error={errors.to?.message} stops={stops} {...register("to")} />

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-semibold text-ink-200">
            Travel date
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-400" />
            <input
              id="date"
              type="date"
              min={today}
              aria-invalid={!!errors.date}
              className={cn("input pl-12", errors.date && "input-error")}
              {...register("date")}
            />
          </div>
          <div className="mt-2 flex gap-2">
            {[
              { label: "Today", v: today },
              { label: "Tomorrow", v: addDays(today, 1) },
            ].map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setValue("date", c.v, { shouldValidate: true })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  date === c.v
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-ink-600 text-ink-300 hover:border-brand-500/60 hover:text-white",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <FieldError msg={errors.date?.message} />
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full md:col-span-2 lg:col-span-1 lg:mt-[34px] lg:px-7">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Search <ArrowRight className="h-5 w-5" /></>}
        </button>
      </div>
    </form>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence initial={false}>
      {msg && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 flex items-center gap-1.5 text-sm text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" /> {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; stops: Stop[] }
>(function Select({ label, error, stops, name, ...rest }, ref) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-ink-200">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-400" />
        <select
          id={name}
          name={name}
          ref={ref}
          aria-invalid={!!error}
          className={cn("input cursor-pointer pl-12 pr-11", error && "input-error")}
          {...rest}
        >
          <option value="">Select city</option>
          {stops.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
      </div>
      <FieldError msg={error} />
    </div>
  );
});

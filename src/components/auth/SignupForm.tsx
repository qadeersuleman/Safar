"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, MailCheck, Phone, User, UserPlus } from "lucide-react";
import Field from "@/components/ui/Field";
import FormAlert from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PK_PHONE_REGEX, cn, normalizePhone } from "@/lib/utils";

const schema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(60, "Name is too long")
      .regex(/^[\p{L} .'-]+$/u, "Use letters only"),
    phone: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .refine((v) => PK_PHONE_REGEX.test(v.replace(/[\s-]/g, "")), "Enter a valid number like 0300 1234567"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

type Values = z.infer<typeof schema>;

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return s;
}

const strengthMeta = [
  { label: "Too weak", color: "bg-red-500" },
  { label: "Weak", color: "bg-red-500" },
  { label: "Okay", color: "bg-brand-400" },
  { label: "Good", color: "bg-mint" },
  { label: "Strong", color: "bg-mint" },
];

export default function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const pw = watch("password") ?? "";
  const score = strength(pw);

  async function onSubmit(v: Values) {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase is not connected yet. Add your keys in .env.local (see README).");
      return;
    }
    const { data, error } = await createClient().auth.signUp({
      email: v.email,
      password: v.password,
      options: { data: { full_name: v.fullName.trim(), phone: normalizePhone(v.phone) } },
    });

    if (error) {
      setError(/already/i.test(error.message) ? "This email is already registered. Try logging in." : error.message);
      return;
    }
    // Email already registered (Supabase obfuscates this): identities empty
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("This email is already registered. Try logging in.");
      return;
    }
    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }
    setConfirmEmail(v.email);
  }

  if (confirmEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/15 text-brand-400"
        >
          <MailCheck className="h-10 w-10" />
        </motion.span>
        <h2 className="mt-5 text-2xl font-bold">Check your email</h2>
        <p className="mt-2 text-ink-300">
          We sent a confirmation link to <b className="text-white">{confirmEmail}</b>. Open it, then log in.
        </p>
        <Link href="/login" className="btn-primary mt-6 w-full">
          Go to log in
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormAlert message={error} />
      <Field
        label="Full name"
        icon={User}
        autoComplete="name"
        placeholder="Ahmed Raza"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Field
        label="Mobile number"
        icon={Phone}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0300 1234567"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Field
        label="Email"
        icon={Mail}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <div>
        <Field
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        {pw.length > 0 && (
          <div className="mt-3">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className={cn("h-1.5 flex-1 rounded-full", i <= score ? strengthMeta[score].color : "bg-ink-600")}
                  initial={false}
                  animate={{ opacity: i <= score ? 1 : 0.5 }}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ink-400">{strengthMeta[score].label}</p>
          </div>
        )}
      </div>
      <Field
        label="Confirm password"
        icon={Lock}
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={errors.confirm?.message}
        {...register("confirm")}
      />
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-ink-300">
        Already have an account?{" "}
        <Link href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-400 hover:text-brand-300">
          Log in
        </Link>
      </p>
    </form>
  );
}

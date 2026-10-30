"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import Field from "@/components/ui/Field";
import FormAlert from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(v: Values) {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase is not connected yet. Add your keys in .env.local (see README).");
      return;
    }
    const { error } = await createClient().auth.signInWithPassword({ email: v.email, password: v.password });
    if (error) {
      setError(
        /invalid login/i.test(error.message)
          ? "Wrong email or password."
          : /not confirmed/i.test(error.message)
            ? "Please confirm your email first. Check your inbox."
            : error.message,
      );
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormAlert message={error} />
      <Field
        label="Email"
        icon={Mail}
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label="Password"
        icon={Lock}
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        error={errors.password?.message}
        {...register("password")}
      />
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-ink-300">
        New to SafarGo?{" "}
        <Link href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-400 hover:text-brand-300">
          Create an account
        </Link>
      </p>
    </form>
  );
}

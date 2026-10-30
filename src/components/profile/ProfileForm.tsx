"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, LogOut, Mail, Phone, Save, User } from "lucide-react";
import Field from "@/components/ui/Field";
import FormAlert from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import { PK_PHONE_REGEX, normalizePhone } from "@/lib/utils";

const schema = z.object({
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
});
type Values = z.infer<typeof schema>;

type Props = { userId: string; email: string; fullName: string; phone: string; tickets: number };

export default function ProfileForm({ userId, email, fullName, phone, tickets }: Props) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { fullName, phone } });

  const name = watch("fullName") || email;

  async function onSubmit(v: Values) {
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: v.fullName.trim(), phone: normalizePhone(v.phone) });
    if (error) {
      setMsg({ type: "error", text: error.message });
      return;
    }
    setMsg({ type: "success", text: "Profile saved." });
    router.refresh();
  }

  async function logout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card h-fit p-6 text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-4xl font-extrabold text-white shadow-glow">
          {name.trim().charAt(0).toUpperCase()}
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-brand-500/40 [animation-duration:3s]" />
        </div>
        <h2 className="mt-4 truncate text-xl font-bold">{name}</h2>
        <p className="truncate text-sm text-ink-400">{email}</p>
        <div className="mt-6 rounded-2xl bg-ink-900 p-4">
          <p className="font-display text-3xl font-extrabold text-brand-400">{tickets}</p>
          <p className="text-xs uppercase tracking-wider text-ink-400">Seats booked</p>
        </div>
        <button onClick={logout} disabled={loggingOut} className="btn-ghost mt-6 w-full text-red-300 hover:border-red-500/50">
          {loggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          Log out
        </button>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="card space-y-5 p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold">Personal details</h2>
        <FormAlert message={msg?.text ?? null} type={msg?.type} />
        <Field label="Full name" icon={User} autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
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
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-200">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input value={email} readOnly disabled className="input pl-12 opacity-60" />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary w-full sm:w-auto">
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </motion.form>
    </div>
  );
}

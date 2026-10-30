import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/profile/ProfileForm";
import { getCurrentUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "My profile" };

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-3xl font-extrabold">Profile</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-300">Connect Supabase to enable accounts and profiles.</p>
        <Link href="/" className="btn-primary mt-6">Back home</Link>
      </div>
    );
  }

  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const supabase = await createClient();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("status", "confirmed");

  return (
    <div className="container-x py-8 sm:py-12">
      <span className="eyebrow">Account</span>
      <h1 className="mb-8 mt-3 text-3xl font-extrabold sm:text-5xl">My profile</h1>
      <ProfileForm
        userId={user.id}
        email={user.email ?? ""}
        fullName={profile?.full_name ?? (user.user_metadata?.full_name as string) ?? ""}
        phone={profile?.phone ?? (user.user_metadata?.phone as string) ?? ""}
        tickets={count ?? 0}
      />
    </div>
  );
}

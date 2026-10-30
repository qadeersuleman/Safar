import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SetupBanner from "@/components/layout/SetupBanner";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: { default: "SafarGo — Your Journey, Just a Tap Away", template: "%s · SafarGo" },
  description:
    "Book intercity bus tickets between Sukkur, Pano Aqil, Ghotki, Mirpur Mathelo, Daharki and Obauro. Choose your seat, see fares, get your e-ticket.",
  applicationName: "SafarGo",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser();
  const navUser = user
    ? {
        name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "",
        email: user.email ?? "",
      }
    : null;

  return (
    <html lang="en">
      <body>
        <Navbar user={navUser} />
        {!isSupabaseConfigured() && <SetupBanner />}
        <main className="min-h-[70svh] pb-24 md:pb-0">{children}</main>
        <Footer />
        <BottomNav authed={!!user} />
      </body>
    </html>
  );
}

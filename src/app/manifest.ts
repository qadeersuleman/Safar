import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafarGo",
    short_name: "SafarGo",
    description: "Your Journey, Just a Tap Away.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#ff6a00",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

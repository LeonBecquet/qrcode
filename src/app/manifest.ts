import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QR Restaurant",
    short_name: "QR Resto",
    description: "Commandez depuis votre table en scannant un QR code.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#000000",
    lang: "fr",
    icons: [],
  };
}

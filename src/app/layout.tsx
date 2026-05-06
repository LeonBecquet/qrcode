import type { Metadata } from "next";
import { DM_Serif_Display, Geist, Inter, Lora, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

// Polices pour les ambiances de carte côté client.
// preload: false → téléchargées seulement quand utilisées.
const menuModern = Inter({
  subsets: ["latin"],
  variable: "--font-menu-modern",
  display: "swap",
  preload: false,
});
const menuElegant = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-menu-elegant",
  display: "swap",
  preload: false,
});
const menuRustic = Lora({
  subsets: ["latin"],
  variable: "--font-menu-rustic",
  display: "swap",
  preload: false,
});
const menuPlayful = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-menu-playful",
  display: "swap",
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: "QR Restaurant — Commandes par QR code",
    template: "%s · QR Restaurant",
  },
  description:
    "Commandes par QR code pour restaurants français. Vos clients commandent depuis leur table, sans application, sans attente.",
  applicationName: "QR Restaurant",
  authors: [{ name: "QR Restaurant" }],
  keywords: [
    "QR code restaurant",
    "menu en ligne",
    "commande à table",
    "menu digital restaurant",
    "QR menu France",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "QR Restaurant",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={cn(
        "font-sans",
        geist.variable,
        menuModern.variable,
        menuElegant.variable,
        menuRustic.variable,
        menuPlayful.variable,
      )}
    >
      <body className="antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

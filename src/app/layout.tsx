import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

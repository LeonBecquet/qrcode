import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { env } from "@/lib/env";

/**
 * Génère un token URL-safe pour une table.
 * 16 caractères hex = 64 bits d'entropie. Suffisant : on n'a pas à protéger
 * un secret, juste à empêcher de deviner le QR du voisin.
 */
export function generateTableToken(): string {
  return randomBytes(8).toString("hex");
}

/**
 * URL publique scannée par le client.
 */
export function buildTableUrl(restaurantSlug: string, token: string): string {
  return `${env.APP_URL.replace(/\/$/, "")}/r/${restaurantSlug}/t/${token}`;
}

/**
 * QR encodé en data URL (PNG). Pour usage dans <img>, <Image>, ou @react-pdf.
 */
export async function generateQRDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

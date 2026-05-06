import { Resend } from "resend";
import { env } from "@/lib/env";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  if (!env.RESEND_API_KEY) return null;
  _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Envoie un email via Resend. No-op silencieux si Resend non configuré
 * (utile en dev local). Logge mais ne throw pas — on ne veut pas faire échouer
 * un signup parce qu'un email n'a pas pu partir.
 */
export async function sendEmail(args: SendArgs): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] skipped (Resend not configured): "${args.subject}" → ${args.to}`);
    return;
  }
  const from = env.EMAIL_FROM ?? "onboarding@resend.dev";
  try {
    const result = await resend.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (result.error) {
      console.error(`[email] Resend error: ${result.error.message}`);
    }
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
  max-width: 560px;
  margin: 0 auto;
  padding: 24px;
`;
const buttonStyle = `
  display: inline-block;
  background: #000;
  color: #fff;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  margin: 16px 0;
`;
const mutedStyle = `color: #6b7280; font-size: 14px;`;

export function welcomeEmail(args: { name: string; appUrl: string }): SendArgs {
  return {
    to: "", // filled by caller
    subject: "Bienvenue sur QR Restaurant 👋",
    text: `Bonjour ${args.name},\n\nMerci de vous être inscrit sur QR Restaurant. Pour démarrer, configurez votre restaurant et votre menu : ${args.appUrl}/dashboard\n\nL'équipe QR Restaurant`,
    html: `
      <div style="${baseStyle}">
        <h1 style="margin: 0 0 16px 0; font-size: 24px;">Bienvenue ${args.name} !</h1>
        <p>Merci d'avoir créé un compte sur <strong>QR Restaurant</strong>.</p>
        <p>Pour démarrer :</p>
        <ol>
          <li>Choisissez votre formule (mensuel, annuel ou à vie)</li>
          <li>Configurez votre restaurant : nom, logo, horaires</li>
          <li>Construisez votre menu et ajoutez vos plats</li>
          <li>Imprimez vos QR codes et collez-les sur les tables</li>
        </ol>
        <p>
          <a href="${args.appUrl}/dashboard" style="${buttonStyle}">Aller au tableau de bord</a>
        </p>
        <p style="${mutedStyle}">
          Une question ? Répondez à cet email, on vous lit.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="${mutedStyle}">
          QR Restaurant · Commandes par QR code pour restaurants français
        </p>
      </div>
    `,
  };
}

export function subscriptionConfirmedEmail(args: {
  name: string;
  tierLabel: string;
  amountEur: number;
  isLifetime: boolean;
  appUrl: string;
}): SendArgs {
  const cadence = args.isLifetime
    ? "à vie (paiement unique)"
    : args.tierLabel === "Mensuel"
      ? "/mois"
      : "/an";

  return {
    to: "",
    subject: "Votre abonnement QR Restaurant est actif ✓",
    text: `Bonjour ${args.name},\n\nVotre abonnement ${args.tierLabel} (${args.amountEur} € ${cadence}) est maintenant actif.\n\nAccédez à votre tableau de bord : ${args.appUrl}/dashboard\n\nL'équipe QR Restaurant`,
    html: `
      <div style="${baseStyle}">
        <h1 style="margin: 0 0 16px 0; font-size: 24px;">Abonnement activé ✓</h1>
        <p>Bonjour ${args.name},</p>
        <p>
          Votre abonnement <strong>${args.tierLabel}</strong> (${args.amountEur} € ${cadence}) est
          maintenant actif. Vous avez accès à toutes les fonctionnalités.
        </p>
        ${
          args.isLifetime
            ? `<p style="${mutedStyle}">Cet achat unique vous donne accès au service à vie. Aucun renouvellement à prévoir.</p>`
            : `<p style="${mutedStyle}">Vous pouvez gérer ou annuler votre abonnement à tout moment depuis votre espace.</p>`
        }
        <p>
          <a href="${args.appUrl}/dashboard" style="${buttonStyle}">Continuer la configuration</a>
        </p>
        <p style="${mutedStyle}">
          Une facture vous sera envoyée par Stripe.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="${mutedStyle}">
          QR Restaurant · Commandes par QR code pour restaurants français
        </p>
      </div>
    `,
  };
}

import Link from "next/link";
import { Logo } from "@/components/logo";
import { MarketingNav } from "@/components/marketing-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-svh">
      <MarketingNav />
      <main>{children}</main>
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-4">
          <div className="space-y-3">
            <Logo variant="full" size={28} />
            <p className="text-muted-foreground text-sm">
              Commandes par QR code pour restaurants français.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Produit</p>
            <ul className="text-muted-foreground space-y-1">
              <li>
                <Link href="/#fonctionnalites" className="hover:text-foreground">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/#tarifs" className="hover:text-foreground">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Compte</p>
            <ul className="text-muted-foreground space-y-1">
              <li>
                <Link href="/signin" className="hover:text-foreground">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Légal</p>
            <ul className="text-muted-foreground space-y-1">
              <li>
                <Link href="/legal/mentions-legales" className="hover:text-foreground">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cgu" className="hover:text-foreground">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/legal/cgv" className="hover:text-foreground">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/legal/confidentialite" className="hover:text-foreground">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-foreground">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-muted-foreground container mx-auto border-t px-4 py-4 text-xs">
          © {new Date().getFullYear()} QR Restaurant. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

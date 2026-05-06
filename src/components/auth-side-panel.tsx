import Link from "next/link";
import { Logo } from "@/components/logo";

type Props = {
  /**
   * Citation/tagline à afficher en grand au centre du panneau.
   */
  tagline: string;
  /**
   * Stats ou trust signals affichés en bas.
   */
  highlights?: { value: string; label: string }[];
};

/**
 * Panneau gauche partagé entre les pages d'auth (signin, signup).
 * Couleur dominante vert forêt avec accents orange + safran.
 * Caché sur mobile (md:flex).
 */
export function AuthSidePanel({ tagline, highlights }: Props) {
  return (
    <aside className="text-[var(--brand-cream)] relative hidden flex-col justify-between overflow-hidden bg-[var(--brand-forest)] p-10 md:flex lg:p-14">
      {/* Decorative shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-[360px] w-[360px] rounded-full bg-[var(--brand-orange)]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-[var(--brand-saffron)]/25 blur-3xl"
      />

      {/* Mini QR pattern décoratif */}
      <div
        aria-hidden="true"
        className="absolute top-12 right-12 size-28 rotate-12 rounded-2xl bg-[var(--brand-cream)]/10 p-3 backdrop-blur"
      >
        <div className="grid h-full grid-cols-5 grid-rows-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => {
            const corners = [0, 4, 20];
            const isCorner = corners.includes(i);
            const isAccent = i === 24;
            const random = [6, 8, 12, 13, 16, 18];
            const filled = isCorner || isAccent || random.includes(i);
            return (
              <div
                key={i}
                className={
                  isAccent
                    ? "rounded bg-[var(--brand-orange)]"
                    : isCorner
                      ? "rounded bg-[var(--brand-saffron)]"
                      : filled
                        ? "rounded bg-[var(--brand-cream)]"
                        : ""
                }
              />
            );
          })}
        </div>
      </div>

      {/* Logo + retour */}
      <div className="relative">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo size={32} />
          <span className="text-base font-semibold tracking-tight">QR Restaurant</span>
        </Link>
      </div>

      {/* Tagline */}
      <div className="relative space-y-4">
        <div className="bg-[var(--brand-orange)] inline-block size-2 rounded-full" />
        <blockquote className="text-3xl leading-tight font-semibold tracking-tight lg:text-4xl">
          {tagline}
        </blockquote>
      </div>

      {/* Highlights / stats */}
      {highlights && highlights.length > 0 ? (
        <dl className="text-[var(--brand-cream)]/80 relative grid grid-cols-3 gap-3 border-t border-[var(--brand-cream)]/15 pt-6">
          {highlights.map((h) => (
            <div key={h.label}>
              <dt className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">
                {h.label}
              </dt>
              <dd className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">
                {h.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </aside>
  );
}

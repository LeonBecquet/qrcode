"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const { error: signInError } = await signIn.email({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Identifiants invalides.");
      return;
    }

    const from = searchParams.get("from");
    router.push(from && from.startsWith("/") ? from : "/dashboard");
    router.refresh();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <FloatingField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        icon={<Mail className="size-4" />}
        required
      />

      <div className="space-y-1.5">
        <FloatingField
          id="password"
          name="password"
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          icon={<Lock className="size-4" />}
          required
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        <div className="flex justify-end">
          <a
            href="mailto:contact@qr-resto.fr?subject=Mot%20de%20passe%20oubli%C3%A9"
            className="text-muted-foreground hover:text-[var(--brand-orange)] text-xs transition-colors"
          >
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <span className="bg-destructive flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
            !
          </span>
          {error}
        </motion.div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="group relative h-12 w-full overflow-hidden bg-[var(--brand-orange)] text-base font-semibold text-white shadow-lg shadow-[var(--brand-orange)]/30 transition-all hover:bg-[var(--brand-orange)]/95 hover:shadow-xl hover:shadow-[var(--brand-orange)]/50 active:scale-[0.98]"
      >
        {/* Shine effect */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
        <span className="relative inline-flex items-center gap-2">
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Connexion en cours...
            </>
          ) : (
            <>
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
                Se connecter
              </span>
              <svg
                viewBox="0 0 14 10"
                fill="none"
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </span>
      </Button>
    </motion.form>
  );
}

/**
 * Input avec floating label : le label part dans l'input quand vide,
 * remonte en small caps orange quand focus ou rempli.
 * Utilise placeholder=" " (un espace) + peer-focus + peer-[&:not(:placeholder-shown)].
 */
function FloatingField({
  id,
  name,
  label,
  type,
  autoComplete,
  icon,
  rightAdornment,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  icon: React.ReactNode;
  rightAdornment?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="group/field relative">
      {/* Icône à gauche */}
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 transition-colors group-focus-within/field:text-[var(--brand-orange)]">
        {icon}
      </span>

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className="border-input bg-background placeholder:text-transparent focus-visible:border-[var(--brand-orange)]/60 focus-visible:ring-[var(--brand-orange)]/30 peer h-14 w-full rounded-md border px-10 pt-5 pb-1.5 text-sm shadow-xs transition-all outline-none focus-visible:ring-2"
      />

      {/* Floating label */}
      <label
        htmlFor={id}
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 text-sm transition-all peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:tracking-wider peer-focus:text-[var(--brand-orange)] peer-focus:uppercase peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:tracking-wider peer-[&:not(:placeholder-shown)]:uppercase"
      >
        {label}
      </label>

      {rightAdornment}
    </div>
  );
}

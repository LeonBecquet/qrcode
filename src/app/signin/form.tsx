"use client";

import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      className="space-y-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <FocusField id="email" label="Email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@restaurant.fr"
          className="h-12 transition-all focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]/30"
        />
      </FocusField>

      <FocusField
        id="password"
        label="Mot de passe"
        right={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            {showPassword ? "Masquer" : "Afficher"}
          </button>
        }
      >
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          className="h-12 transition-all focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]/30"
        />
      </FocusField>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border px-3 py-2 text-sm"
        >
          {error}
        </motion.div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="group relative h-12 w-full overflow-hidden bg-[var(--brand-orange)] text-base text-white shadow-md shadow-[var(--brand-orange)]/30 transition-all hover:bg-[var(--brand-orange)]/90 hover:shadow-lg hover:shadow-[var(--brand-orange)]/40"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Connexion...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            Se connecter
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        )}
      </Button>
    </motion.form>
  );
}

/**
 * Wrapper input + label. Le label devient orange quand l'input est focused.
 */
function FocusField({
  id,
  label,
  children,
  right,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="group/field space-y-1.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-foreground transition-colors group-focus-within/field:text-[var(--brand-orange)]"
        >
          {label}
        </Label>
        {right}
      </div>
      {children}
    </div>
  );
}

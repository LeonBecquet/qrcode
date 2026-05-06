import Link from "next/link";
import { Suspense } from "react";
import SignInForm from "./form";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  return (
    <div className="bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="transition-opacity hover:opacity-80">
        <Logo variant="full" size={32} />
      </Link>
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}

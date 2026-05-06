import { Suspense } from "react";
import SignInForm from "./form";

export default function SignInPage() {
  return (
    <div className="bg-muted/30 flex min-h-svh items-center justify-center p-4">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}

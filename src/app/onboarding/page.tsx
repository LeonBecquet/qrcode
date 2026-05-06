import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import OnboardingForm from "./form";
import { db } from "@/lib/db/client";
import { memberships } from "@/lib/db/schema";
import { requireSession } from "@/lib/server/session";

export default async function OnboardingPage() {
  const session = await requireSession();

  const existing = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1);

  if (existing.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-muted/30 flex min-h-svh items-center justify-center p-4">
      <OnboardingForm />
    </div>
  );
}

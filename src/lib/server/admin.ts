import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { user as userTable } from "@/lib/db/schema";
import { requireSession } from "@/lib/server/session";

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const rows = await db
    .select({ flag: userTable.isPlatformAdmin })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);
  return rows[0]?.flag ?? false;
}

export async function requirePlatformAdmin() {
  const session = await requireSession();
  const isAdmin = await isPlatformAdmin(session.user.id);
  if (!isAdmin) redirect("/dashboard");
  return session;
}

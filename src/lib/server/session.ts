import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { memberships, restaurants } from "@/lib/db/schema";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/signin");
  return session;
}

/**
 * Charge le restaurant + role de l'utilisateur courant.
 * Si pas connecté → /signin. Si connecté mais sans resto → /onboarding.
 */
export async function requireRestaurant() {
  const session = await requireSession();

  const rows = await db
    .select({
      restaurant: restaurants,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(restaurants, eq(memberships.restaurantId, restaurants.id))
    .where(eq(memberships.userId, session.user.id))
    .limit(1);

  const found = rows[0];
  if (!found) redirect("/onboarding");

  return {
    user: session.user,
    session: session.session,
    restaurant: found.restaurant,
    role: found.role,
  };
}

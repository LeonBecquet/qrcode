"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { requireRestaurant } from "@/lib/server/session";
import { getStripe } from "@/lib/stripe";

export async function openBillingPortalAction() {
  const ctx = await requireRestaurant();
  if (!ctx.restaurant.stripeCustomerId) {
    throw new Error("Aucun compte de facturation pour ce restaurant.");
  }
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: ctx.restaurant.stripeCustomerId,
    return_url: `${env.APP_URL}/dashboard/settings`,
  });
  redirect(session.url);
}

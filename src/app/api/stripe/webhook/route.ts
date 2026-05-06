import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db/client";
import { memberships, restaurants, type SubStatus, type SubTier, user as userTable } from "@/lib/db/schema";
import { sendEmail, subscriptionConfirmedEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { getStripe, getWebhookSecret, TIER_CONFIG } from "@/lib/stripe";

export const runtime = "nodejs";

function mapStripeStatusToOurs(status: Stripe.Subscription.Status): SubStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "paused":
      return "paused";
    case "incomplete":
      return "trialing";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    default:
      return "canceled";
  }
}

function getCustomerId(value: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof value === "string" ? value : value.id;
}

export async function POST(request: Request) {
  let stripe;
  let webhookSecret: string;
  try {
    stripe = getStripe();
    webhookSecret = getWebhookSecret();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe not configured" },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const restaurantId = session.metadata?.restaurantId;
      const tier = session.metadata?.tier as SubTier | undefined;
      if (!restaurantId || !tier) break;

      if (session.mode === "payment" && tier === "lifetime") {
        await db
          .update(restaurants)
          .set({
            tier: "lifetime",
            subStatus: "active",
            lifetimePurchasedAt: new Date(),
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
            updatedAt: new Date(),
          })
          .where(eq(restaurants.id, restaurantId));
      } else if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        await db
          .update(restaurants)
          .set({
            tier,
            stripeSubscriptionId: subscriptionId,
            updatedAt: new Date(),
          })
          .where(eq(restaurants.id, restaurantId));
      }

      // Email de confirmation à l'owner
      const ownerRows = await db
        .select({ name: userTable.name, email: userTable.email })
        .from(memberships)
        .innerJoin(userTable, eq(memberships.userId, userTable.id))
        .where(and(eq(memberships.restaurantId, restaurantId), eq(memberships.role, "owner")))
        .limit(1);
      const owner = ownerRows[0];
      if (owner) {
        const config = TIER_CONFIG[tier];
        const tpl = subscriptionConfirmedEmail({
          name: owner.name,
          tierLabel: config.label,
          amountEur: config.amountEur,
          isLifetime: tier === "lifetime",
          appUrl: env.APP_URL,
        });
        await sendEmail({ ...tpl, to: owner.email });
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const customerId = getCustomerId(sub.customer);
      const status = mapStripeStatusToOurs(sub.status);
      const periodEnd = sub.items.data[0]?.current_period_end;

      await db
        .update(restaurants)
        .set({
          stripeSubscriptionId: sub.id,
          subStatus: status,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          updatedAt: new Date(),
        })
        .where(eq(restaurants.stripeCustomerId, customerId));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customerId = getCustomerId(sub.customer);
      await db
        .update(restaurants)
        .set({
          subStatus: "canceled",
          updatedAt: new Date(),
        })
        .where(eq(restaurants.stripeCustomerId, customerId));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (!invoice.customer) break;
      const customerId = getCustomerId(invoice.customer);
      await db
        .update(restaurants)
        .set({
          subStatus: "past_due",
          updatedAt: new Date(),
        })
        .where(eq(restaurants.stripeCustomerId, customerId));
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

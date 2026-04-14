import { getStripeSync } from "./lib/stripeClient";
import { db } from "@workspace/db";
import { subscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

interface StripeSubscriptionEvent {
  id: string;
  status: string;
  current_period_end?: number;
  metadata?: Record<string, string>;
}

interface StripeCheckoutSessionEvent {
  id: string;
  mode: string;
  subscription?: string;
  metadata?: Record<string, string>;
}

interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

function resolveStatus(stripeStatus: string): "active" | "cancelled" {
  return stripeStatus === "active" || stripeStatus === "trialing"
    ? "active"
    : "cancelled";
}

async function handleSubscriptionEvent(subscription: StripeSubscriptionEvent) {
  const status = resolveStatus(subscription.status);
  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  const existing = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptionsTable)
      .set({ status, expiresAt })
      .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));
    return;
  }

  const guruId = parseInt(subscription.metadata?.guruId ?? "0", 10);
  const userId = parseInt(subscription.metadata?.userId ?? "0", 10);

  if (!guruId || !userId) {
    console.warn("Webhook: No existing record and missing metadata for new subscription", {
      subscriptionId: subscription.id,
      metadata: subscription.metadata,
    });
    return;
  }

  await db
    .insert(subscriptionsTable)
    .values({
      userId,
      guruId,
      status,
      stripeSubscriptionId: subscription.id,
      startedAt: new Date(),
      expiresAt,
    })
    .onConflictDoUpdate({
      target: subscriptionsTable.stripeSubscriptionId,
      set: { status, expiresAt },
    });
}

async function handleCheckoutCompleted(session: StripeCheckoutSessionEvent) {
  if (session.mode !== "subscription" || !session.subscription) {
    return;
  }

  const guruId = parseInt(session.metadata?.guruId ?? "0", 10);
  const userId = parseInt(session.metadata?.userId ?? "0", 10);

  if (!guruId || !userId) {
    console.warn("Webhook: Missing metadata on checkout session", {
      sessionId: session.id,
      metadata: session.metadata,
    });
    return;
  }

  const subscriptionId = session.subscription;

  const existing = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await db
    .insert(subscriptionsTable)
    .values({
      userId,
      guruId,
      status: "active",
      stripeSubscriptionId: subscriptionId,
      startedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptionsTable.stripeSubscriptionId,
      set: { status: "active" },
    });
}

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    const event = JSON.parse(payload.toString()) as StripeWebhookEvent;
    const eventType = event?.type;

    switch (eventType) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as StripeSubscriptionEvent;
        await handleSubscriptionEvent(subscription);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as unknown as StripeCheckoutSessionEvent;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as unknown as StripeCheckoutSessionEvent;
        console.info("Checkout session failed/expired", {
          sessionId: session.id,
          type: eventType,
          metadata: session.metadata,
        });
        break;
      }
    }
  }
}

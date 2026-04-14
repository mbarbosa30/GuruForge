import { getStripeSync } from "./lib/stripeClient";
import { db } from "@workspace/db";
import { subscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

interface StripeSubscriptionMeta {
  id: string;
  status: string;
  current_period_end?: number;
  metadata?: Record<string, string>;
}

async function handleSubscriptionEvent(subscription: StripeSubscriptionMeta) {
  const guruId = parseInt(subscription.metadata?.guruId ?? "0", 10);
  const userId = parseInt(subscription.metadata?.userId ?? "0", 10);

  if (!guruId || !userId) {
    console.warn("Webhook: Missing guruId or userId in subscription metadata", {
      subscriptionId: subscription.id,
      metadata: subscription.metadata,
    });
    return;
  }

  const status = subscription.status === "active" || subscription.status === "trialing"
    ? "active"
    : "cancelled";

  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

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

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
          "Received type: " +
          typeof payload +
          ". " +
          "This usually means express.json() parsed the body before reaching this handler. " +
          "FIX: Ensure webhook route is registered BEFORE app.use(express.json()).",
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    const event = JSON.parse(payload.toString());
    const eventType = event?.type;

    if (
      eventType === "customer.subscription.created" ||
      eventType === "customer.subscription.updated" ||
      eventType === "customer.subscription.deleted"
    ) {
      const subscription = event.data?.object as StripeSubscriptionMeta;
      if (subscription) {
        await handleSubscriptionEvent(subscription);
      }
    }
  }
}

import { Router, type IRouter } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { db } from "@workspace/db";
import { subscriptionsTable, gurusTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { getUncachableStripeClient } from "../lib/stripeClient";

const router: IRouter = Router();

router.post("/subscriptions/checkout", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found." });
      return;
    }

    const { guruId } = req.body;
    if (!guruId || typeof guruId !== "number") {
      res.status(400).json({ error: "guruId is required." });
      return;
    }

    const [guru] = await db
      .select()
      .from(gurusTable)
      .where(eq(gurusTable.id, guruId))
      .limit(1);

    if (!guru || guru.status !== "published") {
      res.status(404).json({ error: "Guru not found." });
      return;
    }

    const existing = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, req.dbUserId),
          eq(subscriptionsTable.guruId, guruId),
          eq(subscriptionsTable.status, "active"),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "You already have an active subscription to this Guru." });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.dbUserId))
      .limit(1);

    if (!user) {
      res.status(400).json({ error: "User not found." });
      return;
    }

    const stripe = await getUncachableStripeClient();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: String(user.id), clerkId: user.clerkId },
      });
      customerId = customer.id;
      await db
        .update(usersTable)
        .set({ stripeCustomerId: customerId })
        .where(eq(usersTable.id, user.id));
    }

    let stripePriceId = guru.stripePriceId;
    if (!stripePriceId) {
      let stripeProductId = guru.stripeProductId;
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: guru.name,
          description: guru.tagline || guru.description || `Subscription to ${guru.name}`,
          metadata: { guruId: String(guru.id) },
        });
        stripeProductId = product.id;
      }

      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: guru.priceCents,
        currency: "usd",
        recurring: { interval: guru.priceInterval === "yearly" ? "year" : "month" },
      });
      stripePriceId = price.id;

      await db
        .update(gurusTable)
        .set({ stripeProductId, stripePriceId })
        .where(eq(gurusTable.id, guru.id));
    }

    const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost";
    const baseUrl = `https://${domain}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/guru/${guru.slug}?checkout=success`,
      cancel_url: `${baseUrl}/guru/${guru.slug}?checkout=cancel`,
      metadata: {
        guruId: String(guru.id),
        userId: String(req.dbUserId),
      },
      subscription_data: {
        metadata: {
          guruId: String(guru.id),
          userId: String(req.dbUserId),
        },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

router.get("/subscriptions/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found." });
      return;
    }

    const subs = await db
      .select({
        id: subscriptionsTable.id,
        guruId: subscriptionsTable.guruId,
        status: subscriptionsTable.status,
        startedAt: subscriptionsTable.startedAt,
        expiresAt: subscriptionsTable.expiresAt,
        stripeSubscriptionId: subscriptionsTable.stripeSubscriptionId,
        guruName: gurusTable.name,
        guruSlug: gurusTable.slug,
        guruAvatarUrl: gurusTable.avatarUrl,
        guruPriceCents: gurusTable.priceCents,
        guruPriceInterval: gurusTable.priceInterval,
      })
      .from(subscriptionsTable)
      .innerJoin(gurusTable, eq(subscriptionsTable.guruId, gurusTable.id))
      .where(
        and(
          eq(subscriptionsTable.userId, req.dbUserId),
          eq(subscriptionsTable.status, "active"),
        ),
      );

    res.json(subs);
  } catch (err) {
    console.error("List subscriptions error:", err);
    res.status(500).json({ error: "Failed to list subscriptions." });
  }
});

router.post("/subscriptions/portal", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found." });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.dbUserId))
      .limit(1);

    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: "No billing account found." });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost";
    const returnUrl = `https://${domain}/dashboard`;

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    res.status(500).json({ error: "Failed to create portal session." });
  }
});

router.get("/subscriptions/check/:guruId", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.json({ subscribed: false });
      return;
    }

    const rawGuruId = req.params.guruId;
    const guruId = parseInt(Array.isArray(rawGuruId) ? rawGuruId[0] : rawGuruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID." });
      return;
    }

    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, req.dbUserId),
          eq(subscriptionsTable.guruId, guruId),
          eq(subscriptionsTable.status, "active"),
        ),
      )
      .limit(1);

    res.json({ subscribed: !!sub });
  } catch (err) {
    res.json({ subscribed: false });
  }
});

export default router;

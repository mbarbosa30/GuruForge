import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./lib/stripeClient";
import app from "./app";
import { logger } from "./lib/logger";
import { startAllPublishedBots } from "./lib/botManager";
import { startProactiveScheduler } from "./lib/proactiveEngine";
import { startSnapshotScheduler } from "./lib/knowledgeSnapshotScheduler";
import { seedDemo } from "@workspace/db";

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled rejection");
});

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set — skipping Stripe initialization");
    return;
  }

  try {
    logger.info("Initializing Stripe schema...");
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready");

    const stripeSync = await getStripeSync();

    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    const webhookUrl = `${webhookBaseUrl}/api/webhooks/stripe`;
    logger.info({ webhookUrl }, "Setting up managed webhook...");

    await stripeSync.findOrCreateManagedWebhook(webhookUrl);
    logger.info("Webhook configured");

    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe data synced"))
      .catch((err: unknown) => logger.error({ err }, "Error syncing Stripe data"));
  } catch (error) {
    logger.error({ error }, "Failed to initialize Stripe — continuing without it");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  seedDemo()
    .then(() => logger.info("Demo seed check complete"))
    .catch((err: unknown) => logger.error({ err }, "Demo seed failed (non-fatal)"));

  startAllPublishedBots()
    .then(() => {
      logger.info("Telegram bots initialized");
      startProactiveScheduler();
      startSnapshotScheduler();
    })
    .catch((err: unknown) => logger.error({ err }, "Failed to start Telegram bots"));
});

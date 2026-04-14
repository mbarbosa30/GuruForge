import { Router, type IRouter } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { db } from "@workspace/db";
import {
  connectionCodesTable,
  telegramConnectionsTable,
  gurusTable,
  subscriptionsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { getBotHandler, startBot, stopBot, setupWebhook, isBotActive, getWebhookSecret } from "../lib/botManager";
import crypto from "crypto";

const router: IRouter = Router();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

router.post("/telegram/connect/:guruId", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found." });
      return;
    }

    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID." });
      return;
    }

    const [guru] = await db
      .select({
        id: gurusTable.id,
        name: gurusTable.name,
        telegramBotToken: gurusTable.telegramBotToken,
      })
      .from(gurusTable)
      .where(and(eq(gurusTable.id, guruId), eq(gurusTable.status, "published")))
      .limit(1);

    if (!guru) {
      res.status(404).json({ error: "Guru not found." });
      return;
    }

    if (!guru.telegramBotToken) {
      res.status(400).json({ error: "This Guru has not configured a Telegram bot yet." });
      return;
    }

    const [activeSub] = await db
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

    if (!activeSub) {
      res.status(403).json({ error: "You need an active subscription to connect on Telegram." });
      return;
    }

    const existingConnection = await db
      .select()
      .from(telegramConnectionsTable)
      .where(
        and(
          eq(telegramConnectionsTable.userId, req.dbUserId),
          eq(telegramConnectionsTable.guruId, guruId),
          eq(telegramConnectionsTable.status, "active"),
        ),
      )
      .limit(1);

    if (existingConnection.length > 0) {
      res.json({
        alreadyConnected: true,
        message: "You are already connected to this Guru on Telegram.",
      });
      return;
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(connectionCodesTable).values({
      userId: req.dbUserId,
      guruId,
      code,
      expiresAt,
    });

    if (!isBotActive(guruId)) {
      const started = await startBot(guruId);
      if (started) {
        const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0];
        if (domain) {
          await setupWebhook(guruId, `https://${domain}/api/telegram/webhook/${guruId}`);
        }
      }
    }

    let botUsername: string | null = null;
    try {
      const { Bot } = await import("grammy");
      const tempBot = new Bot(guru.telegramBotToken);
      const me = await tempBot.api.getMe();
      botUsername = me.username ?? null;
    } catch {}

    res.json({
      code,
      expiresAt: expiresAt.toISOString(),
      expiresInSeconds: 600,
      botUsername,
      botLink: botUsername ? `https://t.me/${botUsername}` : null,
    });
  } catch (err) {
    console.error("Telegram connect error:", err);
    res.status(500).json({ error: "Failed to generate connection code." });
  }
});

router.get("/telegram/status/:guruId", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ connected: false });
      return;
    }

    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID." });
      return;
    }

    const [connection] = await db
      .select()
      .from(telegramConnectionsTable)
      .where(
        and(
          eq(telegramConnectionsTable.userId, req.dbUserId),
          eq(telegramConnectionsTable.guruId, guruId),
          eq(telegramConnectionsTable.status, "active"),
        ),
      )
      .limit(1);

    res.json({
      connected: !!connection,
      connectedAt: connection?.connectedAt?.toISOString() ?? null,
    });
  } catch (err) {
    res.json({ connected: false });
  }
});

router.get("/telegram/bot-info/:guruId", async (req, res) => {
  try {
    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID." });
      return;
    }

    const [guru] = await db
      .select({
        telegramBotToken: gurusTable.telegramBotToken,
      })
      .from(gurusTable)
      .where(and(eq(gurusTable.id, guruId), eq(gurusTable.status, "published")))
      .limit(1);

    if (!guru?.telegramBotToken) {
      res.json({ configured: false, botUsername: null });
      return;
    }

    try {
      const { Bot } = await import("grammy");
      const tempBot = new Bot(guru.telegramBotToken);
      const me = await tempBot.api.getMe();
      res.json({ configured: true, botUsername: me.username });
    } catch {
      res.json({ configured: true, botUsername: null });
    }
  } catch (err) {
    res.json({ configured: false, botUsername: null });
  }
});

router.post("/telegram/webhook/:guruId", async (req, res) => {
  try {
    const guruId = parseInt(req.params.guruId as string, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID." });
      return;
    }

    const expectedSecret = getWebhookSecret(guruId);
    const receivedSecret = req.headers["x-telegram-bot-api-secret-token"];
    if (!receivedSecret || receivedSecret !== expectedSecret) {
      res.status(403).json({ error: "Unauthorized." });
      return;
    }

    if (!isBotActive(guruId)) {
      const started = await startBot(guruId);
      if (!started) {
        res.status(200).json({ ok: true });
        return;
      }
    }

    const handler = getBotHandler(guruId);
    if (handler) {
      handler(req, res);
    } else {
      res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error(`Webhook error for guru ${req.params.guruId}:`, err);
    res.status(200).json({ ok: true });
  }
});

router.patch("/telegram/bot-token/:guruId", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found." });
      return;
    }

    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID." });
      return;
    }

    const [guru] = await db
      .select()
      .from(gurusTable)
      .where(eq(gurusTable.id, guruId))
      .limit(1);

    if (!guru) {
      res.status(404).json({ error: "Guru not found." });
      return;
    }

    if (guru.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "You can only configure your own Gurus." });
      return;
    }

    const { botToken } = req.body;
    if (!botToken || typeof botToken !== "string") {
      res.status(400).json({ error: "botToken is required." });
      return;
    }

    try {
      const { Bot } = await import("grammy");
      const testBot = new Bot(botToken);
      const me = await testBot.api.getMe();

      await db
        .update(gurusTable)
        .set({ telegramBotToken: botToken, updatedAt: new Date() })
        .where(eq(gurusTable.id, guruId));

      if (isBotActive(guruId)) {
        stopBot(guruId);
      }

      const started = await startBot(guruId);
      if (started) {
        const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0];
        if (domain) {
          await setupWebhook(guruId, `https://${domain}/api/telegram/webhook/${guruId}`);
        }
      }

      res.json({
        success: true,
        botUsername: me.username,
        botName: me.first_name,
      });
    } catch (botErr) {
      res.status(400).json({ error: "Invalid bot token. Please check the token from BotFather." });
    }
  } catch (err) {
    console.error("Bot token update error:", err);
    res.status(500).json({ error: "Failed to update bot token." });
  }
});

export default router;

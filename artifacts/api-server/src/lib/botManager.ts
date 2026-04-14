import { Bot, webhookCallback } from "grammy";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { gurusTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { handleTelegramMessage } from "./conversationEngine";

interface BotEntry {
  bot: Bot;
  handler: (req: Request, res: Response) => void;
}

const activeBots = new Map<number, BotEntry>();

export async function startBot(guruId: number): Promise<boolean> {
  if (activeBots.has(guruId)) return true;

  const [guru] = await db
    .select()
    .from(gurusTable)
    .where(eq(gurusTable.id, guruId))
    .limit(1);

  if (!guru?.telegramBotToken) return false;

  try {
    const bot = new Bot(guru.telegramBotToken);

    bot.on("message:text", async (ctx) => {
      const text = ctx.message.text;
      const telegramUserId = String(ctx.from.id);
      const chatId = String(ctx.chat.id);

      try {
        const response = await handleTelegramMessage(guruId, telegramUserId, chatId, text);
        await ctx.reply(response);
      } catch (err) {
        console.error(`Bot ${guruId} message error:`, err);
        await ctx.reply("I'm having trouble processing your message right now. Please try again in a moment.");
      }
    });

    await bot.init();

    const handler = webhookCallback(bot, "express");
    activeBots.set(guruId, { bot, handler });
    return true;
  } catch (err) {
    console.error(`Failed to start bot for guru ${guruId}:`, err);
    return false;
  }
}

export function stopBot(guruId: number): void {
  const entry = activeBots.get(guruId);
  if (entry) {
    entry.bot.stop();
    activeBots.delete(guruId);
  }
}

export function getBotHandler(guruId: number): ((req: Request, res: Response) => void) | null {
  return activeBots.get(guruId)?.handler ?? null;
}

export function isBotActive(guruId: number): boolean {
  return activeBots.has(guruId);
}

export async function startAllPublishedBots(): Promise<void> {
  const publishedGurus = await db
    .select({ id: gurusTable.id, telegramBotToken: gurusTable.telegramBotToken })
    .from(gurusTable)
    .where(eq(gurusTable.status, "published"));

  for (const guru of publishedGurus) {
    if (guru.telegramBotToken) {
      await startBot(guru.id);
    }
  }
}

export async function setupWebhook(guruId: number, webhookUrl: string): Promise<boolean> {
  const entry = activeBots.get(guruId);
  if (!entry) return false;

  try {
    await entry.bot.api.setWebhook(webhookUrl);
    return true;
  } catch (err) {
    console.error(`Failed to set webhook for guru ${guruId}:`, err);
    return false;
  }
}

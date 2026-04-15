import { db } from "@workspace/db";
import {
  gurusTable,
  telegramConnectionsTable,
  usersTable,
  userMemoriesTable,
  collectivePatternsTable,
  subscriptionsTable,
  conversationsTable,
  messagesTable,
  processedTelegramUpdatesTable,
} from "@workspace/db/schema";
import { eq, and, or, isNull, lte, desc, sql } from "drizzle-orm";
import { sendBotMessage } from "./botManager";
import { getModelConfig } from "./modelConfig";
import { logUsage } from "./usageLogger";
import { logger } from "./logger";

const CADENCE_HOURS: Record<string, number> = {
  daily: 24,
  every_few_days: 60,
  weekly: 168,
};

function isQuietHoursUTC(): boolean {
  const hour = new Date().getUTCHours();
  return hour < 9 || hour >= 21;
}

interface EligibleConnection {
  connectionId: number;
  userId: number;
  guruId: number;
  telegramChatId: string;
  guruName: string;
  guruDescription: string | null;
  guruTagline: string | null;
  guruPersonalityStyle: string | null;
  guruTopics: string[] | null;
  guruModelTier: string | null;
  guruPriceCents: number;
  guruCreatorId: number;
  userName: string | null;
}

async function getEligibleConnections(): Promise<EligibleConnection[]> {
  const now = new Date();

  const gurusWithCadence = await db
    .select({
      id: gurusTable.id,
      creatorId: gurusTable.creatorId,
      name: gurusTable.name,
      description: gurusTable.description,
      tagline: gurusTable.tagline,
      personalityStyle: gurusTable.personalityStyle,
      topics: gurusTable.topics,
      modelTier: gurusTable.modelTier,
      priceCents: gurusTable.priceCents,
      proactiveCadence: gurusTable.proactiveCadence,
    })
    .from(gurusTable)
    .where(
      and(
        eq(gurusTable.status, "published"),
        or(
          eq(gurusTable.proactiveCadence, "daily"),
          eq(gurusTable.proactiveCadence, "every_few_days"),
          eq(gurusTable.proactiveCadence, "weekly"),
        ),
      ),
    );

  const eligible: EligibleConnection[] = [];

  for (const guru of gurusWithCadence) {
    const cadenceHours = CADENCE_HOURS[guru.proactiveCadence];
    if (!cadenceHours) continue;

    const cadenceCutoff = new Date(now.getTime() - cadenceHours * 60 * 60 * 1000);
    const interactionCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const connections = await db
      .select({
        connectionId: telegramConnectionsTable.id,
        userId: telegramConnectionsTable.userId,
        guruId: telegramConnectionsTable.guruId,
        telegramChatId: telegramConnectionsTable.telegramChatId,
        userName: usersTable.name,
      })
      .from(telegramConnectionsTable)
      .innerJoin(usersTable, eq(telegramConnectionsTable.userId, usersTable.id))
      .where(
        and(
          eq(telegramConnectionsTable.guruId, guru.id),
          eq(telegramConnectionsTable.status, "active"),
          eq(telegramConnectionsTable.onboardingCompleted, true),
          or(
            isNull(telegramConnectionsTable.lastProactiveAt),
            lte(telegramConnectionsTable.lastProactiveAt, cadenceCutoff),
          ),
        ),
      );

    for (const conn of connections) {
      const isCreator = guru.creatorId === conn.userId;

      if (!isCreator) {
        const [activeSub] = await db
          .select({ id: subscriptionsTable.id })
          .from(subscriptionsTable)
          .where(
            and(
              eq(subscriptionsTable.userId, conn.userId),
              eq(subscriptionsTable.guruId, guru.id),
              eq(subscriptionsTable.status, "active"),
            ),
          )
          .limit(1);

        if (!activeSub) continue;
      }

      const [recentMsg] = await db
        .select({ createdAt: messagesTable.createdAt })
        .from(messagesTable)
        .innerJoin(conversationsTable, eq(messagesTable.conversationId, conversationsTable.id))
        .where(
          and(
            eq(conversationsTable.userId, conn.userId),
            eq(conversationsTable.guruId, guru.id),
            eq(messagesTable.role, "user"),
          ),
        )
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      if (recentMsg && recentMsg.createdAt > interactionCutoff) {
        continue;
      }

      eligible.push({
        connectionId: conn.connectionId,
        userId: conn.userId,
        guruId: conn.guruId,
        telegramChatId: conn.telegramChatId,
        guruName: guru.name,
        guruDescription: guru.description,
        guruTagline: guru.tagline,
        guruPersonalityStyle: guru.personalityStyle,
        guruTopics: guru.topics,
        guruModelTier: guru.modelTier,
        guruPriceCents: guru.priceCents,
        guruCreatorId: guru.creatorId,
        userName: conn.userName,
      });
    }
  }

  return eligible;
}

async function getPersonalContext(userId: number, guruId: number): Promise<string> {
  const goalMemories = await db
    .select({ summary: userMemoriesTable.summary, category: userMemoriesTable.category })
    .from(userMemoriesTable)
    .where(
      and(
        eq(userMemoriesTable.userId, userId),
        eq(userMemoriesTable.guruId, guruId),
        eq(userMemoriesTable.category, "goals"),
      ),
    )
    .orderBy(desc(userMemoriesTable.importance), desc(userMemoriesTable.updatedAt))
    .limit(5);

  const remainingSlots = 10 - goalMemories.length;
  const otherMemories = remainingSlots > 0
    ? await db
        .select({ summary: userMemoriesTable.summary, category: userMemoriesTable.category })
        .from(userMemoriesTable)
        .where(
          and(
            eq(userMemoriesTable.userId, userId),
            eq(userMemoriesTable.guruId, guruId),
            sql`${userMemoriesTable.category} != 'goals'`,
          ),
        )
        .orderBy(desc(userMemoriesTable.importance), desc(userMemoriesTable.updatedAt))
        .limit(remainingSlots)
    : [];

  const all = [...goalMemories, ...otherMemories];
  if (all.length === 0) return "";

  return all.map((m) => `- [${m.category}] ${m.summary}`).join("\n");
}

async function getRecentCollectivePatterns(guruId: number, lastProactiveAt: Date | null): Promise<string> {
  const cutoff = lastProactiveAt ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const patterns = await db
    .select({
      pattern: collectivePatternsTable.summary,
      confidence: collectivePatternsTable.confidence,
      updatedAt: collectivePatternsTable.updatedAt,
    })
    .from(collectivePatternsTable)
    .where(
      and(
        eq(collectivePatternsTable.guruId, guruId),
        sql`${collectivePatternsTable.updatedAt} > ${cutoff}`,
      ),
    )
    .orderBy(desc(collectivePatternsTable.confidence))
    .limit(5);

  if (patterns.length === 0) {
    const fallback = await db
      .select({ pattern: collectivePatternsTable.summary, confidence: collectivePatternsTable.confidence })
      .from(collectivePatternsTable)
      .where(eq(collectivePatternsTable.guruId, guruId))
      .orderBy(desc(collectivePatternsTable.confidence))
      .limit(3);

    if (fallback.length === 0) return "";
    return fallback.map((p) => `- ${p.pattern} (confidence: ${(p.confidence * 100).toFixed(0)}%)`).join("\n");
  }

  return patterns.map((p) => `- ${p.pattern} (confidence: ${(p.confidence * 100).toFixed(0)}%)`).join("\n");
}

async function generateProactiveMessage(conn: EligibleConnection, lastProactiveAt: Date | null): Promise<string | null> {
  const personalContext = await getPersonalContext(conn.userId, conn.guruId);
  const collectiveContext = await getRecentCollectivePatterns(conn.guruId, lastProactiveAt);

  if (!personalContext && !collectiveContext) return null;

  let modelConfig;
  try {
    modelConfig = getModelConfig(conn.guruModelTier);
  } catch {
    return null;
  }

  const personality = conn.guruPersonalityStyle ?? "professional";
  const personalityDesc: Record<string, string> = {
    professional: "clear, structured, and professional",
    friendly: "warm, approachable, and conversational",
    direct: "concise, straight to the point",
    academic: "thorough, analytical, and evidence-based",
  };

  const systemPrompt = [
    `You are ${conn.guruName}, a specialized AI Guru sending a proactive check-in message.`,
    conn.guruTagline ? `Your focus: ${conn.guruTagline}` : "",
    `Personality: ${personalityDesc[personality] ?? personalityDesc.professional}`,
    conn.guruTopics?.length ? `Your expertise: ${conn.guruTopics.join(", ")}` : "",
    conn.userName ? `The user's name is "${conn.userName}".` : "",
    "",
    "Generate a brief, natural check-in message (2-4 sentences) that:",
    "- References something specific from their context or a recently discovered community insight",
    "- Asks a thought-provoking question or offers a useful nudge",
    "- Feels personal, not generic or spammy",
    "- Does NOT start with 'Hey!' or similar greeting cliches",
    "",
    personalContext ? `PERSONAL CONTEXT:\n${personalContext}` : "",
    collectiveContext ? `RECENT COMMUNITY INSIGHTS:\n${collectiveContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const start = Date.now();
  const completion = await modelConfig.client.chat.completions.create({
    model: modelConfig.fastModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate a proactive check-in message for this user." },
    ],
    max_tokens: 200,
    temperature: 0.8,
  });

  const elapsed = Date.now() - start;
  const usage = completion.usage;
  if (usage) {
    logUsage({
      guruId: conn.guruId,
      userId: conn.userId,
      callType: "proactive_checkin",
      model: modelConfig.fastModel,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
      latencyMs: elapsed,
    }).catch(() => {});
  }

  return completion.choices[0]?.message?.content?.trim() || null;
}

async function persistProactiveMessage(userId: number, guruId: number, message: string): Promise<void> {
  let [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.userId, userId),
        eq(conversationsTable.guruId, guruId),
      ),
    )
    .orderBy(desc(conversationsTable.createdAt))
    .limit(1);

  if (!conversation) {
    [conversation] = await db
      .insert(conversationsTable)
      .values({
        userId,
        guruId,
        title: "Telegram conversation",
      })
      .returning();
  }

  await db.insert(messagesTable).values({
    conversationId: conversation.id,
    role: "assistant",
    content: message,
  });
}

async function processConnection(conn: EligibleConnection): Promise<void> {
  try {
    const [connRow] = await db
      .select({ lastProactiveAt: telegramConnectionsTable.lastProactiveAt })
      .from(telegramConnectionsTable)
      .where(eq(telegramConnectionsTable.id, conn.connectionId))
      .limit(1);

    const message = await generateProactiveMessage(conn, connRow?.lastProactiveAt ?? null);
    if (!message) return;

    const sent = await sendBotMessage(conn.guruId, conn.telegramChatId, message);
    if (sent) {
      await persistProactiveMessage(conn.userId, conn.guruId, message);
      await db
        .update(telegramConnectionsTable)
        .set({ lastProactiveAt: new Date() })
        .where(eq(telegramConnectionsTable.id, conn.connectionId));
    }
  } catch (err) {
    logger.error(
      { err, guruId: conn.guruId, userId: conn.userId },
      "Failed to process proactive message",
    );
  }
}

export async function runProactiveCycle(): Promise<void> {
  try {
    if (isQuietHoursUTC()) {
      logger.debug("Skipping proactive cycle — outside UTC 9am-9pm window");
      return;
    }

    const eligible = await getEligibleConnections();
    if (eligible.length === 0) return;

    logger.info({ count: eligible.length }, "Running proactive engagement cycle");

    const shuffled = eligible.sort(() => Math.random() - 0.5);
    const batch = shuffled.slice(0, 50);

    for (const conn of batch) {
      await processConnection(conn);
      await new Promise((r) => setTimeout(r, 2000));
    }

    logger.info({ processed: batch.length }, "Proactive cycle complete");
  } catch (err) {
    logger.error({ err }, "Proactive cycle error");
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000;

export function startProactiveScheduler(): void {
  if (intervalId) return;

  const envInterval = process.env.PROACTIVE_INTERVAL_MS;
  const intervalMs = envInterval ? parseInt(envInterval, 10) || DEFAULT_INTERVAL_MS : DEFAULT_INTERVAL_MS;

  intervalId = setInterval(async () => {
    runProactiveCycle().catch((err) =>
      logger.error({ err }, "Scheduled proactive cycle failed"),
    );

    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await db
        .delete(processedTelegramUpdatesTable)
        .where(lte(processedTelegramUpdatesTable.processedAt, cutoff));
      logger.info("Cleaned up old processed Telegram update records");
    } catch (cleanupErr) {
      logger.error({ err: cleanupErr }, "Failed to clean up processed Telegram updates");
    }
  }, intervalMs);

  logger.info({ intervalMs }, "Proactive engagement scheduler started");
}

export function stopProactiveScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info("Proactive engagement scheduler stopped");
  }
}

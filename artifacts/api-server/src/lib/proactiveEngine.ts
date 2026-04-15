import { db } from "@workspace/db";
import {
  gurusTable,
  telegramConnectionsTable,
  usersTable,
  userMemoriesTable,
  collectivePatternsTable,
  subscriptionsTable,
} from "@workspace/db/schema";
import { eq, and, or, isNull, lte, desc, sql } from "drizzle-orm";
import { sendBotMessage } from "./botManager";
import { getModelConfig } from "./modelConfig";
import { logUsage } from "./usageLogger";
import { logger } from "./logger";

const CADENCE_HOURS: Record<string, number> = {
  daily: 24,
  weekly: 168,
  biweekly: 336,
};

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
  userName: string | null;
}

async function getEligibleConnections(): Promise<EligibleConnection[]> {
  const now = new Date();

  const gurusWithCadence = await db
    .select({
      id: gurusTable.id,
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
          eq(gurusTable.proactiveCadence, "weekly"),
          eq(gurusTable.proactiveCadence, "biweekly"),
        ),
      ),
    );

  const eligible: EligibleConnection[] = [];

  for (const guru of gurusWithCadence) {
    const cadenceHours = CADENCE_HOURS[guru.proactiveCadence];
    if (!cadenceHours) continue;

    const cutoff = new Date(now.getTime() - cadenceHours * 60 * 60 * 1000);

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
            lte(telegramConnectionsTable.lastProactiveAt, cutoff),
          ),
        ),
      );

    for (const conn of connections) {
      const isCreator = false;
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

        const [guruRow] = await db
          .select({ creatorId: gurusTable.creatorId })
          .from(gurusTable)
          .where(eq(gurusTable.id, guru.id))
          .limit(1);

        if (!activeSub && guruRow?.creatorId !== conn.userId) continue;
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
        userName: conn.userName,
      });
    }
  }

  return eligible;
}

async function getPersonalContext(userId: number, guruId: number): Promise<string> {
  const memories = await db
    .select({ summary: userMemoriesTable.summary, category: userMemoriesTable.category })
    .from(userMemoriesTable)
    .where(and(eq(userMemoriesTable.userId, userId), eq(userMemoriesTable.guruId, guruId)))
    .orderBy(desc(userMemoriesTable.importance), desc(userMemoriesTable.updatedAt))
    .limit(10);

  if (memories.length === 0) return "";

  return memories.map((m) => `- [${m.category}] ${m.summary}`).join("\n");
}

async function getCollectiveContext(guruId: number): Promise<string> {
  const patterns = await db
    .select({ pattern: collectivePatternsTable.summary, confidence: collectivePatternsTable.confidence })
    .from(collectivePatternsTable)
    .where(eq(collectivePatternsTable.guruId, guruId))
    .orderBy(desc(collectivePatternsTable.confidence))
    .limit(5);

  if (patterns.length === 0) return "";

  return patterns.map((p) => `- ${p.pattern} (confidence: ${(p.confidence * 100).toFixed(0)}%)`).join("\n");
}

async function generateProactiveMessage(conn: EligibleConnection): Promise<string | null> {
  const personalContext = await getPersonalContext(conn.userId, conn.guruId);
  const collectiveContext = await getCollectiveContext(conn.guruId);

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
    "- References something specific from their context or a community insight",
    "- Asks a thought-provoking question or offers a useful nudge",
    "- Feels personal, not generic or spammy",
    "- Does NOT start with 'Hey!' or similar greeting cliches",
    "",
    personalContext ? `PERSONAL CONTEXT:\n${personalContext}` : "",
    collectiveContext ? `COMMUNITY INSIGHTS:\n${collectiveContext}` : "",
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
      model: modelConfig.fastModel,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      latencyMs: elapsed,
      operation: "proactive_checkin",
    }).catch(() => {});
  }

  return completion.choices[0]?.message?.content?.trim() || null;
}

async function processConnection(conn: EligibleConnection): Promise<void> {
  try {
    const message = await generateProactiveMessage(conn);
    if (!message) return;

    const sent = await sendBotMessage(conn.guruId, conn.telegramChatId, message);
    if (sent) {
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

export function startProactiveScheduler(): void {
  if (intervalId) return;

  const intervalMs = 60 * 60 * 1000;
  intervalId = setInterval(() => {
    runProactiveCycle().catch((err) =>
      logger.error({ err }, "Scheduled proactive cycle failed"),
    );
  }, intervalMs);

  logger.info("Proactive engagement scheduler started (runs every hour)");
}

export function stopProactiveScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info("Proactive engagement scheduler stopped");
  }
}

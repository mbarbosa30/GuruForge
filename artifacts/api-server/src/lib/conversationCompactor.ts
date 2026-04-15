import { db } from "@workspace/db";
import {
  messagesTable,
  conversationSummariesTable,
} from "@workspace/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { getModelConfig } from "./modelConfig";
import { logUsage } from "./usageLogger";

const RECENT_WINDOW = 20;
const COMPACTION_THRESHOLD = 30;
const CHUNK_SIZE = 20;
const MAX_SUMMARY_LENGTH = 3000;

export async function compactConversation(
  conversationId: number,
  guruId: number,
  modelTier: string | null,
): Promise<void> {
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId));

  const totalMessages = countResult?.count ?? 0;
  if (totalMessages < COMPACTION_THRESHOLD) return;

  const [existingSummary] = await db
    .select()
    .from(conversationSummariesTable)
    .where(eq(conversationSummariesTable.conversationId, conversationId))
    .limit(1);

  const olderMessageCount = totalMessages - RECENT_WINDOW;
  if (olderMessageCount <= 0) return;
  if (existingSummary && existingSummary.messagesSummarized >= olderMessageCount) return;

  const olderMessages = await db
    .select({ role: messagesTable.role, content: messagesTable.content })
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(asc(messagesTable.createdAt))
    .limit(olderMessageCount);

  if (olderMessages.length === 0) return;

  const unsummarizedStart = existingSummary?.messagesSummarized ?? 0;
  const newMessages = olderMessages.slice(unsummarizedStart);
  if (newMessages.length === 0) return;

  let modelConfig;
  try {
    modelConfig = getModelConfig(modelTier);
  } catch {
    return;
  }

  const chunks: Array<typeof newMessages> = [];
  for (let i = 0; i < newMessages.length; i += CHUNK_SIZE) {
    chunks.push(newMessages.slice(i, i + CHUNK_SIZE));
  }

  const chunkSummaries: string[] = [];
  for (const chunk of chunks) {
    const transcript = chunk
      .map((m) => `[${m.role}]: ${m.content.slice(0, 500)}`)
      .join("\n");

    const prompt = `Summarize the following conversation excerpt concisely. Focus on key topics discussed, decisions made, user preferences revealed, and important context. Write in third person about "the user" and "the assistant". Keep the summary under 300 words.\n\nConversation:\n${transcript}`;

    const start = Date.now();
    const completion = await modelConfig.client.chat.completions.create({
      model: modelConfig.fastModel,
      max_completion_tokens: 512,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    const latency = Date.now() - start;

    await logUsage({
      guruId,
      conversationId,
      callType: "conversation_compaction",
      model: modelConfig.fastModel,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
      latencyMs: latency,
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (summary) chunkSummaries.push(summary);
  }

  if (chunkSummaries.length === 0) return;

  const combinedNewSummary = chunkSummaries.join("\n\n");
  let fullSummary = existingSummary?.summary
    ? `${existingSummary.summary}\n\n${combinedNewSummary}`
    : combinedNewSummary;

  if (fullSummary.length > MAX_SUMMARY_LENGTH) {
    fullSummary = await recondenseSummary(fullSummary, modelConfig);
  }

  await db
    .insert(conversationSummariesTable)
    .values({
      conversationId,
      summary: fullSummary,
      messagesSummarized: olderMessageCount,
    })
    .onConflictDoUpdate({
      target: conversationSummariesTable.conversationId,
      set: {
        summary: fullSummary,
        messagesSummarized: olderMessageCount,
        updatedAt: new Date(),
      },
    });
}

async function recondenseSummary(
  summary: string,
  modelConfig: ReturnType<typeof getModelConfig>,
): Promise<string> {
  const prompt = `The following is a running summary of a conversation that has grown too long. Condense it into a single cohesive summary under 2000 characters, preserving all key topics, decisions, preferences, and important context. Remove redundancy.\n\nSummary to condense:\n${summary}`;

  const completion = await modelConfig.client.chat.completions.create({
    model: modelConfig.fastModel,
    max_completion_tokens: 512,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content?.trim() ?? summary.slice(0, MAX_SUMMARY_LENGTH);
}

export async function getConversationSummary(
  conversationId: number,
): Promise<string | null> {
  const [summary] = await db
    .select({ summary: conversationSummariesTable.summary })
    .from(conversationSummariesTable)
    .where(eq(conversationSummariesTable.conversationId, conversationId))
    .limit(1);

  return summary?.summary ?? null;
}

import { db } from "@workspace/db";
import {
  telegramConnectionsTable,
  connectionCodesTable,
  conversationsTable,
  messagesTable,
  gurusTable,
  usersTable,
  subscriptionsTable,
} from "@workspace/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

function buildSystemPrompt(guru: {
  name: string;
  description: string | null;
  tagline: string | null;
  personalityStyle: string | null;
  topics: string[] | null;
  memoryPolicy: string | null;
}): string {
  const personality = guru.personalityStyle ?? "professional";
  const personalityDescriptions: Record<string, string> = {
    professional: "You communicate in a clear, structured, and professional manner. You are precise and thoughtful.",
    friendly: "You are warm, approachable, and conversational. You make people feel comfortable and supported.",
    direct: "You are concise, straight to the point, and action-oriented. You don't waste words.",
    academic: "You are thorough, analytical, and evidence-based. You reference frameworks and principles.",
  };

  const parts = [
    `You are ${guru.name}, a specialized AI Guru.`,
    guru.tagline ? `Your focus: ${guru.tagline}` : "",
    guru.description ? `\nAbout you: ${guru.description}` : "",
    `\nPersonality: ${personalityDescriptions[personality] ?? personalityDescriptions.professional}`,
    guru.topics?.length ? `\nYour areas of expertise: ${guru.topics.join(", ")}` : "",
    `\nYou are part of a private wisdom community. Every user talks to you privately 1-on-1.`,
    `You learn collectively from all your users — synthesizing patterns across conversations to offer insights no single person could provide alone.`,
    `You never reveal personal details from one user to another. All collective insights are anonymized.`,
    `Keep responses helpful, contextual, and appropriately concise. Don't be overly verbose unless the topic requires depth.`,
  ];

  return parts.filter(Boolean).join("\n");
}

export async function handleCodeVerification(
  guruId: number,
  telegramUserId: string,
  chatId: string,
  code: string,
): Promise<{ success: boolean; message: string }> {
  const now = new Date();

  const [codeEntry] = await db
    .select()
    .from(connectionCodesTable)
    .where(
      and(
        eq(connectionCodesTable.code, code.toUpperCase()),
        eq(connectionCodesTable.guruId, guruId),
        eq(connectionCodesTable.used, false),
        gt(connectionCodesTable.expiresAt, now),
      ),
    )
    .limit(1);

  if (!codeEntry) {
    return { success: false, message: "" };
  }

  await db
    .update(connectionCodesTable)
    .set({ used: true })
    .where(eq(connectionCodesTable.id, codeEntry.id));

  const existing = await db
    .select()
    .from(telegramConnectionsTable)
    .where(
      and(
        eq(telegramConnectionsTable.userId, codeEntry.userId),
        eq(telegramConnectionsTable.guruId, guruId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(telegramConnectionsTable)
      .set({
        telegramUserId,
        telegramChatId: chatId,
        status: "active",
        connectedAt: now,
      })
      .where(eq(telegramConnectionsTable.id, existing[0].id));
  } else {
    await db.insert(telegramConnectionsTable).values({
      userId: codeEntry.userId,
      guruId,
      telegramUserId,
      telegramChatId: chatId,
      status: "active",
    });
  }

  const [guru] = await db
    .select({ name: gurusTable.name })
    .from(gurusTable)
    .where(eq(gurusTable.id, guruId))
    .limit(1);

  const guruName = guru?.name ?? "your Guru";
  return {
    success: true,
    message: `Connected! I am now your ${guruName}. I remember everything and I'm learning from everyone in this private community. How can I help you today?`,
  };
}

export async function handleTelegramMessage(
  guruId: number,
  telegramUserId: string,
  chatId: string,
  text: string,
): Promise<string> {
  if (/^[A-Z0-9]{8}$/.test(text.trim().toUpperCase()) && text.trim().length === 8) {
    const result = await handleCodeVerification(guruId, telegramUserId, chatId, text.trim());
    if (result.success) return result.message;
  }

  const [connection] = await db
    .select()
    .from(telegramConnectionsTable)
    .where(
      and(
        eq(telegramConnectionsTable.telegramUserId, telegramUserId),
        eq(telegramConnectionsTable.guruId, guruId),
        eq(telegramConnectionsTable.status, "active"),
      ),
    )
    .limit(1);

  if (!connection) {
    return "Please connect your GuruForge account first. Go to the Guru's profile page on GuruForge and click 'Connect on Telegram' to get your connection code.";
  }

  const [activeSub] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, connection.userId),
        eq(subscriptionsTable.guruId, guruId),
        eq(subscriptionsTable.status, "active"),
      ),
    )
    .limit(1);

  if (!activeSub) {
    return "Your subscription to this Guru is not active. Please visit GuruForge to resubscribe.";
  }

  const [guru] = await db
    .select()
    .from(gurusTable)
    .where(eq(gurusTable.id, guruId))
    .limit(1);

  if (!guru) {
    return "This Guru is no longer available.";
  }

  let [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.userId, connection.userId),
        eq(conversationsTable.guruId, guruId),
      ),
    )
    .orderBy(desc(conversationsTable.createdAt))
    .limit(1);

  if (!conversation) {
    [conversation] = await db
      .insert(conversationsTable)
      .values({
        userId: connection.userId,
        guruId,
        title: "Telegram conversation",
      })
      .returning();
  }

  const recentMessages = await db
    .select({ role: messagesTable.role, content: messagesTable.content })
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversation.id))
    .orderBy(desc(messagesTable.createdAt))
    .limit(20);

  recentMessages.reverse();

  const systemPrompt = buildSystemPrompt(guru);

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: text },
  ];

  const modelMap: Record<string, string> = {
    basic: "gpt-4o-mini",
    pro: "gpt-5.2",
    enterprise: "gpt-5.2",
  };
  const model = modelMap[guru.modelTier ?? "basic"] ?? "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    max_completion_tokens: 8192,
    messages: chatMessages,
  });

  const assistantContent = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
  const promptTokens = completion.usage?.prompt_tokens ?? null;
  const completionTokens = completion.usage?.completion_tokens ?? null;
  const totalTokens = completion.usage?.total_tokens ?? null;

  await db.insert(messagesTable).values([
    {
      conversationId: conversation.id,
      role: "user",
      content: text,
    },
    {
      conversationId: conversation.id,
      role: "assistant",
      content: assistantContent,
      promptTokens,
      completionTokens,
      totalTokens,
    },
  ]);

  await db
    .update(conversationsTable)
    .set({ updatedAt: new Date() })
    .where(eq(conversationsTable.id, conversation.id));

  return assistantContent;
}

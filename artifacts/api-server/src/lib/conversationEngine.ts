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
import { retrieveMemoryContext } from "./memoryManager";
import { getModelConfig } from "./modelConfig";
import { logUsage } from "./usageLogger";
import { runTriage, type TriageResult } from "./triagePipeline";
import { runCalibration } from "./calibrationPipeline";
import { maybeRecalculateScores } from "./scoreCalculator";
import {
  getOnboardingState,
  generateWelcomeWithFirstQuestion,
  handleOnboardingResponse,
} from "./onboardingManager";

interface MemoryPolicyFlags {
  personalMemory: boolean;
  sharedLearning: boolean;
}

function parseMemoryPolicy(memoryPolicy: string | null): MemoryPolicyFlags {
  if (!memoryPolicy) return { personalMemory: true, sharedLearning: true };

  try {
    const parsed = JSON.parse(memoryPolicy);
    return {
      personalMemory: parsed.personalMemory !== false,
      sharedLearning: parsed.sharedLearning !== false,
    };
  } catch {
    const lower = (memoryPolicy ?? "").toLowerCase();
    if (lower === "none" || lower.includes("no memory")) {
      return { personalMemory: false, sharedLearning: false };
    }
    return {
      personalMemory: lower.includes("personal"),
      sharedLearning: lower.includes("shared") || lower.includes("pattern"),
    };
  }
}

function getMaxCompletionTokens(priceCents: number): number {
  if (priceCents >= 10000) return 2400;
  if (priceCents >= 5000) return 1200;
  if (priceCents >= 2000) return 600;
  return 300;
}

function buildSystemPrompt(
  guru: {
    name: string;
    description: string | null;
    tagline: string | null;
    personalityStyle: string | null;
    topics: string[] | null;
    memoryPolicy: string | null;
  },
  personalMemories: string,
  collectivePatterns: string,
  triage: TriageResult | null,
  userName: string | null,
): string {
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
    userName ? `\nThe user's name is "${userName.replace(/[^\p{L}\p{N}\s'-]/gu, "").slice(0, 50)}". Address them by name naturally when appropriate.` : "",
    `\nYou are part of a private wisdom community. Every user talks to you privately 1-on-1.`,
    `You learn collectively from all your users — synthesizing patterns across conversations to offer insights no single person could provide alone.`,
    `You never reveal personal details from one user to another. All collective insights are anonymized.`,
  ];

  if (triage) {
    if (triage.outOfDomain) {
      parts.push(
        `\nNote: The user's question may be outside your area of expertise. Acknowledge this gracefully and redirect if appropriate, or provide general guidance while noting your limitations.`,
      );
    }
    if (triage.specialFlags.includes("needs_empathy")) {
      parts.push(`\nThe user may need empathetic support. Be especially thoughtful and caring in your response.`);
    }
    if (triage.urgency === "high") {
      parts.push(`\nThis appears to be an urgent matter. Prioritize actionable, direct advice.`);
    }
  }

  if (personalMemories) {
    parts.push(
      `\n--- PERSONAL MEMORY (things you remember about this specific user) ---`,
      personalMemories,
      `--- END PERSONAL MEMORY ---`,
      `Use these memories naturally in conversation. Reference them when relevant (e.g., "Last time you mentioned X..."). Do not list them unprompted.`,
    );
  }

  if (collectivePatterns) {
    parts.push(
      `\n--- COLLECTIVE WISDOM (anonymized patterns from your community) ---`,
      collectivePatterns,
      `--- END COLLECTIVE WISDOM ---`,
      `Weave these patterns into your advice naturally. Reference community-level insights when helpful (e.g., "Based on what I've learned from this community..."). Never attribute patterns to specific users.`,
    );
  }

  parts.push(
    `\nKeep responses helpful, contextual, and appropriately concise. Don't be overly verbose unless the topic requires depth.`,
  );

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

  const existingByUser = await db
    .select()
    .from(telegramConnectionsTable)
    .where(
      and(
        eq(telegramConnectionsTable.userId, codeEntry.userId),
        eq(telegramConnectionsTable.guruId, guruId),
      ),
    )
    .limit(1);

  let alreadyOnboarded = false;
  let midOnboarding = false;

  if (existingByUser.length > 0) {
    alreadyOnboarded = existingByUser[0].onboardingCompleted;
    midOnboarding = !alreadyOnboarded && existingByUser[0].onboardingStep > 0;
    await db
      .update(telegramConnectionsTable)
      .set({
        telegramUserId,
        telegramChatId: chatId,
        status: "active",
        connectedAt: now,
      })
      .where(eq(telegramConnectionsTable.id, existingByUser[0].id));
  } else {
    const existingByTelegram = await db
      .select()
      .from(telegramConnectionsTable)
      .where(
        and(
          eq(telegramConnectionsTable.guruId, guruId),
          eq(telegramConnectionsTable.telegramUserId, telegramUserId),
        ),
      )
      .limit(1);

    if (existingByTelegram.length > 0) {
      const userChanged = existingByTelegram[0].userId !== codeEntry.userId;
      if (userChanged) {
        alreadyOnboarded = false;
        midOnboarding = false;
      } else {
        alreadyOnboarded = existingByTelegram[0].onboardingCompleted;
        midOnboarding = !alreadyOnboarded && existingByTelegram[0].onboardingStep > 0;
      }
      await db
        .update(telegramConnectionsTable)
        .set({
          userId: codeEntry.userId,
          telegramChatId: chatId,
          status: "active",
          connectedAt: now,
          ...(userChanged ? { onboardingCompleted: false, onboardingStep: 0 } : {}),
        })
        .where(eq(telegramConnectionsTable.id, existingByTelegram[0].id));
    } else {
      await db.insert(telegramConnectionsTable).values({
        userId: codeEntry.userId,
        guruId,
        telegramUserId,
        telegramChatId: chatId,
        status: "active",
      });
    }
  }

  const [guru] = await db
    .select()
    .from(gurusTable)
    .where(eq(gurusTable.id, guruId))
    .limit(1);

  const guruName = guru?.name ?? "your Guru";

  if (alreadyOnboarded) {
    return {
      success: true,
      message: `Welcome back! I'm ${guruName}, reconnected and ready to continue where we left off. What can I help you with?`,
    };
  }

  if (midOnboarding) {
    return {
      success: true,
      message: `Welcome back! I'm ${guruName}. We were getting to know each other — just send me a message and we'll pick up where we left off.`,
    };
  }

  let userName: string | null = null;
  try {
    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, codeEntry.userId))
      .limit(1);
    userName = user?.name || null;
  } catch (err) {
    console.error("Failed to fetch user name for onboarding:", err);
  }

  let welcomeMessage: string;
  try {
    welcomeMessage = await generateWelcomeWithFirstQuestion(
      {
        id: guru.id,
        name: guru.name,
        description: guru.description,
        tagline: guru.tagline,
        personalityStyle: guru.personalityStyle,
        topics: guru.topics,
        modelTier: guru.modelTier,
        priceCents: guru.priceCents,
      },
      userName,
    );
  } catch (err) {
    console.error("Failed to generate onboarding welcome:", err);
    welcomeMessage = `Connected! I'm ${guruName}. I remember everything and I learn from everyone in this private community. To get started, could you tell me a bit about your background and experience in my area of focus?`;
  }

  return {
    success: true,
    message: welcomeMessage,
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

  const connections = await db
    .select()
    .from(telegramConnectionsTable)
    .where(
      and(
        eq(telegramConnectionsTable.telegramUserId, telegramUserId),
        eq(telegramConnectionsTable.guruId, guruId),
        eq(telegramConnectionsTable.status, "active"),
      ),
    );

  if (connections.length === 0) {
    return "Please connect your GuruForge account first. Go to the Guru's profile page on GuruForge and click 'Connect on Telegram' to get your connection code.";
  }

  if (connections.length > 1) {
    console.error(`Integrity error: multiple active connections for telegramUserId=${telegramUserId}, guruId=${guruId}`);
    return "There's a configuration issue with your account. Please contact support.";
  }

  const connection = connections[0];

  const [guru] = await db
    .select()
    .from(gurusTable)
    .where(eq(gurusTable.id, guruId))
    .limit(1);

  if (!guru) {
    return "This Guru is no longer available.";
  }

  const isCreator = guru.creatorId === connection.userId;

  if (!isCreator) {
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
  }

  const onboarding = getOnboardingState(connection);
  if (!onboarding.completed) {
    try {
      let userName: string | null = null;
      try {
        const [user] = await db
          .select({ name: usersTable.name })
          .from(usersTable)
          .where(eq(usersTable.id, connection.userId))
          .limit(1);
        userName = user?.name || null;
      } catch (err) {
        console.error("Failed to fetch user name for onboarding:", err);
      }

      return await handleOnboardingResponse(
        {
          id: guru.id,
          name: guru.name,
          description: guru.description,
          tagline: guru.tagline,
          personalityStyle: guru.personalityStyle,
          topics: guru.topics,
          modelTier: guru.modelTier,
          priceCents: guru.priceCents,
        },
        connection.userId,
        connection.id,
        onboarding.step,
        text,
        userName,
      );
    } catch (err) {
      console.error("Onboarding flow error, will retry on next message:", err);
      return "I had a momentary hiccup — could you send that again? I want to make sure I capture your answer properly.";
    }
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

  const recentContext = recentMessages
    .slice(-6)
    .map((m) => `[${m.role}]: ${m.content.slice(0, 200)}`)
    .join("\n");

  let triage: TriageResult | null = null;
  try {
    triage = await runTriage(
      guruId,
      connection.userId,
      conversation.id,
      guru.modelTier,
      text,
      recentContext,
      guru.topics,
    );
  } catch (err) {
    console.error("Triage failed, continuing without:", err);
  }

  const memoryFlags = parseMemoryPolicy(guru.memoryPolicy);
  let personalMemories = "";
  let collectivePatterns = "";

  const includePersonal = memoryFlags.personalMemory &&
    (!triage || triage.memoryTiers.includes("tier2"));
  const includeCollective = memoryFlags.sharedLearning &&
    (!triage || triage.memoryTiers.includes("tier3"));

  if (includePersonal || includeCollective) {
    try {
      const memCtx = await retrieveMemoryContext(
        connection.userId,
        guruId,
        text,
        includePersonal,
        includeCollective,
      );
      personalMemories = memCtx.personalMemories;
      collectivePatterns = memCtx.collectivePatterns;
    } catch (err) {
      console.error("Memory retrieval failed, continuing without memory context:", err);
    }
  }

  let userName: string | null = null;
  try {
    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, connection.userId))
      .limit(1);
    userName = user?.name || null;
  } catch (err) {
    console.error("Failed to fetch user name:", err);
  }

  const systemPrompt = buildSystemPrompt(guru, personalMemories, collectivePatterns, triage, userName);

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: text },
  ];

  let modelConfig;
  try {
    modelConfig = getModelConfig(guru.modelTier);
  } catch (err) {
    console.error("Model config error:", err instanceof Error ? err.message : err);
    return "This Guru's AI model is not currently available. Please try again later or contact the Guru creator.";
  }

  const maxTokens = getMaxCompletionTokens(guru.priceCents);

  const convStart = Date.now();
  const completion = await modelConfig.client.chat.completions.create({
    model: modelConfig.conversationModel,
    max_completion_tokens: maxTokens,
    messages: chatMessages,
  });
  const convLatency = Date.now() - convStart;

  const assistantContent = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
  const promptTokens = completion.usage?.prompt_tokens ?? 0;
  const completionTokens = completion.usage?.completion_tokens ?? 0;
  const totalTokens = completion.usage?.total_tokens ?? 0;

  await logUsage({
    guruId,
    userId: connection.userId,
    conversationId: conversation.id,
    callType: "conversation",
    model: modelConfig.conversationModel,
    promptTokens,
    completionTokens,
    totalTokens,
    latencyMs: convLatency,
  });

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

  (async () => {
    try {
      await runCalibration({
        guruId,
        userId: connection.userId,
        conversationId: conversation.id,
        modelTier: guru.modelTier,
        userMessage: text,
        assistantResponse: assistantContent,
        personalMemoryEnabled: memoryFlags.personalMemory,
        sharedLearningEnabled: memoryFlags.sharedLearning,
      });
      await maybeRecalculateScores(guruId);
    } catch (err) {
      console.error("Background calibration/score recalculation failed:", err);
    }
  })();

  return assistantContent;
}

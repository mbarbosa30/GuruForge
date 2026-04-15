import { db } from "@workspace/db";
import { telegramConnectionsTable, userMemoriesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { getModelConfig } from "./modelConfig";
import { logUsage } from "./usageLogger";

const TOTAL_ONBOARDING_STEPS = 3;

interface GuruInfo {
  id: number;
  name: string;
  description: string | null;
  tagline: string | null;
  personalityStyle: string | null;
  topics: string[] | null;
  modelTier: string | null;
  priceCents: number;
}

interface OnboardingState {
  step: number;
  completed: boolean;
}

export function getOnboardingState(connection: {
  onboardingCompleted: boolean;
  onboardingStep: number;
}): OnboardingState {
  return {
    step: connection.onboardingStep,
    completed: connection.onboardingCompleted,
  };
}

export async function generateWelcomeWithFirstQuestion(
  guru: GuruInfo,
  userName: string | null,
): Promise<string> {
  const { fastModel, client } = getModelConfig(guru.modelTier);

  const personality = guru.personalityStyle ?? "professional";
  const topicsStr = guru.topics?.length ? guru.topics.join(", ") : "general guidance";

  const prompt = `You are ${guru.name}, a specialized AI Guru focused on: ${topicsStr}.
${guru.tagline ? `Your tagline: ${guru.tagline}` : ""}
${guru.description ? `About you: ${guru.description}` : ""}

Personality style: ${personality}

A new user${userName ? ` named ${userName}` : ""} has just connected with you on Telegram. Write a warm welcome message that:
1. Introduces yourself briefly and your area of expertise
2. Explains that you learn from every conversation to provide better guidance
3. Ends with your FIRST onboarding question — ask about their background or experience level in your domain

Keep it concise (3-5 sentences max). The question should feel natural, not like a form. Match your personality style.

Respond ONLY with the welcome message text. No formatting instructions or meta-commentary.`;

  const start = Date.now();
  const completion = await client.chat.completions.create({
    model: fastModel,
    max_completion_tokens: 512,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  const latency = Date.now() - start;

  await logUsage({
    guruId: guru.id,
    callType: "onboarding",
    model: fastModel,
    promptTokens: completion.usage?.prompt_tokens ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
    totalTokens: completion.usage?.total_tokens ?? 0,
    latencyMs: latency,
  });

  return completion.choices[0]?.message?.content?.trim() ??
    `Welcome! I'm ${guru.name}. I'm here to help you with ${topicsStr}. To get started, could you tell me a bit about your background in this area?`;
}

export async function handleOnboardingResponse(
  guru: GuruInfo,
  userId: number,
  connectionId: number,
  currentStep: number,
  userAnswer: string,
  userName: string | null,
): Promise<string> {
  const { fastModel, client } = getModelConfig(guru.modelTier);
  const personality = guru.personalityStyle ?? "professional";
  const topicsStr = guru.topics?.length ? guru.topics.join(", ") : "general guidance";

  await extractMemoryFromAnswer(guru.id, userId, currentStep, userAnswer, fastModel, client);

  const nextStep = currentStep + 1;

  if (nextStep >= TOTAL_ONBOARDING_STEPS) {
    await db
      .update(telegramConnectionsTable)
      .set({ onboardingCompleted: true, onboardingStep: nextStep })
      .where(eq(telegramConnectionsTable.id, connectionId));

    return await generateOnboardingSummary(guru, userId, userName, fastModel, client);
  }

  await db
    .update(telegramConnectionsTable)
    .set({ onboardingStep: nextStep })
    .where(eq(telegramConnectionsTable.id, connectionId));

  return await generateNextQuestion(guru, nextStep, userAnswer, userName, fastModel, client);
}

async function generateNextQuestion(
  guru: GuruInfo,
  step: number,
  previousAnswer: string,
  userName: string | null,
  model: string,
  client: any,
): Promise<string> {
  const personality = guru.personalityStyle ?? "professional";
  const topicsStr = guru.topics?.length ? guru.topics.join(", ") : "general guidance";

  const questionFocus = step === 1
    ? "Ask about their specific goals or what they hope to achieve in your domain. What are they working on or trying to accomplish?"
    : "Ask about their biggest challenge or pain point right now in your domain. What's holding them back or what do they struggle with most?";

  const prompt = `You are ${guru.name}, a specialized AI Guru focused on: ${topicsStr}.
Personality style: ${personality}

You're onboarding a new user${userName ? ` named ${userName}` : ""}. They just answered your previous question with:
"${previousAnswer}"

Briefly acknowledge their answer (1 sentence), then ask your next question.
${questionFocus}

Keep it concise and conversational. Match your personality style. Respond ONLY with the message text.`;

  const start = Date.now();
  const completion = await client.chat.completions.create({
    model,
    max_completion_tokens: 512,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  const latency = Date.now() - start;

  await logUsage({
    guruId: guru.id,
    callType: "onboarding",
    model,
    promptTokens: completion.usage?.prompt_tokens ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
    totalTokens: completion.usage?.total_tokens ?? 0,
    latencyMs: latency,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "Thank you! What are your main goals in this area?";
}

async function generateOnboardingSummary(
  guru: GuruInfo,
  userId: number,
  userName: string | null,
  model: string,
  client: any,
): Promise<string> {
  const memories = await db
    .select({ category: userMemoriesTable.category, summary: userMemoriesTable.summary })
    .from(userMemoriesTable)
    .where(
      and(eq(userMemoriesTable.userId, userId), eq(userMemoriesTable.guruId, guru.id)),
    )
    .limit(10);

  const memoryLines = memories.map((m) => `- [${m.category}] ${m.summary}`).join("\n");

  const personality = guru.personalityStyle ?? "professional";
  const topicsStr = guru.topics?.length ? guru.topics.join(", ") : "general guidance";

  const prompt = `You are ${guru.name}, a specialized AI Guru focused on: ${topicsStr}.
Personality style: ${personality}

You've just finished onboarding a new user${userName ? ` named ${userName}` : ""}. Here's what you learned about them:
${memoryLines || "No specific details captured yet."}

Write a brief summary message (3-4 sentences) that:
1. Summarizes what you've learned about them
2. Explains how you'll use this to personalize your guidance
3. Invites them to start their first real conversation — suggest a topic or question they could ask based on what you've learned

Match your personality style. Be encouraging. Respond ONLY with the message text.`;

  const start = Date.now();
  const completion = await client.chat.completions.create({
    model,
    max_completion_tokens: 512,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  const latency = Date.now() - start;

  await logUsage({
    guruId: guru.id,
    callType: "onboarding",
    model,
    promptTokens: completion.usage?.prompt_tokens ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
    totalTokens: completion.usage?.total_tokens ?? 0,
    latencyMs: latency,
  });

  return completion.choices[0]?.message?.content?.trim() ??
    "Great, I've got a good sense of where you are. I'll remember everything we discuss to give you better guidance over time. Feel free to ask me anything!";
}

async function extractMemoryFromAnswer(
  guruId: number,
  userId: number,
  step: number,
  answer: string,
  model: string,
  client: any,
): Promise<void> {
  try {
    const categoryMapping: Record<number, string> = {
      0: "context",
      1: "goals",
      2: "context",
    };
    const defaultCategory = categoryMapping[step] ?? "context";

    const prompt = `Extract key facts from this onboarding answer. The user is answering question ${step + 1} of 3 during their initial intake with an AI Guru.

User's answer: "${answer}"

Return a JSON array of memory objects. Each must have:
- "category": one of "goals", "preferences", "history", "decisions", "context"
- "summary": a concise one-sentence summary
- "importance": 0.0 to 1.0 (onboarding answers are generally high importance, 0.7-0.9)
- "displayTitle": a short 3-8 word title
- "topic": a short topic tag

If the answer is too vague or brief, return at least one memory with what you can extract. Default category should be "${defaultCategory}" for this question.

Respond ONLY with a valid JSON array.`;

    const start = Date.now();
    const completion = await client.chat.completions.create({
      model,
      max_completion_tokens: 512,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    const latency = Date.now() - start;

    await logUsage({
      guruId,
      userId,
      callType: "onboarding_memory",
      model,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
      latencyMs: latency,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "[]";
    let memories: Array<{
      category: string;
      summary: string;
      importance: number;
      displayTitle?: string;
      topic?: string;
    }>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      memories = JSON.parse(cleaned);
    } catch {
      memories = [{
        category: defaultCategory,
        summary: answer.slice(0, 200),
        importance: 0.7,
      }];
    }

    if (!Array.isArray(memories) || memories.length === 0) {
      memories = [{
        category: defaultCategory,
        summary: answer.slice(0, 200),
        importance: 0.7,
      }];
    }

    const validCategories = ["goals", "preferences", "history", "decisions", "context"];

    for (const mem of memories.slice(0, 5)) {
      if (!mem.summary) continue;
      if (!validCategories.includes(mem.category)) mem.category = defaultCategory;
      const importance = typeof mem.importance === "number" ? Math.min(1, Math.max(0, mem.importance)) : 0.7;

      await db.insert(userMemoriesTable).values({
        userId,
        guruId,
        category: mem.category,
        summary: mem.summary,
        displayTitle: mem.displayTitle || null,
        topic: mem.topic || null,
        importance,
      });
    }
  } catch (err) {
    console.error("Onboarding memory extraction error:", err);
  }
}

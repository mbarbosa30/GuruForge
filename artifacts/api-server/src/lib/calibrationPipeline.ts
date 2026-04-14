import { db } from "@workspace/db";
import {
  contributionScoresTable,
  telegramConnectionsTable,
  collectivePatternsTable,
  userMemoriesTable,
} from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getModelConfig } from "./modelConfig";
import { logUsage } from "./usageLogger";
import { redactPIIWithLLM, logRedaction } from "./piiRedactor";

interface CalibrationInput {
  guruId: number;
  userId: number;
  conversationId: number;
  modelTier: string | null;
  userMessage: string;
  assistantResponse: string;
  personalMemoryEnabled: boolean;
  sharedLearningEnabled: boolean;
}

export async function runCalibration(input: CalibrationInput): Promise<void> {
  try {
    const { fastModel, client } = getModelConfig(input.modelTier);

    const prompt = `Analyze this conversation turn and extract learning. Return a JSON object with:
- "personalMemories": array of objects with "category" (goals/preferences/history/decisions/context), "summary" (concise one-sentence), "importance" (0.0-1.0). Only include genuinely useful memories.
- "collectiveInsights": array of objects with "patternType" (common_questions/successful_strategies/pitfalls/trends), "summary" (anonymized pattern description), "confidence" (0.0-1.0). Only if the exchange reveals patterns useful for other users.
- "contributionQuality": number 0.0-1.0 rating how much this turn contributes to the guru's collective wisdom (0=trivial greeting, 1=highly novel insight)

User message: ${input.userMessage}
Assistant response: ${input.assistantResponse}

Respond ONLY with valid JSON, no other text.`;

    const completion = await client.chat.completions.create({
      model: fastModel,
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    await logUsage({
      guruId: input.guruId,
      userId: input.userId,
      conversationId: input.conversationId,
      callType: "calibration",
      model: fastModel,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "{}";
    let parsed: {
      personalMemories?: Array<{ category: string; summary: string; importance: number }>;
      collectiveInsights?: Array<{ patternType: string; summary: string; confidence: number }>;
      contributionQuality?: number;
    };
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      parsed = JSON.parse(cleaned);
    } catch {
      return;
    }

    if (input.personalMemoryEnabled && Array.isArray(parsed.personalMemories)) {
      await upsertPersonalMemories(input.userId, input.guruId, parsed.personalMemories);
    }

    const [conn] = await db
      .select({ contributesToWisdom: telegramConnectionsTable.contributesToWisdom })
      .from(telegramConnectionsTable)
      .where(
        and(
          eq(telegramConnectionsTable.userId, input.userId),
          eq(telegramConnectionsTable.guruId, input.guruId),
          eq(telegramConnectionsTable.status, "active"),
        ),
      )
      .limit(1);

    const userContributes = conn?.contributesToWisdom === true;

    if (input.sharedLearningEnabled && userContributes && Array.isArray(parsed.collectiveInsights)) {
      await upsertCollectiveInsights(input.guruId, parsed.collectiveInsights);
    }

    const quality = typeof parsed.contributionQuality === "number"
      ? Math.min(1, Math.max(0, parsed.contributionQuality))
      : 0;
    if (userContributes) {
      await updateContributionScore(input.userId, input.guruId, quality);
    }
  } catch (err) {
    console.error("Calibration pipeline error:", err);
  }
}

async function upsertPersonalMemories(
  userId: number,
  guruId: number,
  memories: Array<{ category: string; summary: string; importance: number }>,
): Promise<void> {
  const validCategories = ["goals", "preferences", "history", "decisions", "context"];

  for (const mem of memories.slice(0, 5)) {
    if (!mem.summary || !mem.category) continue;
    if (!validCategories.includes(mem.category)) mem.category = "context";
    const importance = typeof mem.importance === "number" ? Math.min(1, Math.max(0, mem.importance)) : 0.5;

    const existing = await db
      .select()
      .from(userMemoriesTable)
      .where(
        and(
          eq(userMemoriesTable.userId, userId),
          eq(userMemoriesTable.guruId, guruId),
          eq(userMemoriesTable.category, mem.category),
        ),
      )
      .orderBy(desc(userMemoriesTable.updatedAt))
      .limit(10);

    const duplicate = existing.find((e) => {
      const eSummary = e.summary.toLowerCase();
      const mSummary = mem.summary.toLowerCase();
      const words = mSummary.split(/\s+/).filter((w) => w.length > 3);
      const overlap = words.filter((w) => eSummary.includes(w)).length;
      return words.length > 0 && overlap / words.length > 0.6;
    });

    if (duplicate) {
      await db
        .update(userMemoriesTable)
        .set({
          summary: mem.summary,
          importance: Math.max(duplicate.importance, importance),
          updatedAt: new Date(),
        })
        .where(eq(userMemoriesTable.id, duplicate.id));
    } else {
      await db.insert(userMemoriesTable).values({
        userId,
        guruId,
        category: mem.category,
        summary: mem.summary,
        importance,
      });
    }
  }
}

async function upsertCollectiveInsights(
  guruId: number,
  insights: Array<{ patternType: string; summary: string; confidence: number }>,
): Promise<void> {
  const validTypes = ["common_questions", "successful_strategies", "pitfalls", "trends"];

  for (const p of insights.slice(0, 5)) {
    if (!p.summary || !p.patternType) continue;
    if (!validTypes.includes(p.patternType)) p.patternType = "trends";

    const redactionResult = await redactPIIWithLLM(p.summary);
    logRedaction(`calibration_collective:guru_${guruId}`, redactionResult);

    if (redactionResult.usage) {
      await logUsage({
        guruId,
        callType: "pii_redaction",
        model: redactionResult.usage.model,
        promptTokens: redactionResult.usage.promptTokens,
        completionTokens: redactionResult.usage.completionTokens,
        totalTokens: redactionResult.usage.totalTokens,
      });
    }

    const confidence = typeof p.confidence === "number" ? Math.min(1, Math.max(0, p.confidence)) : 0.5;

    const existing = await db
      .select()
      .from(collectivePatternsTable)
      .where(
        and(
          eq(collectivePatternsTable.guruId, guruId),
          eq(collectivePatternsTable.patternType, p.patternType),
        ),
      )
      .orderBy(desc(collectivePatternsTable.updatedAt))
      .limit(10);

    const duplicate = existing.find((e) => {
      const eSummary = e.summary.toLowerCase();
      const pSummary = redactionResult.redacted.toLowerCase();
      const words = pSummary.split(/\s+/).filter((w) => w.length > 3);
      const overlap = words.filter((w) => eSummary.includes(w)).length;
      return words.length > 0 && overlap / words.length > 0.6;
    });

    if (duplicate) {
      await db
        .update(collectivePatternsTable)
        .set({
          summary: redactionResult.redacted,
          confidence: Math.max(duplicate.confidence, confidence),
          frequency: duplicate.frequency + 1,
          updatedAt: new Date(),
        })
        .where(eq(collectivePatternsTable.id, duplicate.id));
    } else {
      await db.insert(collectivePatternsTable).values({
        guruId,
        patternType: p.patternType,
        summary: redactionResult.redacted,
        confidence,
        sourceCount: 1,
      });
    }
  }
}

async function updateContributionScore(
  userId: number,
  guruId: number,
  quality: number,
): Promise<void> {
  try {
    const [existing] = await db
      .select()
      .from(contributionScoresTable)
      .where(
        and(
          eq(contributionScoresTable.userId, userId),
          eq(contributionScoresTable.guruId, guruId),
        ),
      )
      .limit(1);

    if (existing) {
      const newCount = existing.turnCount + 1;
      const decay = 0.95;
      const newScore = existing.score * decay + quality * (1 - decay) * 100;
      await db
        .update(contributionScoresTable)
        .set({
          score: Math.min(100, newScore),
          turnCount: newCount,
          patternsContributed: quality > 0.3 ? existing.patternsContributed + 1 : existing.patternsContributed,
          lastUpdatedAt: new Date(),
        })
        .where(eq(contributionScoresTable.id, existing.id));
    } else {
      await db.insert(contributionScoresTable).values({
        userId,
        guruId,
        score: quality * 10,
        turnCount: 1,
        patternsContributed: quality > 0.3 ? 1 : 0,
      });
    }
  } catch (err) {
    console.error("Contribution score update error:", err);
  }
}

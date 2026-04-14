import { db } from "@workspace/db";
import {
  userMemoriesTable,
  collectivePatternsTable,
  telegramConnectionsTable,
  messagesTable,
  conversationsTable,
} from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { redactPIIWithLLM, logRedaction } from "./piiRedactor";

interface MemoryContext {
  personalMemories: string;
  collectivePatterns: string;
}

export async function retrieveMemoryContext(
  userId: number,
  guruId: number,
  currentMessage: string,
  includePersonal: boolean = true,
  includeCollective: boolean = true,
): Promise<MemoryContext> {
  const keywords = currentMessage
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  let personalMemories = "";
  if (includePersonal) {
    const allMemories = await db
      .select()
      .from(userMemoriesTable)
      .where(and(eq(userMemoriesTable.userId, userId), eq(userMemoriesTable.guruId, guruId)))
      .orderBy(desc(userMemoriesTable.importance), desc(userMemoriesTable.updatedAt))
      .limit(30);

    const scored = allMemories.map((m) => {
      const summaryLower = m.summary.toLowerCase();
      let keywordScore = 0;
      for (const kw of keywords) {
        if (summaryLower.includes(kw)) keywordScore += 1;
      }
      const recencyMs = Date.now() - m.updatedAt.getTime();
      const recencyDays = recencyMs / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - recencyDays / 90);
      const totalScore = keywordScore * 2 + m.importance + recencyScore;
      return { ...m, totalScore };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    const topMemories = scored.slice(0, 8);

    if (topMemories.length > 0) {
      const memoryIds = topMemories.map((m) => m.id);
      await db
        .update(userMemoriesTable)
        .set({ lastAccessedAt: new Date() })
        .where(sql`${userMemoriesTable.id} IN (${sql.join(memoryIds.map(id => sql`${id}`), sql`, `)})`);

      const lines = topMemories.map(
        (m) => `- [${m.category}] ${m.summary}`,
      );
      personalMemories = lines.join("\n");
    }
  }

  let collectivePatternsText = "";
  if (includeCollective) {
    const patterns = await db
      .select()
      .from(collectivePatternsTable)
      .where(eq(collectivePatternsTable.guruId, guruId))
      .orderBy(desc(collectivePatternsTable.confidence), desc(collectivePatternsTable.frequency))
      .limit(10);

    let relevantPatterns = patterns;
    if (keywords.length > 0 && patterns.length > 5) {
      const patternScored = patterns.map((p) => {
        const summaryLower = p.summary.toLowerCase();
        let score = 0;
        for (const kw of keywords) {
          if (summaryLower.includes(kw)) score += 1;
        }
        return { ...p, score };
      });
      patternScored.sort((a, b) => b.score - a.score);
      relevantPatterns = patternScored.slice(0, 5);
    }

    if (relevantPatterns.length > 0) {
      const lines = relevantPatterns.map(
        (p) => `- [${p.patternType}] ${p.summary} (confidence: ${(p.confidence * 100).toFixed(0)}%, sources: ${p.sourceCount})`,
      );
      collectivePatternsText = lines.join("\n");
    }
  }

  return { personalMemories, collectivePatterns: collectivePatternsText };
}

export async function extractPersonalMemories(
  userId: number,
  guruId: number,
  userMessage: string,
  assistantResponse: string,
): Promise<void> {
  try {
    const prompt = `Analyze this conversation exchange and extract any personal facts, goals, preferences, decisions, or context worth remembering about the user. Return a JSON array of memory objects. Each object must have:
- "category": one of "goals", "preferences", "history", "decisions", "context"
- "summary": a concise one-sentence summary of the memory
- "importance": a number from 0.0 to 1.0 indicating how important this is to remember

Only include genuinely useful memories. If there's nothing worth remembering, return an empty array [].

User message: ${userMessage}
Assistant response: ${assistantResponse}

Respond ONLY with a valid JSON array, no other text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "[]";
    let memories: Array<{ category: string; summary: string; importance: number }>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      memories = JSON.parse(cleaned);
    } catch {
      return;
    }

    if (!Array.isArray(memories) || memories.length === 0) return;

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
  } catch (err) {
    console.error("Memory extraction error:", err);
  }
}

const PATTERN_EXTRACTION_INTERVAL = 10;

export async function maybeExtractCollectivePatterns(guruId: number): Promise<void> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messagesTable)
      .innerJoin(conversationsTable, eq(messagesTable.conversationId, conversationsTable.id))
      .where(and(eq(conversationsTable.guruId, guruId), eq(messagesTable.role, "user")));

    const totalUserMessages = result?.count ?? 0;
    if (totalUserMessages % PATTERN_EXTRACTION_INTERVAL !== 0) return;

    await extractCollectivePatterns(guruId);
  } catch (err) {
    console.error(`Collective pattern extraction error for guru ${guruId}:`, err);
  }
}

async function extractCollectivePatterns(guruId: number): Promise<void> {
  const eligibleConnections = await db
    .select({ userId: telegramConnectionsTable.userId })
    .from(telegramConnectionsTable)
    .where(
      and(
        eq(telegramConnectionsTable.guruId, guruId),
        eq(telegramConnectionsTable.status, "active"),
        eq(telegramConnectionsTable.contributesToWisdom, true),
      ),
    );

  if (eligibleConnections.length === 0) return;

  const eligibleUserIds = eligibleConnections.map((c) => c.userId);

  const recentConversations = await db
    .select({ id: conversationsTable.id, userId: conversationsTable.userId })
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.guruId, guruId),
        sql`${conversationsTable.userId} IN (${sql.join(eligibleUserIds.map(id => sql`${id}`), sql`, `)})`,
      ),
    )
    .orderBy(desc(conversationsTable.updatedAt))
    .limit(20);

  if (recentConversations.length === 0) return;

  const conversationIds = recentConversations.map((c) => c.id);
  const recentMessages = await db
    .select({ role: messagesTable.role, content: messagesTable.content })
    .from(messagesTable)
    .where(sql`${messagesTable.conversationId} IN (${sql.join(conversationIds.map(id => sql`${id}`), sql`, `)})`)
    .orderBy(desc(messagesTable.createdAt))
    .limit(100);

  const redactedExchanges: string[] = [];
  for (const m of recentMessages) {
    const result = await redactPIIWithLLM(m.content);
    logRedaction(`collective_extraction:guru_${guruId}`, result);
    redactedExchanges.push(`[${m.role}]: ${result.redacted}`);
  }

  const uniqueUserCount = new Set(recentConversations.map((c) => c.userId)).size;

  const prompt = `Analyze these anonymized conversation excerpts from ${uniqueUserCount} different users interacting with an AI Guru. Extract recurring patterns. Return a JSON array of pattern objects. Each object must have:
- "patternType": one of "common_questions", "successful_strategies", "pitfalls", "trends"
- "summary": a concise anonymized description of the pattern
- "confidence": 0.0 to 1.0 indicating how confident you are this is a real pattern

Only include patterns that appear across multiple conversations. If there are no clear patterns, return an empty array [].

Conversation excerpts:
${redactedExchanges.slice(0, 50).join("\n")}

Respond ONLY with a valid JSON array, no other text.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "[]";
  let patterns: Array<{ patternType: string; summary: string; confidence: number }>;
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    patterns = JSON.parse(cleaned);
  } catch {
    return;
  }

  if (!Array.isArray(patterns) || patterns.length === 0) return;

  const validTypes = ["common_questions", "successful_strategies", "pitfalls", "trends"];

  for (const p of patterns.slice(0, 8)) {
    if (!p.summary || !p.patternType) continue;
    if (!validTypes.includes(p.patternType)) p.patternType = "trends";
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
      const pSummary = p.summary.toLowerCase();
      const words = pSummary.split(/\s+/).filter((w) => w.length > 3);
      const overlap = words.filter((w) => eSummary.includes(w)).length;
      return words.length > 0 && overlap / words.length > 0.6;
    });

    if (duplicate) {
      await db
        .update(collectivePatternsTable)
        .set({
          summary: p.summary,
          confidence: Math.max(duplicate.confidence, confidence),
          frequency: duplicate.frequency + 1,
          sourceCount: uniqueUserCount,
          updatedAt: new Date(),
        })
        .where(eq(collectivePatternsTable.id, duplicate.id));
    } else {
      await db.insert(collectivePatternsTable).values({
        guruId,
        patternType: p.patternType,
        summary: p.summary,
        confidence,
        sourceCount: uniqueUserCount,
      });
    }
  }
}

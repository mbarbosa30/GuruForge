import { db } from "@workspace/db";
import {
  conversationAnnotationsTable,
  messagesTable,
  conversationsTable,
  gurusTable,
  guruRatingsTable,
  collectivePatternsTable,
  dataCorrelationsTable,
  trainingExportsTable,
  telegramConnectionsTable,
} from "@workspace/db/schema";
import { eq, and, gte, lte, sql, desc, count, avg, inArray } from "drizzle-orm";
import { redactPIIWithLLM } from "./piiRedactor";
import { logger } from "./logger";
import type { ExportFilters } from "@workspace/db/schema/training-exports";

export type ExportFormat = "instruction_pairs" | "preference_pairs" | "knowledge_distillation";

interface InstructionPair {
  system: string;
  user: string;
  assistant: string;
  quality: number;
  domain_relevance: number;
  topics: string[];
}

interface PreferencePair {
  system: string;
  user: string;
  chosen: string;
  rejected: string;
  chosen_quality: number;
  rejected_quality: number;
}

interface KnowledgeDistillation {
  pattern_type: string;
  content: string;
  confidence: number;
  frequency: number;
  source_count: number;
  guru_id: number;
  guru_name: string;
  guru_domain: string[];
  publish_title: string | null;
}

export async function createExport(
  format: ExportFormat,
  filters: ExportFilters,
  exportedBy?: number,
): Promise<{ exportId: number }> {
  const [exportRecord] = await db.insert(trainingExportsTable).values({
    format,
    status: "processing",
    filters,
    exportedBy: exportedBy ?? null,
    startedAt: new Date(),
  }).returning({ id: trainingExportsTable.id });

  const exportId = exportRecord.id;

  (async () => {
    try {
      let data: unknown[];
      switch (format) {
        case "instruction_pairs":
          data = await buildInstructionPairs(filters);
          break;
        case "preference_pairs":
          data = await buildPreferencePairs(filters);
          break;
        case "knowledge_distillation":
          data = await buildKnowledgeDistillation(filters);
          break;
        default:
          throw new Error(`Unknown format: ${format}`);
      }

      const jsonl = data.map((row) => JSON.stringify(row)).join("\n");
      const fileSize = Buffer.byteLength(jsonl, "utf-8");

      await db
        .update(trainingExportsTable)
        .set({
          status: "completed",
          rowCount: data.length,
          fileSize,
          exportContent: jsonl,
          completedAt: new Date(),
        })
        .where(eq(trainingExportsTable.id, exportId));

      logger.info({ exportId, format, rowCount: data.length, fileSize }, "Training export completed");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await db
        .update(trainingExportsTable)
        .set({
          status: "failed",
          errorMessage,
          completedAt: new Date(),
        })
        .where(eq(trainingExportsTable.id, exportId));
      logger.error({ err, exportId }, "Training export failed");
    }
  })();

  return { exportId };
}

async function getOptedInAnnotations(filters: ExportFilters) {
  const conditions = [
    eq(telegramConnectionsTable.contributesToWisdom, true),
    eq(telegramConnectionsTable.status, "active"),
  ];
  if (filters.guruId) {
    conditions.push(eq(conversationAnnotationsTable.guruId, filters.guruId));
  }
  if (filters.minQuality !== undefined) {
    conditions.push(gte(conversationAnnotationsTable.qualityScore, filters.minQuality));
  }
  if (filters.dateFrom) {
    conditions.push(gte(conversationAnnotationsTable.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(conversationAnnotationsTable.createdAt, new Date(filters.dateTo)));
  }

  return db
    .select({
      messageId: conversationAnnotationsTable.messageId,
      conversationId: conversationAnnotationsTable.conversationId,
      guruId: conversationAnnotationsTable.guruId,
      qualityScore: conversationAnnotationsTable.qualityScore,
      domainRelevance: conversationAnnotationsTable.domainRelevance,
      topicTags: conversationAnnotationsTable.topicTags,
    })
    .from(conversationAnnotationsTable)
    .innerJoin(
      conversationsTable,
      eq(conversationAnnotationsTable.conversationId, conversationsTable.id),
    )
    .innerJoin(
      telegramConnectionsTable,
      and(
        eq(telegramConnectionsTable.userId, conversationsTable.userId),
        eq(telegramConnectionsTable.guruId, conversationsTable.guruId),
      ),
    )
    .where(and(...conditions))
    .orderBy(desc(conversationAnnotationsTable.qualityScore))
    .limit(10000);
}

async function buildInstructionPairs(filters: ExportFilters): Promise<InstructionPair[]> {
  const annotations = await getOptedInAnnotations(filters);
  const pairs: InstructionPair[] = [];

  for (const ann of annotations) {
    const [assistantMsg] = await db
      .select({ content: messagesTable.content })
      .from(messagesTable)
      .where(eq(messagesTable.id, ann.messageId))
      .limit(1);

    if (!assistantMsg) continue;

    const [userMsg] = await db
      .select({ content: messagesTable.content })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.conversationId, ann.conversationId),
          eq(messagesTable.role, "user"),
          sql`${messagesTable.id} < ${ann.messageId}`,
        ),
      )
      .orderBy(desc(messagesTable.id))
      .limit(1);

    if (!userMsg) continue;

    const [guru] = await db
      .select({ systemPrompt: gurusTable.systemPrompt })
      .from(gurusTable)
      .where(eq(gurusTable.id, ann.guruId))
      .limit(1);

    const redactedUser = await redactPIIWithLLM(userMsg.content);
    const redactedAssistant = await redactPIIWithLLM(assistantMsg.content);

    pairs.push({
      system: guru?.systemPrompt ?? "",
      user: redactedUser.redacted,
      assistant: redactedAssistant.redacted,
      quality: ann.qualityScore,
      domain_relevance: ann.domainRelevance,
      topics: ann.topicTags ?? [],
    });
  }

  return pairs;
}

async function buildPreferencePairs(filters: ExportFilters): Promise<PreferencePair[]> {
  const guruRatings = await db
    .select({
      guruId: guruRatingsTable.guruId,
      avgRating: avg(guruRatingsTable.rating),
    })
    .from(guruRatingsTable)
    .groupBy(guruRatingsTable.guruId);

  const ratingMap = new Map<number, number>();
  for (const g of guruRatings) {
    ratingMap.set(g.guruId, Number(g.avgRating ?? 0));
  }

  const highRatedGuruIds = guruRatings
    .filter((g) => Number(g.avgRating ?? 0) >= 4.0)
    .map((g) => g.guruId);
  const lowRatedGuruIds = guruRatings
    .filter((g) => Number(g.avgRating ?? 0) <= 3.0)
    .map((g) => g.guruId);

  if (highRatedGuruIds.length === 0 || lowRatedGuruIds.length === 0) {
    return [];
  }

  const baseConditions = [
    eq(telegramConnectionsTable.contributesToWisdom, true),
    eq(telegramConnectionsTable.status, "active"),
  ];
  if (filters.guruId) {
    baseConditions.push(eq(conversationAnnotationsTable.guruId, filters.guruId));
  }
  if (filters.minQuality !== undefined) {
    baseConditions.push(gte(conversationAnnotationsTable.qualityScore, filters.minQuality));
  }
  if (filters.dateFrom) {
    baseConditions.push(gte(conversationAnnotationsTable.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    baseConditions.push(lte(conversationAnnotationsTable.createdAt, new Date(filters.dateTo)));
  }

  const highAnnotations = await db
    .select({
      messageId: conversationAnnotationsTable.messageId,
      conversationId: conversationAnnotationsTable.conversationId,
      guruId: conversationAnnotationsTable.guruId,
      qualityScore: conversationAnnotationsTable.qualityScore,
      topicTags: conversationAnnotationsTable.topicTags,
    })
    .from(conversationAnnotationsTable)
    .innerJoin(conversationsTable, eq(conversationAnnotationsTable.conversationId, conversationsTable.id))
    .innerJoin(
      telegramConnectionsTable,
      and(
        eq(telegramConnectionsTable.userId, conversationsTable.userId),
        eq(telegramConnectionsTable.guruId, conversationsTable.guruId),
      ),
    )
    .where(and(...baseConditions, inArray(conversationAnnotationsTable.guruId, highRatedGuruIds)))
    .orderBy(desc(conversationAnnotationsTable.qualityScore))
    .limit(5000);

  const lowAnnotations = await db
    .select({
      messageId: conversationAnnotationsTable.messageId,
      conversationId: conversationAnnotationsTable.conversationId,
      guruId: conversationAnnotationsTable.guruId,
      qualityScore: conversationAnnotationsTable.qualityScore,
      topicTags: conversationAnnotationsTable.topicTags,
    })
    .from(conversationAnnotationsTable)
    .innerJoin(conversationsTable, eq(conversationAnnotationsTable.conversationId, conversationsTable.id))
    .innerJoin(
      telegramConnectionsTable,
      and(
        eq(telegramConnectionsTable.userId, conversationsTable.userId),
        eq(telegramConnectionsTable.guruId, conversationsTable.guruId),
      ),
    )
    .where(and(...baseConditions, inArray(conversationAnnotationsTable.guruId, lowRatedGuruIds)))
    .orderBy(conversationAnnotationsTable.qualityScore)
    .limit(5000);

  const pairs: PreferencePair[] = [];
  const pairCount = Math.min(highAnnotations.length, lowAnnotations.length);

  for (let i = 0; i < pairCount; i++) {
    const high = highAnnotations[i];
    const low = lowAnnotations[i];

    const [chosenMsg] = await db
      .select({ content: messagesTable.content })
      .from(messagesTable)
      .where(eq(messagesTable.id, high.messageId))
      .limit(1);

    const [rejectedMsg] = await db
      .select({ content: messagesTable.content })
      .from(messagesTable)
      .where(eq(messagesTable.id, low.messageId))
      .limit(1);

    if (!chosenMsg || !rejectedMsg) continue;

    const [userMsg] = await db
      .select({ content: messagesTable.content })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.conversationId, high.conversationId),
          eq(messagesTable.role, "user"),
          sql`${messagesTable.id} < ${high.messageId}`,
        ),
      )
      .orderBy(desc(messagesTable.id))
      .limit(1);

    if (!userMsg) continue;

    const [guru] = await db
      .select({ systemPrompt: gurusTable.systemPrompt })
      .from(gurusTable)
      .where(eq(gurusTable.id, high.guruId))
      .limit(1);

    const redactedUser = await redactPIIWithLLM(userMsg.content);
    const redactedChosen = await redactPIIWithLLM(chosenMsg.content);
    const redactedRejected = await redactPIIWithLLM(rejectedMsg.content);

    pairs.push({
      system: guru?.systemPrompt ?? "",
      user: redactedUser.redacted,
      chosen: redactedChosen.redacted,
      rejected: redactedRejected.redacted,
      chosen_quality: high.qualityScore,
      rejected_quality: low.qualityScore,
    });
  }

  return pairs;
}

async function buildKnowledgeDistillation(filters: ExportFilters): Promise<KnowledgeDistillation[]> {
  const optedInPatternIds = await db
    .selectDistinct({ patternId: dataCorrelationsTable.targetId })
    .from(dataCorrelationsTable)
    .innerJoin(
      conversationAnnotationsTable,
      and(
        eq(dataCorrelationsTable.sourceType, "message"),
        eq(dataCorrelationsTable.targetType, "pattern"),
        eq(dataCorrelationsTable.sourceId, conversationAnnotationsTable.messageId),
      ),
    )
    .innerJoin(
      conversationsTable,
      eq(conversationAnnotationsTable.conversationId, conversationsTable.id),
    )
    .innerJoin(
      telegramConnectionsTable,
      and(
        eq(telegramConnectionsTable.userId, conversationsTable.userId),
        eq(telegramConnectionsTable.guruId, conversationsTable.guruId),
        eq(telegramConnectionsTable.contributesToWisdom, true),
        eq(telegramConnectionsTable.status, "active"),
      ),
    );

  const eligibleIds = optedInPatternIds.map((r) => r.patternId);
  if (eligibleIds.length === 0) return [];

  const conditions = [inArray(collectivePatternsTable.id, eligibleIds)];
  if (filters.guruId) {
    conditions.push(eq(collectivePatternsTable.guruId, filters.guruId));
  }
  if (filters.minQuality !== undefined) {
    conditions.push(gte(collectivePatternsTable.confidence, filters.minQuality));
  }
  if (filters.dateFrom) {
    conditions.push(gte(collectivePatternsTable.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(collectivePatternsTable.createdAt, new Date(filters.dateTo)));
  }

  const patterns = await db
    .select({
      patternType: collectivePatternsTable.patternType,
      summary: collectivePatternsTable.summary,
      redactedSummary: collectivePatternsTable.redactedSummary,
      publishTitle: collectivePatternsTable.publishTitle,
      confidence: collectivePatternsTable.confidence,
      frequency: collectivePatternsTable.frequency,
      sourceCount: collectivePatternsTable.sourceCount,
      guruId: collectivePatternsTable.guruId,
      guruName: gurusTable.name,
      guruTopics: gurusTable.topics,
    })
    .from(collectivePatternsTable)
    .innerJoin(gurusTable, eq(collectivePatternsTable.guruId, gurusTable.id))
    .where(and(...conditions))
    .orderBy(desc(collectivePatternsTable.confidence));

  const results: KnowledgeDistillation[] = [];
  for (const p of patterns) {
    let content = p.redactedSummary;
    if (!content) {
      const redacted = await redactPIIWithLLM(p.summary);
      content = redacted.redacted;
    }
    results.push({
      pattern_type: p.patternType,
      content,
      confidence: p.confidence,
      frequency: p.frequency,
      source_count: p.sourceCount,
      guru_id: p.guruId,
      guru_name: p.guruName,
      guru_domain: p.guruTopics ?? [],
      publish_title: p.publishTitle,
    });
  }
  return results;
}

export async function getExportContent(exportId: number) {
  const [exp] = await db
    .select({
      status: trainingExportsTable.status,
      format: trainingExportsTable.format,
      content: trainingExportsTable.exportContent,
    })
    .from(trainingExportsTable)
    .where(eq(trainingExportsTable.id, exportId))
    .limit(1);

  return exp || null;
}

export async function getTrainingStats(guruId?: number) {
  const conditions = guruId
    ? [eq(conversationAnnotationsTable.guruId, guruId)]
    : [];

  const [annotationStats] = await db
    .select({
      totalAnnotated: count(),
      avgQuality: sql<number>`coalesce(avg(${conversationAnnotationsTable.qualityScore}), 0)`,
      avgDomainRelevance: sql<number>`coalesce(avg(${conversationAnnotationsTable.domainRelevance}), 0)`,
      highQuality: sql<number>`count(*) filter (where ${conversationAnnotationsTable.qualityScore} >= 0.7)`,
      mediumQuality: sql<number>`count(*) filter (where ${conversationAnnotationsTable.qualityScore} >= 0.3 and ${conversationAnnotationsTable.qualityScore} < 0.7)`,
      lowQuality: sql<number>`count(*) filter (where ${conversationAnnotationsTable.qualityScore} < 0.3)`,
      totalMemoriesExtracted: sql<number>`coalesce(sum(${conversationAnnotationsTable.memoriesExtractedCount}), 0)`,
    })
    .from(conversationAnnotationsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const topicRows = await db
    .select({
      tag: sql<string>`jsonb_array_elements_text(${conversationAnnotationsTable.topicTags})`,
    })
    .from(conversationAnnotationsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const topicCounts: Record<string, number> = {};
  for (const row of topicRows) {
    topicCounts[row.tag] = (topicCounts[row.tag] || 0) + 1;
  }
  const domainCoverage = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([topic, cnt]) => ({ topic, count: cnt }));

  const exports = await db
    .select()
    .from(trainingExportsTable)
    .orderBy(desc(trainingExportsTable.createdAt))
    .limit(20);

  return {
    annotatedTurns: Number(annotationStats.totalAnnotated),
    avgQuality: Number(annotationStats.avgQuality),
    avgDomainRelevance: Number(annotationStats.avgDomainRelevance),
    qualityDistribution: {
      high: Number(annotationStats.highQuality),
      medium: Number(annotationStats.mediumQuality),
      low: Number(annotationStats.lowQuality),
    },
    totalMemoriesExtracted: Number(annotationStats.totalMemoriesExtracted),
    domainCoverage,
    recentExports: exports.map((e) => ({
      id: e.id,
      format: e.format,
      status: e.status,
      rowCount: e.rowCount,
      fileSize: e.fileSize,
      createdAt: e.createdAt,
      completedAt: e.completedAt,
      errorMessage: e.errorMessage,
    })),
  };
}

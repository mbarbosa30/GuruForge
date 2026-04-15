import { db } from "@workspace/db";
import {
  gurusTable,
  knowledgeSnapshotsTable,
  collectivePatternsTable,
  userMemoriesTable,
  conversationAnnotationsTable,
  conversationsTable,
  telegramConnectionsTable,
} from "@workspace/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { logger } from "./logger";
import type { SnapshotData } from "@workspace/db/schema/knowledge-snapshots";

const SNAPSHOT_INTERVAL_MS = parseInt(process.env.SNAPSHOT_INTERVAL_MS || "86400000", 10);

let snapshotTimer: ReturnType<typeof setInterval> | null = null;

export function startSnapshotScheduler(): void {
  if (snapshotTimer) return;
  logger.info({ intervalMs: SNAPSHOT_INTERVAL_MS }, "Starting knowledge snapshot scheduler");
  snapshotTimer = setInterval(runAllSnapshots, SNAPSHOT_INTERVAL_MS);
  setTimeout(runAllSnapshots, 5000);
}

export function stopSnapshotScheduler(): void {
  if (snapshotTimer) {
    clearInterval(snapshotTimer);
    snapshotTimer = null;
  }
}

async function runAllSnapshots(): Promise<void> {
  try {
    const gurus = await db
      .select({ id: gurusTable.id })
      .from(gurusTable)
      .where(eq(gurusTable.status, "published"));

    logger.info({ guruCount: gurus.length }, "Running knowledge snapshots");

    for (const guru of gurus) {
      try {
        await createSnapshot(guru.id);
      } catch (err) {
        logger.error({ err, guruId: guru.id }, "Snapshot failed for guru");
      }
    }
  } catch (err) {
    logger.error({ err }, "Knowledge snapshot scheduler error");
  }
}

async function createSnapshot(guruId: number): Promise<void> {
  const patternRows = await db
    .select({
      patternType: collectivePatternsTable.patternType,
      cnt: count(),
    })
    .from(collectivePatternsTable)
    .where(eq(collectivePatternsTable.guruId, guruId))
    .groupBy(collectivePatternsTable.patternType);

  const patternCounts: Record<string, number> = {};
  let totalPatterns = 0;
  for (const row of patternRows) {
    patternCounts[row.patternType] = Number(row.cnt);
    totalPatterns += Number(row.cnt);
  }

  const memoryRows = await db
    .select({
      category: userMemoriesTable.category,
      cnt: count(),
    })
    .from(userMemoriesTable)
    .where(eq(userMemoriesTable.guruId, guruId))
    .groupBy(userMemoriesTable.category);

  const memoryDistribution: Record<string, number> = {};
  let totalMemories = 0;
  for (const row of memoryRows) {
    memoryDistribution[row.category] = Number(row.cnt);
    totalMemories += Number(row.cnt);
  }

  const [qualityResult] = await db
    .select({
      avg: sql<number>`coalesce(avg(${conversationAnnotationsTable.qualityScore}), 0)`,
      total: count(),
    })
    .from(conversationAnnotationsTable)
    .where(eq(conversationAnnotationsTable.guruId, guruId));

  const avgQualityScore = Number(qualityResult?.avg ?? 0);
  const totalAnnotatedTurns = Number(qualityResult?.total ?? 0);

  const [convResult] = await db
    .select({ total: count() })
    .from(conversationsTable)
    .where(eq(conversationsTable.guruId, guruId));
  const totalConversations = Number(convResult?.total ?? 0);

  const [userResult] = await db
    .select({ total: sql<number>`count(distinct ${telegramConnectionsTable.userId})` })
    .from(telegramConnectionsTable)
    .where(eq(telegramConnectionsTable.guruId, guruId));
  const totalUsers = Number(userResult?.total ?? 0);

  const topTopicRows = await db
    .select({
      tag: sql<string>`jsonb_array_elements_text(${conversationAnnotationsTable.topicTags})`,
    })
    .from(conversationAnnotationsTable)
    .where(eq(conversationAnnotationsTable.guruId, guruId));

  const topicCounts: Record<string, number> = {};
  for (const row of topTopicRows) {
    const tag = row.tag;
    topicCounts[tag] = (topicCounts[tag] || 0) + 1;
  }
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, cnt]) => ({ topic, count: cnt }));

  const [confResult] = await db
    .select({
      avgConf: sql<number>`coalesce(avg(${collectivePatternsTable.confidence}), 0)`,
      high: sql<number>`count(*) filter (where ${collectivePatternsTable.confidence} >= 0.7)`,
      medium: sql<number>`count(*) filter (where ${collectivePatternsTable.confidence} >= 0.3 and ${collectivePatternsTable.confidence} < 0.7)`,
      low: sql<number>`count(*) filter (where ${collectivePatternsTable.confidence} < 0.3)`,
    })
    .from(collectivePatternsTable)
    .where(eq(collectivePatternsTable.guruId, guruId));

  const avgConfidence = Number(confResult?.avgConf ?? 0);

  const snapshotData: SnapshotData = {
    patternCounts,
    memoryDistribution,
    avgQualityScore,
    totalAnnotatedTurns,
    totalConversations,
    totalUsers,
    topTopics,
    confidenceDistribution: {
      high: Number(confResult?.high ?? 0),
      medium: Number(confResult?.medium ?? 0),
      low: Number(confResult?.low ?? 0),
    },
  };

  await db.insert(knowledgeSnapshotsTable).values({
    guruId,
    snapshotData,
    totalPatterns,
    totalMemories,
    avgConfidence,
  });

  logger.info({ guruId, totalPatterns, totalMemories, totalAnnotatedTurns }, "Knowledge snapshot created");
}

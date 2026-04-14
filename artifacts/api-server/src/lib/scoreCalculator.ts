import { db } from "@workspace/db";
import {
  gurusTable,
  collectivePatternsTable,
  telegramConnectionsTable,
  conversationsTable,
  messagesTable,
  guruRatingsTable,
  subscriptionsTable,
  usageLogsTable,
  userMemoriesTable,
} from "@workspace/db/schema";
import { eq, and, sql, avg, count } from "drizzle-orm";

const SCORE_RECALC_INTERVAL = 5;

export async function maybeRecalculateScores(guruId: number): Promise<void> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(usageLogsTable)
      .where(
        and(
          eq(usageLogsTable.guruId, guruId),
          eq(usageLogsTable.callType, "calibration"),
        ),
      );

    const calibrationCount = result?.count ?? 0;
    if (calibrationCount === 0 || calibrationCount % SCORE_RECALC_INTERVAL !== 0) return;

    await recalculateGuruScores(guruId);
  } catch (err) {
    console.error(`Score recalculation error for guru ${guruId}:`, err);
  }
}

async function recalculateGuruScores(guruId: number): Promise<void> {
  const [patternStats] = await db
    .select({
      patternCount: count(collectivePatternsTable.id),
      avgConfidence: avg(collectivePatternsTable.confidence),
      totalFrequency: sql<number>`COALESCE(SUM(${collectivePatternsTable.frequency}), 0)`,
    })
    .from(collectivePatternsTable)
    .where(eq(collectivePatternsTable.guruId, guruId));

  const [topicDiversity] = await db
    .select({
      distinctTypes: sql<number>`COUNT(DISTINCT ${collectivePatternsTable.patternType})`,
    })
    .from(collectivePatternsTable)
    .where(eq(collectivePatternsTable.guruId, guruId));

  const [memoryDiversity] = await db
    .select({
      distinctCategories: sql<number>`COUNT(DISTINCT ${userMemoriesTable.category})`,
    })
    .from(userMemoriesTable)
    .where(eq(userMemoriesTable.guruId, guruId));

  const [activeUserStats] = await db
    .select({ activeUsers: count(telegramConnectionsTable.id) })
    .from(telegramConnectionsTable)
    .where(
      and(
        eq(telegramConnectionsTable.guruId, guruId),
        eq(telegramConnectionsTable.status, "active"),
      ),
    );

  const [conversationStats] = await db
    .select({
      totalConversations: count(conversationsTable.id),
    })
    .from(conversationsTable)
    .where(eq(conversationsTable.guruId, guruId));

  const [messageStats] = await db
    .select({
      totalMessages: count(messagesTable.id),
    })
    .from(messagesTable)
    .innerJoin(conversationsTable, eq(messagesTable.conversationId, conversationsTable.id))
    .where(eq(conversationsTable.guruId, guruId));

  const patternCount = patternStats?.patternCount ?? 0;
  const avgConf = parseFloat(String(patternStats?.avgConfidence ?? 0));
  const totalFreq = patternStats?.totalFrequency ?? 0;
  const activeUsers = activeUserStats?.activeUsers ?? 0;
  const totalConversations = conversationStats?.totalConversations ?? 0;
  const totalMessages = messageStats?.totalMessages ?? 0;
  const patternTypeCount = topicDiversity?.distinctTypes ?? 0;
  const memoryCategoryCount = memoryDiversity?.distinctCategories ?? 0;

  const avgDepth = totalConversations > 0 ? totalMessages / totalConversations : 0;

  const patternScore = Math.min(25, patternCount * 2);
  const confidenceScore = avgConf * 15;
  const userScore = Math.min(15, activeUsers * 3);
  const depthScore = Math.min(15, avgDepth * 1.5);
  const volumeScore = Math.min(15, Math.log2(totalFreq + 1) * 3);
  const diversityScore = Math.min(15, (patternTypeCount * 2) + (memoryCategoryCount * 1.5));

  const wisdomScore = Math.round(
    Math.min(100, patternScore + confidenceScore + userScore + depthScore + volumeScore + diversityScore),
  );

  const [ratingStats] = await db
    .select({
      avgRating: avg(guruRatingsTable.rating),
      ratingCount: count(guruRatingsTable.id),
    })
    .from(guruRatingsTable)
    .where(eq(guruRatingsTable.guruId, guruId));

  const avgRating = parseFloat(String(ratingStats?.avgRating ?? 0));
  const ratingCount = ratingStats?.ratingCount ?? 0;

  const [returningUsers] = await db
    .select({
      returnCount: sql<number>`COUNT(DISTINCT ${conversationsTable.userId}) FILTER (WHERE (SELECT COUNT(*) FROM ${messagesTable} WHERE ${messagesTable.conversationId} = ${conversationsTable.id}) > 4)`,
    })
    .from(conversationsTable)
    .where(eq(conversationsTable.guruId, guruId));

  const [sentimentSignals] = await db
    .select({
      positiveCount: sql<number>`COUNT(*) FILTER (WHERE ${guruRatingsTable.rating} >= 4)`,
      negativeCount: sql<number>`COUNT(*) FILTER (WHERE ${guruRatingsTable.rating} <= 2)`,
    })
    .from(guruRatingsTable)
    .where(eq(guruRatingsTable.guruId, guruId));

  const positiveRatings = sentimentSignals?.positiveCount ?? 0;
  const negativeRatings = sentimentSignals?.negativeCount ?? 0;
  const totalSentiment = positiveRatings + negativeRatings;
  const sentimentRatio = totalSentiment > 0 ? positiveRatings / totalSentiment : 0.5;

  const returnRate = activeUsers > 0 ? Math.min(1, (returningUsers?.returnCount ?? 0) / activeUsers) : 0;

  const ratingComponent = ratingCount > 0 ? (avgRating / 5) * 35 : 20;
  const returnComponent = returnRate * 25;
  const engagementComponent = Math.min(15, avgDepth * 2);
  const sentimentComponent = sentimentRatio * 25;

  const satisfactionScore = Math.round(
    Math.min(100, ratingComponent + returnComponent + engagementComponent + sentimentComponent),
  );

  const [subscriberCount] = await db
    .select({ count: count(subscriptionsTable.id) })
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.guruId, guruId),
        eq(subscriptionsTable.status, "active"),
      ),
    );

  const userCount = subscriberCount?.count ?? 0;

  await db
    .update(gurusTable)
    .set({
      wisdomScore,
      satisfactionScore,
      userCount,
      updatedAt: new Date(),
    })
    .where(eq(gurusTable.id, guruId));
}

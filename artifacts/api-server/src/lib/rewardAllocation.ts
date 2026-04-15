import { db } from "@workspace/db";
import { contributionScoresTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface RewardRecipient {
  walletAddress: string;
  score: number;
  sharePercent: number;
  patternsContributed: number;
  turnCount: number;
}

export interface RewardAllocation {
  recipients: RewardRecipient[];
  totalContributors: number;
  totalScore: number;
}

export async function computeRewardAllocation(guruId: number): Promise<RewardAllocation> {
  const rows = await db
    .select({
      walletAddress: usersTable.walletAddress,
      score: contributionScoresTable.score,
      patternsContributed: contributionScoresTable.patternsContributed,
      turnCount: contributionScoresTable.turnCount,
    })
    .from(contributionScoresTable)
    .innerJoin(usersTable, eq(contributionScoresTable.userId, usersTable.id))
    .where(
      and(
        eq(contributionScoresTable.guruId, guruId),
        sql`${usersTable.walletAddress} IS NOT NULL`,
      ),
    )
    .orderBy(desc(contributionScoresTable.score));

  const totalScore = rows.reduce((sum, r) => sum + r.score, 0);

  const recipients = rows.map((row) => ({
    walletAddress: row.walletAddress!,
    score: Math.round(row.score),
    sharePercent: totalScore > 0 ? Math.round((row.score / totalScore) * 10000) / 100 : 0,
    patternsContributed: row.patternsContributed,
    turnCount: row.turnCount,
  }));

  return {
    recipients,
    totalContributors: recipients.length,
    totalScore: Math.round(totalScore),
  };
}

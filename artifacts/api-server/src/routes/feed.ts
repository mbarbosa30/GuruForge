import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  collectivePatternsTable,
  feedbackTable,
  gurusTable,
} from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { optionalAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/feed", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { patternType, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(gurusTable.status, "published")];

    if (patternType) {
      conditions.push(eq(collectivePatternsTable.patternType, patternType));
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collectivePatternsTable)
      .innerJoin(gurusTable, eq(collectivePatternsTable.guruId, gurusTable.id))
      .where(whereClause);

    const voteSubquery = db
      .select({
        targetId: feedbackTable.targetId,
        votesUp: sql<number>`coalesce(sum(case when ${feedbackTable.vote} = 'up' then 1 else 0 end), 0)::int`.as("votes_up"),
        votesDown: sql<number>`coalesce(sum(case when ${feedbackTable.vote} = 'down' then 1 else 0 end), 0)::int`.as("votes_down"),
      })
      .from(feedbackTable)
      .where(eq(feedbackTable.targetType, "pattern"))
      .groupBy(feedbackTable.targetId)
      .as("vote_counts");

    const patterns = await db
      .select({
        id: collectivePatternsTable.id,
        patternType: collectivePatternsTable.patternType,
        publishTitle: collectivePatternsTable.publishTitle,
        redactedSummary: collectivePatternsTable.redactedSummary,
        frequency: collectivePatternsTable.frequency,
        confidence: collectivePatternsTable.confidence,
        sourceCount: collectivePatternsTable.sourceCount,
        createdAt: collectivePatternsTable.createdAt,
        updatedAt: collectivePatternsTable.updatedAt,
        guruId: gurusTable.id,
        guruName: gurusTable.name,
        guruSlug: gurusTable.slug,
        guruAvatarUrl: gurusTable.avatarUrl,
        votesUp: sql<number>`coalesce(${voteSubquery.votesUp}, 0)`.mapWith(Number),
        votesDown: sql<number>`coalesce(${voteSubquery.votesDown}, 0)`.mapWith(Number),
      })
      .from(collectivePatternsTable)
      .innerJoin(gurusTable, eq(collectivePatternsTable.guruId, gurusTable.id))
      .leftJoin(voteSubquery, eq(collectivePatternsTable.id, voteSubquery.targetId))
      .where(whereClause)
      .orderBy(
        sql`(${collectivePatternsTable.confidence} * ln(greatest(coalesce(${voteSubquery.votesUp}, 0) + 2, 2)) * (1.0 / (1.0 + extract(epoch from (now() - ${collectivePatternsTable.updatedAt})) / 86400.0))) DESC`,
      )
      .limit(limitNum)
      .offset(offset);

    const patternIds = patterns.map((p) => p.id);
    let userVoteMap = new Map<number, string>();
    if (req.dbUserId && patternIds.length > 0) {
      const userVotes = await db
        .select({ targetId: feedbackTable.targetId, vote: feedbackTable.vote })
        .from(feedbackTable)
        .where(
          and(
            eq(feedbackTable.userId, req.dbUserId),
            eq(feedbackTable.targetType, "pattern"),
            sql`${feedbackTable.targetId} IN (${sql.join(patternIds.map(id => sql`${id}`), sql`, `)})`
          )
        );
      for (const v of userVotes) {
        userVoteMap.set(v.targetId, v.vote);
      }
    }

    const items = patterns.map((p) => ({
      id: p.id,
      patternType: p.patternType,
      publishTitle: p.publishTitle,
      redactedSummary: p.redactedSummary || "Insight summary not yet available.",
      frequency: p.frequency,
      confidence: p.confidence,
      sourceCount: p.sourceCount,
      votesUp: p.votesUp,
      votesDown: p.votesDown,
      guruId: p.guruId,
      guruName: p.guruName,
      guruSlug: p.guruSlug,
      guruAvatarUrl: p.guruAvatarUrl,
      userVote: userVoteMap.get(p.id) || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json({
      items,
      total: countResult?.count ?? 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((countResult?.count ?? 0) / limitNum),
    });
  } catch (err) {
    console.error("Global feed error:", err);
    res.status(500).json({ error: "Failed to fetch global feed" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  userMemoriesTable,
  collectivePatternsTable,
  feedbackTable,
  subscriptionsTable,
} from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/gurus/:guruId/wisdom-feed", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    const [activeSub] = await db
      .select({ id: subscriptionsTable.id })
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, req.dbUserId),
          eq(subscriptionsTable.guruId, guruId),
          eq(subscriptionsTable.status, "active"),
        )
      )
      .limit(1);

    if (!activeSub) {
      res.status(403).json({ error: "Active subscription required" });
      return;
    }

    const { category, topic, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [
      eq(userMemoriesTable.userId, req.dbUserId),
      eq(userMemoriesTable.guruId, guruId),
    ];

    if (category) {
      conditions.push(eq(userMemoriesTable.category, category));
    }

    if (topic) {
      conditions.push(eq(userMemoriesTable.topic, topic));
    }

    if (search) {
      conditions.push(
        sql`(${userMemoriesTable.summary} ILIKE ${'%' + search + '%'} OR ${userMemoriesTable.displayTitle} ILIKE ${'%' + search + '%'})`
      );
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userMemoriesTable)
      .where(whereClause);

    const memories = await db
      .select()
      .from(userMemoriesTable)
      .where(whereClause)
      .orderBy(desc(userMemoriesTable.updatedAt), desc(userMemoriesTable.importance))
      .limit(limitNum)
      .offset(offset);

    const memoryIds = memories.map((m) => m.id);
    let userFeedback: Array<{ targetId: number; vote: string }> = [];
    if (memoryIds.length > 0) {
      userFeedback = await db
        .select({ targetId: feedbackTable.targetId, vote: feedbackTable.vote })
        .from(feedbackTable)
        .where(
          and(
            eq(feedbackTable.userId, req.dbUserId),
            eq(feedbackTable.targetType, "memory"),
            sql`${feedbackTable.targetId} IN (${sql.join(memoryIds.map(id => sql`${id}`), sql`, `)})`
          )
        );
    }

    const feedbackMap = new Map(userFeedback.map((f) => [f.targetId, f.vote]));

    const items = memories.map((m) => ({
      id: m.id,
      category: m.category,
      summary: m.summary,
      displayTitle: m.displayTitle,
      topic: m.topic,
      importance: m.importance,
      userVote: feedbackMap.get(m.id) || null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    res.json({
      items,
      total: countResult?.count ?? 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((countResult?.count ?? 0) / limitNum),
    });
  } catch (err) {
    console.error("Wisdom feed error:", err);
    res.status(500).json({ error: "Failed to fetch wisdom feed" });
  }
});

router.get("/gurus/:guruId/journal", async (req, res) => {
  try {
    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    const { patternType, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(collectivePatternsTable.guruId, guruId)];

    if (patternType) {
      conditions.push(eq(collectivePatternsTable.patternType, patternType));
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collectivePatternsTable)
      .where(whereClause);

    const patterns = await db
      .select()
      .from(collectivePatternsTable)
      .where(whereClause)
      .orderBy(desc(collectivePatternsTable.confidence), desc(collectivePatternsTable.updatedAt))
      .limit(limitNum)
      .offset(offset);

    const patternIds = patterns.map((p) => p.id);
    let voteCounts: Array<{ targetId: number; vote: string; count: number }> = [];
    if (patternIds.length > 0) {
      voteCounts = await db
        .select({
          targetId: feedbackTable.targetId,
          vote: feedbackTable.vote,
          count: sql<number>`count(*)::int`,
        })
        .from(feedbackTable)
        .where(
          and(
            eq(feedbackTable.targetType, "pattern"),
            sql`${feedbackTable.targetId} IN (${sql.join(patternIds.map(id => sql`${id}`), sql`, `)})`
          )
        )
        .groupBy(feedbackTable.targetId, feedbackTable.vote);
    }

    const voteMap = new Map<number, { up: number; down: number }>();
    for (const vc of voteCounts) {
      const entry = voteMap.get(vc.targetId) || { up: 0, down: 0 };
      if (vc.vote === "up") entry.up = vc.count;
      if (vc.vote === "down") entry.down = vc.count;
      voteMap.set(vc.targetId, entry);
    }

    const items = patterns.map((p) => {
      const votes = voteMap.get(p.id) || { up: 0, down: 0 };
      return {
        id: p.id,
        patternType: p.patternType,
        publishTitle: p.publishTitle,
        redactedSummary: p.redactedSummary || p.summary,
        frequency: p.frequency,
        confidence: p.confidence,
        sourceCount: p.sourceCount,
        votesUp: votes.up,
        votesDown: votes.down,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    res.json({
      items,
      total: countResult?.count ?? 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((countResult?.count ?? 0) / limitNum),
    });
  } catch (err) {
    console.error("Journal error:", err);
    res.status(500).json({ error: "Failed to fetch journal" });
  }
});

router.get("/gurus/:guruId/journal/my-votes", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    const patternIds = await db
      .select({ id: collectivePatternsTable.id })
      .from(collectivePatternsTable)
      .where(eq(collectivePatternsTable.guruId, guruId));

    if (patternIds.length === 0) {
      res.json({ votes: {} });
      return;
    }

    const ids = patternIds.map((p) => p.id);
    const votes = await db
      .select({ targetId: feedbackTable.targetId, vote: feedbackTable.vote })
      .from(feedbackTable)
      .where(
        and(
          eq(feedbackTable.userId, req.dbUserId),
          eq(feedbackTable.targetType, "pattern"),
          sql`${feedbackTable.targetId} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`
        )
      );

    const voteMap: Record<number, string> = {};
    for (const v of votes) {
      voteMap[v.targetId] = v.vote;
    }

    res.json({ votes: voteMap });
  } catch (err) {
    console.error("Journal votes error:", err);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});

router.post("/feedback", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { targetType, targetId, vote } = req.body;

    if (!targetType || !["memory", "pattern"].includes(targetType)) {
      res.status(400).json({ error: "Invalid target type" });
      return;
    }

    if (!targetId || typeof targetId !== "number") {
      res.status(400).json({ error: "Invalid target ID" });
      return;
    }

    if (!vote || !["up", "down"].includes(vote)) {
      res.status(400).json({ error: "Invalid vote (must be 'up' or 'down')" });
      return;
    }

    if (targetType === "memory") {
      const [memory] = await db
        .select()
        .from(userMemoriesTable)
        .where(
          and(
            eq(userMemoriesTable.id, targetId),
            eq(userMemoriesTable.userId, req.dbUserId),
          )
        )
        .limit(1);

      if (!memory) {
        res.status(404).json({ error: "Memory not found" });
        return;
      }
    }

    if (targetType === "pattern") {
      const [pattern] = await db
        .select()
        .from(collectivePatternsTable)
        .where(eq(collectivePatternsTable.id, targetId))
        .limit(1);

      if (!pattern) {
        res.status(404).json({ error: "Pattern not found" });
        return;
      }
    }

    const [existing] = await db
      .select()
      .from(feedbackTable)
      .where(
        and(
          eq(feedbackTable.userId, req.dbUserId),
          eq(feedbackTable.targetType, targetType),
          eq(feedbackTable.targetId, targetId),
        )
      )
      .limit(1);

    let result;
    if (existing) {
      if (existing.vote === vote) {
        await db.delete(feedbackTable).where(eq(feedbackTable.id, existing.id));
        result = { action: "removed", vote: null };
      } else {
        await db
          .update(feedbackTable)
          .set({ vote, updatedAt: new Date() })
          .where(eq(feedbackTable.id, existing.id));
        result = { action: "changed", vote };
      }
    } else {
      await db.insert(feedbackTable).values({
        userId: req.dbUserId,
        targetType,
        targetId,
        vote,
      });
      result = { action: "created", vote };
    }

    if (targetType === "memory") {
      let netDelta = 0;
      if (result.action === "created") {
        netDelta = vote === "up" ? 0.05 : -0.05;
      } else if (result.action === "changed") {
        netDelta = vote === "up" ? 0.10 : -0.10;
      } else if (result.action === "removed") {
        netDelta = existing!.vote === "up" ? -0.05 : 0.05;
      }
      if (netDelta !== 0) {
        await db
          .update(userMemoriesTable)
          .set({
            importance: sql`LEAST(1.0, GREATEST(0.0, ${userMemoriesTable.importance} + ${netDelta}))`,
            updatedAt: new Date(),
          })
          .where(eq(userMemoriesTable.id, targetId));
      }
    }

    if (targetType === "pattern") {
      const [upCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(feedbackTable)
        .where(
          and(
            eq(feedbackTable.targetType, "pattern"),
            eq(feedbackTable.targetId, targetId),
            eq(feedbackTable.vote, "up"),
          )
        );
      const [downCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(feedbackTable)
        .where(
          and(
            eq(feedbackTable.targetType, "pattern"),
            eq(feedbackTable.targetId, targetId),
            eq(feedbackTable.vote, "down"),
          )
        );

      const ups = upCount?.count ?? 0;
      const downs = downCount?.count ?? 0;
      const total = ups + downs;
      let newConfidence: number;
      if (total > 0) {
        const ratio = ups / total;
        const baseConfidence = 0.5;
        const adjustment = (ratio - 0.5) * 0.3;
        newConfidence = Math.min(1.0, Math.max(0.0, baseConfidence + adjustment));
      } else {
        newConfidence = 0.5;
      }
      await db
        .update(collectivePatternsTable)
        .set({ confidence: newConfidence, updatedAt: new Date() })
        .where(eq(collectivePatternsTable.id, targetId));
    }

    res.json(result);
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

export default router;

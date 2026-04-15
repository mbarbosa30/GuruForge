import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { gurusTable, usersTable, categoriesTable, guruRatingsTable, contributionScoresTable } from "@workspace/db/schema";
import { eq, desc, asc, and, sql, avg, count, or } from "drizzle-orm";
import { requireAuth, optionalAuth, type AuthRequest } from "../middlewares/auth";
import { CreateGuruBody, UpdateGuruBody, UpdateGuruParams, ListGurusQueryParams } from "@workspace/api-zod";
import { handleGuruStatusChange, isBotActive, stopBot, startBot, setupWebhook } from "../lib/botManager";

const router: IRouter = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/gurus", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = ListGurusQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { category, status, search, sort } = parsed.data;

    const conditions = [];

    if (status && status !== "published") {
      if (!req.dbUserId) {
        conditions.push(eq(gurusTable.status, "published"));
      } else {
        conditions.push(
          or(
            eq(gurusTable.status, "published"),
            and(eq(gurusTable.status, status), eq(gurusTable.creatorId, req.dbUserId))
          )!
        );
      }
    } else {
      conditions.push(eq(gurusTable.status, "published"));
    }

    if (category) {
      const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
      if (cat.length > 0) {
        conditions.push(eq(gurusTable.categoryId, cat[0].id));
      }
    }

    if (search) {
      conditions.push(
        sql`(${gurusTable.name} ILIKE ${'%' + search + '%'} OR ${gurusTable.tagline} ILIKE ${'%' + search + '%'} OR ${gurusTable.description} ILIKE ${'%' + search + '%'})`
      );
    }

    let orderBy;
    switch (sort) {
      case "wisdom":
        orderBy = desc(gurusTable.wisdomScore);
        break;
      case "price_asc":
        orderBy = asc(gurusTable.priceCents);
        break;
      case "price_desc":
        orderBy = desc(gurusTable.priceCents);
        break;
      case "users":
        orderBy = desc(gurusTable.userCount);
        break;
      case "newest":
      default:
        orderBy = desc(gurusTable.createdAt);
        break;
    }

    const gurus = await db
      .select({
        id: gurusTable.id,
        name: gurusTable.name,
        slug: gurusTable.slug,
        tagline: gurusTable.tagline,
        description: gurusTable.description,
        categoryId: gurusTable.categoryId,
        avatarUrl: gurusTable.avatarUrl,
        status: gurusTable.status,
        priceCents: gurusTable.priceCents,
        priceInterval: gurusTable.priceInterval,
        topics: gurusTable.topics,
        personalityStyle: gurusTable.personalityStyle,
        modelTier: gurusTable.modelTier,
        wisdomScore: gurusTable.wisdomScore,
        satisfactionScore: gurusTable.satisfactionScore,
        userCount: gurusTable.userCount,
        createdAt: gurusTable.createdAt,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        creatorName: usersTable.name,
      })
      .from(gurusTable)
      .leftJoin(categoriesTable, eq(gurusTable.categoryId, categoriesTable.id))
      .leftJoin(usersTable, eq(gurusTable.creatorId, usersTable.id))
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(orderBy);

    res.json(gurus);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gurus" });
  }
});

router.get("/gurus/:slug", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    const results = await db
      .select({
        id: gurusTable.id,
        creatorId: gurusTable.creatorId,
        name: gurusTable.name,
        slug: gurusTable.slug,
        tagline: gurusTable.tagline,
        description: gurusTable.description,
        categoryId: gurusTable.categoryId,
        avatarUrl: gurusTable.avatarUrl,
        status: gurusTable.status,
        priceCents: gurusTable.priceCents,
        priceInterval: gurusTable.priceInterval,
        topics: gurusTable.topics,
        personalityStyle: gurusTable.personalityStyle,
        modelTier: gurusTable.modelTier,
        memoryPolicy: gurusTable.memoryPolicy,
        introEnabled: gurusTable.introEnabled,
        proactiveCadence: gurusTable.proactiveCadence,
        wisdomScore: gurusTable.wisdomScore,
        satisfactionScore: gurusTable.satisfactionScore,
        userCount: gurusTable.userCount,
        createdAt: gurusTable.createdAt,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        creatorName: usersTable.name,
        creatorAvatarUrl: usersTable.avatarUrl,
      })
      .from(gurusTable)
      .leftJoin(categoriesTable, eq(gurusTable.categoryId, categoriesTable.id))
      .leftJoin(usersTable, eq(gurusTable.creatorId, usersTable.id))
      .where(eq(gurusTable.slug, slug))
      .limit(1);

    if (results.length === 0 || results[0].status !== "published") {
      res.status(404).json({ error: "Guru not found" });
      return;
    }

    const guru = results[0];

    const ratingStats = await db
      .select({
        avgRating: avg(guruRatingsTable.rating),
        totalRatings: count(guruRatingsTable.id),
      })
      .from(guruRatingsTable)
      .where(eq(guruRatingsTable.guruId, guru.id));

    res.json({
      ...guru,
      avgRating: ratingStats[0]?.avgRating ? parseFloat(String(ratingStats[0].avgRating)) : null,
      totalRatings: ratingStats[0]?.totalRatings ?? 0,
      isCreator: req.dbUserId ? guru.creatorId === req.dbUserId : false,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch guru" });
  }
});

router.post("/gurus", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found." });
      return;
    }

    const parsed = CreateGuruBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
      return;
    }

    const { name, tagline, description, categoryId, avatarUrl, priceCents, priceInterval, topics, personalityStyle, modelTier, memoryPolicy, introEnabled, proactiveCadence } = parsed.data;

    let slug = slugify(name);
    const existing = await db.select({ id: gurusTable.id }).from(gurusTable).where(eq(gurusTable.slug, slug)).limit(1);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [guru] = await db.insert(gurusTable).values({
      creatorId: req.dbUserId,
      name,
      slug,
      tagline: tagline ?? null,
      description: description ?? null,
      categoryId: categoryId ?? null,
      avatarUrl: avatarUrl ?? null,
      status: "published",
      priceCents: priceCents ?? 0,
      priceInterval: priceInterval ?? "monthly",
      topics: topics ?? [],
      personalityStyle: personalityStyle ?? "professional",
      modelTier: modelTier ?? "gpt",
      memoryPolicy: memoryPolicy ?? null,
      introEnabled: introEnabled ?? false,
      proactiveCadence: proactiveCadence ?? "off",
    }).returning();

    await db.update(usersTable).set({ role: "creator" }).where(eq(usersTable.id, req.dbUserId));

    res.status(201).json(guru);
  } catch (err) {
    res.status(500).json({ error: "Failed to create guru" });
  }
});

router.patch("/gurus/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const paramsParsed = UpdateGuruParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    const guruId = paramsParsed.data.id;

    const [existing] = await db.select().from(gurusTable).where(eq(gurusTable.id, guruId)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }
    if (existing.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "You can only edit your own Gurus" });
      return;
    }

    const bodyParsed = UpdateGuruBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: bodyParsed.error.issues[0]?.message || "Invalid input" });
      return;
    }

    const updates: Partial<typeof gurusTable.$inferInsert> = { updatedAt: new Date() };
    const data = bodyParsed.data;

    if (data.name !== undefined) updates.name = data.name;
    if (data.tagline !== undefined) updates.tagline = data.tagline;
    if (data.description !== undefined) updates.description = data.description;
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
    if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl;
    if (data.status !== undefined) updates.status = data.status;
    if (data.priceCents !== undefined) updates.priceCents = data.priceCents;
    if (data.priceInterval !== undefined) updates.priceInterval = data.priceInterval;
    if (data.topics !== undefined) updates.topics = data.topics;
    if (data.personalityStyle !== undefined) updates.personalityStyle = data.personalityStyle;
    if (data.modelTier !== undefined) updates.modelTier = data.modelTier;
    if (data.memoryPolicy !== undefined) updates.memoryPolicy = data.memoryPolicy;
    if (data.introEnabled !== undefined) updates.introEnabled = data.introEnabled;
    if (data.proactiveCadence !== undefined) updates.proactiveCadence = data.proactiveCadence;
    if (data.telegramBotToken !== undefined) updates.telegramBotToken = data.telegramBotToken;

    const [updated] = await db.update(gurusTable).set(updates).where(eq(gurusTable.id, guruId)).returning();

    if (data.status !== undefined && data.status !== existing.status) {
      handleGuruStatusChange(guruId, data.status).catch((err) =>
        console.error(`Bot lifecycle error for guru ${guruId}:`, err)
      );
    } else if (data.telegramBotToken !== undefined && updated.status === "published") {
      (async () => {
        if (isBotActive(guruId)) stopBot(guruId);
        const started = await startBot(guruId);
        if (started) {
          const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0];
          if (domain) {
            await setupWebhook(guruId, `https://${domain}/api/telegram/webhook/${guruId}`);
          }
        }
      })().catch((err) => console.error(`Bot token update error for guru ${guruId}:`, err));
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update guru" });
  }
});

router.get("/gurus/:guruId/contribution-score", requireAuth, async (req: AuthRequest, res) => {
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

    const [score] = await db
      .select()
      .from(contributionScoresTable)
      .where(
        and(
          eq(contributionScoresTable.userId, req.dbUserId),
          eq(contributionScoresTable.guruId, guruId),
        ),
      )
      .limit(1);

    res.json({
      score: score?.score ?? 0,
      turnCount: score?.turnCount ?? 0,
      patternsContributed: score?.patternsContributed ?? 0,
      lastUpdatedAt: score?.lastUpdatedAt ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contribution score" });
  }
});

router.get("/gurus/:guruId/leaderboard", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const guruId = parseInt(req.params.guruId, 10);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    const [guru] = await db
      .select({ id: gurusTable.id, status: gurusTable.status, creatorId: gurusTable.creatorId })
      .from(gurusTable)
      .where(eq(gurusTable.id, guruId))
      .limit(1);

    if (!guru) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }

    if (guru.status !== "published" && guru.creatorId !== req.dbUserId) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }

    const parsedLimit = parseInt(req.query.limit as string, 10);
    const parsedOffset = parseInt(req.query.offset as string, 10);
    const limit = Math.max(1, Math.min(isNaN(parsedLimit) ? 25 : parsedLimit, 100));
    const offset = Math.max(0, isNaN(parsedOffset) ? 0 : parsedOffset);

    const rows = await db
      .select({
        userId: contributionScoresTable.userId,
        score: contributionScoresTable.score,
        patternsContributed: contributionScoresTable.patternsContributed,
        name: usersTable.name,
      })
      .from(contributionScoresTable)
      .innerJoin(usersTable, eq(contributionScoresTable.userId, usersTable.id))
      .where(eq(contributionScoresTable.guruId, guruId))
      .orderBy(desc(contributionScoresTable.score))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: count() })
      .from(contributionScoresTable)
      .where(eq(contributionScoresTable.guruId, guruId));

    const contributors = rows.map((row, idx) => {
      const rank = offset + idx + 1;
      const nameStr = row.name || "Anonymous";
      const anonymized = nameStr.charAt(0) + "***";
      return {
        rank,
        displayName: anonymized,
        score: Math.round(row.score),
        patternsContributed: row.patternsContributed,
        isYou: req.dbUserId ? row.userId === req.dbUserId : false,
      };
    });

    res.json({
      contributors,
      total: totalResult?.count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get("/gurus/:guruId/leaderboard/creator", requireAuth, async (req: AuthRequest, res) => {
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

    const [guru] = await db
      .select({ creatorId: gurusTable.creatorId })
      .from(gurusTable)
      .where(eq(gurusTable.id, guruId))
      .limit(1);

    if (!guru || guru.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "Only the guru creator can view this data" });
      return;
    }

    const parsedLimit = parseInt(req.query.limit as string, 10);
    const parsedOffset = parseInt(req.query.offset as string, 10);
    const limit = Math.max(1, Math.min(isNaN(parsedLimit) ? 50 : parsedLimit, 200));
    const offset = Math.max(0, isNaN(parsedOffset) ? 0 : parsedOffset);

    const rows = await db
      .select({
        userId: contributionScoresTable.userId,
        score: contributionScoresTable.score,
        turnCount: contributionScoresTable.turnCount,
        patternsContributed: contributionScoresTable.patternsContributed,
        lastUpdatedAt: contributionScoresTable.lastUpdatedAt,
        name: usersTable.name,
        email: usersTable.email,
        walletAddress: usersTable.walletAddress,
      })
      .from(contributionScoresTable)
      .innerJoin(usersTable, eq(contributionScoresTable.userId, usersTable.id))
      .where(eq(contributionScoresTable.guruId, guruId))
      .orderBy(desc(contributionScoresTable.score))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: count() })
      .from(contributionScoresTable)
      .where(eq(contributionScoresTable.guruId, guruId));

    const contributors = rows.map((row, idx) => ({
      rank: offset + idx + 1,
      name: row.name || "Anonymous",
      email: row.email,
      walletAddress: row.walletAddress,
      score: Math.round(row.score),
      turnCount: row.turnCount,
      patternsContributed: row.patternsContributed,
      lastUpdatedAt: row.lastUpdatedAt,
    }));

    res.json({
      contributors,
      total: totalResult?.count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch creator leaderboard" });
  }
});

router.get("/gurus/:guruId/leaderboard/rewards", requireAuth, async (req: AuthRequest, res) => {
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

    const [guru] = await db
      .select({ creatorId: gurusTable.creatorId })
      .from(gurusTable)
      .where(eq(gurusTable.id, guruId))
      .limit(1);

    if (!guru || guru.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "Only the guru creator can view reward data" });
      return;
    }

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

    res.json({
      recipients,
      totalContributors: recipients.length,
      totalScore: Math.round(totalScore),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reward data" });
  }
});

export default router;

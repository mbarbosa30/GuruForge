import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { gurusTable, usersTable, categoriesTable, guruRatingsTable } from "@workspace/db/schema";
import { eq, ilike, desc, asc, and, sql, avg, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/gurus", async (req, res) => {
  try {
    const { category, status, search, sort } = req.query;

    const conditions = [];

    conditions.push(eq(gurusTable.status, "published"));

    if (category && typeof category === "string") {
      const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
      if (cat.length > 0) {
        conditions.push(eq(gurusTable.categoryId, cat[0].id));
      }
    }

    if (search && typeof search === "string") {
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

router.get("/gurus/:slug", async (req, res) => {
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
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch guru" });
  }
});

router.post("/gurus", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found. Please complete your profile first." });
      return;
    }

    const { name, tagline, description, categoryId, avatarUrl, priceCents, priceInterval, topics, personalityStyle, modelTier, memoryPolicy, introEnabled } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const validIntervals = ["monthly", "yearly"];
    if (priceInterval && !validIntervals.includes(priceInterval)) {
      res.status(400).json({ error: "priceInterval must be 'monthly' or 'yearly'" });
      return;
    }

    const validStyles = ["professional", "friendly", "direct", "academic"];
    if (personalityStyle && !validStyles.includes(personalityStyle)) {
      res.status(400).json({ error: "Invalid personalityStyle" });
      return;
    }

    const validTiers = ["basic", "pro", "enterprise"];
    if (modelTier && !validTiers.includes(modelTier)) {
      res.status(400).json({ error: "Invalid modelTier" });
      return;
    }

    if (priceCents !== undefined && (typeof priceCents !== "number" || priceCents < 0)) {
      res.status(400).json({ error: "priceCents must be a non-negative number" });
      return;
    }

    let slug = slugify(name);
    const existing = await db.select({ id: gurusTable.id }).from(gurusTable).where(eq(gurusTable.slug, slug)).limit(1);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [guru] = await db.insert(gurusTable).values({
      creatorId: req.dbUserId,
      name,
      slug,
      tagline: tagline || null,
      description: description || null,
      categoryId: categoryId || null,
      avatarUrl: avatarUrl || null,
      status: "published",
      priceCents: priceCents || 0,
      priceInterval: priceInterval || "monthly",
      topics: topics || [],
      personalityStyle: personalityStyle || "professional",
      modelTier: modelTier || "basic",
      memoryPolicy: memoryPolicy || null,
      introEnabled: introEnabled || false,
    }).returning();

    await db.update(usersTable).set({ role: "creator" }).where(eq(usersTable.id, req.dbUserId));

    res.status(201).json(guru);
  } catch (err) {
    res.status(500).json({ error: "Failed to create guru" });
  }
});

router.patch("/gurus/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const guruId = parseInt(req.params.id);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    const [existing] = await db.select().from(gurusTable).where(eq(gurusTable.id, guruId)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }
    if (existing.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "You can only edit your own Gurus" });
      return;
    }

    const validStatuses = ["draft", "published", "archived"];
    if (req.body.status && !validStatuses.includes(req.body.status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const validIntervals = ["monthly", "yearly"];
    if (req.body.priceInterval && !validIntervals.includes(req.body.priceInterval)) {
      res.status(400).json({ error: "Invalid priceInterval" });
      return;
    }

    const validStyles = ["professional", "friendly", "direct", "academic"];
    if (req.body.personalityStyle && !validStyles.includes(req.body.personalityStyle)) {
      res.status(400).json({ error: "Invalid personalityStyle" });
      return;
    }

    const validTiers = ["basic", "pro", "enterprise"];
    if (req.body.modelTier && !validTiers.includes(req.body.modelTier)) {
      res.status(400).json({ error: "Invalid modelTier" });
      return;
    }

    const allowedFields = ["name", "tagline", "description", "categoryId", "avatarUrl", "status", "priceCents", "priceInterval", "topics", "personalityStyle", "modelTier", "memoryPolicy", "introEnabled"];
    const updates: Record<string, any> = { updatedAt: new Date() };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const [updated] = await db.update(gurusTable).set(updates).where(eq(gurusTable.id, guruId)).returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update guru" });
  }
});

export default router;

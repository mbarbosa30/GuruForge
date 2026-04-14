import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { guruRatingsTable, usersTable, gurusTable } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/gurus/:id/ratings", async (req, res) => {
  try {
    const guruId = parseInt(req.params.id);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    const ratings = await db
      .select({
        id: guruRatingsTable.id,
        rating: guruRatingsTable.rating,
        comment: guruRatingsTable.comment,
        createdAt: guruRatingsTable.createdAt,
        userName: usersTable.name,
        userAvatarUrl: usersTable.avatarUrl,
      })
      .from(guruRatingsTable)
      .leftJoin(usersTable, eq(guruRatingsTable.userId, usersTable.id))
      .where(eq(guruRatingsTable.guruId, guruId))
      .orderBy(desc(guruRatingsTable.createdAt));

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

router.post("/gurus/:id/ratings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const guruId = parseInt(req.params.id);
    if (isNaN(guruId)) {
      res.status(400).json({ error: "Invalid guru ID" });
      return;
    }

    if (!req.dbUserId) {
      res.status(400).json({ error: "User profile not found" });
      return;
    }

    const { rating, comment } = req.body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be a number between 1 and 5" });
      return;
    }

    const [guru] = await db.select({ id: gurusTable.id }).from(gurusTable).where(eq(gurusTable.id, guruId)).limit(1);
    if (!guru) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }

    const existing = await db
      .select({ id: guruRatingsTable.id })
      .from(guruRatingsTable)
      .where(and(eq(guruRatingsTable.userId, req.dbUserId), eq(guruRatingsTable.guruId, guruId)))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(guruRatingsTable)
        .set({ rating, comment: comment || null })
        .where(eq(guruRatingsTable.id, existing[0].id))
        .returning();
      res.status(200).json(updated);
      return;
    }

    const [newRating] = await db.insert(guruRatingsTable).values({
      userId: req.dbUserId,
      guruId,
      rating,
      comment: comment || null,
    }).returning();

    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

export default router;

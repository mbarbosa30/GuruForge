import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);

    if (!user) {
      [user] = await db.insert(usersTable).values({
        clerkId: req.userId,
        email: (req as any).auth?.sessionClaims?.email || "unknown@example.com",
        name: (req as any).auth?.sessionClaims?.name || null,
      }).returning();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

router.patch("/users/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, avatarUrl } = req.body;
    const updates: Record<string, any> = { updatedAt: new Date() };

    if (name !== undefined) updates.name = name;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.clerkId, req.userId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db/schema";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.displayOrder));
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { gurusTable, contributionScoresTable, usersTable, rewardDistributionsTable } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { deployToken, transferTokens, getPortfolio, validateTokenName, validateTokenSymbol } from "../lib/bankrClient";

const router: IRouter = Router();

router.post("/gurus/:guruId/token/launch", requireAuth, async (req: AuthRequest, res) => {
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
      .select()
      .from(gurusTable)
      .where(eq(gurusTable.id, guruId))
      .limit(1);

    if (!guru) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }

    if (guru.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "Only the guru creator can launch a token" });
      return;
    }

    if (guru.tokenAddress) {
      res.status(409).json({ error: "Token already launched", tokenAddress: guru.tokenAddress, tokenSymbol: guru.tokenSymbol });
      return;
    }

    const { name, symbol } = req.body;
    if (!name || !symbol) {
      res.status(400).json({ error: "Token name and symbol are required" });
      return;
    }

    const nameErr = validateTokenName(String(name).trim());
    if (nameErr) {
      res.status(400).json({ error: nameErr });
      return;
    }

    const symErr = validateTokenSymbol(String(symbol).trim().toUpperCase());
    if (symErr) {
      res.status(400).json({ error: symErr });
      return;
    }

    const result = await deployToken({ name: String(name).trim(), symbol: String(symbol).trim().toUpperCase() });

    await db
      .update(gurusTable)
      .set({
        tokenAddress: result.tokenAddress,
        tokenSymbol: result.symbol,
        tokenChain: result.chain || "base",
        updatedAt: new Date(),
      })
      .where(eq(gurusTable.id, guruId));

    res.status(201).json({
      tokenAddress: result.tokenAddress,
      tokenSymbol: result.symbol,
      tokenChain: result.chain || "base",
      transactionHash: result.transactionHash ?? null,
    });
  } catch (err) {
    console.error("Token launch error:", err);
    const message = err instanceof Error ? err.message : "Failed to launch token";
    res.status(500).json({ error: message });
  }
});

router.post("/gurus/:guruId/rewards/distribute", requireAuth, async (req: AuthRequest, res) => {
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
      .select()
      .from(gurusTable)
      .where(eq(gurusTable.id, guruId))
      .limit(1);

    if (!guru) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }

    if (guru.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "Only the guru creator can distribute rewards" });
      return;
    }

    if (!guru.tokenAddress || !guru.tokenSymbol) {
      res.status(400).json({ error: "No token launched for this guru. Launch a token first." });
      return;
    }

    const { totalAmount } = req.body;
    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      res.status(400).json({ error: "A positive totalAmount is required" });
      return;
    }

    const rows = await db
      .select({
        walletAddress: usersTable.walletAddress,
        score: contributionScoresTable.score,
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

    if (rows.length === 0) {
      res.status(400).json({ error: "No eligible contributors with wallet addresses" });
      return;
    }

    const totalScore = rows.reduce((sum, r) => sum + r.score, 0);
    if (totalScore <= 0) {
      res.status(400).json({ error: "No positive contribution scores to distribute" });
      return;
    }

    const total = Number(totalAmount);
    const recipients = rows.map((r) => ({
      walletAddress: r.walletAddress!,
      amount: ((r.score / totalScore) * total).toFixed(6),
    }));

    const [distRecord] = await db.insert(rewardDistributionsTable).values({
      guruId,
      initiatedBy: req.dbUserId,
      tokenAddress: guru.tokenAddress,
      tokenSymbol: guru.tokenSymbol,
      chain: guru.tokenChain || "base",
      totalAmount: String(totalAmount),
      recipientCount: recipients.length,
      status: "pending",
    }).returning();

    const batchResult = await transferTokens({
      tokenAddress: guru.tokenAddress,
      recipients,
    });

    const hashes = batchResult.outcomes
      .filter((o) => o.transactionHash)
      .map((o) => o.transactionHash);

    const finalStatus = batchResult.failCount === 0
      ? "completed"
      : batchResult.successCount === 0
        ? "failed"
        : "partial";

    const errorMessage = batchResult.failCount > 0
      ? `${batchResult.failCount} of ${batchResult.outcomes.length} transfers failed`
      : null;

    await db
      .update(rewardDistributionsTable)
      .set({
        status: finalStatus,
        transactionHashes: JSON.stringify(hashes),
        recipientCount: batchResult.successCount,
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(rewardDistributionsTable.id, distRecord.id));

    const statusCode = finalStatus === "failed" ? 500 : 201;
    res.status(statusCode).json({
      distributionId: distRecord.id,
      status: finalStatus,
      recipientCount: batchResult.successCount,
      totalAmount: String(totalAmount),
      transactionHashes: hashes,
      failedCount: batchResult.failCount,
    });
  } catch (err) {
    console.error("Reward distribution error:", err);
    res.status(500).json({ error: "Failed to distribute rewards" });
  }
});

router.get("/gurus/:guruId/rewards/history", requireAuth, async (req: AuthRequest, res) => {
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

    if (!guru) {
      res.status(404).json({ error: "Guru not found" });
      return;
    }

    if (guru.creatorId !== req.dbUserId) {
      res.status(403).json({ error: "Only the guru creator can view distribution history" });
      return;
    }

    const distributions = await db
      .select()
      .from(rewardDistributionsTable)
      .where(eq(rewardDistributionsTable.guruId, guruId))
      .orderBy(desc(rewardDistributionsTable.createdAt));

    res.json({
      distributions: distributions.map((d) => ({
        id: d.id,
        tokenAddress: d.tokenAddress,
        tokenSymbol: d.tokenSymbol,
        chain: d.chain,
        totalAmount: d.totalAmount,
        recipientCount: d.recipientCount,
        status: d.status,
        transactionHashes: d.transactionHashes ? JSON.parse(d.transactionHashes) : [],
        errorMessage: d.errorMessage,
        createdAt: d.createdAt,
        completedAt: d.completedAt,
      })),
    });
  } catch (err) {
    console.error("Distribution history error:", err);
    res.status(500).json({ error: "Failed to fetch distribution history" });
  }
});

router.get("/portfolio", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.dbUserRole !== "admin" && req.dbUserRole !== "creator") {
      res.status(403).json({ error: "Only creators and admins can view the platform portfolio" });
      return;
    }

    const tokens = await getPortfolio();
    res.json({ tokens });
  } catch (err) {
    console.error("Portfolio error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch portfolio";
    res.status(500).json({ error: message });
  }
});

export default router;

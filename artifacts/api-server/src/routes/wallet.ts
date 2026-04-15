import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { gurusTable, guruWalletsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import {
  generateWallet,
  encryptPrivateKey,
  decryptPrivateKey,
  splitKeyShares,
  signTransaction,
  getOnChainBalances,
  broadcastTransaction,
  getEthPriceUsd,
  fetchTxParams,
} from "../lib/walletCrypto";

const router: IRouter = Router();

router.post("/gurus/:guruId/wallet", requireAuth, async (req: AuthRequest, res) => {
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
      res.status(403).json({ error: "Only the guru creator can create a wallet" });
      return;
    }

    const [existing] = await db
      .select()
      .from(guruWalletsTable)
      .where(eq(guruWalletsTable.guruId, guruId))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "Wallet already exists for this guru" });
      return;
    }

    const { address, privateKey } = await generateWallet();

    const encryptedKey = await encryptPrivateKey(privateKey);

    const shares = splitKeyShares(privateKey);
    const serverShare = shares[0];
    const creatorShare = shares[1];

    await db.insert(guruWalletsTable).values({
      guruId,
      walletAddress: address,
      encryptedPrivateKey: encryptedKey,
      serverRecoveryShare: serverShare,
    });

    res.status(201).json({
      walletAddress: address,
      recoveryShare: creatorShare,
    });
  } catch (err) {
    console.error("Wallet creation error:", err);
    const message = err instanceof Error ? err.message : "Failed to create wallet";
    res.status(500).json({ error: message });
  }
});

router.get("/gurus/:guruId/wallet", requireAuth, async (req: AuthRequest, res) => {
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
      res.status(403).json({ error: "Only the guru creator can view wallet details" });
      return;
    }

    const [wallet] = await db
      .select()
      .from(guruWalletsTable)
      .where(eq(guruWalletsTable.guruId, guruId))
      .limit(1);

    if (!wallet) {
      res.status(404).json({ error: "No wallet found for this guru" });
      return;
    }

    let balances = { ethBalance: "0" };
    try {
      balances = await getOnChainBalances(wallet.walletAddress);
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }

    res.json({
      walletAddress: wallet.walletAddress,
      ethBalance: balances.ethBalance,
      perTxLimitUsd: wallet.perTxLimitUsd,
      dailyLimitUsd: wallet.dailyLimitUsd,
      dailySpentUsd: wallet.dailySpentUsd,
      createdAt: wallet.createdAt,
    });
  } catch (err) {
    console.error("Wallet fetch error:", err);
    res.status(500).json({ error: "Failed to fetch wallet info" });
  }
});

router.put("/gurus/:guruId/wallet/limits", requireAuth, async (req: AuthRequest, res) => {
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
      res.status(403).json({ error: "Only the guru creator can update spending limits" });
      return;
    }

    const { perTxLimitUsd, dailyLimitUsd } = req.body;

    if (perTxLimitUsd !== undefined && (typeof perTxLimitUsd !== "number" || perTxLimitUsd < 0)) {
      res.status(400).json({ error: "perTxLimitUsd must be a non-negative number" });
      return;
    }

    if (dailyLimitUsd !== undefined && (typeof dailyLimitUsd !== "number" || dailyLimitUsd < 0)) {
      res.status(400).json({ error: "dailyLimitUsd must be a non-negative number" });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (perTxLimitUsd !== undefined) updates.perTxLimitUsd = perTxLimitUsd;
    if (dailyLimitUsd !== undefined) updates.dailyLimitUsd = dailyLimitUsd;

    const [updated] = await db
      .update(guruWalletsTable)
      .set(updates)
      .where(eq(guruWalletsTable.guruId, guruId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "No wallet found for this guru" });
      return;
    }

    res.json({
      perTxLimitUsd: updated.perTxLimitUsd,
      dailyLimitUsd: updated.dailyLimitUsd,
    });
  } catch (err) {
    console.error("Wallet limits update error:", err);
    res.status(500).json({ error: "Failed to update spending limits" });
  }
});

async function rollbackDailySpend(guruId: number, usdValue: number): Promise<void> {
  try {
    await db
      .update(guruWalletsTable)
      .set({
        dailySpentUsd: sql`GREATEST(${guruWalletsTable.dailySpentUsd} - ${usdValue}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(guruWalletsTable.guruId, guruId));
  } catch (err) {
    console.error("Failed to rollback daily spend:", err);
  }
}

router.post("/gurus/:guruId/wallet/sign", requireAuth, async (req: AuthRequest, res) => {
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
      res.status(403).json({ error: "Only the guru creator can sign transactions" });
      return;
    }

    const [wallet] = await db
      .select()
      .from(guruWalletsTable)
      .where(eq(guruWalletsTable.guruId, guruId))
      .limit(1);

    if (!wallet) {
      res.status(404).json({ error: "No wallet found for this guru" });
      return;
    }

    const { to, value, data: txData } = req.body;

    if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
      res.status(400).json({ error: "Valid 'to' address is required" });
      return;
    }

    const hasCallData = txData && txData !== "0x" && txData.length > 2;
    if (hasCallData) {
      res.status(400).json({
        error: "Contract calls with arbitrary data are not supported. Only native ETH transfers are allowed.",
      });
      return;
    }

    const valueStr = value || "0";
    if (!/^\d+$/.test(valueStr)) {
      res.status(400).json({ error: "Value must be a non-negative integer string (wei)" });
      return;
    }
    if (valueStr.length > 30) {
      res.status(400).json({ error: "Value exceeds maximum allowed range" });
      return;
    }

    const txValueWei = BigInt(valueStr);
    const txValueEth = parseFloat((Number(txValueWei) / 1e18).toFixed(18));

    const ethPrice = await getEthPriceUsd();
    if (ethPrice <= 0) {
      res.status(503).json({ error: "Unable to fetch ETH price for spending limit check. Try again later." });
      return;
    }
    const usdValue = txValueEth * ethPrice;

    if (usdValue > wallet.perTxLimitUsd) {
      res.status(403).json({
        error: `Transaction value ~$${usdValue.toFixed(2)} exceeds per-transaction limit of $${wallet.perTxLimitUsd}`,
      });
      return;
    }

    const reserveResult = await db
      .update(guruWalletsTable)
      .set({
        dailySpentUsd: sql`CASE
          WHEN DATE(${guruWalletsTable.dailySpentResetAt}) != CURRENT_DATE
          THEN ${usdValue}
          ELSE ${guruWalletsTable.dailySpentUsd} + ${usdValue}
        END`,
        dailySpentResetAt: sql`CASE
          WHEN DATE(${guruWalletsTable.dailySpentResetAt}) != CURRENT_DATE
          THEN NOW()
          ELSE ${guruWalletsTable.dailySpentResetAt}
        END`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(guruWalletsTable.guruId, guruId),
          sql`CASE
            WHEN DATE(${guruWalletsTable.dailySpentResetAt}) != CURRENT_DATE
            THEN ${usdValue} <= ${guruWalletsTable.dailyLimitUsd}
            ELSE ${guruWalletsTable.dailySpentUsd} + ${usdValue} <= ${guruWalletsTable.dailyLimitUsd}
          END`,
        ),
      )
      .returning();

    if (reserveResult.length === 0) {
      res.status(403).json({
        error: `Transaction would exceed daily spending limit of $${wallet.dailyLimitUsd}`,
      });
      return;
    }

    let privateKey: string;
    try {
      privateKey = await decryptPrivateKey(wallet.encryptedPrivateKey);
    } catch {
      await rollbackDailySpend(guruId, usdValue);
      res.status(500).json({ error: "Failed to decrypt wallet key" });
      return;
    }

    let nonce: number;
    let gasEstimate: string;
    let feeData: { maxFeePerGas: string; maxPriorityFeePerGas: string };
    try {
      [nonce, gasEstimate, feeData] = await fetchTxParams(wallet.walletAddress, to, value || "0");
    } catch (err) {
      await rollbackDailySpend(guruId, usdValue);
      res.status(503).json({
        error: `Failed to fetch on-chain tx params: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
      return;
    }

    let signedTx: string;
    try {
      signedTx = await signTransaction(privateKey, {
        to,
        value: value || "0",
        data: "0x",
        chainId: 8453,
        nonce,
        gasLimit: gasEstimate,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });
    } catch (err) {
      privateKey = "";
      await rollbackDailySpend(guruId, usdValue);
      res.status(500).json({ error: "Failed to sign transaction" });
      return;
    } finally {
      privateKey = "";
    }

    let transactionHash = "";
    try {
      transactionHash = await broadcastTransaction(signedTx);
    } catch (err) {
      await rollbackDailySpend(guruId, usdValue);
      res.status(500).json({
        error: `Transaction signed but broadcast failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        signedTransaction: signedTx,
      });
      return;
    }

    res.json({ transactionHash, signedTransaction: signedTx });
  } catch (err) {
    console.error("Transaction signing error:", err);
    res.status(500).json({ error: "Failed to sign transaction" });
  }
});

export default router;

import { db } from "@workspace/db";
import { usageLogsTable } from "@workspace/db/schema";

interface UsageEntry {
  guruId: number;
  userId?: number | null;
  conversationId?: number | null;
  callType: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs?: number | null;
}

const COST_PER_1K_INPUT: Record<string, number> = {
  "gpt-4o-mini": 0.015,
  "gpt-5.2": 0.25,
  "gpt-5.4": 0.25,
  "gpt-5-mini": 0.04,
  "grok-3": 0.3,
  "grok-3-mini": 0.03,
  "grok-4.20-0309-reasoning": 0.2,
  "grok-4-1-fast-non-reasoning": 0.02,
};

const COST_PER_1K_OUTPUT: Record<string, number> = {
  "gpt-4o-mini": 0.06,
  "gpt-5.2": 1.0,
  "gpt-5.4": 1.0,
  "gpt-5-mini": 0.16,
  "grok-3": 1.0,
  "grok-3-mini": 0.1,
  "grok-4.20-0309-reasoning": 0.6,
  "grok-4-1-fast-non-reasoning": 0.05,
};

function estimateCostCents(model: string, promptTokens: number, completionTokens: number): number {
  const inputRate = COST_PER_1K_INPUT[model] ?? 0.015;
  const outputRate = COST_PER_1K_OUTPUT[model] ?? 0.06;
  const costDollars = (promptTokens / 1000) * inputRate + (completionTokens / 1000) * outputRate;
  return Math.round(costDollars * 100);
}

export async function logUsage(entry: UsageEntry): Promise<void> {
  try {
    await db.insert(usageLogsTable).values({
      guruId: entry.guruId,
      userId: entry.userId ?? null,
      conversationId: entry.conversationId ?? null,
      callType: entry.callType,
      model: entry.model,
      promptTokens: entry.promptTokens,
      completionTokens: entry.completionTokens,
      totalTokens: entry.totalTokens,
      estimatedCostCents: estimateCostCents(entry.model, entry.promptTokens, entry.completionTokens),
      latencyMs: entry.latencyMs ?? null,
    });
  } catch (err) {
    console.error("Usage logging error:", err);
  }
}

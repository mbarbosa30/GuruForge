import { openai } from "@workspace/integrations-openai-ai-server";
import type OpenAI from "openai";

export type ModelProvider = "gpt" | "grok";

export interface ModelConfig {
  provider: ModelProvider;
  conversationModel: string;
  fastModel: string;
  client: OpenAI;
}

interface ProviderTierConfig {
  provider: ModelProvider;
  conversationModel: string;
  fastModel: string;
}

const GPT_TIERS: Record<string, ProviderTierConfig> = {
  basic: { provider: "gpt", conversationModel: "gpt-4o-mini", fastModel: "gpt-4o-mini" },
  pro: { provider: "gpt", conversationModel: "gpt-5.2", fastModel: "gpt-4o-mini" },
  enterprise: { provider: "gpt", conversationModel: "gpt-5.2", fastModel: "gpt-4o-mini" },
};

const GROK_TIERS: Record<string, ProviderTierConfig> = {
  grok_basic: { provider: "grok", conversationModel: "grok-2", fastModel: "grok-2-mini" },
  grok_pro: { provider: "grok", conversationModel: "grok-3", fastModel: "grok-2-mini" },
};

let grokClient: OpenAI | null = null;

export function registerGrokClient(client: OpenAI): void {
  grokClient = client;
}

function getProviderClient(provider: ModelProvider): OpenAI {
  if (provider === "grok") {
    if (grokClient) return grokClient;
    console.warn(
      "Grok provider client not yet registered; falling back to GPT. " +
      "Register via registerGrokClient() when Grok integration is configured.",
    );
    return openai;
  }
  return openai;
}

export function getModelConfig(modelTier: string | null): ModelConfig {
  const tier = modelTier ?? "basic";

  const grokConfig = GROK_TIERS[tier];
  if (grokConfig) {
    const client = getProviderClient("grok");
    if (!grokClient) {
      const fallback = GPT_TIERS.basic;
      return { ...fallback, client };
    }
    return { ...grokConfig, client };
  }

  const gptConfig = GPT_TIERS[tier] ?? GPT_TIERS.basic;
  return { ...gptConfig, client: openai };
}

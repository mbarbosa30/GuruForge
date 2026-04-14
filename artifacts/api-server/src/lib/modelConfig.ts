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

function getProviderClient(provider: ModelProvider): OpenAI {
  if (provider === "grok") {
    throw new Error(
      "Grok provider client not yet configured. " +
      "Task #11 (Branded model selector) will register the Grok client. " +
      "Assign a GPT-based model tier to this Guru until Grok support is enabled.",
    );
  }
  return openai;
}

export function getModelConfig(modelTier: string | null): ModelConfig {
  const tier = modelTier ?? "basic";

  const config = GPT_TIERS[tier] ?? GROK_TIERS[tier] ?? GPT_TIERS.basic;
  const client = getProviderClient(config.provider);

  return { ...config, client };
}

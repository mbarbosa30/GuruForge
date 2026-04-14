import { openai } from "@workspace/integrations-openai-ai-server";
import { getXaiClient } from "@workspace/integrations-xai-server";
import type OpenAI from "openai";

export type ModelProvider = "gpt" | "grok";

export interface ModelConfig {
  provider: ModelProvider;
  conversationModel: string;
  fastModel: string;
  client: OpenAI;
}

const PROVIDER_MODELS: Record<ModelProvider, { conversationModel: string; fastModel: string }> = {
  gpt: { conversationModel: "gpt-5.4", fastModel: "gpt-5-mini" },
  grok: { conversationModel: "grok-3", fastModel: "grok-3-mini" },
};

export function getModelConfig(modelTier: string | null): ModelConfig {
  const tier = (modelTier ?? "gpt") as ModelProvider;

  if (tier === "grok") {
    const xaiClient = getXaiClient();
    if (!xaiClient) {
      throw new Error(
        "This Guru uses Grok but the xAI API key is not configured. " +
        "Set the XAI_API_KEY environment variable to enable Grok-powered conversations.",
      );
    }
    return { provider: "grok", ...PROVIDER_MODELS.grok, client: xaiClient };
  }

  return { provider: "gpt", ...PROVIDER_MODELS.gpt, client: openai };
}

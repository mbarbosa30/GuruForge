import { openai } from "@workspace/integrations-openai-ai-server";

export type ModelProvider = "gpt" | "grok";

export interface ModelConfig {
  provider: ModelProvider;
  conversationModel: string;
  fastModel: string;
  client: typeof openai;
}

export function getModelConfig(modelTier: string | null): ModelConfig {
  const tier = modelTier ?? "basic";

  const providerConfigs: Record<string, { provider: ModelProvider; conversationModel: string; fastModel: string }> = {
    basic: { provider: "gpt", conversationModel: "gpt-4o-mini", fastModel: "gpt-4o-mini" },
    pro: { provider: "gpt", conversationModel: "gpt-5.2", fastModel: "gpt-4o-mini" },
    enterprise: { provider: "gpt", conversationModel: "gpt-5.2", fastModel: "gpt-4o-mini" },
    grok_basic: { provider: "grok", conversationModel: "gpt-4o-mini", fastModel: "gpt-4o-mini" },
    grok_pro: { provider: "grok", conversationModel: "gpt-5.2", fastModel: "gpt-4o-mini" },
  };

  const config = providerConfigs[tier] ?? providerConfigs.basic;

  return {
    ...config,
    client: openai,
  };
}

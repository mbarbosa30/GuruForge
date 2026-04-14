import { openai } from "@workspace/integrations-openai-ai-server";

export interface ModelConfig {
  conversationModel: string;
  fastModel: string;
  client: typeof openai;
}

export function getModelConfig(modelTier: string | null): ModelConfig {
  const tier = modelTier ?? "basic";

  const configs: Record<string, { conversationModel: string; fastModel: string }> = {
    basic: { conversationModel: "gpt-4o-mini", fastModel: "gpt-4o-mini" },
    pro: { conversationModel: "gpt-5.2", fastModel: "gpt-4o-mini" },
    enterprise: { conversationModel: "gpt-5.2", fastModel: "gpt-4o-mini" },
  };

  const config = configs[tier] ?? configs.basic;
  return { ...config, client: openai };
}

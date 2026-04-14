import { getModelConfig } from "./modelConfig";
import { logUsage } from "./usageLogger";

export interface TriageResult {
  intent: string;
  urgency: "low" | "medium" | "high";
  memoryTiers: ("tier1" | "tier2" | "tier3")[];
  outOfDomain: boolean;
  specialFlags: string[];
}

const DEFAULT_TRIAGE: TriageResult = {
  intent: "general_question",
  urgency: "medium",
  memoryTiers: ["tier1", "tier2", "tier3"],
  outOfDomain: false,
  specialFlags: [],
};

export async function runTriage(
  guruId: number,
  userId: number,
  conversationId: number,
  modelTier: string | null,
  userMessage: string,
  recentContext: string,
  guruTopics: string[] | null,
): Promise<TriageResult> {
  try {
    const { fastModel, client } = getModelConfig(modelTier);

    const topicList = guruTopics?.length ? guruTopics.join(", ") : "general";

    const prompt = `Classify this user message for an AI Guru specializing in: ${topicList}.

User message: "${userMessage}"

Recent conversation context (last few exchanges):
${recentContext || "(no prior context)"}

Return a JSON object with:
- "intent": one of "greeting", "general_question", "deep_analysis", "follow_up", "feedback", "off_topic", "personal_update"
- "urgency": "low", "medium", or "high"
- "memoryTiers": array of which tiers to query: "tier1" (recent chat), "tier2" (personal memory), "tier3" (collective wisdom). Always include "tier1".
- "outOfDomain": boolean, true if the question is clearly outside the guru's expertise
- "specialFlags": array of strings for special handling (e.g. "needs_empathy", "actionable_advice", "reference_previous")

Respond ONLY with valid JSON, no other text.`;

    const completion = await client.chat.completions.create({
      model: fastModel,
      max_completion_tokens: 256,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "{}";

    await logUsage({
      guruId,
      userId,
      conversationId,
      callType: "triage",
      model: fastModel,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
    });

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const parsed = JSON.parse(cleaned);

    const validIntents = ["greeting", "general_question", "deep_analysis", "follow_up", "feedback", "off_topic", "personal_update"];
    const validUrgencies = ["low", "medium", "high"];

    return {
      intent: validIntents.includes(parsed.intent) ? parsed.intent : "general_question",
      urgency: validUrgencies.includes(parsed.urgency) ? parsed.urgency : "medium",
      memoryTiers: Array.isArray(parsed.memoryTiers)
        ? [...new Set(["tier1", ...parsed.memoryTiers.filter((t: string) => ["tier1", "tier2", "tier3"].includes(t))])]
        : ["tier1", "tier2", "tier3"],
      outOfDomain: parsed.outOfDomain === true,
      specialFlags: Array.isArray(parsed.specialFlags) ? parsed.specialFlags : [],
    };
  } catch (err) {
    console.error("Triage pipeline error, using defaults:", err);
    return DEFAULT_TRIAGE;
  }
}

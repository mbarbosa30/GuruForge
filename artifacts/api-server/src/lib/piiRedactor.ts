import { openai } from "@workspace/integrations-openai-ai-server";

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const CREDIT_CARD_REGEX = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
const IP_ADDRESS_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
const AT_HANDLE_REGEX = /@[a-zA-Z0-9_]{2,32}/g;
const DOB_REGEX = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g;
const US_ADDRESS_REGEX = /\b\d{1,5}\s+[A-Z][a-zA-Z\s]{2,30}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Road|Rd|Court|Ct|Way|Place|Pl|Circle|Cir)\.?\b/gi;
const ZIPCODE_REGEX = /\b\d{5}(?:-\d{4})?\b/g;

export interface RedactionResult {
  redacted: string;
  redactionCount: number;
  redactedTypes: string[];
}

export function redactPIIRegex(text: string): RedactionResult {
  let redacted = text;
  let redactionCount = 0;
  const redactedTypes: string[] = [];

  const patterns: Array<{ regex: RegExp; label: string; replacement: string }> = [
    { regex: EMAIL_REGEX, label: "email", replacement: "[EMAIL]" },
    { regex: SSN_REGEX, label: "ssn", replacement: "[SSN]" },
    { regex: CREDIT_CARD_REGEX, label: "credit_card", replacement: "[CARD]" },
    { regex: URL_REGEX, label: "url", replacement: "[URL]" },
    { regex: PHONE_REGEX, label: "phone", replacement: "[PHONE]" },
    { regex: IP_ADDRESS_REGEX, label: "ip_address", replacement: "[IP]" },
    { regex: AT_HANDLE_REGEX, label: "handle", replacement: "[HANDLE]" },
    { regex: DOB_REGEX, label: "date", replacement: "[DATE]" },
    { regex: US_ADDRESS_REGEX, label: "address", replacement: "[ADDRESS]" },
    { regex: ZIPCODE_REGEX, label: "zipcode", replacement: "[ZIP]" },
  ];

  for (const { regex, label, replacement } of patterns) {
    const matches = redacted.match(regex);
    if (matches && matches.length > 0) {
      redactionCount += matches.length;
      if (!redactedTypes.includes(label)) {
        redactedTypes.push(label);
      }
      redacted = redacted.replace(regex, replacement);
    }
  }

  return { redacted, redactionCount, redactedTypes };
}

export async function redactPIIWithLLM(text: string): Promise<RedactionResult> {
  const regexResult = redactPIIRegex(text);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are a PII redaction specialist. Given text that has already had some PII removed (marked with [EMAIL], [PHONE], etc.), identify and redact any remaining personally identifiable information that regex missed:
- Person names → [NAME]
- Company/organization names → [ORG]
- Physical addresses not yet caught → [ADDRESS]
- Any other identifying information → [REDACTED]

Return ONLY the redacted text with no explanation. If no additional PII is found, return the text unchanged.`,
        },
        { role: "user", content: regexResult.redacted },
      ],
    });

    const llmRedacted = completion.choices[0]?.message?.content?.trim() ?? regexResult.redacted;

    let llmRedactionCount = 0;
    const llmTypes: string[] = [];
    const llmPatterns = [
      { tag: "[NAME]", label: "name" },
      { tag: "[ORG]", label: "organization" },
      { tag: "[ADDRESS]", label: "address" },
      { tag: "[REDACTED]", label: "contextual" },
    ];

    for (const { tag, label } of llmPatterns) {
      const count = (llmRedacted.match(new RegExp(tag.replace(/[[\]]/g, "\\$&"), "g")) || []).length;
      const origCount = (regexResult.redacted.match(new RegExp(tag.replace(/[[\]]/g, "\\$&"), "g")) || []).length;
      const newCount = count - origCount;
      if (newCount > 0) {
        llmRedactionCount += newCount;
        if (!llmTypes.includes(label)) llmTypes.push(label);
      }
    }

    return {
      redacted: llmRedacted,
      redactionCount: regexResult.redactionCount + llmRedactionCount,
      redactedTypes: [...regexResult.redactedTypes, ...llmTypes],
    };
  } catch (err) {
    console.error("LLM PII redaction failed, using regex-only result:", err);
    return regexResult;
  }
}

export function logRedaction(context: string, result: RedactionResult): void {
  if (result.redactionCount > 0) {
    console.info(
      `[PII-REDACTION] context=${context} count=${result.redactionCount} types=${result.redactedTypes.join(",")}`,
    );
  }
}

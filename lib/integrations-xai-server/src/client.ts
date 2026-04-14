import OpenAI from "openai";

const XAI_BASE_URL = process.env.XAI_BASE_URL || "https://api.x.ai/v1";

let _xai: OpenAI | null = null;

export function getXaiClient(): OpenAI | null {
  if (_xai) return _xai;

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  _xai = new OpenAI({ apiKey, baseURL: XAI_BASE_URL });
  return _xai;
}

export function isXaiConfigured(): boolean {
  return !!process.env.XAI_API_KEY;
}

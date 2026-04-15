const BANKR_BASE = "https://api.bankr.bot";

function getApiKey(): string {
  const key = process.env.BANKR_API_KEY;
  if (!key) throw new Error("BANKR_API_KEY is not configured");
  return key;
}

async function bankrFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${BANKR_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bankr API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export interface TokenDeployResult {
  tokenAddress: string;
  transactionHash?: string;
  chain: string;
  name: string;
  symbol: string;
}

function sanitizeTokenInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
}

export function validateTokenName(name: string): string | null {
  if (!name || name.length < 2) return "Token name must be at least 2 characters";
  if (name.length > 64) return "Token name must be 64 characters or fewer";
  if (!/^[a-zA-Z0-9 _-]+$/.test(name)) return "Token name can only contain letters, numbers, spaces, hyphens, and underscores";
  return null;
}

export function validateTokenSymbol(symbol: string): string | null {
  if (!symbol || symbol.length < 1) return "Token symbol is required";
  if (symbol.length > 10) return "Token symbol must be 10 characters or fewer";
  if (!/^[A-Z0-9]+$/.test(symbol)) return "Token symbol can only contain uppercase letters and numbers";
  return null;
}

export async function deployToken(opts: {
  name: string;
  symbol: string;
}): Promise<TokenDeployResult> {
  const safeName = sanitizeTokenInput(opts.name);
  const safeSymbol = sanitizeTokenInput(opts.symbol).toUpperCase();

  const nameErr = validateTokenName(safeName);
  if (nameErr) throw new Error(nameErr);
  const symErr = validateTokenSymbol(safeSymbol);
  if (symErr) throw new Error(symErr);

  const result = await bankrFetch<TokenDeployResult>("/agent/prompt", {
    method: "POST",
    body: {
      prompt: `Deploy a token called "${safeName}" with symbol "${safeSymbol}" on Base via Clanker`,
    },
  });
  return result;
}

export interface TransferResult {
  transactionHash: string;
  status: string;
}

export async function transferTokens(opts: {
  tokenAddress: string;
  recipients: Array<{ walletAddress: string; amount: string }>;
}): Promise<TransferResult[]> {
  const results: TransferResult[] = [];
  for (const r of opts.recipients) {
    const result = await bankrFetch<TransferResult>("/wallet/transfer", {
      method: "POST",
      body: {
        tokenAddress: opts.tokenAddress,
        to: r.walletAddress,
        amount: r.amount,
      },
    });
    results.push(result);
  }
  return results;
}

export interface PortfolioItem {
  tokenAddress: string;
  symbol: string;
  name: string;
  balance: string;
  chain: string;
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  const result = await bankrFetch<{ tokens: PortfolioItem[] }>("/wallet/portfolio");
  return result.tokens ?? [];
}

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

function parseDeployResponse(raw: unknown, expectedName: string, expectedSymbol: string): TokenDeployResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Bankr deployment returned an invalid response");
  }

  const obj = raw as Record<string, unknown>;

  const tokenAddress = typeof obj.tokenAddress === "string" ? obj.tokenAddress.trim() : "";
  if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    throw new Error(`Bankr deployment returned invalid token address: ${tokenAddress || "(empty)"}`);
  }

  const chain = typeof obj.chain === "string" && obj.chain.trim() ? obj.chain.trim() : "base";

  const name = typeof obj.name === "string" && obj.name.trim() ? obj.name.trim() : expectedName;
  const symbol = typeof obj.symbol === "string" && obj.symbol.trim() ? obj.symbol.trim().toUpperCase() : expectedSymbol;

  const transactionHash = typeof obj.transactionHash === "string" && /^0x[a-fA-F0-9]{64}$/.test(obj.transactionHash)
    ? obj.transactionHash
    : undefined;

  return { tokenAddress, transactionHash, chain, name, symbol };
}

export async function deployToken(opts: {
  name: string;
  symbol: string;
  feeRecipient?: string;
}): Promise<TokenDeployResult> {
  const safeName = sanitizeTokenInput(opts.name);
  const safeSymbol = sanitizeTokenInput(opts.symbol).toUpperCase();

  const nameErr = validateTokenName(safeName);
  if (nameErr) throw new Error(nameErr);
  const symErr = validateTokenSymbol(safeSymbol);
  if (symErr) throw new Error(symErr);

  const feeRecipientClause = opts.feeRecipient
    ? ` with fee recipient ${opts.feeRecipient}`
    : "";

  const raw = await bankrFetch<unknown>("/agent/prompt", {
    method: "POST",
    body: {
      prompt: `Deploy a token called "${safeName}" with symbol "${safeSymbol}" on Base via Clanker${feeRecipientClause}`,
    },
  });

  return parseDeployResponse(raw, safeName, safeSymbol);
}

export interface TransferResult {
  transactionHash: string;
  status: string;
}

export interface RecipientTransferOutcome {
  walletAddress: string;
  amount: string;
  transactionHash: string | null;
  status: "success" | "failed";
  error?: string;
}

export interface BatchTransferResult {
  outcomes: RecipientTransferOutcome[];
  successCount: number;
  failCount: number;
}

export async function transferTokens(opts: {
  tokenAddress: string;
  recipients: Array<{ walletAddress: string; amount: string }>;
}): Promise<BatchTransferResult> {
  const outcomes: RecipientTransferOutcome[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const r of opts.recipients) {
    try {
      const result = await bankrFetch<TransferResult>("/wallet/transfer", {
        method: "POST",
        body: {
          tokenAddress: opts.tokenAddress,
          to: r.walletAddress,
          amount: r.amount,
        },
      });
      outcomes.push({
        walletAddress: r.walletAddress,
        amount: r.amount,
        transactionHash: result.transactionHash || null,
        status: "success",
      });
      successCount++;
    } catch (err) {
      outcomes.push({
        walletAddress: r.walletAddress,
        amount: r.amount,
        transactionHash: null,
        status: "failed",
        error: err instanceof Error ? err.message : "Transfer failed",
      });
      failCount++;
    }
  }

  return { outcomes, successCount, failCount };
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

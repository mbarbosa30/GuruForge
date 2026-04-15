import crypto from "crypto";
import { ethers } from "ethers";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 32;
const IV_LENGTH = 12;

function getEncryptionSecret(): string {
  const secret = process.env.WALLET_ENCRYPTION_SECRET;
  if (!secret) throw new Error("WALLET_ENCRYPTION_SECRET is not configured");
  if (secret.length < 32) throw new Error("WALLET_ENCRYPTION_SECRET must be at least 32 characters");
  return secret;
}

function deriveKey(salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      getEncryptionSecret(),
      salt,
      KEY_LENGTH,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, key) => {
        if (err) reject(err);
        else resolve(key);
      },
    );
  });
}

export interface GeneratedWallet {
  address: string;
  encryptedPrivateKey: string;
}

export async function generateWallet(): Promise<{ address: string; privateKey: string }> {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export async function encryptPrivateKey(privateKey: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await deriveKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    salt.toString("hex"),
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export async function decryptPrivateKey(blob: string): Promise<string> {
  const parts = blob.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted key format");
  }

  const [saltHex, ivHex, tagHex, ciphertextHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const key = await deriveKey(salt);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

const GF256_EXP = new Uint8Array(256);
const GF256_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x = x ^ (x << 1) ^ (x & 0x80 ? 0x1b : 0);
    x &= 0xff;
  }
  GF256_EXP[255] = GF256_EXP[0];
})();

function gf256Mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[(GF256_LOG[a] + GF256_LOG[b]) % 255];
}

function gf256Inv(a: number): number {
  if (a === 0) throw new Error("Cannot invert zero in GF(256)");
  return GF256_EXP[255 - GF256_LOG[a]];
}

function gf256Eval(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    result = gf256Mul(result, x) ^ coeffs[i];
  }
  return result;
}

export function splitKeyShares(privateKey: string): string[] {
  const keyBytes = Buffer.from(privateKey.replace(/^0x/, ""), "hex");

  const share1 = Buffer.alloc(keyBytes.length);
  const share2 = Buffer.alloc(keyBytes.length);

  for (let i = 0; i < keyBytes.length; i++) {
    const a0 = keyBytes[i];
    const a1 = crypto.randomBytes(1)[0];
    share1[i] = gf256Eval([a0, a1], 1);
    share2[i] = gf256Eval([a0, a1], 2);
  }

  return [
    `1:${share1.toString("hex")}`,
    `2:${share2.toString("hex")}`,
  ];
}

export function combineShares(shares: string[]): string {
  if (shares.length !== 2) {
    throw new Error("Exactly 2 shares required for 2-of-2 recovery");
  }

  const parsed = shares.map((s) => {
    const colonIdx = s.indexOf(":");
    if (colonIdx === -1) throw new Error("Invalid share format");
    return {
      index: parseInt(s.substring(0, colonIdx), 10),
      data: Buffer.from(s.substring(colonIdx + 1), "hex"),
    };
  });

  if (parsed[0].data.length !== parsed[1].data.length) {
    throw new Error("Share length mismatch");
  }

  const x1 = parsed[0].index;
  const x2 = parsed[1].index;

  const result = Buffer.alloc(parsed[0].data.length);
  for (let i = 0; i < result.length; i++) {
    const y1 = parsed[0].data[i];
    const y2 = parsed[1].data[i];
    const l1 = gf256Mul(x2, gf256Inv(x1 ^ x2));
    const l2 = gf256Mul(x1, gf256Inv(x2 ^ x1));
    result[i] = gf256Mul(y1, l1) ^ gf256Mul(y2, l2);
  }

  return `0x${result.toString("hex")}`;
}

export async function signTransaction(
  privateKey: string,
  txData: {
    to: string;
    value?: string;
    data?: string;
    chainId?: number;
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
  },
): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  const signedTx = await wallet.signTransaction({
    to: txData.to,
    value: txData.value ? BigInt(txData.value) : 0n,
    data: txData.data || "0x",
    chainId: txData.chainId || 8453,
    gasLimit: txData.gasLimit ? BigInt(txData.gasLimit) : undefined,
    maxFeePerGas: txData.maxFeePerGas ? BigInt(txData.maxFeePerGas) : undefined,
    maxPriorityFeePerGas: txData.maxPriorityFeePerGas ? BigInt(txData.maxPriorityFeePerGas) : undefined,
    nonce: txData.nonce,
    type: 2,
  });
  return signedTx;
}

const BASE_RPC = "https://mainnet.base.org";

export async function getOnChainBalances(address: string): Promise<{
  ethBalance: string;
}> {
  const response = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1,
    }),
  });

  const result = (await response.json()) as { result?: string; error?: { message: string } };
  if (result.error) {
    throw new Error(`RPC error: ${result.error.message}`);
  }

  const balanceWei = BigInt(result.result || "0x0");
  const ethBalance = ethers.formatEther(balanceWei);

  return { ethBalance };
}

export async function getEthPriceUsd(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    );
    const data = (await response.json()) as { ethereum?: { usd?: number } };
    return data?.ethereum?.usd ?? 0;
  } catch {
    return 0;
  }
}

async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  const result = (await response.json()) as { result?: unknown; error?: { message: string } };
  if (result.error) throw new Error(`RPC error (${method}): ${result.error.message}`);
  return result.result;
}

export async function fetchTxParams(
  from: string,
  to: string,
  value: string,
): Promise<[number, string, { maxFeePerGas: string; maxPriorityFeePerGas: string }]> {
  const valueHex = "0x" + BigInt(value).toString(16);

  const [nonceHex, gasEstimateHex, baseFeeBlock, priorityFeeHex] = await Promise.all([
    rpcCall("eth_getTransactionCount", [from, "latest"]) as Promise<string>,
    rpcCall("eth_estimateGas", [{ from, to, value: valueHex, data: "0x" }]) as Promise<string>,
    rpcCall("eth_getBlockByNumber", ["latest", false]) as Promise<{ baseFeePerGas?: string }>,
    rpcCall("eth_maxPriorityFeePerGas", []) as Promise<string>,
  ]);

  const nonce = Number(nonceHex);

  const gasWithBuffer = (BigInt(gasEstimateHex) * 120n) / 100n;

  const baseFee = BigInt(baseFeeBlock?.baseFeePerGas || "0x0");
  const priorityFee = BigInt(priorityFeeHex || "0x0");
  const maxFeePerGas = (baseFee * 2n) + priorityFee;

  return [
    nonce,
    gasWithBuffer.toString(),
    {
      maxFeePerGas: maxFeePerGas.toString(),
      maxPriorityFeePerGas: priorityFee.toString(),
    },
  ];
}

export async function broadcastTransaction(signedTx: string): Promise<string> {
  const response = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: [signedTx],
      id: 1,
    }),
  });

  const result = (await response.json()) as { result?: string; error?: { message: string } };
  if (result.error) {
    throw new Error(`Broadcast error: ${result.error.message}`);
  }

  return result.result || "";
}

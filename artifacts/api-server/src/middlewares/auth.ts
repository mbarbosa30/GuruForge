import { Request, Response, NextFunction } from "express";
import { PrivyClient, User as PrivyUser } from "@privy-io/server-auth";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  privyId?: string;
  dbUserId?: number;
  dbUserRole?: string;
}

const appId = process.env.PRIVY_APP_ID;
const appSecret = process.env.PRIVY_APP_SECRET;

if (!appId || !appSecret) {
  throw new Error(
    "PRIVY_APP_ID and PRIVY_APP_SECRET environment variables are required",
  );
}

const privy = new PrivyClient(appId, appSecret);

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

interface PrivyProfile {
  name: string;
  email: string;
  walletAddress: string | null;
}

function extractProfileFromPrivyUser(user: PrivyUser): PrivyProfile {
  const name =
    user.google?.name ||
    user.twitter?.name ||
    user.discord?.username ||
    user.email?.address?.split("@")[0] ||
    "";

  const email =
    user.google?.email ||
    user.email?.address ||
    user.apple?.email ||
    user.discord?.email ||
    "unknown@example.com";

  const walletAddress =
    user.smartWallet?.address ||
    user.wallet?.address ||
    null;

  return { name, email, walletAddress };
}

async function fetchPrivyProfile(privyUserId: string): Promise<PrivyProfile> {
  const user = await privy.getUser(privyUserId);
  return extractProfileFromPrivyUser(user);
}

async function resolveOrCreateUser(privyUserId: string) {
  const [existingByPrivyId] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.privyId, privyUserId))
    .limit(1);

  if (existingByPrivyId) {
    const needsName = !existingByPrivyId.name || existingByPrivyId.name.trim() === "";
    const needsWallet = !existingByPrivyId.walletAddress;
    if (needsName || needsWallet) {
      try {
        const profile = await fetchPrivyProfile(privyUserId);
        const updates: Record<string, string> = {};
        if (needsName && profile.name.trim()) {
          updates.name = profile.name;
        }
        if (!existingByPrivyId.email || existingByPrivyId.email === "unknown@example.com") {
          updates.email = profile.email;
        }
        if (needsWallet && profile.walletAddress) {
          updates.walletAddress = profile.walletAddress;
        }
        if (Object.keys(updates).length > 0) {
          const [updated] = await db
            .update(usersTable)
            .set(updates)
            .where(eq(usersTable.id, existingByPrivyId.id))
            .returning();
          return updated;
        }
      } catch (err) {
        console.error("Failed to fetch Privy user profile:", err);
      }
    }
    return existingByPrivyId;
  }

  let profile: PrivyProfile = { name: "", email: "unknown@example.com", walletAddress: null };
  try {
    profile = await fetchPrivyProfile(privyUserId);
  } catch (err) {
    console.error("Failed to fetch Privy profile:", err);
  }

  if (profile.email && profile.email !== "unknown@example.com") {
    const [existingByEmail] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, profile.email))
      .limit(1);

    if (existingByEmail) {
      const updates: Record<string, string> = { privyId: privyUserId };
      if (profile.name.trim() && (!existingByEmail.name || existingByEmail.name.trim() === "")) {
        updates.name = profile.name;
      }
      if (profile.walletAddress) {
        updates.walletAddress = profile.walletAddress;
      }
      const [migrated] = await db
        .update(usersTable)
        .set(updates)
        .where(eq(usersTable.id, existingByEmail.id))
        .returning();
      return migrated;
    }
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      privyId: privyUserId,
      email: profile.email,
      name: profile.name.trim() || null,
      walletAddress: profile.walletAddress,
    })
    .returning();
  return created;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const claims = await privy.verifyAuthToken(token);
    const privyUserId = claims.userId;
    req.privyId = privyUserId;

    const user = await resolveOrCreateUser(privyUserId);
    req.dbUserId = user.id;
    req.dbUserRole = user.role;

    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const claims = await privy.verifyAuthToken(token);
      const privyUserId = claims.userId;
      req.privyId = privyUserId;

      const user = await resolveOrCreateUser(privyUserId);
      req.dbUserId = user.id;
      req.dbUserRole = user.role;
    }
  } catch {
  }
  next();
};

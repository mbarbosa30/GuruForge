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
}

function extractProfileFromPrivyUser(user: PrivyUser): PrivyProfile {
  const name =
    user.google?.name ||
    user.twitter?.name ||
    user.discord?.username ||
    "";

  const email =
    user.google?.email ||
    user.email?.address ||
    user.apple?.email ||
    user.discord?.email ||
    "unknown@example.com";

  return { name, email };
}

async function fetchPrivyProfile(privyUserId: string): Promise<PrivyProfile> {
  const user = await privy.getUser(privyUserId);
  return extractProfileFromPrivyUser(user);
}

async function resolveOrCreateUser(privyUserId: string) {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, privyUserId))
    .limit(1);

  if (existing) {
    if (!existing.name || existing.name.trim() === "") {
      try {
        const profile = await fetchPrivyProfile(privyUserId);
        if (profile.name.trim()) {
          const updates: Record<string, string> = { name: profile.name };
          if (!existing.email || existing.email === "unknown@example.com") {
            updates.email = profile.email;
          }
          const [updated] = await db
            .update(usersTable)
            .set(updates)
            .where(eq(usersTable.id, existing.id))
            .returning();
          return updated;
        }
      } catch (err) {
        console.error("Failed to fetch Privy user profile:", err);
      }
    }
    return existing;
  }

  let name: string | null = null;
  let email = "unknown@example.com";
  try {
    const profile = await fetchPrivyProfile(privyUserId);
    name = profile.name.trim() || null;
    email = profile.email;
  } catch (err) {
    console.error("Failed to fetch Privy profile for new user:", err);
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      clerkId: privyUserId,
      email,
      name,
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

import { Request, Response, NextFunction } from "express";
import { PrivyClient } from "@privy-io/server-auth";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  privyId?: string;
  clerkId?: string;
  dbUserId?: number;
  dbUserRole?: string;
}

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

interface PrivyProfile {
  name: string;
  email: string;
}

async function fetchPrivyProfile(privyUserId: string): Promise<PrivyProfile> {
  const user = await privy.getUser(privyUserId);

  const name =
    (user as any).google?.name ||
    (user as any).apple?.name ||
    (user as any).twitter?.name ||
    (user as any).discord?.name ||
    "";

  const email =
    (user as any).google?.email ||
    (user as any).email?.address ||
    (user as any).apple?.email ||
    "unknown@example.com";

  return { name, email };
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
    req.clerkId = privyUserId;

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
      req.clerkId = privyUserId;

      const user = await resolveOrCreateUser(privyUserId);
      req.dbUserId = user.id;
      req.dbUserRole = user.role;
    }
  } catch {
  }
  next();
};

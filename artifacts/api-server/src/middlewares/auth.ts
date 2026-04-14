import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  clerkId?: string;
  dbUserId?: number;
  dbUserRole?: string;
}

interface ClerkSessionClaims {
  userId?: string;
  email?: string;
  name?: string;
}

function extractClerkId(req: Request): string | null {
  const auth = getAuth(req);
  const clerkId = (auth?.sessionClaims as ClerkSessionClaims | undefined)?.userId || auth?.userId;
  if (clerkId && typeof clerkId === "string") {
    return clerkId;
  }
  return null;
}

function extractClerkClaims(req: Request): { email?: string; name?: string } {
  const auth = getAuth(req);
  const claims = auth?.sessionClaims as ClerkSessionClaims | undefined;
  return {
    email: typeof claims?.email === "string" ? claims.email : undefined,
    name: typeof claims?.name === "string" ? claims.name : undefined,
  };
}

async function resolveOrCreateUser(clerkId: string, claims: { email?: string; name?: string }) {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing) {
    return existing;
  }

  const [created] = await db.insert(usersTable).values({
    clerkId,
    email: claims.email || "unknown@example.com",
    name: claims.name || null,
  }).returning();
  return created;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clerkId = extractClerkId(req);
    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.clerkId = clerkId;

    const claims = extractClerkClaims(req);
    const user = await resolveOrCreateUser(clerkId, claims);
    req.dbUserId = user.id;
    req.dbUserRole = user.role;

    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const clerkId = extractClerkId(req);
    if (clerkId) {
      req.clerkId = clerkId;
      const claims = extractClerkClaims(req);
      const user = await resolveOrCreateUser(clerkId, claims);
      req.dbUserId = user.id;
      req.dbUserRole = user.role;
    }
  } catch {
    // silently continue without auth
  }
  next();
};

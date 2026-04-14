import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  clerkId?: string;
  dbUserId?: number;
  dbUserRole?: string;
}

function extractClerkId(req: Request): string | null {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (clerkId && typeof clerkId === "string") {
    return clerkId;
  }
  return null;
}

async function fetchClerkProfile(clerkId: string): Promise<{ name: string; email: string }> {
  const clerkUser = await clerkClient.users.getUser(clerkId);
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "unknown@example.com";
  return { name: fullName, email };
}

async function resolveOrCreateUser(clerkId: string) {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);

  if (existing) {
    if (!existing.name || existing.name.trim() === "") {
      try {
        const profile = await fetchClerkProfile(clerkId);
        if (profile.name.trim()) {
          const updates: Record<string, string> = { name: profile.name };
          if (!existing.email || existing.email === "unknown@example.com") {
            updates.email = profile.email;
          }
          const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, existing.id)).returning();
          return updated;
        }
      } catch (err) {
        console.error("Failed to fetch Clerk user profile:", err);
      }
    }
    return existing;
  }

  let name: string | null = null;
  let email = "unknown@example.com";
  try {
    const profile = await fetchClerkProfile(clerkId);
    name = profile.name.trim() || null;
    email = profile.email;
  } catch (err) {
    console.error("Failed to fetch Clerk profile for new user:", err);
  }

  const [created] = await db.insert(usersTable).values({
    clerkId,
    email,
    name,
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

    const user = await resolveOrCreateUser(clerkId);
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
      const user = await resolveOrCreateUser(clerkId);
      req.dbUserId = user.id;
      req.dbUserRole = user.role;
    }
  } catch {
  }
  next();
};

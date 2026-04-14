import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  userId?: string;
  dbUserId?: number;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth?.sessionClaims?.userId || auth?.userId;
    if (!clerkId || typeof clerkId !== "string") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.userId = clerkId;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    if (user) {
      req.dbUserId = user.id;
    }

    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth?.sessionClaims?.userId || auth?.userId;
    if (clerkId && typeof clerkId === "string") {
      req.userId = clerkId;
      const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
      if (user) {
        req.dbUserId = user.id;
      }
    }
  } catch {
    // silently continue without auth
  }
  next();
};

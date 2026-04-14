import { pgTable, serial, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { gurusTable } from "./gurus";

export const connectionCodesTable = pgTable("connection_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  code: varchar("code", { length: 8 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertConnectionCodeSchema = createInsertSchema(connectionCodesTable).omit({
  id: true,
  used: true,
  createdAt: true,
});

export type ConnectionCode = typeof connectionCodesTable.$inferSelect;
export type InsertConnectionCode = z.infer<typeof insertConnectionCodeSchema>;

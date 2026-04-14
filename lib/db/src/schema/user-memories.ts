import { pgTable, serial, integer, varchar, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { gurusTable } from "./gurus";

export const memoryCategoryEnum = ["goals", "preferences", "history", "decisions", "context"] as const;

export const userMemoriesTable = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  category: varchar("category", { length: 50 }).notNull(),
  summary: text("summary").notNull(),
  displayTitle: varchar("display_title", { length: 200 }),
  topic: varchar("topic", { length: 100 }),
  details: jsonb("details"),
  importance: real("importance").notNull().default(0.5),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserMemory = typeof userMemoriesTable.$inferSelect;

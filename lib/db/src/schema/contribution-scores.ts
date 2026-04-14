import { pgTable, serial, integer, real, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { gurusTable } from "./gurus";

export const contributionScoresTable = pgTable("contribution_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  score: real("score").notNull().default(0),
  turnCount: integer("turn_count").notNull().default(0),
  patternsContributed: integer("patterns_contributed").notNull().default(0),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("contribution_scores_user_guru_idx").on(table.userId, table.guruId),
]);

export type ContributionScore = typeof contributionScoresTable.$inferSelect;

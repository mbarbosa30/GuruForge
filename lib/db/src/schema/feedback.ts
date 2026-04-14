import { pgTable, serial, integer, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const feedbackTable = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  targetId: integer("target_id").notNull(),
  vote: varchar("vote", { length: 10 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("feedback_user_target_idx").on(table.userId, table.targetType, table.targetId),
]);

export type Feedback = typeof feedbackTable.$inferSelect;

import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { gurusTable } from "./gurus";
import { usersTable } from "./users";
import { conversationsTable } from "./conversations";

export const usageLogsTable = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  userId: integer("user_id").references(() => usersTable.id),
  conversationId: integer("conversation_id").references(() => conversationsTable.id),
  callType: varchar("call_type", { length: 30 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  estimatedCostCents: integer("estimated_cost_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UsageLog = typeof usageLogsTable.$inferSelect;

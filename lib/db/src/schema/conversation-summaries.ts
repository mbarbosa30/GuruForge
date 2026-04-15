import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { conversationsTable } from "./conversations";

export const conversationSummariesTable = pgTable("conversation_summaries", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id),
  summary: text("summary").notNull(),
  messagesSummarized: integer("messages_summarized").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("conv_summaries_conversation_id_idx").on(table.conversationId),
]);

export type ConversationSummary = typeof conversationSummariesTable.$inferSelect;

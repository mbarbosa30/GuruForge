import { pgTable, serial, integer, varchar, real, boolean, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages";
import { conversationsTable } from "./conversations";
import { gurusTable } from "./gurus";

export const conversationAnnotationsTable = pgTable("conversation_annotations", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messagesTable.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  topicTags: jsonb("topic_tags").$type<string[]>().default([]),
  qualityScore: real("quality_score").notNull().default(0),
  memoryExtractionSuccess: boolean("memory_extraction_success").notNull().default(false),
  memoriesExtractedCount: integer("memories_extracted_count").notNull().default(0),
  contributionQuality: real("contribution_quality").notNull().default(0),
  domainRelevance: real("domain_relevance").notNull().default(0),
  piiDetected: boolean("pii_detected").notNull().default(false),
  tokenCount: integer("token_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("conv_annotations_guru_idx").on(table.guruId),
  index("conv_annotations_quality_idx").on(table.qualityScore),
  index("conv_annotations_conversation_idx").on(table.conversationId),
  uniqueIndex("conv_annotations_message_unique_idx").on(table.messageId),
]);

export type ConversationAnnotation = typeof conversationAnnotationsTable.$inferSelect;

import { pgTable, serial, integer, varchar, text, real, timestamp } from "drizzle-orm/pg-core";
import { gurusTable } from "./gurus";

export const patternTypeEnum = ["common_questions", "successful_strategies", "pitfalls", "trends"] as const;

export const collectivePatternsTable = pgTable("collective_patterns", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  patternType: varchar("pattern_type", { length: 50 }).notNull(),
  summary: text("summary").notNull(),
  publishTitle: varchar("publish_title", { length: 300 }),
  redactedSummary: text("redacted_summary"),
  frequency: integer("frequency").notNull().default(1),
  confidence: real("confidence").notNull().default(0.5),
  sourceCount: integer("source_count").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CollectivePattern = typeof collectivePatternsTable.$inferSelect;

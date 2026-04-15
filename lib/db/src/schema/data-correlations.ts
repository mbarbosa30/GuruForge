import { pgTable, serial, integer, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { gurusTable } from "./gurus";

export const dataCorrelationsTable = pgTable("data_correlations", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  sourceType: varchar("source_type", { length: 30 }).notNull(),
  sourceId: integer("source_id").notNull(),
  targetType: varchar("target_type", { length: 30 }).notNull(),
  targetId: integer("target_id").notNull(),
  relationshipType: varchar("relationship_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("data_corr_guru_idx").on(table.guruId),
  index("data_corr_source_idx").on(table.sourceType, table.sourceId),
  index("data_corr_target_idx").on(table.targetType, table.targetId),
]);

export type DataCorrelation = typeof dataCorrelationsTable.$inferSelect;

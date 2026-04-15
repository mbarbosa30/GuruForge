import { pgTable, serial, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { gurusTable } from "./gurus";

export interface SnapshotData {
  patternCounts: Record<string, number>;
  memoryDistribution: Record<string, number>;
  avgQualityScore: number;
  totalAnnotatedTurns: number;
  totalConversations: number;
  totalUsers: number;
  topTopics: Array<{ topic: string; count: number }>;
  confidenceDistribution: { high: number; medium: number; low: number };
}

export const knowledgeSnapshotsTable = pgTable("knowledge_snapshots", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  snapshotData: jsonb("snapshot_data").$type<SnapshotData>().notNull(),
  totalPatterns: integer("total_patterns").notNull().default(0),
  totalMemories: integer("total_memories").notNull().default(0),
  avgConfidence: real("avg_confidence").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => []);

export type KnowledgeSnapshot = typeof knowledgeSnapshotsTable.$inferSelect;

import { pgTable, serial, integer, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export interface ExportFilters {
  guruId?: number;
  minQuality?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const trainingExportsTable = pgTable("training_exports", {
  id: serial("id").primaryKey(),
  format: varchar("format", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  filters: jsonb("filters").$type<ExportFilters>().default({}),
  rowCount: integer("row_count").notNull().default(0),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  exportContent: text("export_content"),
  exportedBy: integer("exported_by"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type TrainingExport = typeof trainingExportsTable.$inferSelect;

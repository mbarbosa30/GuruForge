import { pgTable, bigint, integer, timestamp, index, primaryKey } from "drizzle-orm/pg-core";
import { gurusTable } from "./gurus";

export const processedTelegramUpdatesTable = pgTable("processed_telegram_updates", {
  updateId: bigint("update_id", { mode: "bigint" }).notNull(),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.guruId, table.updateId] }),
  index("processed_tg_updates_processed_at_idx").on(table.processedAt),
]);

export type ProcessedTelegramUpdate = typeof processedTelegramUpdatesTable.$inferSelect;

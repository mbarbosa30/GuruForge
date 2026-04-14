import { pgTable, serial, integer, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { gurusTable } from "./gurus";

export const telegramConnectionStatusEnum = ["active", "disconnected"] as const;

export const telegramConnectionsTable = pgTable("telegram_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  telegramUserId: varchar("telegram_user_id", { length: 64 }).notNull(),
  telegramChatId: varchar("telegram_chat_id", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  connectedAt: timestamp("connected_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("telegram_conn_user_guru_idx").on(table.userId, table.guruId),
  uniqueIndex("telegram_conn_tg_guru_idx").on(table.guruId, table.telegramUserId),
]);

export const insertTelegramConnectionSchema = createInsertSchema(telegramConnectionsTable).omit({
  id: true,
  connectedAt: true,
});

export type TelegramConnection = typeof telegramConnectionsTable.$inferSelect;
export type InsertTelegramConnection = z.infer<typeof insertTelegramConnectionSchema>;

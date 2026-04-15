import { pgTable, serial, integer, varchar, text, real, timestamp } from "drizzle-orm/pg-core";
import { gurusTable } from "./gurus";

export const guruWalletsTable = pgTable("guru_wallets", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id")
    .notNull()
    .unique()
    .references(() => gurusTable.id),
  walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
  serverRecoveryShare: text("server_recovery_share").notNull(),
  perTxLimitUsd: real("per_tx_limit_usd").notNull().default(100),
  dailyLimitUsd: real("daily_limit_usd").notNull().default(1000),
  dailySpentUsd: real("daily_spent_usd").notNull().default(0),
  dailySpentResetAt: timestamp("daily_spent_reset_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GuruWallet = typeof guruWalletsTable.$inferSelect;
export type InsertGuruWallet = typeof guruWalletsTable.$inferInsert;

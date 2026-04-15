import { pgTable, serial, integer, varchar, text, real, timestamp } from "drizzle-orm/pg-core";
import { gurusTable } from "./gurus";
import { usersTable } from "./users";

export const rewardDistributionsTable = pgTable("reward_distributions", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  initiatedBy: integer("initiated_by").notNull().references(() => usersTable.id),
  tokenAddress: varchar("token_address", { length: 255 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 50 }).notNull(),
  chain: varchar("chain", { length: 50 }).notNull().default("base"),
  totalAmount: varchar("total_amount", { length: 255 }).notNull(),
  recipientCount: integer("recipient_count").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  transactionHashes: text("transaction_hashes"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type RewardDistribution = typeof rewardDistributionsTable.$inferSelect;

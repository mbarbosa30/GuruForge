import { pgTable, text, serial, integer, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { gurusTable } from "./gurus";

export const subscriptionStatusEnum = ["active", "cancelled", "expired"] as const;

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
}, (table) => [
  uniqueIndex("unique_stripe_sub_id").on(table.stripeSubscriptionId),
]);

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({
  id: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;

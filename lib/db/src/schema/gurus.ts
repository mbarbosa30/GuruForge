import { pgTable, text, serial, integer, timestamp, varchar, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const guruStatusEnum = ["draft", "published", "archived"] as const;
export const modelTierEnum = ["grok", "gpt"] as const;
export const personalityStyleEnum = ["professional", "friendly", "direct", "academic"] as const;
export const priceIntervalEnum = ["monthly", "yearly"] as const;

export const proactiveCadenceEnum = ["off", "daily", "every_few_days", "weekly"] as const;

export const gurusTable = pgTable("gurus", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => usersTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tagline: varchar("tagline", { length: 500 }),
  description: text("description"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  avatarUrl: text("avatar_url"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  priceCents: integer("price_cents").notNull().default(0),
  priceInterval: varchar("price_interval", { length: 20 }).notNull().default("monthly"),
  topics: text("topics").array(),
  personalityStyle: varchar("personality_style", { length: 50 }).default("professional"),
  modelTier: varchar("model_tier", { length: 20 }).default("gpt"),
  memoryPolicy: text("memory_policy"),
  introEnabled: boolean("intro_enabled").default(false),
  proactiveCadence: varchar("proactive_cadence", { length: 20 }).notNull().default("off"),
  wisdomScore: real("wisdom_score").default(0),
  satisfactionScore: real("satisfaction_score").default(0),
  userCount: integer("user_count").default(0),
  telegramBotToken: text("telegram_bot_token"),
  tokenAddress: varchar("token_address", { length: 255 }),
  tokenSymbol: varchar("token_symbol", { length: 50 }),
  tokenChain: varchar("token_chain", { length: 50 }),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGuruSchema = createInsertSchema(gurusTable).omit({
  id: true,
  wisdomScore: true,
  satisfactionScore: true,
  userCount: true,
  telegramBotToken: true,
  tokenAddress: true,
  tokenSymbol: true,
  tokenChain: true,
  stripeProductId: true,
  stripePriceId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGuru = z.infer<typeof insertGuruSchema>;
export type Guru = typeof gurusTable.$inferSelect;

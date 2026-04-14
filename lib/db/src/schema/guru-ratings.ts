import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { gurusTable } from "./gurus";

export const guruRatingsTable = pgTable("guru_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  guruId: integer("guru_id").notNull().references(() => gurusTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("guru_ratings_user_guru_unique").on(table.userId, table.guruId),
]);

export const insertGuruRatingSchema = createInsertSchema(guruRatingsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertGuruRating = z.infer<typeof insertGuruRatingSchema>;
export type GuruRating = typeof guruRatingsTable.$inferSelect;

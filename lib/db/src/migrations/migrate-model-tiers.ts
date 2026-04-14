import { db } from "../index";
import { gurusTable } from "../schema";
import { sql } from "drizzle-orm";

async function migrateModelTiers() {
  console.log("Migrating model_tier values: basic/pro/enterprise → gpt...");

  const result = await db.execute(
    sql`UPDATE ${gurusTable} SET model_tier = 'gpt' WHERE model_tier IN ('basic', 'pro', 'enterprise')`
  );

  console.log(`Migration complete. Rows updated: ${(result as any).rowCount ?? 'unknown'}`);
  process.exit(0);
}

migrateModelTiers().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

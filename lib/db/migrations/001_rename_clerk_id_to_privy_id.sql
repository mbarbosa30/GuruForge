-- Migration: Rename clerk_id to privy_id in users table
-- Applied: 2026-04-14 as part of Clerk → Privy.io auth migration
-- Status: APPLIED (run manually via psql)

ALTER TABLE users RENAME COLUMN clerk_id TO privy_id;
ALTER INDEX users_clerk_id_unique RENAME TO users_privy_id_unique;

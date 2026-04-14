# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

**GuruForge** — A marketplace for specialized AI agents (Gurus) delivered via Telegram. Users can discover, subscribe to, and interact with Gurus that compound in value over time.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (whitelabel, proxy-based)
- **Frontend**: React + Vite + Tailwind CSS + wouter

## Architecture

### Artifacts
- `artifacts/api-server` — Express API server (port from $PORT env, currently 8080)
- `artifacts/guruforge` — React/Vite frontend app (served at `/guruforge/`)
- `artifacts/mockup-sandbox` — Vite dev server for UI mockups

### Shared Libraries
- `lib/db` — Drizzle ORM schema and database client
- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-zod` — Generated Zod schemas from OpenAPI
- `lib/api-client-react` — Generated React Query hooks from OpenAPI

### Database Schema
- `users` — id, clerk_id, email, name, avatar_url, role (user/creator/admin)
- `categories` — id, name, slug, description, icon, display_order
- `gurus` — id, creator_id (FK users), name, slug, tagline, description, category_id (FK categories), avatar_url, status, price_cents, price_interval, topics, personality_style, model_tier, memory_policy, intro_enabled, wisdom_score, satisfaction_score, user_count, stripe_product_id, stripe_price_id
- `subscriptions` — id, user_id, guru_id, status, started_at, expires_at, stripe_subscription_id
- `guru_ratings` — id, user_id, guru_id, rating (1-5), comment (unique constraint on user_id + guru_id)

### API Endpoints (under `/api`)
- `GET /api/healthz` — Health check
- `GET /api/categories` — List all categories
- `GET /api/gurus` — List/search gurus (filters: category, search, sort)
- `GET /api/gurus/:slug` — Get guru by slug (published only)
- `POST /api/gurus` — Create guru (auth required)
- `PATCH /api/gurus/:id` — Update guru (auth required, creator only)
- `GET /api/users/me` — Get current user (auth required)
- `PATCH /api/users/me` — Update current user (auth required)
- `GET /api/gurus/:id/ratings` — List ratings for a guru
- `POST /api/gurus/:id/ratings` — Rate/update rating (auth required, upsert)

### Auth
- Clerk middleware validates JWT tokens
- `requireAuth` middleware: validates auth and resolves DB user
- `optionalAuth` middleware: resolves auth if present, continues if not
- Public endpoints: categories, guru list/detail, ratings list
- Protected endpoints: user profile, guru create/update, rating create

### Design System
- Neo-minimal flat UI: pure white bg, sharp edges, uppercase micro-labels, numbered cards, clean typography
- Light backgrounds only, no dark themes, no heavy animations

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `npx tsx lib/db/src/seed.ts` — seed database with sample data

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Seed Data
- 5 categories: Founders & Operators, DeFi & Crypto, Coaching & Growth, Research & Analysis, Creator Economy
- 7 sample Gurus with realistic content, pricing, and wisdom scores
- 1 system user (seed_system_user) as creator for sample Gurus

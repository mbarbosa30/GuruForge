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
- `users` — id, clerk_id, email, name, avatar_url, role (user/creator/admin), stripe_customer_id
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
- `POST /api/subscriptions/checkout` — Create Stripe checkout session (auth required)
- `GET /api/subscriptions/me` — List user's active subscriptions (auth required)
- `POST /api/subscriptions/portal` — Create Stripe billing portal session (auth required)
- `GET /api/subscriptions/check/:guruId` — Check subscription status for a guru (auth required)
- `POST /api/webhooks/stripe` — Stripe webhook (raw body, before express.json())

### Auth
- Clerk middleware validates JWT tokens
- `requireAuth` middleware: validates auth and resolves DB user
- `optionalAuth` middleware: resolves auth if present, continues if not
- Public endpoints: categories, guru list/detail, ratings list
- Protected endpoints: user profile, guru create/update, rating create

### Frontend Pages
- `/` — Landing page with hero, features, waitlist form, and "Browse Marketplace" CTA
- `/marketplace` — Guru discovery page with search, category filters, sort, and responsive 3-col grid
- `/guru/:slug` — Guru profile page with stats, description, topics, trust indicators, ratings, CTAs
- `/create` — 6-step Guru creator wizard (Identity, Purpose, Intelligence, Memory, Pricing, Review) with auth gate
- `/dashboard` — User subscriptions dashboard with Manage Billing link (auth required)
- `/sign-in`, `/sign-up` — Clerk auth pages

### Payments (Stripe)
- **Integration**: Replit Stripe connector (`stripe-replit-sync` + `stripe` packages at workspace root)
- **Stripe client**: `artifacts/api-server/src/lib/stripeClient.ts` (credentials via Replit connector API)
- **Webhook**: `/api/webhooks/stripe` registered BEFORE `express.json()` in app.ts; processes via `stripe-replit-sync` and syncs subscription status to local DB
- **Checkout flow**: Subscribe button → creates Stripe customer (if needed) → creates Stripe product/price (if needed) → creates checkout session → redirects to Stripe → webhook updates subscription status
- **Billing portal**: Manage Billing button on dashboard → creates portal session → redirects to Stripe portal
- **Startup**: `runMigrations` (stripe schema) → `getStripeSync` → `findOrCreateManagedWebhook` → `syncBackfill`

### Design System
- Neo-minimal flat UI: pure white bg, sharp edges, uppercase micro-labels, numbered cards, clean typography
- Light backgrounds only, no dark themes, no heavy animations
- Shared `Layout` component wraps all pages with consistent nav bar and footer
- Clerk `Show` component for auth-conditional rendering (Sign In vs UserButton)

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

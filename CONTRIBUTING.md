# Contributing to GuruForge

Thanks for your interest in contributing to GuruForge. This document covers everything you need to get started.

## Local Development Setup

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL 16+

### Setup

```bash
git clone <repo-url>
cd guruforge
pnpm install
```

Create a `.env` file in the project root with the required environment variables (see README.md).

```bash
# Push the database schema
pnpm --filter @workspace/db run push

# Seed base data
npx tsx lib/db/src/seed.ts

# Seed demo engagement data
npx tsx lib/db/src/seed-demo.ts

# Start development servers
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/guruforge run dev
```

## Project Structure

This is a pnpm monorepo. Key packages:

- `artifacts/api-server` — Express API server
- `artifacts/guruforge` — React frontend
- `lib/db` — Database schema and client (Drizzle ORM)
- `lib/api-spec` — OpenAPI specification
- `lib/api-client-react` — Generated React Query hooks

## Branch Naming

```
feature/short-description
fix/short-description
refactor/short-description
```

## Commit Conventions

Write clear, descriptive commit messages. Use the imperative mood:

```
Add contribution leaderboard endpoint
Fix Telegram webhook timeout on large payloads
Refactor memory extraction to batch inserts
```

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Make your changes.
3. Run `pnpm run typecheck` to ensure no type errors.
4. Run `pnpm run build` to verify the full build succeeds.
5. If you changed the API, update `lib/api-spec/openapi.yaml` and run `pnpm --filter @workspace/api-spec run codegen`.
6. Open a pull request with a clear description of what changed and why.

## Design System

The frontend follows a strict neo-minimal design language. Please adhere to these rules:

- **White backgrounds only** — pure `#ffffff` base, `#f8f8f7` for alternating sections
- **No dark themes**
- **No animations** — subtle `transition-colors` on hover is acceptable
- **Sharp edges** — no border-radius
- **Font-weight 300** for headlines, semibold for labels
- **Uppercase micro-labels** — `text-[11px] font-medium tracking-[0.12em] uppercase`
- **No link underlines** — use border-bottom for active states
- **No emojis** — do not use emojis in product UI or content
- **Color palette** — `#111` primary text, `#555`/`#666` body text, `#777`/`#888`/`#999` secondary, `#e0e0e0` borders

## Database Changes

- Edit schema files in `lib/db/src/schema/`
- Run `pnpm --filter @workspace/db run push` to apply changes
- Never manually write SQL migrations
- Never change primary key column types

## Adding API Endpoints

1. Add the route handler in `artifacts/api-server/src/routes/`
2. Register the route in `artifacts/api-server/src/app.ts`
3. Update `lib/api-spec/openapi.yaml` with the new endpoint
4. Run `pnpm --filter @workspace/api-spec run codegen` to generate client hooks
5. Use `requireAuth` middleware for protected endpoints
6. Admin endpoints must check `dbUserRole === "admin"`

## Questions

Open an issue with the `question` label if you need help getting started.

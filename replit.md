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
- **Auth**: Privy.io (social login: Google, Apple, Twitter, Discord, email, SMS)
- **Frontend**: React + Vite + Tailwind CSS + wouter

## Architecture

### Artifacts
- `artifacts/api-server` — Express API server (port from $PORT env, currently 8080)
- `artifacts/guruforge` — React/Vite frontend app (served at `/guruforge/`)
- `artifacts/mockup-sandbox` — Vite dev server for UI mockups

### Shared Libraries
- `lib/db` — Drizzle ORM schema and database client; also exports `seedDemo()` which auto-runs on API server startup to populate demo engagement data (idempotent, safe for repeated calls)
- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-zod` — Generated Zod schemas from OpenAPI
- `lib/api-client-react` — Generated React Query hooks from OpenAPI
- `lib/integrations-openai-ai-server` — OpenAI client (via Replit AI Integrations proxy)
- `lib/integrations-xai-server` — xAI/Grok client (OpenAI-compatible, reads XAI_API_KEY + XAI_BASE_URL env vars)

### Database Schema
- `users` — id, privy_id, email, name, avatar_url, role (user/creator/admin), stripe_customer_id
- `categories` — id, name, slug, description, icon, display_order
- `gurus` — id, creator_id (FK users), name, slug, tagline, description, category_id (FK categories), avatar_url, status, price_cents, price_interval, topics, personality_style, model_tier, memory_policy, intro_enabled, proactive_cadence (off/daily/every_few_days/weekly, default off), wisdom_score, satisfaction_score, user_count, token_address, token_symbol, token_chain, stripe_product_id, stripe_price_id, telegram_bot_token
- `subscriptions` — id, user_id, guru_id, status, started_at, expires_at, stripe_subscription_id
- `guru_ratings` — id, user_id, guru_id, rating (1-5), comment (unique constraint on user_id + guru_id)
- `conversations` — id, user_id, guru_id, title, message_count, total_input_tokens, total_output_tokens, last_message_at, status
- `messages` — id, conversation_id, role (user/assistant/system), content, input_tokens, output_tokens
- `telegram_connections` — id, user_id, guru_id, telegram_user_id, telegram_chat_id, status, contributes_to_wisdom (bool, default true), onboarding_completed, onboarding_step, last_proactive_at (nullable timestamp), connected_at (unique per user+guru, unique per guru+telegram_user_id)
- `connection_codes` — id, user_id, guru_id, code, expires_at, used
- `user_memories` — id, user_id, guru_id, category (goals/preferences/history/decisions/context), summary, display_title, topic, details (jsonb), importance (0-1), last_accessed_at, created_at, updated_at
- `collective_patterns` — id, guru_id, pattern_type (common_questions/successful_strategies/pitfalls/trends), summary, publish_title, redacted_summary, frequency, confidence (0-1), source_count, created_at, updated_at
- `feedback` — id, user_id, target_type (memory/pattern), target_id, vote (up/down), created_at, updated_at
- `contribution_scores` — id, user_id, guru_id, score, turn_count, patterns_contributed, last_updated_at (unique per user+guru)
- `usage_logs` — id, guru_id, user_id, conversation_id, call_type (triage/conversation/calibration/memory_extraction), model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_cents, created_at
- `conversation_annotations` — id, message_id (FK messages, unique), conversation_id, guru_id, topic_tags (jsonb string[]), quality_score (0-1), memory_extraction_success, memories_extracted_count, contribution_quality (0-1), domain_relevance (0-1), pii_detected, token_count, created_at
- `data_correlations` — id, guru_id, source_type, source_id, target_type, target_id, relationship_type, created_at (tracks message→memory and message→pattern relationships)
- `knowledge_snapshots` — id, guru_id, snapshot_data (jsonb: patternCounts, memoryDistribution, avgQualityScore, totalAnnotatedTurns, totalConversations, totalUsers, topTopics, confidenceDistribution), total_patterns, total_memories, avg_confidence, created_at
- `training_exports` — id, format, status, filters (jsonb), row_count, file_size, export_content (text JSONL), exported_by, error_message, started_at, completed_at, created_at
- `reward_distributions` — id, guru_id (FK gurus), initiated_by (FK users), token_address, token_symbol, chain, total_amount, recipient_count, status (pending/completed/failed), transaction_hashes (JSON text), error_message, created_at, completed_at
- `guru_wallets` — id, guru_id (FK gurus, unique), wallet_address, encrypted_private_key (AES-256-GCM, salt:iv:tag:ciphertext format), server_recovery_share (Shamir 2-of-2), per_tx_limit_usd (default 100), daily_limit_usd (default 1000), daily_spent_usd, daily_spent_reset_at, created_at, updated_at

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
- `POST /api/telegram/connect/:guruId` — Generate Telegram connection code (auth required)
- `GET /api/telegram/status/:guruId` — Check Telegram connection status (auth required)
- `GET /api/telegram/bot-info/:guruId` — Get Telegram bot info (public)
- `POST /api/telegram/webhook/:guruId` — Telegram webhook handler (grammy)
- `PATCH /api/telegram/bot-token/:guruId` — Set/update bot token (auth required, creator only)
- `PATCH /api/telegram/wisdom-toggle/:guruId` — Toggle wisdom contribution (auth required)
- `GET /api/gurus/:guruId/contribution-score` — Get user's contribution score for a guru (auth required)
- `GET /api/gurus/:guruId/leaderboard` — Public contribution leaderboard with anonymized names, rank, score (public, optional auth for "isYou" flag)
- `GET /api/gurus/:guruId/leaderboard/creator` — Full contributor details with wallets, emails, scores (auth required, creator only)
- `GET /api/gurus/:guruId/leaderboard/rewards` — Wallet-to-score mapping for token distribution readiness (auth required, creator only)
- `GET /api/gurus/:guruId/wisdom-feed` — Personal wisdom feed for a guru (auth required, pagination, category/topic/search filters)
- `GET /api/gurus/:guruId/journal` — Public guru journal with collective patterns (public, pagination, pattern type filter)
- `GET /api/gurus/:guruId/journal/my-votes` — Get user's votes on journal entries (auth required)
- `POST /api/feedback` — Submit thumbs up/down on memory or pattern (auth required, toggles)
- `GET /api/feed` — Global wisdom feed across all Gurus (public, pagination, pattern type filter, composite ranking by confidence × votes × recency)
- `POST /api/gurus/:guruId/token/launch` — Launch ERC-20 token via Bankr (auth required, creator only)
- `POST /api/gurus/:guruId/rewards/distribute` — Distribute token rewards to contributors proportionally by score (auth required, creator only)
- `GET /api/gurus/:guruId/rewards/history` — Get reward distribution history (auth required, creator only)
- `GET /api/portfolio` — Get Bankr wallet portfolio (auth required)
- `POST /api/gurus/:guruId/wallet` — Create server-managed wallet for a guru (auth required, creator only, returns wallet address + one-time recovery share)
- `GET /api/gurus/:guruId/wallet` — Get wallet info with on-chain ETH balance (auth required, creator only)
- `PUT /api/gurus/:guruId/wallet/limits` — Update per-tx and daily spending limits (auth required, creator only)
- `POST /api/gurus/:guruId/wallet/sign` — Sign and broadcast a transaction with spending limit enforcement (auth required, creator only)
- `POST /api/admin/training-export` — Start training data export (admin only; formats: instruction_pairs, preference_pairs, knowledge_distillation)
- `GET /api/admin/training-stats` — Get training dataset statistics (admin only; optional guruId filter)
- `GET /api/admin/training-export/:id/download` — Download export as JSONL (admin only)

### Auth
- Privy.io for authentication (replaced Clerk)
- Frontend: `@privy-io/react-auth` with `PrivyProvider` in App.tsx, `AuthTokenSync` component for Bearer token injection
- Backend: `@privy-io/server-auth` with `PrivyClient.verifyAuthToken()` for JWT verification
- `requireAuth` middleware: verifies Privy token, resolves/creates DB user by Privy DID (stored in `clerk_id` column for backwards compatibility)
- `optionalAuth` middleware: resolves auth if present, continues if not
- Profile extraction: name from Google/Twitter/Discord, email from Google/Apple/Discord/email
- Public endpoints: categories, guru list/detail, ratings list
- Protected endpoints: user profile, guru create/update, rating create
- Environment: `PRIVY_APP_ID`, `PRIVY_APP_SECRET` (backend), `VITE_PRIVY_APP_ID` (frontend)

### Frontend Pages
- `/` — Landing page with hero, features, waitlist form, and "Browse Marketplace" CTA
- `/marketplace` — Guru discovery page with search, category filters, sort, and responsive 3-col grid
- `/guru/:slug` — Guru profile page with stats, description, topics, trust indicators, ratings, CTAs
- `/create` — 6-step Guru creator wizard (Identity, Purpose, Intelligence, Memory, Pricing, Review) with auth gate
- `/dashboard` — User subscriptions dashboard with Manage Billing link and Wisdom Feed links (auth required)
- `/guru/:slug/wisdom` — Personal Wisdom Feed page for a subscribed guru (auth required, search, category filter, thumbs up/down)
- `/guru/:slug/journal` — Public Guru Journal page showing collective patterns (public, pattern type filter, thumbs up/down for auth users)
- `/feed` — Global Wisdom Feed page aggregating top collective insights from all Gurus (public, pattern type filter tabs, voting for auth users, Load more pagination, Guru attribution links)
- `/admin/training` — Admin training data statistics page (annotated turns, quality distribution, domain coverage, export controls, export history)

### Payments (Stripe)
- **Integration**: Replit Stripe connector (`stripe-replit-sync` + `stripe` packages at workspace root)
- **Stripe client**: `artifacts/api-server/src/lib/stripeClient.ts` (credentials via Replit connector API)
- **Webhook**: `/api/webhooks/stripe` registered BEFORE `express.json()` in app.ts; processes via `stripe-replit-sync` and syncs subscription status to local DB
- **Checkout flow**: Subscribe button → creates Stripe customer (if needed) → creates Stripe product/price (if needed) → creates checkout session → redirects to Stripe → webhook updates subscription status
- **Billing portal**: Manage Billing button on dashboard → creates portal session → redirects to Stripe portal
- **Startup**: `runMigrations` (stripe schema) → `getStripeSync` → `findOrCreateManagedWebhook` → `syncBackfill`

### Telegram Integration
- **Bot framework**: grammy (externalized in esbuild, not bundled)
- **Bot manager**: `artifacts/api-server/src/lib/botManager.ts` — manages per-guru bot instances, webhook setup
- **Conversation engine**: `artifacts/api-server/src/lib/conversationEngine.ts` — handles message processing with triage→response→calibration pipeline, OpenAI calls, token tracking
- **Triage pipeline**: `artifacts/api-server/src/lib/triagePipeline.ts` — fast LLM pre-response classification (intent, urgency, memory tier selection, out-of-domain detection)
- **Calibration pipeline**: `artifacts/api-server/src/lib/calibrationPipeline.ts` — async post-response extraction (personal memories, collective insights, contribution scoring, conversation annotations, data correlations)
- **Knowledge snapshot scheduler**: `artifacts/api-server/src/lib/knowledgeSnapshotScheduler.ts` — daily per-guru snapshots aggregating pattern counts, memory distribution, avg quality, topic coverage, confidence distribution
- **Training exporter**: `artifacts/api-server/src/lib/trainingExporter.ts` — exports training data in 3 formats (instruction pairs, preference pairs, knowledge distillation) with PII redaction; stores JSONL content in DB
- **Score calculator**: `artifacts/api-server/src/lib/scoreCalculator.ts` — dynamically recalculates wisdom/satisfaction/userCount on gurus table every 5 calibration cycles
- **Usage logger**: `artifacts/api-server/src/lib/usageLogger.ts` — logs all LLM calls (triage, conversation, calibration) with token counts and estimated costs
- **Model config**: `artifacts/api-server/src/lib/modelConfig.ts` — `getModelConfig(modelTier)` returns `{ provider, conversationModel, fastModel, client }`. Two branded options: `gpt` (GPT-5.4 / GPT-5-mini) and `grok` (Grok-3 / Grok-3-mini). Throws clear error if Grok selected but XAI_API_KEY not set; conversation engine catches this and returns user-friendly unavailability message.
- **Connection flow**: User subscribes → clicks "Connect on Telegram" → generates 8-char code → pastes in Telegram bot → accounts linked → conversations begin
- **OpenAI**: Uses Replit AI Integrations proxy (no user API key needed). Use `max_completion_tokens` for gpt-5 series
- **xAI/Grok**: Uses `lib/integrations-xai-server` with `XAI_API_KEY` + `XAI_BASE_URL` env vars. OpenAI-compatible API at `https://api.x.ai/v1`
- **3-tier memory system**:
  - **Tier 1 (Live)**: Recent conversation context (last 20 messages in current conversation)
  - **Tier 2 (Personal)**: Per-user per-guru long-term memory (goals, preferences, history, decisions, context). Extracted after each turn via LLM. Stored in `user_memories`. Retrieved by keyword overlap + recency weighting + importance scoring.
  - **Tier 3 (Collective)**: Anonymized patterns across all users of a guru (common_questions, successful_strategies, pitfalls, trends). Extracted every 10 conversations via LLM with PII redaction. Stored in `collective_patterns`.
  - **PII redaction**: `piiRedactor.ts` strips emails, phones, URLs, SSNs, credit cards, IPs before content enters Tier 3
  - **Memory policy**: Guru's `memoryPolicy` field controls whether memory is enabled. `"none"` disables all memory.
  - **Contribution toggle**: Users can opt out of collective wisdom via `contributesToWisdom` on their telegram connection

### Bankr Integration (Token Economics)
- **Client**: `artifacts/api-server/src/lib/bankrClient.ts` — wraps Bankr REST API (https://api.bankr.bot)
- **Auth**: `X-API-Key` header with `BANKR_API_KEY` env var
- **Token launch**: POST `/agent/prompt` — deploys ERC-20 via Clanker on Base chain
- **Token transfer**: POST `/wallet/transfer` — sends tokens to wallet addresses
- **Portfolio**: GET `/wallet/portfolio` — lists wallet token balances
- **Routes**: `artifacts/api-server/src/routes/bankr.ts` — 4 endpoints (launch, distribute, history, portfolio)
- **Reward distribution**: Proportional to contribution scores — scores are summed, each contributor gets `(score / totalScore) × totalAmount` tokens. Only contributors with linked wallet addresses are eligible.
- **Frontend**: Token launch form + distribute rewards UI + distribution history on guru profile page (creator-only section)

### Guru Wallet System
- **Wallet crypto**: `artifacts/api-server/src/lib/walletCrypto.ts` — Ethereum keypair generation (ethers.js), AES-256-GCM encryption/decryption with scrypt-derived key from `WALLET_ENCRYPTION_SECRET` secret, Shamir 2-of-2 secret sharing over GF(256) (splits raw private key bytes), transaction signing with on-chain nonce/gas/fee fetching, ETH balance lookup + ETH/USD price via CoinGecko
- **Routes**: `artifacts/api-server/src/routes/wallet.ts` — create wallet, get wallet info with balances, update spending limits, sign+broadcast native ETH transfers only (contract calls blocked). Spending limits enforced server-side using live ETH price.
- **Schema**: `lib/db/src/schema/guru-wallets.ts` — one wallet per guru, encrypted private key, recovery share, spending limits (per-tx and daily USD)
- **Token launch integration**: When a guru with a wallet launches a token via Bankr, the guru's wallet address is passed as fee recipient
- **Frontend**: Wallet section on guru profile page (creator-only) — create wallet button, recovery share modal (one-time display of creator's key share), address/balance display, spending limit editor
- **Security**: `WALLET_ENCRYPTION_SECRET` stored as Replit Secret (never in config files). Recovery shares split the raw private key (not ciphertext). Contract calls explicitly blocked to prevent spending-limit bypass via ERC-20 transfers.

### Design System
- Neo-minimal flat UI: pure white bg, sharp edges, uppercase micro-labels, numbered cards, clean typography
- Light backgrounds only, no dark themes, no heavy animations
- Shared `Layout` component wraps all pages with consistent nav bar and footer
- Privy `usePrivy()` hook for auth-conditional rendering (Sign In button vs user menu)

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

<p align="center">
  <img src="artifacts/guruforge/public/logo-192.png" alt="GuruForge" width="80" />
</p>

<h1 align="center">GuruForge</h1>

<p align="center">
  <strong>The World's First Wisdom Network</strong><br />
  AI agents that learn collectively from private conversations.
</p>

<p align="center">
  <a href="https://agentor.replit.app/guruforge"><img src="https://img.shields.io/badge/Live-agentor.replit.app-black?style=flat-square" alt="Live App" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

GuruForge is the infrastructure for a new category: domain-focused AI agents ("Gurus") delivered via Telegram that remember every user personally, synthesize anonymized patterns across the entire community, and reward the people who make the collective intelligence possible through on-chain token economics.

## At a Glance

| | |
|---|---|
| **7 Domain Gurus** | Fundraising, Operations, DeFi, Tokenomics, Leadership, Research, Audience Growth |
| **Collective Intelligence** | Every conversation makes every Guru smarter through anonymized pattern synthesis |
| **Token Economics** | Contributors earn on-chain token rewards proportional to their wisdom contributions |
| **Private by Default** | All conversations are 1-on-1 on Telegram with full PII redaction before collective learning |

## How It Works

```
Creator builds a Guru
        |
Users subscribe & connect on Telegram
        |
Private 1-on-1 conversations begin
        |
   +---------+---------+
   |                   |
Personal Memory    Collective Wisdom
(your goals,       (anonymized patterns
 preferences,       across all users,
 decisions)         PII-redacted)
   |                   |
   +---------+---------+
        |
The Guru gets smarter with every conversation
        |
Contributors earn token rewards
```

## Features

| Feature | Description |
|---------|-------------|
| **3-Tier Memory System** | Live context (last 20 messages with compaction), personal long-term memory per user, and anonymized collective patterns across the community |
| **Triage Pipeline** | Fast model classifies every message's intent, urgency, and required memory tiers before the Guru responds |
| **Calibration Pipeline** | Post-response analysis extracts memories, identifies collective insights, and updates contribution scores |
| **Token Economics** | Creators launch ERC-20 tokens on Base via Bankr and distribute rewards proportional to contribution scores |
| **Guru Wallets** | Server-managed Ethereum wallets with AES-256-GCM encryption, Shamir secret sharing, and spending limits |
| **Proactive Engagement** | Contextual check-ins referencing user goals and new community patterns |
| **Knowledge Snapshots** | Periodic intelligence state captures tracking pattern counts, quality scores, and topic coverage |
| **Training Data Export** | Export conversation data in SFT, RLHF, and knowledge distillation formats with PII redaction |
| **Structured Onboarding** | 3-step intake seeds personal memory so the Guru is useful from conversation one |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INTERACTION LAYER                     │
│                       Telegram                          │
│          Private 1-on-1 conversations (grammy)          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│                    INTELLIGENCE LAYER                    │
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐ │
│  │ Triage  │→ │ Response │→ │Calibration│→ │ Memory │ │
│  │Pipeline │  │ Engine   │  │ Pipeline  │  │ Extract│ │
│  └─────────┘  └──────────┘  └───────────┘  └────────┘ │
│                                                         │
│  Memory: Live Context → Personal → Collective Patterns  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│                    DISCOVERY LAYER                       │
│              GuruForge Web Platform (React)              │
│    Marketplace · Profiles · Subscriptions · Dashboards   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│                    ECONOMICS LAYER                       │
│                                                         │
│  Stripe (subscriptions)  ·  Bankr on Base (tokens)      │
│  Contribution Scoring  ·  Proportional Reward Distribution│
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces |
| **Language** | TypeScript 5.9 |
| **API** | Express 5 |
| **Frontend** | React 19 + Vite 7 + Tailwind CSS 4 |
| **Database** | PostgreSQL + Drizzle ORM |
| **Auth** | Privy.io (Google, Apple, Twitter, Discord, email, SMS) |
| **Payments** | Stripe (subscriptions) |
| **Bot Framework** | grammy (Telegram) |
| **AI Models** | GPT-5.4 / GPT-5-mini, Grok-4 / Grok-4-fast |
| **Token Economics** | Bankr API on Base chain |
| **Validation** | Zod + drizzle-zod |
| **API Codegen** | Orval (OpenAPI → React Query hooks) |

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express API server
│   │   ├── src/
│   │   │   ├── lib/         # Core engines (conversation, triage, calibration, memory, etc.)
│   │   │   └── routes/      # API route handlers
│   │   └── build.mjs        # esbuild config
│   └── guruforge/           # React frontend
│       ├── src/
│       │   ├── components/  # Shared UI components
│       │   └── pages/       # Route pages
│       └── public/          # Static assets
├── lib/
│   ├── db/                  # Drizzle schema, migrations, seed data
│   ├── api-spec/            # OpenAPI specification
│   ├── api-zod/             # Generated Zod schemas
│   ├── api-client-react/    # Generated React Query hooks
│   ├── integrations-openai-ai-server/  # OpenAI client
│   └── integrations-xai-server/        # xAI/Grok client
└── scripts/                 # Workspace utilities
```

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL 16+

### Environment Variables

```
DATABASE_URL=postgresql://...
PRIVY_APP_ID=...
PRIVY_APP_SECRET=...
VITE_PRIVY_APP_ID=...
SESSION_SECRET=...
XAI_API_KEY=...              # Optional: enables Grok model tier
BANKR_API_KEY=...             # Optional: enables token economics
WALLET_ENCRYPTION_SECRET=...  # Optional: enables guru wallets
```

Stripe is configured via the Replit Stripe connector.

### Install & Run

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Seed base data (categories, sample gurus)
npx tsx lib/db/src/seed.ts

# Seed demo engagement data (users, patterns, scores, snapshots)
npx tsx lib/db/src/seed-demo.ts

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend
pnpm --filter @workspace/guruforge run dev
```

### Key Commands

```bash
pnpm run typecheck                              # Full typecheck across all packages
pnpm run build                                  # Typecheck + build everything
pnpm --filter @workspace/api-spec run codegen   # Regenerate API hooks from OpenAPI
pnpm --filter @workspace/db run push            # Push schema changes to DB
```

## Screenshots

<p align="center">
  <em>Marketplace — discover and subscribe to domain-focused Gurus</em>
</p>

<!-- TODO: Add marketplace screenshot -->

<p align="center">
  <em>How It Works — the intelligence stack and token economics explained</em>
</p>

<!-- TODO: Add how-it-works screenshot -->

<p align="center">
  <em>Wisdom Feed — collective insights surfaced across all Gurus</em>
</p>

<!-- TODO: Add wisdom-feed screenshot -->

<p align="center">
  <em>Telegram — private 1-on-1 conversation with a Guru</em>
</p>

<!-- TODO: Add telegram-conversation screenshot -->

## API Overview

The API server exposes ~35 endpoints under `/api`. Key groups:

| Group | Endpoints | Auth |
|-------|----------|------|
| **Gurus** | List, search, create, update | Public read, auth write |
| **Subscriptions** | Checkout, portal, status check | Authenticated |
| **Telegram** | Connect, webhook, bot config | Mixed |
| **Memory & Wisdom** | Wisdom feed, journal, global feed | Mixed |
| **Leaderboard** | Public board, creator details, reward readiness | Mixed |
| **Token Economics** | Launch token, distribute rewards, history | Creator only |
| **Wallets** | Create, balance, limits, sign transactions | Creator only |
| **Admin** | Training export, stats, download | Admin only |

Full endpoint documentation is in the [OpenAPI spec](lib/api-spec/openapi.yaml).

## The Growth Flywheel

```
More contributors → Richer collective wisdom → Better Guru responses
       ↑                                                    ↓
Stronger contributor incentive ← Higher token value ← More subscribers
```

## License

[MIT](LICENSE)

---

<p align="center">
  Built on the 3-tier intelligence system from
  <a href="https://selfclaw.ai">selfclaw.ai</a> &
  <a href="https://teli.gent">teli.gent</a>
  <br />
  Built with &lt;3 by <a href="https://zeno.vision">zeno.vision</a>
</p>

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
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

GuruForge is a marketplace for domain-focused AI agents ("Gurus") delivered via Telegram. Each Guru remembers every user personally, synthesizes anonymized patterns across the entire community, and rewards the people who make the collective intelligence possible through on-chain token economics.

## At a Glance

| | |
|---|---|
| **7 Domain Gurus** | Fundraising, Operations, DeFi, Tokenomics, Leadership, Research, Audience Growth |
| **Collective Intelligence** | Every conversation makes every Guru smarter through anonymized pattern synthesis |
| **Token Economics** | Contributors earn on-chain token rewards proportional to their wisdom contributions |
| **Private by Default** | All conversations are confidential with full PII redaction before collective learning |

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
 preferences,       across all users)
 decisions)
   |                   |
   +---------+---------+
        |
The Guru gets smarter with every conversation
        |
Contributors earn token rewards
```

## Features

- **Personal Memory** — The Guru remembers your goals, preferences, and decisions across sessions. It picks up exactly where you left off, even weeks later.

- **Collective Wisdom** — Anonymized patterns are synthesized across all users: common challenges, successful strategies, and emerging trends.

- **Token Rewards** — Creators launch tokens for their Guru and distribute rewards to top contributors proportional to their contribution scores.

- **Proactive Engagement** — Personalized check-ins reference your specific goals and new community insights. Not generic notifications.

- **Intelligence Growth** — Each Guru's knowledge compounds over time. Knowledge Snapshots track how the community's collective wisdom evolves.

- **Structured Onboarding** — A 3-step intake immediately seeds personal memory so the Guru is useful from the very first conversation.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                 INTERACTION LAYER                  │
│                    Telegram                        │
│        Private 1-on-1 conversations                │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────┐
│               INTELLIGENCE LAYER                   │
│                                                    │
│   Triage → Response → Calibration → Memory         │
│                                                    │
│   Live Context → Personal Memory → Collective      │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────┐
│                DISCOVERY LAYER                     │
│            GuruForge Web Platform                  │
│  Marketplace · Profiles · Subscriptions · Feed     │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────┐
│               ECONOMICS LAYER                      │
│                                                    │
│   Subscriptions · Token Launch · Reward Distribution│
└──────────────────────────────────────────────────┘
```

## The Growth Flywheel

```
More contributors → Richer collective wisdom → Better Guru responses
       ↑                                                    ↓
Stronger contributor incentive ← Higher token value ← More subscribers
```

## Screenshots

<p align="center">
  <em>Marketplace — discover and subscribe to domain-focused Gurus</em>
</p>

<!-- TODO: Add marketplace screenshot -->

<p align="center">
  <em>How It Works — the intelligence stack and token economics</em>
</p>

<!-- TODO: Add how-it-works screenshot -->

<p align="center">
  <em>Wisdom Feed — collective insights surfaced across all Gurus</em>
</p>

<!-- TODO: Add wisdom-feed screenshot -->

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL 16+

### Setup

```bash
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Seed sample data
npx tsx lib/db/src/seed.ts

# Start development
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/guruforge run dev
```

Copy `.env.example` (if present) or see [CONTRIBUTING.md](CONTRIBUTING.md) for the full list of required environment variables and detailed setup instructions.

## API

The backend exposes a REST API documented with an [OpenAPI spec](lib/api-spec/openapi.yaml). Key areas:

- **Gurus** — Browse, search, create, and manage AI agents
- **Subscriptions** — Stripe-powered subscription billing
- **Telegram** — Bot connection and webhook handling
- **Wisdom** — Personal feeds, public journals, and the global wisdom feed
- **Leaderboard** — Contribution rankings and reward readiness
- **Token Economics** — Token launch and reward distribution (creator-only)

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

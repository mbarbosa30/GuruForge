import { db } from "./index";
import { categoriesTable, usersTable, gurusTable } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const existingCategories = await db.select().from(categoriesTable);
  if (existingCategories.length > 0) {
    console.log("Database already seeded. Skipping.");
    process.exit(0);
  }

  const [cat1, cat2, cat3, cat4, cat5] = await db.insert(categoriesTable).values([
    { name: "Founders & Operators", slug: "founders", description: "Gurus specialized in startup building, fundraising, operations, and scaling", icon: "briefcase", displayOrder: 1 },
    { name: "DeFi & Crypto", slug: "defi-crypto", description: "Expert systems for DeFi strategy, tokenomics, and blockchain operations", icon: "coins", displayOrder: 2 },
    { name: "Coaching & Growth", slug: "coaching", description: "Personal development, career coaching, and leadership growth", icon: "target", displayOrder: 3 },
    { name: "Research & Analysis", slug: "research", description: "Deep research, market analysis, and knowledge synthesis", icon: "search", displayOrder: 4 },
    { name: "Creator Economy", slug: "creator-economy", description: "Content strategy, audience building, and creator monetization", icon: "pen-tool", displayOrder: 5 },
  ]).returning();

  const [seedUser] = await db.insert(usersTable).values({
    clerkId: "seed_system_user",
    email: "system@guruforge.ai",
    name: "GuruForge Team",
    role: "admin",
  }).returning();

  await db.insert(gurusTable).values([
    {
      creatorId: seedUser.id,
      name: "The Fundraising Guru",
      slug: "fundraising-guru",
      tagline: "Your strategic partner through every funding round",
      description: "A specialized intelligence trained on hundreds of successful fundraising journeys. Knows what works at pre-seed through Series B, what investors actually look for, and how to structure your narrative for maximum impact. Combines pattern recognition from real founder experiences with deep knowledge of VC dynamics.",
      categoryId: cat1.id,
      status: "published",
      priceCents: 4900,
      priceInterval: "monthly",
      topics: ["fundraising", "pitch decks", "investor relations", "term sheets", "valuation"],
      personalityStyle: "direct",
      modelTier: "gpt",
      memoryPolicy: "Remembers your fundraising journey privately. Learns anonymized patterns from all users to improve advice quality.",
      introEnabled: true,
      wisdomScore: 82,
      satisfactionScore: 91,
      userCount: 347,
    },
    {
      creatorId: seedUser.id,
      name: "Operator's Edge",
      slug: "operators-edge",
      tagline: "Scale your company without losing your mind",
      description: "Built for founders and operators who have found product-market fit and now need to build the machine. Covers hiring, team structure, process design, OKRs, and the hard conversations nobody prepares you for. Synthesizes real operational wisdom from hundreds of scaling journeys.",
      categoryId: cat1.id,
      status: "published",
      priceCents: 3900,
      priceInterval: "monthly",
      topics: ["operations", "hiring", "team building", "scaling", "management"],
      personalityStyle: "professional",
      modelTier: "gpt",
      memoryPolicy: "Stores your company context privately. Shared learnings are fully anonymized.",
      introEnabled: false,
      wisdomScore: 76,
      satisfactionScore: 88,
      userCount: 215,
    },
    {
      creatorId: seedUser.id,
      name: "DeFi Strategist",
      slug: "defi-strategist",
      tagline: "Navigate DeFi with battle-tested intelligence",
      description: "Your specialized DeFi companion that understands yield strategies, risk management, protocol analysis, and portfolio construction. Learns from real positions and outcomes across hundreds of users to surface what actually works and what to avoid.",
      categoryId: cat2.id,
      status: "published",
      priceCents: 5900,
      priceInterval: "monthly",
      topics: ["DeFi", "yield farming", "liquidity provision", "risk management", "protocol analysis"],
      personalityStyle: "direct",
      modelTier: "grok",
      memoryPolicy: "Your positions and strategy stay private. Aggregated market patterns are shared anonymously.",
      introEnabled: true,
      wisdomScore: 89,
      satisfactionScore: 93,
      userCount: 523,
    },
    {
      creatorId: seedUser.id,
      name: "Tokenomics Architect",
      slug: "tokenomics-architect",
      tagline: "Design token systems that actually work",
      description: "Deep expertise in token design, distribution mechanics, incentive alignment, and launch strategy. Has analyzed hundreds of token launches — the successes and the failures — to help you build economic systems that create real value.",
      categoryId: cat2.id,
      status: "published",
      priceCents: 7900,
      priceInterval: "monthly",
      topics: ["tokenomics", "token design", "incentive design", "token launch", "economic modeling"],
      personalityStyle: "academic",
      modelTier: "grok",
      memoryPolicy: "Project details are strictly private. Design patterns are generalized for collective learning.",
      introEnabled: false,
      wisdomScore: 71,
      satisfactionScore: 86,
      userCount: 128,
    },
    {
      creatorId: seedUser.id,
      name: "Leadership Compass",
      slug: "leadership-compass",
      tagline: "Grow as a leader through real-world wisdom",
      description: "A coaching companion that combines leadership frameworks with real patterns from hundreds of leadership journeys. Helps with difficult conversations, decision-making under uncertainty, team dynamics, and personal growth. Gets wiser as more leaders share their experiences.",
      categoryId: cat3.id,
      status: "published",
      priceCents: 2900,
      priceInterval: "monthly",
      topics: ["leadership", "management", "decision making", "team dynamics", "personal growth"],
      personalityStyle: "friendly",
      modelTier: "gpt",
      memoryPolicy: "Your leadership context stays completely private. Shared wisdom is anonymized and generalized.",
      introEnabled: false,
      wisdomScore: 68,
      satisfactionScore: 90,
      userCount: 412,
    },
    {
      creatorId: seedUser.id,
      name: "Research Synthesizer",
      slug: "research-synthesizer",
      tagline: "Turn information overload into clear insight",
      description: "A knowledge companion that helps you process, synthesize, and draw conclusions from complex information. Excels at connecting dots across domains, identifying patterns in research, and structuring your thinking for better decisions.",
      categoryId: cat4.id,
      status: "published",
      priceCents: 1900,
      priceInterval: "monthly",
      topics: ["research", "analysis", "synthesis", "critical thinking", "knowledge management"],
      personalityStyle: "academic",
      modelTier: "gpt",
      memoryPolicy: "Research context is personal. Methodological patterns are shared to improve analysis quality for everyone.",
      introEnabled: false,
      wisdomScore: 63,
      satisfactionScore: 85,
      userCount: 189,
    },
    {
      creatorId: seedUser.id,
      name: "Audience Architect",
      slug: "audience-architect",
      tagline: "Build an audience that pays attention and pays you",
      description: "Specialized in content strategy, audience growth, and creator monetization. Combines real growth patterns from successful creators across platforms to help you build sustainably. Knows what content converts, what retains, and what to stop doing.",
      categoryId: cat5.id,
      status: "published",
      priceCents: 3400,
      priceInterval: "monthly",
      topics: ["content strategy", "audience growth", "monetization", "social media", "creator business"],
      personalityStyle: "friendly",
      modelTier: "grok",
      memoryPolicy: "Your content strategy is private. Growth patterns are anonymized across all creators.",
      introEnabled: true,
      wisdomScore: 74,
      satisfactionScore: 89,
      userCount: 298,
    },
  ]);

  console.log("Seed complete: 5 categories, 1 system user, 7 sample Gurus.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

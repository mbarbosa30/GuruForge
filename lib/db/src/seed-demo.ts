import { db } from "./index";
import {
  usersTable,
  gurusTable,
  collectivePatternsTable,
  contributionScoresTable,
  knowledgeSnapshotsTable,
  userMemoriesTable,
} from "./schema";
import { eq, like, inArray } from "drizzle-orm";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));
  return d;
}

const DEMO_USERS = [
  { name: "Alex Chen", email: "alex.chen@demo.gg" },
  { name: "Priya Sharma", email: "priya.sharma@demo.gg" },
  { name: "Marcus Johnson", email: "marcus.j@demo.gg" },
  { name: "Sofia Petrova", email: "sofia.p@demo.gg" },
  { name: "Kenji Tanaka", email: "kenji.t@demo.gg" },
  { name: "Amara Osei", email: "amara.o@demo.gg" },
  { name: "Lucas Moretti", email: "lucas.m@demo.gg" },
  { name: "Fatima Al-Rashid", email: "fatima.ar@demo.gg" },
  { name: "Ryan Park", email: "ryan.park@demo.gg" },
  { name: "Elena Volkov", email: "elena.v@demo.gg" },
  { name: "David Nkomo", email: "david.n@demo.gg" },
  { name: "Mei Lin Wu", email: "mei.lin@demo.gg" },
  { name: "Tomas Herrera", email: "tomas.h@demo.gg" },
  { name: "Aisha Patel", email: "aisha.p@demo.gg" },
  { name: "Nikolai Petrov", email: "nikolai.p@demo.gg" },
  { name: "Isabella Costa", email: "isabella.c@demo.gg" },
  { name: "Jin-ho Lee", email: "jinho.l@demo.gg" },
  { name: "Olivia Mensah", email: "olivia.m@demo.gg" },
];

type PatternDef = {
  patternType: string;
  publishTitle: string;
  redactedSummary: string;
  summary: string;
  frequency: number;
  confidence: number;
  sourceCount: number;
};

const PATTERNS_BY_GURU_SLUG: Record<string, PatternDef[]> = {
  "fundraising-guru": [
    { patternType: "successful_strategies", publishTitle: "Market-size-first narratives close 2.4x faster at Series A", redactedSummary: "Founders who opened their pitch with a defensible market sizing framework before discussing product consistently reached term sheet faster. The pattern holds across B2B and consumer.", summary: "73% of successful Series A founders led with TAM/SAM/SOM before product details. Avg time to term sheet: 6.2 weeks vs 14.8 weeks.", frequency: 47, confidence: 0.91, sourceCount: 34 },
    { patternType: "pitfalls", publishTitle: "Raising at inflated valuations creates a 'Series B trap'", redactedSummary: "Founders who accepted above-market valuations at seed frequently struggled to justify step-ups at Series A. Several reported having to do flat or down rounds despite strong growth.", summary: "18 of 23 founders with >40x revenue multiples at seed faced valuation compression at A. Median step-up for this cohort was 1.1x vs 2.8x for market-rate seeds.", frequency: 23, confidence: 0.87, sourceCount: 19 },
    { patternType: "common_questions", publishTitle: "When to hire a CFO vs. fractional finance lead", redactedSummary: "Repeatedly discussed threshold: full-time CFO becomes critical at $3-5M ARR or when preparing for Series B. Before that, a fractional finance lead plus a strong controller covers the gap.", summary: "28 conversations touched CFO timing. Consensus: fractional until $3-5M ARR unless complex revenue models or heavy regulatory requirements.", frequency: 28, confidence: 0.82, sourceCount: 22 },
    { patternType: "trends", publishTitle: "Investor preference shifting toward capital-efficient growth", redactedSummary: "Multiple users report investors now asking about burn multiple and payback period before growth rate. The era of growth-at-all-costs pitches appears to be ending.", summary: "Last 30 days: 15 users mentioned investors asking about burn multiple first. Up from 3 users two months prior.", frequency: 15, confidence: 0.78, sourceCount: 12 },
    { patternType: "successful_strategies", publishTitle: "Warm intros via portfolio founders outperform partner-direct outreach 3:1", redactedSummary: "Founders who secured introductions through existing portfolio companies consistently received faster responses and higher conversion to meetings compared to cold outreach or even mutual connections.", summary: "Portfolio founder intros: 62% meeting rate. Partner-direct cold: 19% meeting rate. Mutual connection: 38%.", frequency: 38, confidence: 0.89, sourceCount: 27 },
    { patternType: "common_questions", publishTitle: "Optimal data room structure that investors actually review", redactedSummary: "A consistent pattern emerged around data room organization. Investors overwhelmingly prefer a 5-section structure with financials upfront, followed by product metrics, team bios, cap table, and legal.", summary: "Analyzed 31 successful data rooms. 5-section format had 89% full-review rate vs 41% for unstructured rooms.", frequency: 31, confidence: 0.85, sourceCount: 24 },
  ],
  "operators-edge": [
    { patternType: "successful_strategies", publishTitle: "Engineering managers promoted from within outperform external hires in first 6 months", redactedSummary: "Companies that promoted senior engineers into management roles saw faster team velocity and lower attrition than those hiring external engineering managers, particularly at the 15-40 person stage.", summary: "Internal EM promotions: 23% velocity increase avg. External hires: 8% velocity decrease in first 6 months, 31% left within a year.", frequency: 19, confidence: 0.84, sourceCount: 16 },
    { patternType: "pitfalls", publishTitle: "Adopting OKRs too early creates planning theater", redactedSummary: "Teams under 20 people that implemented full OKR frameworks frequently reported spending more time on goal-setting rituals than execution. Lighter accountability systems worked better at this stage.", summary: "12 of 15 sub-20 teams abandoned formal OKRs within 2 quarters. Most successful replacement: weekly commitments with monthly retrospectives.", frequency: 15, confidence: 0.81, sourceCount: 12 },
    { patternType: "common_questions", publishTitle: "The 'first ops hire' debate: when and who", redactedSummary: "Consistent guidance emerged: the first dedicated operations hire should come at 25-30 employees, ideally someone who has scaled from 30 to 100 before. Earlier hires tend to over-process.", summary: "22 founders discussed first ops hire timing. Sweet spot: 25-30 employees. Profile: someone who has done 30-to-100 scaling.", frequency: 22, confidence: 0.79, sourceCount: 18 },
    { patternType: "trends", publishTitle: "Async-first communication beating hybrid meeting culture", redactedSummary: "Teams that defaulted to written async communication with optional sync meetings reported higher output quality and better documentation than those running traditional meeting-heavy schedules.", summary: "9 teams switched to async-first in last quarter. All reported fewer meetings and better decision documentation.", frequency: 12, confidence: 0.76, sourceCount: 9 },
    { patternType: "successful_strategies", publishTitle: "Skip-level 1:1s reveal retention risks 6-8 weeks earlier", redactedSummary: "Founders who ran monthly skip-level conversations identified flight risks and team frustrations significantly earlier than those relying solely on direct manager feedback loops.", summary: "14 founders with skip-levels caught 78% of retention issues before resignation. Without: 23% catch rate.", frequency: 14, confidence: 0.83, sourceCount: 11 },
  ],
  "defi-strategist": [
    { patternType: "successful_strategies", publishTitle: "Weekly LP rebalancing yields 2.3x better returns than passive", redactedSummary: "Users who actively rebalanced their liquidity positions on a weekly cadence consistently outperformed those using set-and-forget strategies, even accounting for gas costs on L2s.", summary: "Tracked 45 LP positions over 90 days. Weekly rebalancers: +18.7% avg. Passive: +8.1% avg. Net of gas on Base/Arbitrum.", frequency: 45, confidence: 0.92, sourceCount: 31 },
    { patternType: "pitfalls", publishTitle: "Chasing APY above 200% correlates with 67% loss rate", redactedSummary: "Positions entered in pools advertising >200% APY experienced impermanent loss or rug events at dramatically higher rates. The sustainable yield ceiling appears to be around 40-80% for established protocols.", summary: "67% of positions in >200% APY pools resulted in net loss. Sustainable range: 40-80% on established protocols.", frequency: 34, confidence: 0.94, sourceCount: 28 },
    { patternType: "common_questions", publishTitle: "Optimal stablecoin allocation across lending protocols", redactedSummary: "The most discussed topic: how to spread stablecoin exposure across Aave, Compound, and newer protocols. Consensus forming around 60/30/10 split between battle-tested and emerging platforms.", summary: "37 users discussed stablecoin allocation. Recommended: 60% Aave/Compound, 30% mid-tier (Morpho, Euler), 10% high-yield new protocols.", frequency: 37, confidence: 0.86, sourceCount: 29 },
    { patternType: "trends", publishTitle: "Restaking derivatives creating new yield primitives on Eigen layer", redactedSummary: "Multiple users exploring restaking strategies as a new yield source. Early adopters reporting 12-18% additional yield on top of base staking rewards, though smart contract risk remains elevated.", summary: "22 users entered restaking positions in last 30 days. Avg additional yield: 14.3%. 2 users experienced slashing events.", frequency: 22, confidence: 0.73, sourceCount: 17 },
    { patternType: "successful_strategies", publishTitle: "Dollar-cost averaging into volatile pairs reduces max drawdown by 40%", redactedSummary: "Users who entered concentrated liquidity positions gradually over 2-3 weeks experienced significantly lower maximum drawdowns compared to single-entry positions, especially in ETH-paired pools.", summary: "DCA entry over 2-3 weeks: max drawdown -12% avg. Single entry: max drawdown -21% avg across 52 positions.", frequency: 29, confidence: 0.88, sourceCount: 23 },
    { patternType: "pitfalls", publishTitle: "Cross-chain bridging during high congestion erodes 3-5% of capital", redactedSummary: "Users bridging assets during network congestion events consistently lost more to slippage and failed transactions than anticipated. Timing bridges during low-activity windows saves meaningful capital.", summary: "Analyzed 18 bridge events during congestion. Avg loss: 3.8% of bridged amount. Low-congestion bridges: 0.3% avg.", frequency: 18, confidence: 0.85, sourceCount: 14 },
    { patternType: "common_questions", publishTitle: "When to take profit: the 3x rule and its exceptions", redactedSummary: "A rule of thumb emerged: take 33% off the table at 3x, another 33% at 5x, and let the remainder ride. Users who followed this consistently outperformed those with no exit framework.", summary: "The 3x/5x profit-taking rule was discussed in 41 conversations. Users following it had 2.1x better risk-adjusted returns.", frequency: 41, confidence: 0.87, sourceCount: 33 },
  ],
  "tokenomics-architect": [
    { patternType: "successful_strategies", publishTitle: "Vesting cliffs of 12 months reduce post-TGE sell pressure by 60%", redactedSummary: "Token launches with 12-month team vesting cliffs experienced dramatically less sell pressure compared to 6-month cliffs. The market clearly rewards longer alignment signals.", summary: "Analyzed 14 token launches. 12-month cliff: -8% avg 90-day price decline. 6-month cliff: -34% avg decline.", frequency: 14, confidence: 0.88, sourceCount: 11 },
    { patternType: "pitfalls", publishTitle: "Over-allocating to liquidity mining depletes treasury within 18 months", redactedSummary: "Projects allocating more than 25% of total supply to liquidity incentives consistently ran out of emission budget before reaching sustainability. The mercenary capital problem remains unsolved.", summary: "8 of 10 projects with >25% liquidity mining allocation exhausted incentive budgets. Avg treasury runway: 14 months.", frequency: 10, confidence: 0.82, sourceCount: 8 },
    { patternType: "common_questions", publishTitle: "Fixed supply vs. inflationary: when each model wins", redactedSummary: "Fixed supply works for store-of-value narratives and community tokens. Inflationary models suit utility tokens with ongoing participation rewards. Hybrid models are gaining traction for governance tokens.", summary: "26 discussions on supply model. Fixed preferred for community/SoV (16). Inflationary for utility (7). Hybrid for governance (3).", frequency: 26, confidence: 0.79, sourceCount: 19 },
    { patternType: "trends", publishTitle: "Points-to-token conversion becoming the default launch pattern", redactedSummary: "New projects increasingly launch with off-chain points programs before converting to on-chain tokens. This pattern allows iteration on incentive mechanics before committing to immutable tokenomics.", summary: "7 of last 10 discussed launches used points-first strategy. Avg points program duration: 4-6 months before token.", frequency: 12, confidence: 0.74, sourceCount: 9 },
    { patternType: "successful_strategies", publishTitle: "Revenue-sharing tokens outperform pure governance tokens 4:1 in retention", redactedSummary: "Tokens that distribute protocol revenue to holders maintained active holder counts 4x better than pure governance tokens over 12-month periods. Tangible yield drives long-term holding behavior.", summary: "Revenue-sharing tokens: 72% holder retention at 12 months. Pure governance: 18% retention. Based on 9 comparable projects.", frequency: 9, confidence: 0.86, sourceCount: 7 },
  ],
  "leadership-compass": [
    { patternType: "successful_strategies", publishTitle: "Leaders who share decision rationale see 40% higher team trust scores", redactedSummary: "A clear pattern: leaders who explained the 'why' behind difficult decisions — even unpopular ones — maintained significantly higher team trust compared to those who communicated decisions without context.", summary: "40% higher trust scores (self-reported) for transparent-rationale leaders across 18 team assessments.", frequency: 18, confidence: 0.86, sourceCount: 15 },
    { patternType: "pitfalls", publishTitle: "Delaying difficult conversations costs an average of 3 months of team productivity", redactedSummary: "Leaders who avoided hard conversations about underperformance or role misfit reported the situations worsening over approximately 3 months before becoming unavoidable crises.", summary: "15 leaders tracked delay cost. Avg time from 'should have said something' to crisis: 11.4 weeks. All wished they acted sooner.", frequency: 15, confidence: 0.83, sourceCount: 12 },
    { patternType: "common_questions", publishTitle: "Managing former peers after promotion: the first 90 days", redactedSummary: "Newly promoted leaders consistently struggled with peer-to-manager transitions. Those who held explicit 1:1 reset conversations in the first two weeks navigated the shift more successfully.", summary: "21 conversations about peer-to-manager transitions. Key: explicit reset conversations within 14 days of promotion.", frequency: 21, confidence: 0.80, sourceCount: 17 },
    { patternType: "trends", publishTitle: "Energy management replacing time management as the core leadership skill", redactedSummary: "Leaders increasingly report that managing their energy — not their calendar — is the critical factor in sustained performance. Structured recovery periods and meeting-free blocks are the most common practices.", summary: "11 leaders adopted energy management frameworks in the last month. All reported improved decision quality.", frequency: 11, confidence: 0.72, sourceCount: 9 },
    { patternType: "successful_strategies", publishTitle: "Weekly written reflections accelerate leadership growth 2x", redactedSummary: "Leaders who maintained a weekly written reflection practice — even just 10 minutes — showed measurably faster growth in self-awareness and adaptive leadership compared to those relying on intuition alone.", summary: "12 leaders started weekly reflections. Self-assessed growth rate doubled. 360 feedback confirmed improvement in 9 of 12.", frequency: 12, confidence: 0.81, sourceCount: 10 },
    { patternType: "common_questions", publishTitle: "How to give feedback that actually changes behavior", redactedSummary: "The most effective feedback pattern: specific situation, observed behavior, impact on team/outcomes, and a question inviting the person's perspective. Sandwich feedback was consistently reported as ineffective.", summary: "34 discussions about feedback. SBI+Question model had highest behavior-change rate. Sandwich method: 0 positive reports.", frequency: 34, confidence: 0.88, sourceCount: 26 },
  ],
  "research-synthesizer": [
    { patternType: "successful_strategies", publishTitle: "The 'three-lens' framework catches blind spots 80% of the time", redactedSummary: "Researchers who analyzed findings through three distinct lenses — quantitative evidence, qualitative narrative, and contrarian view — identified critical blind spots that single-lens analysis missed.", summary: "Three-lens framework caught blind spots in 80% of cases across 20 research projects compared to single-perspective analysis.", frequency: 20, confidence: 0.85, sourceCount: 16 },
    { patternType: "pitfalls", publishTitle: "Confirmation bias amplifies in deep research sessions lasting over 4 hours", redactedSummary: "Extended research sessions without breaks showed a measurable increase in confirmation bias. Researchers who took structured breaks every 90 minutes produced more balanced conclusions.", summary: "Analysis of 25 research sessions. >4hr continuous sessions: 3x more likely to produce biased conclusions.", frequency: 25, confidence: 0.81, sourceCount: 18 },
    { patternType: "common_questions", publishTitle: "When to stop researching and start synthesizing", redactedSummary: "The most common challenge: knowing when to stop gathering and start concluding. A reliable signal emerged — when new sources confirm existing patterns without adding novel dimensions, synthesis should begin.", summary: "19 users discussed research stopping criteria. Best signal: information redundancy across 3+ independent sources.", frequency: 19, confidence: 0.77, sourceCount: 14 },
    { patternType: "trends", publishTitle: "AI-assisted literature review saving 60% of initial survey time", redactedSummary: "Users incorporating AI tools for initial literature sweeps report dramatic time savings on the survey phase, freeing more time for the higher-value synthesis and insight generation work.", summary: "14 users reported using AI for lit review. Avg time savings: 62%. Quality of final synthesis unchanged or improved.", frequency: 14, confidence: 0.75, sourceCount: 11 },
    { patternType: "successful_strategies", publishTitle: "Structured contrarian analysis prevents groupthink in team research", redactedSummary: "Research teams that assigned a formal 'devil's advocate' role and required written contrarian arguments produced findings with higher predictive accuracy than teams operating by consensus.", summary: "8 team research projects with formal contrarian role. Predictive accuracy: 74% vs 51% for consensus teams.", frequency: 8, confidence: 0.79, sourceCount: 6 },
  ],
  "audience-architect": [
    { patternType: "successful_strategies", publishTitle: "Creators who publish 3x/week see 5x faster audience growth than daily posters", redactedSummary: "Counter-intuitively, creators posting three high-quality pieces per week consistently outgrew daily posters. Quality-per-piece metrics strongly correlated with algorithmic distribution and audience retention.", summary: "3x/week creators: 847 avg new followers/month. Daily creators: 162 avg. Quality metrics 2.3x higher for 3x group.", frequency: 32, confidence: 0.90, sourceCount: 25 },
    { patternType: "pitfalls", publishTitle: "Platform dependency without email list creates existential risk", redactedSummary: "Multiple creators experienced devastating audience loss when platform algorithms changed or accounts were restricted. Those with email lists recovered their reach within weeks; those without started over.", summary: "7 creators lost >50% reach from algorithm changes. Email list holders recovered in avg 3 weeks. Others: 4+ months.", frequency: 16, confidence: 0.88, sourceCount: 13 },
    { patternType: "common_questions", publishTitle: "Monetization timing: when to launch paid offerings", redactedSummary: "The consensus threshold emerged around 1,000 engaged followers — not total followers. Engagement rate above 5% signals a community willing to pay. Launching too early with low engagement leads to discouraging conversion rates.", summary: "24 creators discussed monetization timing. Sweet spot: 1K+ engaged followers at 5%+ engagement rate.", frequency: 24, confidence: 0.83, sourceCount: 19 },
    { patternType: "trends", publishTitle: "Long-form content making a comeback as short-form saturates", redactedSummary: "Creators report declining returns on short-form video content as the format becomes saturated. Long-form newsletters and in-depth video essays are showing improved engagement and higher monetization rates.", summary: "Last 30 days: 13 creators shifted resources from short-form to long-form. Avg monetization per piece: 3.7x higher.", frequency: 13, confidence: 0.76, sourceCount: 10 },
    { patternType: "successful_strategies", publishTitle: "Community-first creators retain subscribers 3x longer than content-first", redactedSummary: "Creators who built community spaces (Discord, private groups) before launching paid content had dramatically better subscriber retention. The social layer creates switching costs that content alone cannot.", summary: "Community-first creators: 14-month avg subscriber lifetime. Content-first: 4.6-month avg. Based on 18 creators.", frequency: 18, confidence: 0.85, sourceCount: 14 },
    { patternType: "common_questions", publishTitle: "Pricing digital products: the $29-$49 sweet spot", redactedSummary: "Digital products (courses, templates, guides) priced between $29 and $49 consistently achieved the highest revenue per audience member. Lower prices didn't increase volume enough; higher prices reduced conversion.", summary: "Analyzed 21 digital product launches. $29-49 range: highest revenue/follower. Below $20: 2x volume but 4x less revenue.", frequency: 21, confidence: 0.82, sourceCount: 16 },
  ],
};

const MEMORY_TEMPLATES: Record<string, Array<{ category: string; displayTitle: string; topic: string; summary: string; importance: number }>> = {
  "fundraising-guru": [
    { category: "goals", displayTitle: "Raising Series A by Q3", topic: "fundraising", summary: "User is targeting a $8-12M Series A raise by Q3, currently at $1.2M ARR with 18% MoM growth.", importance: 0.95 },
    { category: "context", displayTitle: "B2B SaaS in healthcare compliance", topic: "company", summary: "Building a healthcare compliance automation platform. 47 enterprise customers. SOC2 Type II certified.", importance: 0.88 },
    { category: "preferences", displayTitle: "Prefers data-heavy pitch approach", topic: "communication", summary: "User responds best to quantitative frameworks and benchmarking data. Dislikes narrative-heavy advice without numbers.", importance: 0.72 },
    { category: "decisions", displayTitle: "Chose to delay hiring VP Sales", topic: "hiring", summary: "Decided to keep founder-led sales through Series A instead of hiring VP Sales early. Based on advice about founder-market expertise.", importance: 0.81 },
  ],
  "defi-strategist": [
    { category: "goals", displayTitle: "Building passive yield portfolio", topic: "strategy", summary: "Target: $500K deployed across 5-7 protocols generating 15-25% blended APY. Risk tolerance: moderate. No leverage.", importance: 0.93 },
    { category: "context", displayTitle: "Experienced with Aave and Uniswap V3", topic: "experience", summary: "Has been in DeFi since 2021. Comfortable with concentrated liquidity. Lost money in LUNA collapse — very risk-aware now.", importance: 0.86 },
    { category: "preferences", displayTitle: "Only invests in audited protocols", topic: "risk", summary: "Strict rule: only deployed protocols with at least 2 independent audits and $100M+ TVL. Will not touch unaudited contracts.", importance: 0.91 },
    { category: "history", displayTitle: "Successfully navigated ETH merge positioning", topic: "portfolio", summary: "Correctly positioned for ETH merge by increasing ETH allocation to 40% three months prior. Resulted in 34% portfolio gain.", importance: 0.77 },
  ],
  "leadership-compass": [
    { category: "goals", displayTitle: "Transitioning from IC to VP Engineering", topic: "career", summary: "Currently a Staff Engineer being considered for VP Eng role. Wants to develop people management and strategic planning skills.", importance: 0.94 },
    { category: "context", displayTitle: "Managing 3 teams, 14 direct+skip reports", topic: "organization", summary: "Responsible for platform, infrastructure, and developer experience teams. Company is 180 people, Series C stage.", importance: 0.85 },
    { category: "preferences", displayTitle: "Learns best through frameworks and mental models", topic: "learning", summary: "User prefers structured frameworks they can internalize and apply. Likes having a 'playbook' for different situations.", importance: 0.71 },
    { category: "decisions", displayTitle: "Implemented skip-level 1:1s monthly", topic: "management", summary: "Started monthly skip-level 1:1s based on previous conversation. Reports early positive signal on team trust and information flow.", importance: 0.82 },
  ],
  "audience-architect": [
    { category: "goals", displayTitle: "Grow newsletter to 10K subscribers", topic: "growth", summary: "Currently at 2,400 subscribers with 42% open rate. Target 10K by end of year while maintaining >35% open rate.", importance: 0.92 },
    { category: "context", displayTitle: "Writing about AI product management", topic: "niche", summary: "Niche: practical AI/ML for product managers. Posts 2x/week on LinkedIn, weekly newsletter. Background: PM at Google for 4 years.", importance: 0.87 },
    { category: "preferences", displayTitle: "Anti-growth-hack mentality", topic: "philosophy", summary: "Strongly dislikes engagement bait, follow-for-follow, and other growth hacking tactics. Wants organic, quality-driven growth.", importance: 0.73 },
    { category: "history", displayTitle: "Viral post drove 800 subscribers in one week", topic: "growth", summary: "A deep-dive post on 'Why most AI features fail' went viral, adding 800 subscribers in 7 days. Trying to replicate the format.", importance: 0.79 },
  ],
  "operators-edge": [
    { category: "goals", displayTitle: "Build first management layer by Q2", topic: "hiring", summary: "Company is at 22 people. Needs to hire 3 team leads before headcount hits 35. Wants to promote internally if possible.", importance: 0.93 },
    { category: "context", displayTitle: "B2B fintech, post-Series A", topic: "company", summary: "Building a compliance automation tool for banks. $4.2M raised, 18 enterprise customers, 31% QoQ revenue growth.", importance: 0.86 },
    { category: "decisions", displayTitle: "Switched from Scrum to Shape Up", topic: "process", summary: "Moved engineering from 2-week sprints to 6-week cycles after productivity plateau. Early results showing 40% fewer context switches.", importance: 0.81 },
    { category: "preferences", displayTitle: "Prefers battle-tested frameworks over novel approaches", topic: "management", summary: "User favors proven management practices with track records. Skeptical of trendy methodologies without evidence.", importance: 0.74 },
  ],
  "tokenomics-architect": [
    { category: "goals", displayTitle: "Designing token for social protocol", topic: "tokenomics", summary: "Building a decentralized social graph protocol. Needs token model for content curation, staking, and governance. Target TGE in 6 months.", importance: 0.94 },
    { category: "context", displayTitle: "Previously launched failed utility token", topic: "experience", summary: "First project had 90% token price decline in 3 months due to excessive emissions. Very conscious of inflation mechanics now.", importance: 0.88 },
    { category: "preferences", displayTitle: "Favors deflationary mechanisms", topic: "design", summary: "Strong preference for burn mechanics and buyback models over pure inflation. Wants real revenue backing token value.", importance: 0.82 },
    { category: "decisions", displayTitle: "Chose fixed supply over inflationary model", topic: "tokenomics", summary: "After extensive analysis, decided on 100M fixed supply with fee-redistribution to stakers rather than new emissions.", importance: 0.85 },
  ],
  "research-synthesizer": [
    { category: "goals", displayTitle: "Complete competitive landscape analysis", topic: "research", summary: "Mapping 47 competitors across 5 market segments for board presentation. Needs structured framework for comparison.", importance: 0.91 },
    { category: "context", displayTitle: "Strategy consultant at McKinsey", topic: "background", summary: "10 years in management consulting. Specializes in technology strategy and market entry analysis for Fortune 500 clients.", importance: 0.84 },
    { category: "preferences", displayTitle: "Wants MECE frameworks for everything", topic: "methodology", summary: "Trained in McKinsey-style mutually exclusive, collectively exhaustive frameworks. Wants all analysis structured this way.", importance: 0.76 },
    { category: "history", displayTitle: "Used three-lens method on AI market report", topic: "research", summary: "Applied the quantitative-qualitative-contrarian analysis to AI market sizing. Caught a major blind spot in adoption curves that changed the recommendation.", importance: 0.80 },
  ],
};

async function seedDemo() {
  console.log("Seeding demo engagement data...");

  const gurus = await db.select().from(gurusTable);
  if (gurus.length === 0) {
    console.error("No gurus found. Run the base seed script first: pnpm --filter @workspace/db run seed");
    process.exit(1);
  }
  const guruBySlug = Object.fromEntries(gurus.map(g => [g.slug, g]));

  let existingDemoUsers = await db.select().from(usersTable).where(like(usersTable.privyId, "demo_%"));
  let demoUsers: typeof existingDemoUsers;
  if (existingDemoUsers.length > 0) {
    console.log(`Found ${existingDemoUsers.length} existing demo users. Reusing.`);
    demoUsers = existingDemoUsers;
  } else {
    demoUsers = await db.insert(usersTable).values(
      DEMO_USERS.map((u, i) => ({
        privyId: `demo_user_${i + 1}`,
        email: u.email,
        name: u.name,
        role: "user" as const,
      }))
    ).returning();
    console.log(`Created ${demoUsers.length} demo users.`);
  }

  const existingPatterns = await db.select().from(collectivePatternsTable);
  if (existingPatterns.length > 0) {
    console.log(`Patterns already seeded (${existingPatterns.length}). Skipping.`);
  } else {
    let patternCount = 0;
    for (const [slug, patterns] of Object.entries(PATTERNS_BY_GURU_SLUG)) {
      const guru = guruBySlug[slug];
      if (!guru) { console.warn(`Guru "${slug}" not found, skipping patterns.`); continue; }
      await db.insert(collectivePatternsTable).values(
        patterns.map((p, i) => ({
          guruId: guru.id,
          patternType: p.patternType,
          summary: p.summary,
          publishTitle: p.publishTitle,
          redactedSummary: p.redactedSummary,
          frequency: p.frequency,
          confidence: p.confidence,
          sourceCount: p.sourceCount,
          createdAt: daysAgo(28 - i * 3),
          updatedAt: daysAgo(Math.max(0, 7 - i)),
        }))
      );
      patternCount += patterns.length;
    }
    console.log(`Seeded ${patternCount} collective patterns across ${Object.keys(PATTERNS_BY_GURU_SLUG).length} gurus.`);
  }

  const demoUserIds = demoUsers.map(u => u.id);
  const existingContribs = await db.select().from(contributionScoresTable).where(inArray(contributionScoresTable.userId, demoUserIds));
  if (existingContribs.length > 0) {
    console.log(`Demo contribution scores already seeded (${existingContribs.length}). Skipping.`);
  } else {
    const contribValues: Array<{
      userId: number; guruId: number; score: number; turnCount: number; patternsContributed: number; lastUpdatedAt: Date;
    }> = [];
    for (const guru of gurus) {
      const userSubset = demoUsers.slice(0, 8 + Math.floor(Math.random() * 10));
      for (let j = 0; j < userSubset.length; j++) {
        const user = userSubset[j];
        const score = Math.round((15 + Math.random() * 85) * 100) / 100;
        contribValues.push({
          userId: user.id,
          guruId: guru.id,
          score,
          turnCount: 10 + Math.floor(Math.random() * 90),
          patternsContributed: Math.floor(Math.random() * 8),
          lastUpdatedAt: daysAgo(Math.floor(Math.random() * 28)),
        });
      }
    }
    await db.insert(contributionScoresTable).values(contribValues);
    console.log(`Seeded ${contribValues.length} contribution scores.`);
  }

  const existingSnapshots = await db.select().from(knowledgeSnapshotsTable);
  if (existingSnapshots.length > 0) {
    console.log(`Knowledge snapshots already seeded (${existingSnapshots.length}). Skipping.`);
  } else {
    const snapshotValues: Array<any> = [];
    for (const guru of gurus) {
      const patterns = PATTERNS_BY_GURU_SLUG[guru.slug] || [];
      const patternCounts: Record<string, number> = {};
      for (const p of patterns) {
        patternCounts[p.patternType] = (patternCounts[p.patternType] || 0) + 1;
      }
      const topics = (guru.topics || []).slice(0, 5).map((t, i) => ({ topic: t, count: 30 - i * 5 + Math.floor(Math.random() * 10) }));
      const snapshotDays = [28, 21, 14, 7, 1];
      for (const day of snapshotDays) {
        const scale = 1 - (day / 35);
        snapshotValues.push({
          guruId: guru.id,
          snapshotData: {
            patternCounts,
            memoryDistribution: { goals: Math.round(24 * scale) || 3, preferences: Math.round(18 * scale) || 2, history: Math.round(31 * scale) || 4, decisions: Math.round(15 * scale) || 1, context: Math.round(22 * scale) || 3 },
            avgQualityScore: 0.62 + scale * 0.25,
            totalAnnotatedTurns: Math.round((200 + Math.floor(Math.random() * 600)) * scale) || 10,
            totalConversations: Math.round((40 + Math.floor(Math.random() * 160)) * scale) || 5,
            totalUsers: Math.round((guru.userCount || 50) * scale) || 8,
            topTopics: topics,
            confidenceDistribution: {
              high: Math.round((30 + Math.floor(Math.random() * 20)) * scale) || 2,
              medium: Math.round((35 + Math.floor(Math.random() * 15)) * scale) || 3,
              low: Math.round((5 + Math.floor(Math.random() * 10)) * scale) || 1,
            },
          },
          totalPatterns: Math.round((patterns.length + Math.floor(Math.random() * 10)) * scale) || 1,
          totalMemories: Math.round((80 + Math.floor(Math.random() * 200)) * scale) || 5,
          avgConfidence: 0.65 + scale * 0.2,
          createdAt: daysAgo(day),
        });
      }
    }
    await db.insert(knowledgeSnapshotsTable).values(snapshotValues);
    console.log(`Seeded ${snapshotValues.length} knowledge snapshots (${gurus.length} gurus x 5 time points).`);
  }

  const existingMemories = await db.select().from(userMemoriesTable).where(inArray(userMemoriesTable.userId, demoUserIds));
  if (existingMemories.length > 0) {
    console.log(`Demo user memories already seeded (${existingMemories.length}). Skipping.`);
  } else {
    const memoryValues: Array<{
      userId: number; guruId: number; category: string; summary: string;
      displayTitle: string; topic: string; importance: number;
      createdAt: Date; updatedAt: Date;
    }> = [];
    for (const [slug, memories] of Object.entries(MEMORY_TEMPLATES)) {
      const guru = guruBySlug[slug];
      if (!guru) continue;
      for (let i = 0; i < memories.length; i++) {
        const m = memories[i];
        const userCount = Math.min(3, demoUsers.length);
        for (let u = 0; u < userCount; u++) {
          const userIdx = (i * 3 + u) % demoUsers.length;
          const created = daysAgo(28 - i * 4 - u);
          memoryValues.push({
            userId: demoUsers[userIdx].id,
            guruId: guru.id,
            category: m.category,
            summary: m.summary + (u > 0 ? ` (Variation ${u + 1}: different specifics but same pattern.)` : ""),
            displayTitle: m.displayTitle,
            topic: m.topic,
            importance: Math.round((m.importance - u * 0.05) * 100) / 100,
            createdAt: created,
            updatedAt: daysAgo(Math.max(0, 5 - i)),
          });
        }
      }
    }
    await db.insert(userMemoriesTable).values(memoryValues);
    console.log(`Seeded ${memoryValues.length} user memories across ${Object.keys(MEMORY_TEMPLATES).length} gurus.`);
  }

  console.log("\nDemo seed complete.");
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error("Demo seed failed:", err);
  process.exit(1);
});

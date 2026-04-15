import { useEffect } from "react";
import { Link } from "wouter";

export default function HowItWorks() {
  useEffect(() => {
    document.title = "How It Works — GuruForge";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "Learn how GuruForge works: AI agents that remember every user, synthesize collective wisdom across private conversations, and reward contributors with on-chain tokens.";
    if (meta) {
      meta.setAttribute("content", content);
    } else {
      const el = document.createElement("meta");
      el.name = "description";
      el.content = content;
      document.head.appendChild(el);
    }
  }, []);

  const problems = [
    {
      num: "01",
      title: "Stateless AI",
      desc: "Traditional chatbots forget everything after each session. No continuity, no personal context, no compounding value over time.",
    },
    {
      num: "02",
      title: "Broadcast-first communities",
      desc: "Social platforms reward broadcasting to followers. Deep, private learning from peers is structurally impossible.",
    },
    {
      num: "03",
      title: "No incentive to contribute",
      desc: "Knowledge communities extract value from contributors without giving anything back. The smartest voices eventually leave.",
    },
  ];

  const journey = [
    {
      num: "01",
      title: "Creator builds a Guru",
      desc: "Define the domain, personality style, topic boundaries, and AI model tier. The Guru becomes the invisible center of a private wisdom circle.",
    },
    {
      num: "02",
      title: "Users subscribe and connect on Telegram",
      desc: "Subscribers link their accounts and begin private 1-on-1 conversations. Every interaction is confidential — the Guru never reveals what anyone said.",
    },
    {
      num: "03",
      title: "The Guru remembers you",
      desc: "Personal Memory stores your goals, preferences, decisions, and context. The Guru picks up exactly where you left off, even weeks later.",
    },
    {
      num: "04",
      title: "The Guru learns from everyone",
      desc: "Collective Wisdom synthesizes anonymized patterns across all users — common challenges, successful strategies, emerging trends — with full PII redaction.",
    },
    {
      num: "05",
      title: "The Guru gets smarter over time",
      desc: "Every conversation is calibrated for quality. Knowledge Snapshots track intelligence growth. The circle compounds wisdom with each interaction.",
    },
  ];

  const stack = [
    {
      label: "TRIAGE PIPELINE",
      title: "Intent classification",
      desc: "Before every response, a fast model classifies the user's intent, urgency level, and which memory tiers are needed — ensuring the right context is loaded for each message.",
    },
    {
      label: "MULTI-TIERED MEMORY",
      title: "Three layers of context",
      desc: "Tier 1: recent messages plus long-conversation compaction. Tier 2: personal facts, goals, and preferences per user. Tier 3: anonymized collective patterns across the entire community.",
    },
    {
      label: "CALIBRATION PIPELINE",
      title: "After-action analysis",
      desc: "Every exchange is evaluated for quality. New personal memories are extracted. Collective insights are identified. Contribution scores are updated — all happening asynchronously after the response.",
    },
    {
      label: "PROACTIVE ENGAGEMENT",
      title: "The Guru reaches out",
      desc: "Periodic personalized check-ins reference specific user goals and new community insights. Not generic notifications — contextually relevant messages that drive genuine engagement.",
    },
    {
      label: "CONVERSATION COMPACTION",
      title: "Infinite memory, bounded tokens",
      desc: "When conversations exceed 30 messages, older exchanges are summarized and compressed. The Guru retains the full arc of the relationship without blowing up the context window.",
    },
    {
      label: "STRUCTURED ONBOARDING",
      title: "First impressions that stick",
      desc: "A 3-step intake process asks about background, goals, and challenges — immediately seeding Tier 2 memory so the Guru is useful from the very first real conversation.",
    },
  ];

  const economics = [
    {
      num: "01",
      title: "Launch a token",
      desc: "Creators deploy custom tokens for their Guru on the Base network via Bankr integration. The token represents the economic layer of the wisdom circle.",
    },
    {
      num: "02",
      title: "Track contributions",
      desc: "Every user's impact on collective wisdom is measured through Contribution Scores — a composite of interaction quality, memory extraction value, and pattern generation.",
    },
    {
      num: "03",
      title: "Distribute rewards",
      desc: "Creators distribute token rewards to top contributors proportional to their scores. Wisdom Royalties: earn a stake in the intelligence you helped build.",
    },
  ];

  const flywheel = [
    { label: "More contributors", arrow: true },
    { label: "Richer collective wisdom", arrow: true },
    { label: "Better Guru responses", arrow: true },
    { label: "More subscribers", arrow: true },
    { label: "Higher token value", arrow: true },
    { label: "Stronger contributor incentive", arrow: false },
  ];

  const creatorBenefits = [
    "Define a domain-focused AI with custom personality and boundaries",
    "Earn recurring subscription revenue from your wisdom circle",
    "Launch a token tied to your community's collective intelligence",
    "Reward top contributors with automated token distributions",
    "Track your Guru's intelligence growth through Knowledge Snapshots",
    "Export training data for model fine-tuning (SFT, RLHF, RAG)",
  ];

  const userBenefits = [
    "Get personalized advice that actually remembers your full journey",
    "Benefit from collective wisdom synthesized across the community",
    "Earn token rewards for contributing valuable insights",
    "Private, confidential conversations — your data is never exposed",
    "Proactive check-ins based on your goals and new community patterns",
    "Structured onboarding that makes the Guru useful from day one",
  ];

  const architecture = [
    {
      layer: "INTERACTION",
      title: "Telegram",
      desc: "Private 1-on-1 conversations where all the real value is created",
    },
    {
      layer: "DISCOVERY",
      title: "GuruForge Platform",
      desc: "Marketplace, profiles, subscriptions, dashboards, and creator tools",
    },
    {
      layer: "PAYMENTS",
      title: "Stripe",
      desc: "Subscription billing for Guru access with tiered pricing",
    },
    {
      layer: "TOKEN ECONOMICS",
      title: "Bankr on Base",
      desc: "Token deployment, managed wallets, and batch reward distribution",
    },
    {
      layer: "AI MODELS",
      title: "Multi-provider",
      desc: "GPT and Grok model tiers with per-Guru configuration",
    },
  ];

  return (
    <>
      <section className="px-6 md:px-10 pt-20 md:pt-24 pb-16 md:pb-20 max-w-[820px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-7">
          How it works
        </p>
        <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.03em] leading-[1.1] mb-8 text-[#111]">
          AI agents that learn<br />
          collectively from private<br />
          conversations.
        </h1>
        <p className="text-base font-normal leading-[1.7] text-[#555] max-w-[620px] mb-12">
          GuruForge is the infrastructure for a new category: the Wisdom Network.
          Domain-focused AI agents that remember every user personally, synthesize
          anonymized patterns across the entire community, and reward the people
          who make the collective intelligence possible.
        </p>
        <div className="flex gap-8 items-center flex-wrap">
          <Link
            href="/marketplace"
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
          >
            Explore Gurus
          </Link>
          <Link
            href="/create"
            className="text-[13px] font-medium tracking-[0.04em] text-[#777] no-underline border-b border-[#bbb] pb-px hover:text-[#444] hover:border-[#888] transition-colors"
          >
            Create a Guru
          </Link>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 bg-[#f8f8f7]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-10">
          The problem
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] max-w-[900px]">
          {problems.map((item) => (
            <div key={item.num} className="bg-white px-6 md:px-7 py-8">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[#888] block mb-4">
                {item.num}
              </span>
              <h3 className="text-[15px] font-semibold mb-2.5 text-[#111]">
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#666] m-0">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-3">
          The user journey
        </p>
        <p className="text-[15px] text-[#666] max-w-[480px] mb-10">
          From creation to compounding wisdom — how a Guru evolves.
        </p>
        <div className="max-w-[720px] space-y-0">
          {journey.map((step, i) => (
            <div key={step.num} className={`flex gap-6 ${i < journey.length - 1 ? "pb-8 border-l border-[#e0e0e0] ml-3" : "ml-3"}`}>
              <div className="flex-shrink-0 -ml-3 w-6 h-6 bg-[#111] text-white flex items-center justify-center text-[10px] font-semibold">
                {step.num}
              </div>
              <div className="pb-2">
                <h3 className="text-[15px] font-semibold mb-1.5 text-[#111]">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-[1.65] text-[#666] m-0">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 bg-[#f8f8f7]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-3">
          The intelligence stack
        </p>
        <p className="text-[15px] text-[#666] max-w-[520px] mb-10">
          Six interconnected systems that make each Guru genuinely intelligent.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e0e0e0] max-w-[900px]">
          {stack.map((item) => (
            <div key={item.label} className="bg-white px-6 md:px-7 py-7">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-[#aaa] block mb-3">
                {item.label}
              </span>
              <h3 className="text-[15px] font-semibold mb-2 text-[#111]">
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#666] m-0">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-3">
          Token economics
        </p>
        <h2 className="text-[28px] md:text-[32px] font-light tracking-[-0.02em] leading-[1.15] mb-4 text-[#111]">
          Earn a stake in the<br />
          intelligence you build.
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#555] mb-10 max-w-[580px]">
          GuruForge aligns incentives between creators and contributors through
          on-chain token economics. The more you contribute to collective wisdom,
          the more you earn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] max-w-[900px] mb-14">
          {economics.map((item) => (
            <div key={item.num} className="bg-[#f8f8f7] px-6 md:px-7 py-8">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[#888] block mb-4">
                {item.num}
              </span>
              <h3 className="text-[15px] font-semibold mb-2.5 text-[#111]">
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#666] m-0">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-[900px]">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-6">
            The growth flywheel
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {flywheel.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#111] bg-[#f4f4f3] px-4 py-2.5 border border-[#e0e0e0]">
                  {item.label}
                </span>
                {item.arrow && (
                  <span className="text-[#bbb] text-[14px] select-none">&rarr;</span>
                )}
              </div>
            ))}
            <span className="text-[#bbb] text-[14px] select-none">&circlearrowright;</span>
          </div>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 bg-[#f8f8f7]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-10">
          Two sides of the network
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e0e0e0] max-w-[900px]">
          <div className="bg-white px-6 md:px-8 py-8">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-[#aaa] mb-5">
              FOR CREATORS
            </p>
            <ul className="space-y-3 m-0 p-0 list-none">
              {creatorBenefits.map((b, i) => (
                <li key={i} className="text-[13px] leading-[1.6] text-[#555] flex gap-3">
                  <span className="text-[#111] font-semibold text-[11px] mt-[3px] flex-shrink-0">&bull;</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white px-6 md:px-8 py-8">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-[#aaa] mb-5">
              FOR USERS
            </p>
            <ul className="space-y-3 m-0 p-0 list-none">
              {userBenefits.map((b, i) => (
                <li key={i} className="text-[13px] leading-[1.6] text-[#555] flex gap-3">
                  <span className="text-[#111] font-semibold text-[11px] mt-[3px] flex-shrink-0">&bull;</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-3">
          Platform architecture
        </p>
        <p className="text-[15px] text-[#666] max-w-[480px] mb-10">
          Five layers working together to deliver intelligent, private, economically-aligned conversations.
        </p>
        <div className="max-w-[720px] overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e0e0e0]">
                <th className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] py-3 pr-6 w-[160px]">Layer</th>
                <th className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] py-3 pr-6 w-[160px]">Provider</th>
                <th className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {architecture.map((row) => (
                <tr key={row.layer} className="border-b border-[#f0f0f0]">
                  <td className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#888] py-4 pr-6 align-top">{row.layer}</td>
                  <td className="text-[14px] font-semibold text-[#111] py-4 pr-6 align-top">{row.title}</td>
                  <td className="text-[13px] text-[#666] py-4 leading-[1.5] align-top">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-20 md:py-24 max-w-[720px]">
        <h2 className="text-[28px] md:text-[36px] font-light tracking-[-0.02em] leading-[1.15] mb-4 text-[#111]">
          The wisdom network<br />
          is live.
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#555] mb-10 max-w-[520px]">
          Join a circle that compounds collective intelligence with every conversation,
          or create one and build the community you wish existed.
        </p>
        <div className="flex gap-8 items-center flex-wrap">
          <Link
            href="/marketplace"
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
          >
            Explore Gurus
          </Link>
          <Link
            href="/create"
            className="text-[13px] font-medium tracking-[0.04em] text-[#777] no-underline border-b border-[#bbb] pb-px hover:text-[#444] hover:border-[#888] transition-colors"
          >
            Create Your Guru
          </Link>
        </div>
      </section>
    </>
  );
}

import { useEffect } from "react";
import { Link } from "wouter";
import Layout from "@/components/layout";
import GuruCard from "@/components/guru-card";
import GuruCardSkeleton from "@/components/guru-card-skeleton";
import { useListGurus } from "@workspace/api-client-react";

export default function Home() {
  const { data: gurus, isLoading } = useListGurus({ sort: "wisdom" });
  const featured = gurus?.slice(0, 6);

  useEffect(() => {
    document.title = "GuruForge — Wisdom. Community. Connection.";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "A marketplace of specialized AI agents that live inside Telegram. Each Guru learns collectively from every user's experience, growing wiser without ever exposing personal data.";
    if (meta) {
      meta.setAttribute("content", content);
    } else {
      const el = document.createElement("meta");
      el.name = "description";
      el.content = content;
      document.head.appendChild(el);
    }
  }, []);

  const pillars = [
    {
      num: "01",
      title: "Collective Wisdom",
      desc: "Every conversation is private, but the Guru quietly synthesizes anonymous patterns across all its users — surfacing insights no single person could see alone.",
    },
    {
      num: "02",
      title: "Real Human Connection",
      desc: "When the Guru senses two users could genuinely help each other, it proposes a warm introduction — but only if both independently consent.",
    },
    {
      num: "03",
      title: "Shared Ownership",
      desc: "Pioneer users earn a real slice of their Guru's growth through Wisdom Royalties, rewarding those who helped forge its intelligence early.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Discover",
      desc: "Find a Guru focused on the domain you care about — from DeFi strategy to fundraising to leadership.",
    },
    {
      num: "02",
      title: "Subscribe",
      desc: "Join a private wisdom community. Your subscription gives you ongoing access to an agent that grows smarter from everyone in it.",
    },
    {
      num: "03",
      title: "Connect via Telegram",
      desc: "Talk privately with your Guru inside Telegram. It remembers your journey, learns from the collective, and gets wiser with every conversation.",
    },
  ];

  return (
    <Layout>
      <section className="px-6 md:px-10 pt-20 md:pt-24 pb-16 md:pb-20 max-w-[820px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-7">
          The wisdom economy
        </p>
        <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.03em] leading-[1.1] mb-8 text-[#111]">
          Intelligence that<br />
          compounds with<br />
          every conversation.
        </h1>
        <p className="text-base font-normal leading-[1.7] text-[#666] max-w-[620px] mb-12">
          Each Guru is a specialized AI agent that lives inside Telegram.
          It learns collectively from every user who engages with it — compounding
          real human experience into wisdom that no single person could build alone.
        </p>
        <div className="flex gap-4 items-center flex-wrap">
          <Link
            href="/marketplace"
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
            data-testid="button-browse-marketplace"
          >
            Browse Marketplace
          </Link>
          <Link
            href="/create"
            className="text-[13px] font-medium tracking-[0.04em] text-[#777] no-underline border-b border-[#bbb] pb-px hover:text-[#444] hover:border-[#888] transition-colors"
            data-testid="button-create-guru"
          >
            Create a Guru
          </Link>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 max-w-[1200px]">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">
              Featured Gurus
            </p>
            <p className="text-[15px] text-[#777] max-w-[420px]">
              The highest-rated Gurus, ranked by community-driven wisdom score.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#777] no-underline border-b border-[#bbb] pb-0.5 hover:text-[#444] hover:border-[#888] transition-colors"
            data-testid="link-view-all"
          >
            View all
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <GuruCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && featured && featured.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            data-testid="featured-gurus"
          >
            {featured.map((guru) => (
              <GuruCard key={guru.id} guru={guru} />
            ))}
          </div>
        )}

        {!isLoading && (!featured || featured.length === 0) && (
          <p className="text-[15px] text-[#999] py-8">
            No Gurus available yet. Be the first to create one.
          </p>
        )}
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-10">
          How it works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] max-w-[900px]">
          {steps.map((step) => (
            <div key={step.num} className="bg-white px-6 md:px-7 py-8">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[#999] block mb-4">
                {step.num}
              </span>
              <h3 className="text-[15px] font-semibold mb-2.5 text-[#111]">
                {step.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#777] m-0">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 max-w-[600px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-6">
          For creators
        </p>
        <h2 className="text-[28px] md:text-[32px] font-light tracking-[-0.02em] leading-[1.15] mb-4 text-[#111]">
          Architect a domain.<br />
          Let the community forge it.
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#666] mb-8 max-w-[480px]">
          Define the focus, personality, and boundaries of a specialized AI agent.
          As subscribers engage with it inside Telegram, the Guru compounds their
          collective experience into living wisdom — and you earn recurring revenue
          from the community it builds.
        </p>
        <Link
          href="/create"
          className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
          data-testid="button-create-guru-cta"
        >
          Create a Guru
        </Link>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-10">
          Three pillars
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] max-w-[900px]">
          {pillars.map((item) => (
            <div key={item.num} className="bg-white px-6 md:px-7 py-8">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[#999] block mb-4">
                {item.num}
              </span>
              <h3 className="text-[15px] font-semibold mb-2.5 text-[#111]">
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#777] m-0">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

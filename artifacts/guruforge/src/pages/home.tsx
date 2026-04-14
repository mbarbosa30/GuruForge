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
    document.title = "GuruForge — The World's First Wisdom Network";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "Subscribe to AI Gurus that learn from every conversation. Private 1-on-1 chats on Telegram where collective intelligence grows without exposing personal data.";
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
      title: "The Invisible Thread",
      desc: "Each Guru is the quiet center of a wisdom circle — privately listening to every member, synthesizing anonymous patterns across conversations, and surfacing insights no single person could see.",
    },
    {
      num: "02",
      title: "Community-Owned Intelligence",
      desc: "The wisdom belongs to the circle, not the platform. Every member who contributes earns a meaningful stake in the collective intelligence they helped build through Wisdom Royalties.",
    },
    {
      num: "03",
      title: "Connections That Matter",
      desc: "When the Guru recognizes that two members could genuinely help each other, it proposes a warm introduction — but only if both independently consent. Real relationships, shared context.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Find your circle",
      desc: "Explore wisdom circles focused on the domains you care about most — from DeFi strategy to fundraising to personal leadership growth.",
    },
    {
      num: "02",
      title: "Join the conversation",
      desc: "Enter a private, ongoing dialogue with your Guru. It remembers your full journey, understands your context, and meets you where you are.",
    },
    {
      num: "03",
      title: "Watch wisdom compound",
      desc: "Every conversation makes the circle smarter. The Guru weaves anonymous patterns from across the community into deeper guidance for all.",
    },
  ];

  const comparison = [
    {
      dimension: "Interaction",
      social: "Broadcast to followers",
      ai: "Solo chat with a model",
      guruforge: "Private dialogue within a living community",
    },
    {
      dimension: "Value creation",
      social: "Content for attention",
      ai: "Answers from training data",
      guruforge: "Wisdom compounded from real human experience",
    },
    {
      dimension: "Ownership",
      social: "Platform owns everything",
      ai: "Provider owns the model",
      guruforge: "Community co-owns the intelligence it builds",
    },
    {
      dimension: "Connection",
      social: "Noisy, performative",
      ai: "None",
      guruforge: "Consent-based, contextually relevant introductions",
    },
    {
      dimension: "Memory",
      social: "Algorithmic feed",
      ai: "Resets every session",
      guruforge: "Personal memory + collective pattern recognition",
    },
    {
      dimension: "Output",
      social: "Engagement metrics",
      ai: "Generic responses",
      guruforge: "Domain-specific wisdom that deepens over time",
    },
  ];

  return (
    <Layout>
      <section className="px-6 md:px-10 pt-20 md:pt-24 pb-16 md:pb-20 max-w-[820px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-7">
          The world's first wisdom network
        </p>
        <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.03em] leading-[1.1] mb-8 text-[#111]">
          A new kind of network,<br />
          built on wisdom.
        </h1>
        <p className="text-base font-normal leading-[1.7] text-[#555] max-w-[620px] mb-12">
          Each Guru is the invisible thread connecting a private community.
          It synthesizes collective intelligence from every conversation — growing
          wiser without ever exposing what anyone said. Not a social network.
          Not a chatbot. A wisdom circle.
        </p>
        <div className="flex gap-8 items-center flex-wrap">
          <Link
            href="/marketplace"
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
            data-testid="button-browse-marketplace"
          >
            Explore Wisdom Circles
          </Link>
          <Link
            href="/create"
            className="text-[13px] font-medium tracking-[0.04em] text-[#777] no-underline border-b border-[#bbb] pb-px hover:text-[#444] hover:border-[#888] transition-colors"
            data-testid="button-create-guru"
          >
            Start a Circle
          </Link>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 max-w-[1200px]">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-3">
              Featured circles
            </p>
            <p className="text-[15px] text-[#666] max-w-[420px]">
              The wisest circles, ranked by community-driven wisdom score.
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
            No wisdom circles available yet. Be the first to start one.
          </p>
        )}
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 bg-[#f8f8f7]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-10">
          The wisdom journey
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] max-w-[900px]">
          {steps.map((step) => (
            <div key={step.num} className="bg-white px-6 md:px-7 py-8">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[#888] block mb-4">
                {step.num}
              </span>
              <h3 className="text-[15px] font-semibold mb-2.5 text-[#111]">
                {step.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#666] m-0">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-10">
          How this is different
        </p>
        <div className="max-w-[900px] overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e0e0e0]">
                <th className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] py-3 pr-6 w-[140px]" />
                <th className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] py-3 pr-6">Social networks</th>
                <th className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] py-3 pr-6">AI platforms</th>
                <th className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#111] py-3">GuruForge</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.dimension} className="border-b border-[#f0f0f0]">
                  <td className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#888] py-4 pr-6 align-top">{row.dimension}</td>
                  <td className="text-[13px] text-[#888] py-4 pr-6 leading-[1.5] align-top">{row.social}</td>
                  <td className="text-[13px] text-[#888] py-4 pr-6 leading-[1.5] align-top">{row.ai}</td>
                  <td className="text-[13px] text-[#333] py-4 leading-[1.5] align-top font-medium">{row.guruforge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 max-w-[720px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-6">
          For creators
        </p>
        <h2 className="text-[28px] md:text-[32px] font-light tracking-[-0.02em] leading-[1.15] mb-4 text-[#111]">
          Architect a wisdom circle.<br />
          Found a community.
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#555] mb-8 max-w-[580px]">
          Define the focus, personality, and boundaries of a specialized AI that
          becomes the invisible center of a community. As members engage, the Guru
          weaves their collective experience into living intelligence — and you earn
          recurring revenue from the wisdom circle you founded.
        </p>
        <Link
          href="/create"
          className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
          data-testid="button-create-guru-cta"
        >
          Start a Wisdom Circle
        </Link>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 bg-[#f8f8f7]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#777] mb-10">
          Three pillars
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] max-w-[900px]">
          {pillars.map((item) => (
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
    </Layout>
  );
}

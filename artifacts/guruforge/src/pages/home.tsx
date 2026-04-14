import { useState, useEffect } from "react";
import { Link } from "wouter";
import Layout from "@/components/layout";

export default function Home() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "creator" | "both">("user");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "GuruForge — Wisdom. Community. Connection.";
    const meta = document.querySelector('meta[name="description"]');
    const content = "A new marketplace where specialized AI Gurus are forged inside Telegram. They learn from real human experience, remember your journey, and get wiser every day.";
    if (meta) {
      meta.setAttribute("content", content);
    } else {
      const el = document.createElement("meta");
      el.name = "description";
      el.content = content;
      document.head.appendChild(el);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  const features = [
    {
      num: "01",
      title: "Collective Wisdom",
      desc: "Gurus that quietly learn real patterns from many users, without ever leaking personal data.",
    },
    {
      num: "02",
      title: "Real Human Connection",
      desc: "Safe, consent-based warm intros inside Telegram when the moment is right.",
    },
    {
      num: "03",
      title: "Shared Ownership",
      desc: "Pioneer users own a real slice of their Guru's growth through Pioneer Wisdom Royalties.",
    },
  ];

  return (
    <Layout>
      <section className="px-6 md:px-10 pt-20 md:pt-24 pb-16 md:pb-20 max-w-[680px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-7">
          Day zero — domain secured
        </p>
        <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.03em] leading-[1.1] mb-8 text-[#111]">
          Wisdom.<br />
          Community.<br />
          Connection.
        </h1>
        <p className="text-base font-normal leading-[1.7] text-[#666] max-w-[520px] mb-12">
          A new marketplace where specialized AI Gurus are forged
          inside Telegram. They learn from real human experience,
          remember your journey, and get wiser every day.
        </p>
        <div className="flex gap-4 items-center flex-wrap">
          <Link
            href="/marketplace"
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
            data-testid="button-browse-marketplace"
          >
            Browse Marketplace
          </Link>
          <a
            href="#waitlist"
            className="text-[13px] font-medium tracking-[0.04em] text-[#777] no-underline border-b border-[#bbb] pb-px hover:text-[#444] hover:border-[#888] transition-colors"
            data-testid="button-join-waitlist"
          >
            Join waitlist
          </a>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16 max-w-[600px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-6">
          The problem
        </p>
        <div className="text-[#555] text-[15px] leading-[1.8] space-y-4">
          <p>
            Most AI today is incredibly smart but stays isolated. It doesn't
            remember your full story. It can't learn from the real successes
            and failures of hundreds of people just like you.
          </p>
          <p>
            GuruForge will be different.
          </p>
          <p>
            We are building living AI Gurus powered by a proven 3-tier
            intelligence system — Triage, Conversation, Calibration.
          </p>
        </div>
      </section>

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section className="px-6 md:px-10 py-16">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-10">
          What's coming
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] max-w-[900px]">
          {features.map((item) => (
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

      <div className="border-t border-[#e0e0e0] mx-6 md:mx-10" />

      <section id="waitlist" className="px-6 md:px-10 py-16 max-w-[560px]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-6">
          Reserve your spot
        </p>
        <p className="text-xl font-light leading-[1.4] text-[#111] mb-2">
          Be part of the first chapter.
        </p>
        <p className="text-sm text-[#777] mb-8 leading-relaxed">
          This is day zero. No fake metrics. No overhyped claims.
        </p>

        {submitted ? (
          <div className="py-6">
            <p className="text-[15px] font-medium text-[#111] mb-1">You're on the list.</p>
            <p className="text-[13px] text-[#777]">We'll be in touch when it's time.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex mb-4">
              <label htmlFor="waitlist-email" className="sr-only">Email address</label>
              <input
                id="waitlist-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 h-11 px-4 border border-[#ddd] border-r-0 bg-white text-sm text-[#111] placeholder:text-[#bbb] outline-none focus:border-[#999] transition-colors"
                data-testid="input-email"
              />
              <button
                type="submit"
                className="h-11 px-6 bg-[#111] text-white border border-[#111] text-xs font-medium tracking-[0.06em] uppercase cursor-pointer hover:bg-[#333] transition-colors"
                data-testid="button-submit-waitlist"
              >
                Reserve
              </button>
            </div>

            <fieldset className="flex gap-2 items-center border-0 p-0 m-0">
              <legend className="sr-only">I am a</legend>
              <span className="text-xs text-[#888] mr-1" aria-hidden="true">I am a</span>
              {(["user", "creator", "both"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={`text-[11px] font-medium tracking-[0.04em] uppercase px-3.5 py-1 border cursor-pointer transition-all duration-150 ${
                    role === r
                      ? "border-[#111] bg-[#111] text-white"
                      : "border-[#ddd] bg-transparent text-[#777] hover:border-[#999] hover:text-[#444]"
                  }`}
                  data-testid={`button-role-${r}`}
                >
                  {r === "both" ? "Both" : r === "user" ? "User" : "Creator"}
                </button>
              ))}
            </fieldset>
          </form>
        )}
      </section>
    </Layout>
  );
}

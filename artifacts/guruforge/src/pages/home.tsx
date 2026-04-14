import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import {
  BrainCircuit,
  Users,
  TrendingUp,
  ArrowRight,
  Mail,
} from "lucide-react";

const fade: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

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

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] text-[#1a1a1a] font-sans selection:bg-teal-100 overflow-x-hidden">

      <header className="w-full flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[#1a1a1a]" data-testid="link-logo">
          GuruForge
        </Link>
        <a
          href="#waitlist"
          className="text-sm font-medium border border-[#d4d0c8] text-[#555] hover:text-[#1a1a1a] hover:border-[#aaa] rounded-full px-5 py-2 transition-colors inline-flex items-center"
          data-testid="link-nav-waitlist"
        >
          Join Waitlist
        </a>
      </header>

      <section className="px-6 md:px-12 pt-20 pb-28 md:pt-32 md:pb-40 max-w-3xl mx-auto text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center">
          <motion.h1
            variants={fade}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8 text-[#1a1a1a]"
          >
            Wisdom. Community.{" "}
            <br className="hidden sm:block" />
            Connection.
          </motion.h1>

          <motion.p variants={fade} className="text-lg md:text-xl leading-relaxed text-[#555] max-w-2xl mb-6">
            A new marketplace where specialized AI Gurus are forged inside Telegram.
            They learn from real human experience, remember your journey,
            and get wiser every day.
          </motion.p>

          <motion.p variants={fade} className="text-sm text-[#888] mb-10">
            Just an idea for now. Domain secured today. Private beta coming soon.
          </motion.p>

          <motion.div variants={fade} className="flex flex-col sm:flex-row gap-3">
            <a
              href="#waitlist"
              className="bg-[#1a1a1a] hover:bg-[#333] text-white font-medium px-8 h-12 rounded-full text-base transition-colors inline-flex items-center justify-center"
              data-testid="button-join-waitlist"
            >
              Join the Founding Waitlist
            </a>
            <a
              href="#waitlist"
              className="text-[#666] hover:text-[#1a1a1a] font-medium px-6 h-12 rounded-full text-base transition-colors inline-flex items-center justify-center gap-1"
              data-testid="button-forge-guru"
            >
              I want to forge a Guru <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      <div className="w-full border-t border-[#e8e5dd]" />

      <section className="px-6 md:px-12 py-24 md:py-32 max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.h2 variants={fade} className="text-2xl md:text-3xl font-bold tracking-tight mb-10 text-[#1a1a1a]">
            Why we're building GuruForge
          </motion.h2>

          <motion.div variants={fade} className="space-y-6 text-[#555] text-base md:text-lg leading-relaxed">
            <p>
              Most AI today is incredibly smart... but it stays isolated.
            </p>
            <p>
              It doesn't remember your full story. It can't learn from the real successes
              and failures of hundreds of people just like you. And it can never make
              genuine human connections.
            </p>
            <p>
              GuruForge will be different.
            </p>
            <p>
              We are building living AI Gurus powered by a proven 3-tier intelligence
              system — Triage, Conversation, Calibration. They will synthesize
              collective wisdom privately and securely, while protecting every
              user's personal information.
            </p>
            <p className="text-[#777] text-base">
              The earlier you join, the more you help shape them — and the more you
              may benefit as they grow.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <div className="w-full border-t border-[#e8e5dd]" />

      <section className="px-6 md:px-12 py-24 md:py-32 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.h2 variants={fade} className="text-2xl md:text-3xl font-bold tracking-tight mb-14 text-[#1a1a1a]">
            What's coming
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            <motion.div variants={fade}>
              <div className="w-10 h-10 rounded-lg bg-[#f0eeea] flex items-center justify-center mb-5">
                <BrainCircuit className="w-5 h-5 text-[#777]" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#1a1a1a]">Collective Wisdom</h3>
              <p className="text-[#666] text-base leading-relaxed">
                Gurus that quietly learn real patterns — what actually works and why —
                from many users, without ever leaking personal data.
              </p>
            </motion.div>

            <motion.div variants={fade}>
              <div className="w-10 h-10 rounded-lg bg-[#f0eeea] flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-[#777]" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#1a1a1a]">Real Human Connection</h3>
              <p className="text-[#666] text-base leading-relaxed">
                Safe, consent-based warm intros inside Telegram when the moment
                is right. Real people, real help.
              </p>
            </motion.div>

            <motion.div variants={fade}>
              <div className="w-10 h-10 rounded-lg bg-[#f0eeea] flex items-center justify-center mb-5">
                <TrendingUp className="w-5 h-5 text-[#777]" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#1a1a1a]">Shared Ownership</h3>
              <p className="text-[#666] text-base leading-relaxed">
                Pioneer users who join early will own a real slice of their Guru's
                future growth through Wisdom Royalties.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <div className="w-full border-t border-[#e8e5dd]" />

      <section id="waitlist" className="px-6 md:px-12 py-24 md:py-32 max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.h2 variants={fade} className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-[#1a1a1a]">
            Be part of the first chapter.
          </motion.h2>

          <motion.p variants={fade} className="text-[#666] text-base md:text-lg leading-relaxed mb-10">
            This is day zero. No fake metrics. No overhyped claims.
            Just a clear vision and the beginning of something we believe will matter.
          </motion.p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 text-center"
            >
              <p className="text-lg font-medium text-[#1a1a1a] mb-2">You're on the list.</p>
              <p className="text-[#777] text-base">We'll be in touch when it's time.</p>
            </motion.div>
          ) : (
            <motion.form variants={fade} onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <label htmlFor="waitlist-email" className="sr-only">Email address</label>
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" aria-hidden="true" />
                  <input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-full border border-[#d4d0c8] bg-white text-[#1a1a1a] placeholder:text-[#aaa] focus:outline-none focus:border-[#888] transition-colors text-base"
                    data-testid="input-email"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#1a1a1a] hover:bg-[#333] text-white font-medium px-8 h-12 rounded-full text-base transition-colors shrink-0"
                  data-testid="button-submit-waitlist"
                >
                  Reserve Your Spot as a Founding Member
                </button>
              </div>

              <fieldset className="flex items-center gap-1 border-0 p-0 m-0">
                <legend className="sr-only">I am a</legend>
                <span className="text-sm text-[#888] mr-2" aria-hidden="true">I am a</span>
                {(["user", "creator", "both"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                      role === r
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-[#f0eeea] text-[#666] hover:text-[#1a1a1a]"
                    }`}
                    data-testid={`button-role-${r}`}
                  >
                    {r === "both" ? "Both" : r === "user" ? "User" : "Creator"}
                  </button>
                ))}
              </fieldset>
            </motion.form>
          )}
        </motion.div>
      </section>

      <div className="w-full border-t border-[#e8e5dd]" />

      <footer className="px-6 md:px-12 py-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm text-[#888]">
          Built on the proven 3-tier intelligence system from selfclaw.ai & teli.gent
        </span>
        <span className="text-sm text-[#aaa]">guruforge.ai</span>
      </footer>

    </div>
  );
}

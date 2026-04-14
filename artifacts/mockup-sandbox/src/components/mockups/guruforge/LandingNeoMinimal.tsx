import { useState } from "react";

export function LandingNeoMinimal() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "creator" | "both">("user");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      color: "#111",
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: "15px",
      lineHeight: 1.6,
    }}>

      {/* Header — rule-based, no chrome */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 40px",
        borderBottom: "1px solid #e0e0e0",
      }}>
        <span style={{
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#111",
        }}>
          GuruForge
        </span>
        <a href="#waitlist" style={{
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#888",
          textDecoration: "none",
          borderBottom: "1px solid #ccc",
          paddingBottom: "2px",
        }}>
          Waitlist
        </a>
      </header>

      {/* Hero — asymmetric, type-driven */}
      <section style={{
        padding: "100px 40px 80px",
        maxWidth: "680px",
      }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "28px",
        }}>
          Day zero — domain secured
        </p>
        <h1 style={{
          fontSize: "48px",
          fontWeight: 300,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          margin: "0 0 32px",
          color: "#111",
        }}>
          Wisdom.<br />
          Community.<br />
          Connection.
        </h1>
        <p style={{
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: 1.7,
          color: "#666",
          maxWidth: "520px",
          margin: "0 0 48px",
        }}>
          A new marketplace where specialized AI Gurus are forged
          inside Telegram. They learn from real human experience,
          remember your journey, and get wiser every day.
        </p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a href="#waitlist" style={{
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#fff",
            backgroundColor: "#111",
            padding: "12px 28px",
            textDecoration: "none",
            display: "inline-block",
          }}>
            Join waitlist
          </a>
          <a href="#waitlist" style={{
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: "#888",
            textDecoration: "none",
            borderBottom: "1px solid #ccc",
            paddingBottom: "1px",
          }}>
            Forge a Guru
          </a>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #e0e0e0", margin: "0 40px" }} />

      {/* Vision — left-aligned prose */}
      <section style={{ padding: "64px 40px", maxWidth: "600px" }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "24px",
        }}>
          The problem
        </p>
        <div style={{ color: "#555", fontSize: "15px", lineHeight: 1.8 }}>
          <p style={{ marginBottom: "16px" }}>
            Most AI today is incredibly smart but stays isolated. It doesn't
            remember your full story. It can't learn from the real successes
            and failures of hundreds of people just like you.
          </p>
          <p style={{ marginBottom: "16px" }}>
            GuruForge will be different.
          </p>
          <p style={{ marginBottom: "16px" }}>
            We are building living AI Gurus powered by a proven 3-tier
            intelligence system — Triage, Conversation, Calibration.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #e0e0e0", margin: "0 40px" }} />

      {/* What's Coming — numbered list, no icons */}
      <section style={{ padding: "64px 40px" }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "40px",
        }}>
          What's coming
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px",
          backgroundColor: "#e0e0e0",
          maxWidth: "900px",
        }}>
          {[
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
          ].map((item) => (
            <div key={item.num} style={{
              backgroundColor: "#fff",
              padding: "32px 28px",
            }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#bbb",
                display: "block",
                marginBottom: "16px",
              }}>
                {item.num}
              </span>
              <h3 style={{
                fontSize: "15px",
                fontWeight: 600,
                marginBottom: "10px",
                color: "#111",
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: "13px",
                lineHeight: 1.65,
                color: "#777",
                margin: 0,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #e0e0e0", margin: "0 40px" }} />

      {/* Waitlist — minimal form */}
      <section id="waitlist" style={{ padding: "64px 40px", maxWidth: "560px" }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "24px",
        }}>
          Reserve your spot
        </p>
        <p style={{
          fontSize: "20px",
          fontWeight: 300,
          lineHeight: 1.4,
          color: "#111",
          marginBottom: "8px",
        }}>
          Be part of the first chapter.
        </p>
        <p style={{
          fontSize: "14px",
          color: "#888",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}>
          This is day zero. No fake metrics. No overhyped claims.
        </p>

        {submitted ? (
          <div style={{ padding: "24px 0" }}>
            <p style={{ fontSize: "15px", fontWeight: 500, color: "#111", marginBottom: "4px" }}>
              You're on the list.
            </p>
            <p style={{ fontSize: "13px", color: "#888" }}>
              We'll be in touch when it's time.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubmitted(true); }}>
            <div style={{ display: "flex", gap: "0px", marginBottom: "16px" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1,
                  height: "44px",
                  padding: "0 16px",
                  border: "1px solid #ddd",
                  borderRight: "none",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  color: "#111",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  height: "44px",
                  padding: "0 24px",
                  backgroundColor: "#111",
                  color: "#fff",
                  border: "1px solid #111",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Reserve
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#aaa", marginRight: "4px" }}>I am a</span>
              {(["user", "creator", "both"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "5px 14px",
                    border: "1px solid",
                    borderColor: role === r ? "#111" : "#ddd",
                    backgroundColor: role === r ? "#111" : "transparent",
                    color: role === r ? "#fff" : "#888",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {r === "both" ? "Both" : r === "user" ? "User" : "Creator"}
                </button>
              ))}
            </div>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        padding: "24px 40px",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: "11px", color: "#bbb", letterSpacing: "0.02em" }}>
          Built on the 3-tier intelligence system from selfclaw.ai & teli.gent
        </span>
        <span style={{ fontSize: "11px", color: "#ccc" }}>guruforge.ai</span>
      </footer>
    </div>
  );
}

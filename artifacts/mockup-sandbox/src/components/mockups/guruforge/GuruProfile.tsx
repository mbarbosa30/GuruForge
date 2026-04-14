import React from "react";
import { BrainCircuit, ShieldCheck, Users, MessageSquare, ArrowLeft, BarChart3, Database, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const WISDOM_DATA = [
  { month: "Jan", score: 82 },
  { month: "Feb", score: 85 },
  { month: "Mar", score: 88 },
  { month: "Apr", score: 89 },
  { month: "May", score: 92 },
  { month: "Jun", score: 94 },
];

export function GuruProfile() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 h-14 flex items-center max-w-5xl">
          <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Left/Main Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Profile Info */}
            <section className="bg-white border border-slate-200 rounded-xl p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-8 h-8 text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">Finance & VC</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">VC Scout Pro</h1>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Deep intelligence for startup fundraising. Trained on 10,000+ term sheets, public market comps, and early-stage negotiation patterns.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-t border-slate-100">
                <div>
                  <div className="text-2xl font-bold text-slate-900">94<span className="text-sm font-normal text-slate-500">/100</span></div>
                  <div className="text-xs text-slate-500 font-medium">WISDOM SCORE</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">4.8</div>
                  <div className="text-xs text-slate-500 font-medium">RATING</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">4.2k</div>
                  <div className="text-xs text-slate-500 font-medium">SUBSCRIBERS</div>
                </div>
              </div>
            </section>

            {/* Architecture / Capabilities */}
            <section>
              <h2 className="text-xl font-bold mb-4">Intelligence Architecture</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <BarChart3 className="w-5 h-5 text-slate-600 mb-3" />
                  <h3 className="font-semibold text-sm mb-1">Tier 1: Triage</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Real-time intent classification to route queries instantly.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <Database className="w-5 h-5 text-slate-600 mb-3" />
                  <h3 className="font-semibold text-sm mb-1">Tier 2: Private</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Isolated context memory for your specific term sheets.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <RefreshCw className="w-5 h-5 text-slate-600 mb-3" />
                  <h3 className="font-semibold text-sm mb-1">Tier 3: Collective</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Continuous learning from anonymized market trends.</p>
                </div>
              </div>
            </section>

            {/* Chart */}
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-base font-bold">Wisdom Growth</h2>
                  <p className="text-xs text-slate-500">Score improvement over 6 months</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">+14.6%</Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WISDOM_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[70, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                      itemStyle={{ color: '#2563eb' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold mb-4">Subscriber Reviews</h2>
              <div className="space-y-4">
                {[
                  { text: "Saved us from agreeing to a 2x participating preference in our Seed round. Paid for itself instantly.", author: "Founder, SaaS Startup", rating: 5 },
                  { text: "The private memory feature is key. I upload all previous term sheets and it spots inconsistencies immediately.", author: "Partner, Micro-fund", rating: 5 },
                  { text: "Solid analysis, though occasionally too conservative on market-standard SAFE caps.", author: "Angel Investor", rating: 4 }
                ].map((review, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'fill-slate-700 text-slate-700' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 mb-3">"{review.text}"</p>
                    <span className="text-xs text-slate-500 font-medium">— {review.author}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
          
          {/* Right Column / Sticky Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-20 shadow-sm">
              <div className="mb-6">
                <div className="text-3xl font-bold text-slate-900">$49<span className="text-base text-slate-500 font-normal">/mo</span></div>
                <p className="text-sm text-slate-500 mt-1">Cancel anytime. No token limits.</p>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3">
                Subscribe Now
              </Button>
              <Button variant="outline" className="w-full border-slate-200 text-slate-700 gap-2 mb-6">
                <MessageSquare className="w-4 h-4" />
                Chat on Telegram
              </Button>
              
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">Unlimited Tier 1 & 2 queries</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">Private memory state retention</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">Web search & Calculator tools</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

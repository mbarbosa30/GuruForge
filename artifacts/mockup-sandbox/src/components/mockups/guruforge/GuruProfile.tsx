import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Star, Shield, ArrowRight, Zap, MessageSquare, Activity, ShieldCheck, Network, Lock, Users, ChevronRight, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      
      {/* Navbar Minimal */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 h-8 w-8">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
            <span className="text-slate-300 text-sm font-medium">Back to Marketplace</span>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6 text-sm rounded-full">
            Subscribe $49/mo
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Hero Profile */}
            <section className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)] shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                <BrainCircuit className="w-16 h-16 text-emerald-400 relative z-10" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800">Finance & VC</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-400" /> Pioneer Guru
                      </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">VC Scout Pro</h1>
                  </div>
                  <div className="text-right shrink-0 hidden md:block">
                    <div className="text-3xl font-bold text-slate-100">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                  </div>
                </div>
                
                <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                  Deep intelligence for startup fundraising. Trained on 10,000+ term sheets, public market comps, and Tier 3 collective negotiation data. 
                </p>
                
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">94<span className="text-sm text-slate-500 font-normal">/100</span></div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Wisdom Score</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">4.8</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Satisfaction</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">4,247</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Subscribers</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex md:hidden pt-4 border-t border-slate-800 w-full justify-between items-center">
                  <div className="text-2xl font-bold text-slate-100">$49<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Subscribe</Button>
                </div>
              </div>
            </section>

            <hr className="border-slate-800/60" />

            {/* Architecture Section - The core feature */}
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">3-Tier Intelligence System</h2>
                <p className="text-slate-400">How VC Scout Pro processes, synthesizes, and learns from data.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Tier 1 */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/30" />
                  <Zap className="w-6 h-6 text-amber-400 mb-4" />
                  <h3 className="font-bold text-slate-200 mb-2">Tier 1: Triage</h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Intent classification & memory routing. Decides instantly whether a query needs deep synthesis or factual retrieval.
                  </p>
                  <div className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded inline-block">
                    ~120ms Latency
                  </div>
                </div>

                {/* Tier 2 */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30" />
                  <Lock className="w-6 h-6 text-blue-400 mb-4" />
                  <h3 className="font-bold text-slate-200 mb-2">Tier 2: Private</h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Dedicated isolation layer for your personal portfolio data, past term sheets, and specific fund mandates.
                  </p>
                  <div className="text-xs font-mono text-blue-400/80 bg-blue-500/10 px-2 py-1 rounded inline-block">
                    AES-256 Encrypted
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30" />
                  <Network className="w-6 h-6 text-emerald-400 mb-4" />
                  <h3 className="font-bold text-slate-200 mb-2">Tier 3: Collective</h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Post-response reflection loop. Synthesizes anonymized market trends across all 4,200+ subscribers.
                  </p>
                  <div className="text-xs font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                    Wisdom Royalties Active
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-slate-800/60" />

            {/* Chart Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">Wisdom Calibration</h2>
                  <p className="text-sm text-slate-400">Guru intelligence growth over time via Tier 3 learning.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">+14.6%</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">6mo Trajectory</div>
                </div>
              </div>
              
              <div className="h-64 w-full bg-slate-900/30 border border-slate-800 rounded-2xl p-6 pt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WISDOM_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} domain={[70, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <hr className="border-slate-800/60" />

            {/* Recent Synthesis Feed */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold">Recent Collective Synthesis</h2>
              <div className="space-y-4">
                {[
                  { time: "2 hours ago", text: "Identified a 15% increase in liquidation preferences in Seed stage term sheets this month.", type: "Market Trend" },
                  { time: "5 hours ago", text: "Calibrated response model for SAFE note caps vs. traditional priced equity rounds.", type: "Model Update" },
                  { time: "1 day ago", text: "Synthesized new valuation frameworks for generative AI application layer startups.", type: "Knowledge Expansion" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <Activity className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-200">{item.type}</span>
                        <span className="text-xs text-slate-500">{item.time}</span>
                      </div>
                      <p className="text-sm text-slate-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          {/* Right Column: Sticky Sidebar / Telegram Preview */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Action Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold mb-4 gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat on Telegram
              </Button>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  Unlimited Tier 1 & 2 queries
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  Private memory state retention
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  Web search & Calculator tools
                </li>
              </ul>
              
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-semibold text-emerald-400 text-sm">Pioneer Royalties</h4>
                </div>
                <p className="text-xs text-emerald-100/60 leading-relaxed">
                  Early subscribers earn proportional royalties based on Tier 3 data contributions to the collective wisdom.
                </p>
              </div>
            </div>

            {/* Telegram Preview */}
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">VC Scout Pro</h4>
                  <p className="text-[10px] text-emerald-400 font-medium">online</p>
                </div>
              </div>
              
              <div className="p-4 space-y-4 bg-[url('/__mockup/images/guruforge-network.png')] bg-cover bg-center bg-no-repeat relative">
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" />
                
                <div className="relative z-10 space-y-4">
                  <div className="text-xs text-center text-slate-500 font-medium">October 12</div>
                  
                  <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tr-sm p-3 text-sm max-w-[85%] ml-auto shadow-lg">
                    I just got a term sheet for a $3M seed at $15M post. 1x non-participating preference, but they want pro-rata rights. Standard?
                  </div>
                  
                  <div className="bg-emerald-900/40 border border-emerald-500/20 text-emerald-100 rounded-2xl rounded-tl-sm p-3 text-sm max-w-[90%] shadow-lg">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                      <Activity className="w-3 h-3" /> Tier 3 Market Synthesis
                    </div>
                    Based on recent market calibration, 1x non-participating is standard (seen in 92% of seeds). However, pro-rata rights at Seed are becoming less common (only 34% last quarter) as it crowds out Series A leads.
                    <br/><br/>
                    I've cross-referenced your Tier 2 memory: your previous startup had pro-rata rights that complicated your Series A. I recommend pushing back.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

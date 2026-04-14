import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, Users, BrainCircuit, Shield, MessageSquare, ChevronDown, ChevronRight, Zap, TrendingUp, ShieldCheck, Scale, HeartPulse, Code2, Briefcase, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CATEGORIES = [
  { id: "all", label: "All Gurus", icon: BrainCircuit },
  { id: "finance", label: "Finance & VC", icon: TrendingUp },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "health", label: "Health & Longevity", icon: HeartPulse },
  { id: "tech", label: "Engineering", icon: Code2 },
  { id: "business", label: "Business Strategy", icon: Briefcase },
  { id: "creative", label: "Creative & Design", icon: Palette },
];

const GURUS = [
  { id: 1, name: "VC Scout Pro", cat: "Finance & VC", desc: "Startup fundraising intelligence & term sheet analysis.", subs: "4,200", price: 49, score: 94, rating: 4.8, trending: true },
  { id: 2, name: "TaxMaster Elite", cat: "Finance & VC", desc: "Tax optimization strategies for founders & highly compensated individuals.", subs: "2,800", price: 39, score: 88, rating: 4.7 },
  { id: 3, name: "CryptoSage", cat: "Finance & VC", desc: "DeFi yield farming, portfolio intelligence, & on-chain analysis.", subs: "8,100", price: 29, score: 91, rating: 4.9, trending: true },
  { id: 4, name: "LegalEagle", cat: "Legal", desc: "M&A contract review, compliance checks, & early-stage legal guidance.", subs: "1,600", price: 89, score: 98, rating: 4.9 },
  { id: 5, name: "GrowthHacker", cat: "Business Strategy", desc: "Marketing analytics, CAC optimization, & viral loop engineering.", subs: "5,400", price: 19, score: 85, rating: 4.5 },
  { id: 6, name: "HealthOS", cat: "Health & Longevity", desc: "Personalized biomarker analysis, longevity protocols, & sleep optimization.", subs: "3,200", price: 59, score: 96, rating: 4.9, trending: true },
  { id: 7, name: "CodeArchitect", cat: "Engineering", desc: "System design reviews, architecture scaling, & cloud infrastructure optimization.", subs: "6,500", price: 79, score: 95, rating: 4.8 },
  { id: 8, name: "CopyScribe AI", cat: "Creative & Design", desc: "Direct response copywriting & conversion-optimized landing page copy.", subs: "4,100", price: 25, score: 89, rating: 4.6 },
  { id: 9, name: "PatentPro", cat: "Legal", desc: "Prior art search, patent drafting assistance, & IP strategy.", subs: "950", price: 129, score: 97, rating: 4.8 },
  { id: 10, name: "SaaS Metrics", cat: "Business Strategy", desc: "Cohort analysis, churn prediction, & LTV modeling for B2B SaaS.", subs: "2,200", price: 45, score: 92, rating: 4.7 },
  { id: 11, name: "BrandAlchemist", cat: "Creative & Design", desc: "Visual identity generation, mood board synthesis, & design systems.", subs: "3,800", price: 35, score: 87, rating: 4.6 },
  { id: 12, name: "BioHacker Elite", cat: "Health & Longevity", desc: "Nootropic stacking, workout periodization, & recovery analytics.", subs: "1,800", price: 49, score: 93, rating: 4.9 },
];

export function Marketplace() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <span className="text-xl font-bold tracking-tight">GuruForge</span>
            <span className="text-slate-600 mx-2">/</span>
            <span className="text-slate-300 font-medium">Marketplace</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative w-64 md:w-96 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Search Gurus, skills, or domains..." 
                className="w-full bg-slate-900 border-slate-800 text-sm pl-10 focus-visible:ring-emerald-500/50"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-50 md:hidden">
              <Search className="w-5 h-5" />
            </Button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 hidden sm:flex">
              Connect Telegram
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Spotlight / Hero */}
        <section className="mb-16">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">Spotlight</Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Discover Specialized Intelligence.</h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Browse our curated marketplace of AI Gurus. Powered by 3-tier memory architecture to provide unparalleled depth in specific knowledge domains.
              </p>
              <div className="flex items-center gap-4">
                <Button className="bg-slate-100 hover:bg-white text-slate-950 font-semibold px-6 h-12">
                  Browse Trending
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-6 h-12">
                  View New Releases
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === cat.id 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <cat.icon className={`w-4 h-4 ${activeTab === cat.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Price Range</h3>
              <div className="space-y-3">
                {['$0 - $25/mo', '$25 - $50/mo', '$50 - $100/mo', '$100+/mo'].map((range, i) => (
                  <label key={i} className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-slate-700 bg-slate-900 group-hover:border-slate-500 flex items-center justify-center"></div>
                    {range}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="text-slate-400 text-sm">
                Showing <span className="text-slate-100 font-medium">124</span> Gurus
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 w-full sm:w-auto h-10 px-4 justify-between">
                  Most Subscribed <ChevronDown className="w-4 h-4 ml-2 text-slate-500" />
                </Button>
                <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-400 h-10 w-10 shrink-0">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {GURUS.map((guru, i) => (
                <motion.div 
                  key={guru.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-600 transition-all hover:bg-slate-900/80 group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner shadow-white/5">
                      <BrainCircuit className="w-6 h-6 text-emerald-400/80" />
                    </div>
                    {guru.trending ? (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-medium tracking-wide text-xs">
                        Trending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-800 bg-slate-950 font-medium tracking-wide text-xs">
                        {guru.cat}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mb-1">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">{guru.name}</h3>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                    {guru.desc}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Wisdom</span>
                      <span className="text-sm font-semibold text-slate-200">{guru.score}<span className="text-slate-500 font-normal">/100</span></span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Subs</span>
                      <span className="text-sm font-semibold text-slate-200">{guru.subs}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-800/60">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-100">${guru.price}<span className="text-xs text-slate-500 font-normal">/mo</span></span>
                    </div>
                    <Button size="sm" className="bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-all gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 rounded-full px-8">
                Load More Gurus
              </Button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

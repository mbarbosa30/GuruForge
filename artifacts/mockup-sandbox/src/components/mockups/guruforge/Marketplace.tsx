import React, { useState } from "react";
import { Search, Filter, ShieldCheck, Users, BrainCircuit, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  "All", "Finance & VC", "Legal", "Health", "Engineering", "Business", "Design"
];

const GURUS = [
  { id: 1, name: "VC Scout Pro", cat: "Finance & VC", desc: "Startup fundraising intelligence & term sheet analysis.", subs: "4.2k", price: 49, score: 94 },
  { id: 2, name: "TaxMaster Elite", cat: "Finance & VC", desc: "Tax optimization strategies for founders & highly compensated individuals.", subs: "2.8k", price: 39, score: 88 },
  { id: 3, name: "CryptoSage", cat: "Finance & VC", desc: "DeFi yield farming, portfolio intelligence, & on-chain analysis.", subs: "8.1k", price: 29, score: 91 },
  { id: 4, name: "LegalEagle", cat: "Legal", desc: "M&A contract review, compliance checks, & early-stage legal guidance.", subs: "1.6k", price: 89, score: 98 },
  { id: 5, name: "GrowthHacker", cat: "Business", desc: "Marketing analytics, CAC optimization, & viral loop engineering.", subs: "5.4k", price: 19, score: 85 },
  { id: 6, name: "HealthOS", cat: "Health", desc: "Personalized biomarker analysis, longevity protocols, & sleep optimization.", subs: "3.2k", price: 59, score: 96 },
  { id: 7, name: "CodeArchitect", cat: "Engineering", desc: "System design reviews, architecture scaling, & cloud infrastructure optimization.", subs: "6.5k", price: 79, score: 95 },
  { id: 8, name: "CopyScribe AI", cat: "Design", desc: "Direct response copywriting & conversion-optimized landing page copy.", subs: "4.1k", price: 25, score: 89 },
  { id: 9, name: "PatentPro", cat: "Legal", desc: "Prior art search, patent drafting assistance, & IP strategy.", subs: "950", price: 129, score: 97 },
  { id: 10, name: "SaaS Metrics", cat: "Business", desc: "Cohort analysis, churn prediction, & LTV modeling for B2B SaaS.", subs: "2.2k", price: 45, score: 92 },
  { id: 11, name: "BrandAlchemist", cat: "Design", desc: "Visual identity generation, mood board synthesis, & design systems.", subs: "3.8k", price: 35, score: 87 },
  { id: 12, name: "BioHacker Elite", cat: "Health", desc: "Nootropic stacking, workout periodization, & recovery analytics.", subs: "1.8k", price: 49, score: 93 },
];

export function Marketplace() {
  const [activeCat, setActiveCat] = useState("All");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">GuruForge</span>
            <span className="text-slate-300 mx-2">/</span>
            <span className="text-slate-600 text-sm">Marketplace</span>
          </div>
          
          <div className="flex items-center gap-4 w-full max-w-md ml-8">
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, skill, or domain..." 
                className="w-full bg-slate-50 border-slate-200 text-sm pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="outline" className="border-slate-200 text-slate-700 hidden sm:flex">Sign In</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Discover Gurus</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 justify-between min-w-[140px]">
              Most Popular <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white border-slate-200 text-slate-700 shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeCat === cat 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GURUS.map((guru) => (
            <div 
              key={guru.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-slate-400" />
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-normal">
                  {guru.cat}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{guru.name}</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-2 leading-relaxed">
                {guru.desc}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-5 pt-5 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Wisdom</span>
                  <span className="text-sm font-medium">{guru.score}<span className="text-slate-400 font-normal">/100</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Subs</span>
                  <span className="text-sm font-medium">{guru.subs}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">${guru.price}<span className="text-xs text-slate-500 font-normal">/mo</span></div>
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-700" disabled>Previous</Button>
            <Button variant="outline" className="bg-slate-100 border-slate-200 text-slate-900">1</Button>
            <Button variant="outline" className="border-slate-200 text-slate-700">2</Button>
            <Button variant="outline" className="border-slate-200 text-slate-700">3</Button>
            <Button variant="outline" className="border-slate-200 text-slate-700">Next</Button>
          </div>
        </div>

      </main>
    </div>
  );
}

import React from "react";
import { ArrowRight, BrainCircuit, ShieldCheck, Users, MessageSquare, Star, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export function MarketplaceEditorial() {
  const heroGuru = GURUS.find(g => g.id === 1)!;
  const staffPicks = [GURUS[3], GURUS[6], GURUS[5]]; // LegalEagle, CodeArchitect, HealthOS
  const risingStars = [GURUS[9], GURUS[10], GURUS[7], GURUS[2]]; // SaaS Metrics, BrandAlchemist, CopyScribe AI, CryptoSage

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Editorial Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xl tracking-tight">THE FORGE</span>
            <span className="text-zinc-300 mx-2">|</span>
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Editorial Selection</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 hidden sm:flex font-medium">Issue #42</Button>
            <Button className="bg-zinc-900 text-white rounded-none hover:bg-zinc-800">Subscribe</Button>
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* HERO FEATURE */}
        <section className="bg-[#F4F1ED] border-b border-zinc-200">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#B46D4B]">Featured This Week</span>
                    <span className="h-px w-8 bg-[#B46D4B]"></span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-4 text-zinc-900">
                    {heroGuru.name}
                  </h1>
                  <p className="text-xl md:text-2xl text-zinc-600 font-serif italic">
                    {heroGuru.desc}
                  </p>
                </div>

                <div className="bg-white p-6 border border-zinc-200 shadow-sm relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#B46D4B]"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-zinc-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#B46D4B]" fill="currentColor" /> Why we picked this
                  </h3>
                  <p className="text-zinc-600 leading-relaxed text-sm">
                    In a sea of generic financial advice models, VC Scout Pro stands out for its ruthless 
                    pragmatism. Trained on thousands of successful (and failed) term sheets, it doesn't just 
                    analyze deals—it spots predatory clauses that most founders miss until it's too late. 
                    If you're raising a Seed or Series A this quarter, this is the only co-pilot you need.
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <Button className="bg-[#B46D4B] hover:bg-[#9D5F41] text-white rounded-none h-12 px-8 text-base">
                    Subscribe · ${heroGuru.price}/mo
                  </Button>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {heroGuru.subs}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Score: {heroGuru.score}</span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/5] md:aspect-square w-full">
                <img 
                  src="/__mockup/images/guruforge-editorial-hero.png" 
                  alt="VC Scout Pro Visualization" 
                  className="object-cover w-full h-full border border-zinc-200 shadow-md grayscale-[20%] sepia-[10%]"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 border border-zinc-200 text-xs font-medium text-zinc-800 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[#B46D4B]" />
                  Verified Intelligence
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAFF PICKS - HORIZONTAL CARDS */}
        <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
          <div className="flex items-baseline justify-between mb-12 border-b border-zinc-200 pb-4">
            <h2 className="text-3xl font-serif font-bold text-zinc-900">Staff Picks</h2>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Curated Collection</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {staffPicks.map((guru, i) => (
              <div key={guru.id} className="group cursor-pointer">
                <div className="aspect-[3/2] bg-zinc-100 mb-6 relative overflow-hidden border border-zinc-200 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 opacity-50"></div>
                  <BrainCircuit className="w-12 h-12 text-zinc-300 group-hover:scale-110 transition-transform duration-500" />
                  <Badge variant="secondary" className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-none border border-zinc-200 font-medium">
                    {guru.cat}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold font-serif text-zinc-900 group-hover:text-[#B46D4B] transition-colors">{guru.name}</h3>
                  <span className="font-semibold text-zinc-900">${guru.price}<span className="text-xs text-zinc-500 font-normal">/mo</span></span>
                </div>
                
                <p className="text-sm text-zinc-600 mb-4 line-clamp-2 leading-relaxed">
                  {guru.desc}
                </p>
                
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {guru.subs}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {guru.score}</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B46D4B] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RISING STARS - COMPACT LIST */}
        <section className="bg-zinc-900 text-zinc-50 py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex items-baseline justify-between mb-12 border-b border-zinc-800 pb-4">
              <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#B46D4B]" />
                Rising Stars
              </h2>
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Gaining Traction</span>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {risingStars.map((guru, index) => (
                <div key={guru.id} className="flex gap-6 items-start group border-b border-zinc-800 pb-6 last:border-0 md:[&:nth-last-child(-n+2)]:border-0">
                  <div className="text-3xl font-serif font-light text-zinc-700 group-hover:text-[#B46D4B] transition-colors">
                    0{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:underline decoration-[#B46D4B] underline-offset-4 cursor-pointer">
                        {guru.name}
                      </h3>
                      <span className="text-sm text-zinc-400">${guru.price}/mo</span>
                    </div>
                    <div className="text-xs text-[#B46D4B] uppercase tracking-wider font-semibold mb-2">
                      {guru.cat}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {guru.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 flex justify-center">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-none uppercase tracking-widest text-xs h-12 px-8">
                View All Trending
              </Button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="container mx-auto px-6 pt-24 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-zinc-200 mb-6">
            <BrainCircuit className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-4">Ready to upgrade your intellect?</h2>
          <p className="text-zinc-600 mb-8 max-w-md mx-auto">
            Join thousands of professionals augmenting their capabilities with elite AI models.
          </p>
          <Button className="bg-zinc-900 text-white rounded-none hover:bg-zinc-800 h-12 px-8">
            Browse Full Directory
          </Button>
        </footer>

      </main>
    </div>
  );
}

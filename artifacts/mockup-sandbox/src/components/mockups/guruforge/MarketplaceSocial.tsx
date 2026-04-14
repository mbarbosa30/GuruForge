import React, { useState } from "react";
import { ArrowUpDown, Bell, BrainCircuit, Filter, Flame, MessageSquare, Search, ShieldCheck, Star, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GURUS = [
  { id: 1, name: "VC Scout Pro", cat: "Finance & VC", desc: "Startup fundraising intelligence & term sheet analysis.", subs: "4.2k", price: 49, score: 94 },
  { id: 2, name: "TaxMaster Elite", cat: "Finance & VC", desc: "Tax optimization strategies for founders.", subs: "2.8k", price: 39, score: 88 },
  { id: 3, name: "CryptoSage", cat: "Finance & VC", desc: "DeFi yield farming & on-chain analysis.", subs: "8.1k", price: 29, score: 91 },
  { id: 4, name: "LegalEagle", cat: "Legal", desc: "M&A contract review & compliance checks.", subs: "1.6k", price: 89, score: 98 },
  { id: 5, name: "GrowthHacker", cat: "Business", desc: "Marketing analytics & viral loop engineering.", subs: "5.4k", price: 19, score: 85 },
  { id: 6, name: "HealthOS", cat: "Health", desc: "Personalized biomarker analysis & longevity protocols.", subs: "3.2k", price: 59, score: 96 },
  { id: 7, name: "CodeArchitect", cat: "Engineering", desc: "System design reviews & cloud infrastructure.", subs: "6.5k", price: 79, score: 95 },
  { id: 8, name: "CopyScribe AI", cat: "Design", desc: "Direct response & conversion-optimized copy.", subs: "4.1k", price: 25, score: 89 },
  { id: 9, name: "PatentPro", cat: "Legal", desc: "Prior art search & IP strategy.", subs: "950", price: 129, score: 97 },
  { id: 10, name: "SaaS Metrics", cat: "Business", desc: "Cohort analysis & churn prediction for B2B SaaS.", subs: "2.2k", price: 45, score: 92 },
  { id: 11, name: "BrandAlchemist", cat: "Design", desc: "Visual identity generation & design systems.", subs: "3.8k", price: 35, score: 87 },
  { id: 12, name: "BioHacker Elite", cat: "Health", desc: "Nootropic stacking & recovery analytics.", subs: "1.8k", price: 49, score: 93 },
];

const ACTIVITY_FEED = [
  { id: 1, user: "Sarah M.", action: "subscribed to", target: "CodeArchitect", time: "2m ago", type: "sub" },
  { id: 2, user: "James R.", action: "left a 5-star review for", target: "VC Scout Pro", time: "15m ago", type: "review" },
  { id: 3, target: "PatentPro", action: "reached 1,000 subscribers", time: "1h ago", type: "milestone" },
  { id: 4, user: "Elena K.", action: "subscribed to", target: "CryptoSage", time: "2h ago", type: "sub" },
  { id: 5, target: "GrowthHacker", action: "is trending (+340 subs this week)", time: "4h ago", type: "trending" },
  { id: 6, user: "Mike T.", action: "left a 4.5-star review for", target: "HealthOS", time: "5h ago", type: "review" },
];

export function MarketplaceSocial() {
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("trending");
  const [search, setSearch] = useState("");

  const categories = ["All", ...Array.from(new Set(GURUS.map(g => g.cat)))];

  const filteredGurus = GURUS.filter(g => {
    if (filterCat !== "All" && g.cat !== filterCat) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    // Default trending
    return parseInt(b.subs.replace('k', '000')) - parseInt(a.subs.replace('k', '000'));
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">GuruForge</span>
          </div>
          
          <div className="hidden md:flex items-center relative max-w-md w-full mx-4">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <Input 
              placeholder="Search gurus, skills, or categories..." 
              className="pl-9 bg-gray-50 border-gray-200 h-10 w-full rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <Avatar className="w-8 h-8 border border-gray-200 cursor-pointer">
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left/Top Content: Main Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <Badge 
                  key={cat}
                  variant={filterCat === cat ? "default" : "secondary"}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filterCat === cat 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
                  }`}
                  onClick={() => setFilterCat(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 h-9 rounded-full">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Sort: <span className="font-semibold text-gray-900">{
                      sortBy === 'trending' ? 'Trending' : 
                      sortBy === 'score' ? 'Top Rated' : 
                      sortBy === 'price_low' ? 'Price: Low to High' : 'Price: High to Low'
                    }</span></span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending (Subscribers)</SelectItem>
                  <SelectItem value="score">Top Rated (Score)</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGurus.map(guru => (
              <div key={guru.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col group overflow-hidden">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{guru.name}</h3>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">{guru.cat}</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {guru.desc}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-2.5 mb-4 border border-gray-100">
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-0.5"><Users className="w-3 h-3" /> Subs</span>
                      <span className="font-bold text-gray-900 text-sm">{guru.subs}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center border-l border-r border-gray-200">
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-0.5"><ShieldCheck className="w-3 h-3" /> Score</span>
                      <span className="font-bold text-green-600 text-sm">{guru.score}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 font-medium mb-0.5">Price</span>
                      <span className="font-bold text-gray-900 text-sm">${guru.price}<span className="text-[10px] text-gray-500 font-normal">/mo</span></span>
                    </div>
                  </div>

                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 font-semibold shadow-sm transition-all active:scale-[0.98]">
                    Subscribe
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredGurus.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No gurus found matching your criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Social Feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Live Activity
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            
            <ScrollArea className="h-[calc(100vh-12rem)] min-h-[400px]">
              <div className="p-4 space-y-4">
                {ACTIVITY_FEED.map((item, i) => (
                  <div key={item.id} className="relative pl-4 pb-4 last:pb-0">
                    {/* Timeline line */}
                    {i !== ACTIVITY_FEED.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-[-16px] w-px bg-gray-100"></div>
                    )}
                    
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center
                      ${item.type === 'sub' ? 'bg-blue-500' : 
                        item.type === 'review' ? 'bg-yellow-400' : 
                        item.type === 'milestone' ? 'bg-purple-500' : 'bg-orange-500'}`}>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-gray-800 leading-snug">
                        {item.user && <span className="font-semibold">{item.user}</span>}
                        <span className="text-gray-500"> {item.action} </span>
                        <span className="font-semibold text-blue-600 hover:underline cursor-pointer">{item.target}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4 text-xs font-medium text-gray-600 border-gray-200">
                  View More Activity
                </Button>
              </div>
            </ScrollArea>
          </div>
        </div>

      </main>
    </div>
  );
}

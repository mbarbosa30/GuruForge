import React, { useState, useMemo } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, X, Search, Filter, Check, TrendingUp, Users, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const GURUS = [
  { id: 1, name: "VC Scout Pro", cat: "Finance & VC", desc: "Startup fundraising intelligence & term sheet analysis.", subs: "4.2k", subsNum: 4200, price: 49, score: 94 },
  { id: 2, name: "TaxMaster Elite", cat: "Finance & VC", desc: "Tax optimization strategies for founders.", subs: "2.8k", subsNum: 2800, price: 39, score: 88 },
  { id: 3, name: "CryptoSage", cat: "Finance & VC", desc: "DeFi yield farming & on-chain analysis.", subs: "8.1k", subsNum: 8100, price: 29, score: 91 },
  { id: 4, name: "LegalEagle", cat: "Legal", desc: "M&A contract review & compliance checks.", subs: "1.6k", subsNum: 1600, price: 89, score: 98 },
  { id: 5, name: "GrowthHacker", cat: "Business", desc: "Marketing analytics & viral loop engineering.", subs: "5.4k", subsNum: 5400, price: 19, score: 85 },
  { id: 6, name: "HealthOS", cat: "Health", desc: "Personalized biomarker analysis & longevity protocols.", subs: "3.2k", subsNum: 3200, price: 59, score: 96 },
  { id: 7, name: "CodeArchitect", cat: "Engineering", desc: "System design reviews & cloud infrastructure.", subs: "6.5k", subsNum: 6500, price: 79, score: 95 },
  { id: 8, name: "CopyScribe AI", cat: "Design", desc: "Direct response & conversion-optimized copy.", subs: "4.1k", subsNum: 4100, price: 25, score: 89 },
  { id: 9, name: "PatentPro", cat: "Legal", desc: "Prior art search & IP strategy.", subs: "950", subsNum: 950, price: 129, score: 97 },
  { id: 10, name: "SaaS Metrics", cat: "Business", desc: "Cohort analysis & churn prediction for B2B SaaS.", subs: "2.2k", subsNum: 2200, price: 45, score: 92 },
  { id: 11, name: "BrandAlchemist", cat: "Design", desc: "Visual identity generation & design systems.", subs: "3.8k", subsNum: 3800, price: 35, score: 87 },
  { id: 12, name: "BioHacker Elite", cat: "Health", desc: "Nootropic stacking & recovery analytics.", subs: "1.8k", subsNum: 1800, price: 49, score: 93 },
];

const CATEGORIES = ["All", "Finance & VC", "Legal", "Business", "Health", "Engineering", "Design"];

type SortField = "name" | "cat" | "score" | "subsNum" | "price";
type SortOrder = "asc" | "desc";

export function MarketplaceSpeed() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [maxPrice, setMaxPrice] = useState(150);
  const [minScore, setMinScore] = useState(80);
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [comparisonIds, setComparisonIds] = useState<number[]>([1, 7]); // Pre-populated

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleCompare = (id: number) => {
    if (comparisonIds.includes(id)) {
      setComparisonIds(comparisonIds.filter(x => x !== id));
    } else if (comparisonIds.length < 3) {
      setComparisonIds([...comparisonIds, id]);
    }
  };

  const filteredGurus = useMemo(() => {
    return GURUS.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.desc.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === "All" || g.cat === selectedCat;
      const matchPrice = g.price <= maxPrice;
      const matchScore = g.score >= minScore;
      return matchSearch && matchCat && matchPrice && matchScore;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [search, selectedCat, maxPrice, minScore, sortField, sortOrder]);

  const comparedGurus = comparisonIds.map(id => GURUS.find(g => g.id === id)!).filter(Boolean);

  const bestMetrics = useMemo(() => {
    if (comparedGurus.length < 2) return null;
    return {
      price: Math.min(...comparedGurus.map(g => g.price)),
      score: Math.max(...comparedGurus.map(g => g.score)),
      subs: Math.max(...comparedGurus.map(g => g.subsNum)),
    };
  }, [comparedGurus]);

  const getBestOverall = () => {
    if (comparedGurus.length < 2) return null;
    // Simple heuristic: highest score wins overall
    return comparedGurus.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  };

  const bestOverall = getBestOverall();

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-zinc-400" />;
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />;
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-bold text-lg tracking-tight">GURU<span className="text-blue-600">FORGE</span></div>
            <Badge variant="outline" className="bg-zinc-100 text-zinc-600 border-zinc-200 uppercase text-[10px] tracking-wider font-semibold rounded-sm">
              Decision Engine
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-500 hidden sm:inline-block">Workspace: Startup Toolkit</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8 rounded-md">
              Manage Subscriptions
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        
        {/* Comparison Engine Top Section */}
        <section className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" fill="currentColor" /> Evaluation Board
            </h2>
            <span className="text-xs text-zinc-500 font-medium">{comparisonIds.length}/3 Slots Filled</span>
          </div>

          <div className="p-4 md:p-6 bg-white">
            {/* The Slots */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[0, 1, 2].map((index) => {
                const guru = comparedGurus[index];
                if (guru) {
                  return (
                    <div key={`slot-${index}`} className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50/30 relative group">
                      <button 
                        onClick={() => toggleCompare(guru.id)}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-700 bg-white rounded-full p-1 border border-zinc-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-zinc-900">{guru.name}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white border-zinc-200 text-zinc-500 rounded-sm">
                          {guru.cat}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-600 mb-4 h-8 line-clamp-2">{guru.desc}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium bg-white rounded-md border border-zinc-200 p-2 mb-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Score</span>
                          <span className="text-zinc-900 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> {guru.score}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Price</span>
                          <span className="text-zinc-900">${guru.price}/mo</span>
                        </div>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs rounded-md shadow-sm">
                        Subscribe
                      </Button>
                    </div>
                  );
                }
                return (
                  <div key={`empty-${index}`} className="border-2 border-dashed border-zinc-200 rounded-lg p-4 flex flex-col items-center justify-center text-center h-full min-h-[180px] bg-zinc-50/50">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                      <Plus className="w-5 h-5 text-zinc-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-500">Select a Guru below</span>
                    <span className="text-xs text-zinc-400">to pin for comparison</span>
                  </div>
                );
              })}
            </div>

            {/* Detailed Comparison Panel */}
            {comparedGurus.length >= 2 && bestMetrics && (
              <div className="border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                <div className="px-4 py-2 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Feature Matrix</span>
                  {bestOverall && (
                    <span className="text-xs font-medium text-zinc-700 flex items-center gap-1 bg-white px-2 py-1 rounded-sm border border-zinc-200 shadow-sm">
                      Top Recommendation: <strong className="text-blue-600">{bestOverall.name}</strong>
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr]">
                  <div className="border-r border-zinc-200 bg-zinc-100/50 flex flex-col">
                    <div className="h-10 px-4 py-2 text-xs font-semibold text-zinc-600 flex items-center border-b border-zinc-200 uppercase tracking-wider">Score</div>
                    <div className="h-10 px-4 py-2 text-xs font-semibold text-zinc-600 flex items-center border-b border-zinc-200 uppercase tracking-wider">Price</div>
                    <div className="h-10 px-4 py-2 text-xs font-semibold text-zinc-600 flex items-center border-b border-zinc-200 uppercase tracking-wider">Traction</div>
                    <div className="h-10 px-4 py-2 text-xs font-semibold text-zinc-600 flex items-center border-b border-zinc-200 uppercase tracking-wider">Category</div>
                  </div>
                  
                  <div className="flex">
                    {comparedGurus.map((guru) => {
                      const isBestScore = guru.score === bestMetrics.score;
                      const isBestPrice = guru.price === bestMetrics.price;
                      const isBestSubs = guru.subsNum === bestMetrics.subs;
                      
                      return (
                        <div key={`col-${guru.id}`} className="flex-1 flex flex-col border-r border-zinc-200 last:border-r-0 min-w-[120px]">
                          <div className={`h-10 px-4 py-2 text-sm font-medium flex items-center border-b border-zinc-200 ${isBestScore ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-zinc-900'}`}>
                            {guru.score} {isBestScore && <Check className="w-3 h-3 ml-2 text-emerald-500" />}
                          </div>
                          <div className={`h-10 px-4 py-2 text-sm font-medium flex items-center border-b border-zinc-200 ${isBestPrice ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-zinc-900'}`}>
                            ${guru.price} {isBestPrice && <Check className="w-3 h-3 ml-2 text-emerald-500" />}
                          </div>
                          <div className={`h-10 px-4 py-2 text-sm font-medium flex items-center border-b border-zinc-200 ${isBestSubs ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-zinc-900'}`}>
                            {guru.subs} {isBestSubs && <Check className="w-3 h-3 ml-2 text-emerald-500" />}
                          </div>
                          <div className="h-10 px-4 py-2 text-xs text-zinc-600 flex items-center border-b border-zinc-200 bg-white whitespace-nowrap overflow-hidden text-ellipsis">
                            {guru.cat}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Filters and Data Table */}
        <section className="bg-white border border-zinc-200 rounded-lg shadow-sm">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input 
                placeholder="Search models..." 
                className="pl-9 h-9 bg-white border-zinc-200 rounded-md text-sm w-full lg:max-w-sm focus-visible:ring-blue-500 focus-visible:border-blue-500 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 mr-4 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCat === cat 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-6 bg-white border border-zinc-200 rounded-md px-4 py-1.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider w-16">Max $</span>
                  <div className="w-24">
                    <Slider 
                      value={[maxPrice]} 
                      max={150} 
                      step={5} 
                      onValueChange={([val]) => setMaxPrice(val)} 
                      className="py-1"
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-700 w-8">${maxPrice}</span>
                </div>
                
                <div className="w-px h-6 bg-zinc-200"></div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider w-16">Min IQ</span>
                  <div className="w-24">
                    <Slider 
                      value={[minScore]} 
                      min={70} 
                      max={100} 
                      step={1} 
                      onValueChange={([val]) => setMinScore(val)} 
                      className="py-1"
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-700 w-6">{minScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-100/50">
                  <th className="w-12 px-4 py-3"></th>
                  <th className="px-4 py-3 font-semibold text-zinc-600 uppercase tracking-wider text-xs cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-2">Model Name <SortIcon field="name" /></div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-600 uppercase tracking-wider text-xs cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("cat")}>
                    <div className="flex items-center gap-2">Category <SortIcon field="cat" /></div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-600 uppercase tracking-wider text-xs cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("score")}>
                    <div className="flex items-center gap-2">Score <SortIcon field="score" /></div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-600 uppercase tracking-wider text-xs cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("subsNum")}>
                    <div className="flex items-center gap-2">Traction <SortIcon field="subsNum" /></div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-600 uppercase tracking-wider text-xs cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("price")}>
                    <div className="flex items-center gap-2">Price <SortIcon field="price" /></div>
                  </th>
                  <th className="px-4 py-3 w-[120px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {filteredGurus.map((guru) => {
                  const isCompared = comparisonIds.includes(guru.id);
                  const isCompareFull = comparisonIds.length >= 3 && !isCompared;
                  
                  return (
                    <tr key={guru.id} className={`hover:bg-blue-50/30 transition-colors ${isCompared ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <Checkbox 
                          checked={isCompared}
                          onCheckedChange={() => toggleCompare(guru.id)}
                          disabled={isCompareFull}
                          className={isCompared ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300"}
                          title="Compare"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-zinc-900">{guru.name}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-[250px]" title={guru.desc}>{guru.desc}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {guru.cat}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          {guru.score}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                          <Users className="w-4 h-4 text-zinc-400" />
                          {guru.subs}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-zinc-900">${guru.price}<span className="text-xs text-zinc-500 font-normal">/mo</span></div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-8 text-xs rounded-md shadow-sm">
                          Subscribe
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredGurus.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 text-zinc-300 mb-3" />
                        <p className="font-medium text-zinc-900">No models found</p>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </section>

      </main>
    </div>
  );
}

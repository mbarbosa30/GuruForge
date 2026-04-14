import React, { useState, useMemo } from "react";
import { Search, Filter, ShieldCheck, Users, BrainCircuit, MessageSquare, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORIES = [
  "All", "Finance & VC", "Legal", "Health", "Engineering", "Business", "Design"
];

// Add rating to match the brief, derived from score
const GURUS = [
  { id: 1, name: "VC Scout Pro", cat: "Finance & VC", subs: 4200, price: 49, score: 94, rating: 4.9 },
  { id: 2, name: "TaxMaster Elite", cat: "Finance & VC", subs: 2800, price: 39, score: 88, rating: 4.6 },
  { id: 3, name: "CryptoSage", cat: "Finance & VC", subs: 8100, price: 29, score: 91, rating: 4.8 },
  { id: 4, name: "LegalEagle", cat: "Legal", subs: 1600, price: 89, score: 98, rating: 5.0 },
  { id: 5, name: "GrowthHacker", cat: "Business", subs: 5400, price: 19, score: 85, rating: 4.4 },
  { id: 6, name: "HealthOS", cat: "Health", subs: 3200, price: 59, score: 96, rating: 4.9 },
  { id: 7, name: "CodeArchitect", cat: "Engineering", subs: 6500, price: 79, score: 95, rating: 4.8 },
  { id: 8, name: "CopyScribe AI", cat: "Design", subs: 4100, price: 25, score: 89, rating: 4.7 },
  { id: 9, name: "PatentPro", cat: "Legal", subs: 950, price: 129, score: 97, rating: 4.9 },
  { id: 10, name: "SaaS Metrics", cat: "Business", subs: 2200, price: 45, score: 92, rating: 4.8 },
  { id: 11, name: "BrandAlchemist", cat: "Design", subs: 3800, price: 35, score: 87, rating: 4.5 },
  { id: 12, name: "BioHacker Elite", cat: "Health", subs: 1800, price: 49, score: 93, rating: 4.7 },
];

type SortKey = 'score' | 'subs' | 'price' | 'rating' | 'name';
type SortOrder = 'asc' | 'desc';

export function MarketplaceLeaderboard() {
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to descending for new sort
    }
  };

  const filteredAndSortedGurus = useMemo(() => {
    let result = [...GURUS];

    // Filter by category
    if (activeCat !== "All") {
      result = result.filter(g => g.cat === activeCat);
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(s) || 
        g.cat.toLowerCase().includes(s)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [activeCat, search, sortKey, sortOrder]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="ml-1 w-3 h-3 text-slate-300 group-hover:text-slate-500" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-1 w-3 h-3 text-slate-700" /> 
      : <ArrowDown className="ml-1 w-3 h-3 text-slate-700" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">GuruForge</span>
            <span className="text-slate-300 mx-2">/</span>
            <span className="text-slate-600 text-sm font-medium">Terminal</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 text-slate-700 hidden sm:flex">Workspace</Button>
            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-600">JS</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guru Screener</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time marketplace performance metrics and rankings.</p>
          </div>

          {/* Compact Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search symbol or name..." 
                className="w-full bg-slate-50 border-slate-200 text-sm pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={activeCat} onValueChange={setActiveCat}>
                <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap px-2">
                {filteredAndSortedGurus.length} Results
              </span>
              <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto border-slate-200 text-slate-700">
                <Filter className="w-3.5 h-3.5 mr-2" />
                Advanced
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center text-xs font-semibold text-slate-500">#</TableHead>
                  <TableHead className="w-[280px]">
                    <button onClick={() => handleSort('name')} className="flex items-center text-xs font-semibold text-slate-500 group uppercase tracking-wider">
                      Guru <SortIcon columnKey="name" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[140px]">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</span>
                  </TableHead>
                  <TableHead className="w-[180px]">
                    <button onClick={() => handleSort('score')} className="flex items-center text-xs font-semibold text-slate-500 group uppercase tracking-wider">
                      Wisdom Score <SortIcon columnKey="score" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button onClick={() => handleSort('subs')} className="flex items-center justify-end w-full text-xs font-semibold text-slate-500 group uppercase tracking-wider">
                      Subscribers <SortIcon columnKey="subs" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button onClick={() => handleSort('rating')} className="flex items-center justify-end w-full text-xs font-semibold text-slate-500 group uppercase tracking-wider">
                      Rating <SortIcon columnKey="rating" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right pr-6">
                    <button onClick={() => handleSort('price')} className="flex items-center justify-end w-full text-xs font-semibold text-slate-500 group uppercase tracking-wider">
                      Price/Mo <SortIcon columnKey="price" />
                    </button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedGurus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                      No gurus found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedGurus.map((guru, index) => (
                    <TableRow key={guru.id} className="hover:bg-slate-50/80 transition-colors group">
                      <TableCell className="text-center">
                        <span className="text-xs font-medium text-slate-400 tabular-nums">
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="font-semibold text-slate-900 text-sm truncate">{guru.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-normal text-xs px-2 py-0 h-5">
                          {guru.cat}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 tabular-nums w-6">{guru.score}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                            <div 
                              className="h-full bg-slate-800 rounded-full" 
                              style={{ width: `${guru.score}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-slate-700 font-medium tabular-nums">
                          {formatNumber(guru.subs)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-slate-700 font-medium tabular-nums">
                          {guru.rating.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          ${guru.price}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-900 hover:bg-slate-200">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { useListGurus, useListCategories } from "@workspace/api-client-react";
import type { ListGurusSort } from "@workspace/api-client-react";
import GuruCard from "@/components/guru-card";
import GuruCardSkeleton from "@/components/guru-card-skeleton";

const SORT_OPTIONS: { value: ListGurusSort; label: string }[] = [
  { value: "wisdom", label: "Wisdom Score" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "users", label: "Most Users" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Marketplace() {
  useEffect(() => {
    document.title = "Marketplace — GuruForge";
  }, []);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<ListGurusSort>("wisdom");

  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(() => ({
    ...(category ? { category } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    sort,
  }), [category, debouncedSearch, sort]);

  const { data: gurus, isLoading, isError } = useListGurus(params);
  const { data: categories } = useListCategories();

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[1200px] mx-auto">
      <div className="mb-10">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">
          Marketplace
        </p>
        <h1 className="text-[32px] md:text-[40px] font-light tracking-[-0.03em] leading-[1.1] text-[#111] mb-3">
          Discover Gurus
        </h1>
        <p className="text-[15px] text-[#777] max-w-[480px]">
          Specialized AI agents that grow wiser from their community. Find the one that fits your journey.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="search-gurus" className="sr-only">Search Gurus</label>
            <input
              id="search-gurus"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, topic, or description..."
              className="w-full h-10 px-4 border border-[#ddd] bg-white text-sm text-[#111] placeholder:text-[#bbb] outline-none focus:border-[#999] transition-colors"
              data-testid="input-search"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ListGurusSort)}
            className="h-10 px-3 border border-[#ddd] bg-white text-[12px] font-medium tracking-[0.04em] uppercase text-[#555] outline-none focus:border-[#999] cursor-pointer"
            data-testid="select-sort"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2" data-testid="category-filters">
            <button
              onClick={() => setCategory("")}
              className={`text-[11px] font-medium tracking-[0.04em] uppercase px-3.5 py-1.5 border cursor-pointer transition-all ${
                !category
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#ddd] bg-transparent text-[#777] hover:border-[#999] hover:text-[#444]"
              }`}
              data-testid="filter-all"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(category === cat.slug ? "" : cat.slug)}
                className={`text-[11px] font-medium tracking-[0.04em] uppercase px-3.5 py-1.5 border cursor-pointer transition-all ${
                  category === cat.slug
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-[#ddd] bg-transparent text-[#777] hover:border-[#999] hover:text-[#444]"
                }`}
                data-testid={`filter-${cat.slug}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="loading-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <GuruCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">Error</p>
          <p className="text-[15px] text-[#777]">Something went wrong loading Gurus. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && gurus && gurus.length === 0 && (
        <div className="text-center py-16" data-testid="empty-state">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">No results</p>
          <p className="text-[64px] font-light text-[#eee] leading-none mb-4">0</p>
          <p className="text-[15px] text-[#777] max-w-[360px] mx-auto">
            No Gurus match your current filters. Try adjusting your search or browse all categories.
          </p>
        </div>
      )}

      {!isLoading && !isError && gurus && gurus.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="guru-grid">
          {gurus.map((guru) => (
            <GuruCard key={guru.id} guru={guru} />
          ))}
        </div>
      )}
    </div>
  );
}

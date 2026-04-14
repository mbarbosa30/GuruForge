import { useRoute, Link } from "wouter";
import { useState, useMemo, type FormEvent } from "react";
import { useAuth } from "@clerk/react";
import {
  useGetWisdomFeed,
  useGetGuru,
  useSubmitFeedback,
  getGetWisdomFeedQueryOptions,
  getGetGuruQueryOptions,
} from "@workspace/api-client-react";
import type { WisdomFeedItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, Search, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "goals", label: "Goals" },
  { value: "preferences", label: "Preferences" },
  { value: "history", label: "History" },
  { value: "decisions", label: "Decisions" },
  { value: "context", label: "Context" },
];

function categoryColor(cat: string): string {
  switch (cat) {
    case "goals": return "text-[#2a7a2a] bg-[#f0f8f0] border-[#c8e0c8]";
    case "preferences": return "text-[#5a5aaa] bg-[#f0f0ff] border-[#c8c8e8]";
    case "history": return "text-[#8a6a2a] bg-[#fdf8f0] border-[#e0d8c0]";
    case "decisions": return "text-[#aa3a3a] bg-[#fff0f0] border-[#e8c8c8]";
    case "context": return "text-[#555] bg-[#f8f8f8] border-[#e0e0e0]";
    default: return "text-[#555] bg-[#f8f8f8] border-[#e0e0e0]";
  }
}

function MemoryItem({
  item,
  onVote,
}: {
  item: WisdomFeedItem;
  onVote: (id: number, vote: "up" | "down") => void;
}) {
  return (
    <div className="px-5 py-5 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-0.5 border ${categoryColor(item.category)}`}>
              {item.category}
            </span>
            <span className="text-[10px] text-[#ccc] ml-auto">
              {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          {item.displayTitle && (
            <h3 className="text-[15px] font-medium text-[#222] mb-1">{item.displayTitle}</h3>
          )}
          <p className="text-[13px] text-[#666] leading-[1.6]">{item.summary}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-[#bbb] mr-1">Importance:</span>
            <div className="w-16 h-1.5 bg-[#f0f0f0] overflow-hidden">
              <div
                className="h-full bg-[#999]"
                style={{ width: `${Math.round(item.importance * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => onVote(item.id, "up")}
            className={`p-1.5 border transition-colors cursor-pointer ${
              item.userVote === "up"
                ? "border-[#2a7a2a] text-[#2a7a2a] bg-[#f0f8f0]"
                : "border-[#e0e0e0] text-[#ccc] hover:text-[#888] hover:border-[#999]"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onVote(item.id, "down")}
            className={`p-1.5 border transition-colors cursor-pointer ${
              item.userVote === "down"
                ? "border-[#aa3a3a] text-[#aa3a3a] bg-[#fff0f0]"
                : "border-[#e0e0e0] text-[#ccc] hover:text-[#888] hover:border-[#999]"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WisdomFeed() {
  const [, params] = useRoute("/guru/:slug/wisdom");
  const slug = params?.slug ?? "";
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: guru, isLoading: guruLoading } = useGetGuru(slug, {
    query: { ...getGetGuruQueryOptions(slug), enabled: !!slug },
  });

  const guruId = guru?.id ?? 0;

  const { data: feed, isLoading: feedLoading } = useGetWisdomFeed(
    guruId,
    {
      category: category || undefined,
      topic: topic || undefined,
      search: search || undefined,
      page,
      limit: 20,
    },
    {
      query: {
        ...getGetWisdomFeedQueryOptions(guruId, {
          category: category || undefined,
          topic: topic || undefined,
          search: search || undefined,
          page,
          limit: 20,
        }),
        enabled: !!guru?.id && !!isSignedIn,
      },
    },
  );

  const feedbackMutation = useSubmitFeedback();

  const topicGroups = useMemo(() => {
    if (!feed?.items) return [];
    const groups = new Map<string, WisdomFeedItem[]>();
    for (const item of feed.items) {
      const key = item.topic || "General";
      const existing = groups.get(key) || [];
      existing.push(item);
      groups.set(key, existing);
    }
    return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
  }, [feed?.items]);

  const availableTopics = useMemo(() => {
    if (!feed?.items) return [];
    const topics = new Set<string>();
    for (const item of feed.items) {
      if (item.topic) topics.add(item.topic);
    }
    return Array.from(topics).sort();
  }, [feed?.items]);

  async function handleVote(targetId: number, vote: "up" | "down") {
    try {
      await feedbackMutation.mutateAsync({ data: { targetType: "memory" as const, targetId, vote } });
      queryClient.invalidateQueries({ queryKey: getGetWisdomFeedQueryOptions(guruId).queryKey?.slice(0, 2) });
    } catch {}
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  if (!isSignedIn) {
    return (
      <div className="px-6 md:px-10 py-16 text-center max-w-[600px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">Wisdom Feed</p>
        <p className="text-[15px] text-[#777] mb-8">Sign in to view your personal wisdom feed.</p>
        <Link
          href="/sign-in"
          className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (guruLoading) {
    return (
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-[900px] mx-auto animate-pulse">
        <div className="h-4 w-20 bg-[#f0f0f0] mb-6" />
        <div className="h-10 w-2/3 bg-[#f0f0f0] mb-3" />
        <div className="h-5 w-1/2 bg-[#f5f5f5] mb-8" />
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[900px] mx-auto">
      <Link
        href={guru ? `/guru/${guru.slug}` : "/dashboard"}
        className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#888] no-underline border-b border-[#ccc] pb-0.5 hover:text-[#444] hover:border-[#888] transition-colors inline-block mb-8"
      >
        Back to {guru?.name ?? "Dashboard"}
      </Link>

      <div className="mb-10">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2">My Wisdom Feed</p>
        <h1 className="text-[32px] md:text-[40px] font-light tracking-[-0.03em] text-[#111]">
          {guru?.name ?? "Guru"}
        </h1>
        <p className="text-[14px] text-[#888] mt-1">
          Everything this Guru has learned about you, organized by topic.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] text-[13px] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#999]"
            />
          </div>
          <button
            type="submit"
            className="text-[12px] font-medium tracking-[0.04em] uppercase text-[#555] border border-[#ddd] px-4 py-2.5 hover:border-[#999] hover:text-[#333] transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4">
          <div>
            <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#999] block mb-1">Category</span>
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setCategory(cat.value); setPage(1); }}
                  className={`text-[11px] font-medium tracking-[0.04em] uppercase px-3 py-1.5 border transition-colors cursor-pointer ${
                    category === cat.value
                      ? "text-[#111] bg-[#f0f0f0] border-[#999]"
                      : "text-[#888] bg-white border-[#e0e0e0] hover:border-[#999]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {availableTopics.length > 0 && (
            <div>
              <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#999] block mb-1">Topic</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => { setTopic(""); setPage(1); }}
                  className={`text-[11px] font-medium tracking-[0.04em] uppercase px-3 py-1.5 border transition-colors cursor-pointer ${
                    topic === ""
                      ? "text-[#111] bg-[#f0f0f0] border-[#999]"
                      : "text-[#888] bg-white border-[#e0e0e0] hover:border-[#999]"
                  }`}
                >
                  All
                </button>
                {availableTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); setPage(1); }}
                    className={`text-[11px] font-medium tracking-[0.04em] uppercase px-3 py-1.5 border transition-colors cursor-pointer ${
                      topic === t
                        ? "text-[#111] bg-[#f0f0f0] border-[#999]"
                        : "text-[#888] bg-white border-[#e0e0e0] hover:border-[#999]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {feedLoading && (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-[#f0f0f0] p-5">
              <div className="h-4 w-1/4 bg-[#f0f0f0] mb-3" />
              <div className="h-3 w-3/4 bg-[#f5f5f5]" />
            </div>
          ))}
        </div>
      )}

      {!feedLoading && feed && feed.items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[48px] font-light text-[#eee] leading-none mb-4">0</p>
          <p className="text-[15px] text-[#888]">
            {search || category || topic
              ? "No memories match your filters."
              : "No wisdom entries yet. Start chatting with this Guru to build your feed."}
          </p>
        </div>
      )}

      {!feedLoading && feed && feed.items.length > 0 && (
        <>
          {topicGroups.map((group) => (
            <div key={group.name} className="mb-8">
              <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">
                {group.name}
              </p>
              <div className="space-y-0 border border-[#e0e0e0] divide-y divide-[#e0e0e0]">
                {group.items.map((item) => (
                  <MemoryItem key={item.id} item={item} onVote={handleVote} />
                ))}
              </div>
            </div>
          ))}

          {feed.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 border border-[#e0e0e0] text-[#888] hover:border-[#999] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[12px] text-[#888]">
                Page {feed.page} of {feed.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(feed.totalPages, page + 1))}
                disabled={page >= feed.totalPages}
                className="p-2 border border-[#e0e0e0] text-[#888] hover:border-[#999] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-[11px] text-[#bbb] text-center mt-3">
            {feed.total} {feed.total === 1 ? "entry" : "entries"} total
          </p>
        </>
      )}
    </div>
  );
}

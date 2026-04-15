import { useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import {
  useGetGlobalFeed,
  useSubmitFeedback,
  getGetGlobalFeedQueryOptions,
} from "@workspace/api-client-react";
import type { GlobalFeedItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, Users, TrendingUp, ChevronRight } from "lucide-react";

const PATTERN_TYPES = [
  { value: "", label: "All" },
  { value: "successful_strategies", label: "Strategies" },
  { value: "pitfalls", label: "Pitfalls" },
  { value: "trends", label: "Trends" },
  { value: "common_questions", label: "Common Questions" },
];

function patternBadge(type: string): { label: string; className: string } {
  switch (type) {
    case "common_questions":
      return { label: "Question", className: "text-[#5a5aaa] bg-[#f0f0ff] border-[#c8c8e8]" };
    case "successful_strategies":
      return { label: "Strategy", className: "text-[#2a7a2a] bg-[#f0f8f0] border-[#c8e0c8]" };
    case "pitfalls":
      return { label: "Pitfall", className: "text-[#aa3a3a] bg-[#fff0f0] border-[#e8c8c8]" };
    case "trends":
      return { label: "Trend", className: "text-[#8a6a2a] bg-[#fdf8f0] border-[#e0d8c0]" };
    default:
      return { label: type, className: "text-[#555] bg-[#f8f8f8] border-[#e0e0e0]" };
  }
}

function confidenceLabel(c: number): { text: string; className: string } {
  if (c >= 0.8) return { text: "High", className: "text-[#2a7a2a]" };
  if (c >= 0.5) return { text: "Medium", className: "text-[#8a6a2a]" };
  return { text: "Low", className: "text-[#aa3a3a]" };
}

export default function GlobalFeed() {
  const { authenticated } = usePrivy();
  const queryClient = useQueryClient();

  const [patternType, setPatternType] = useState("");
  const [page, setPage] = useState(1);
  const [localVotes, setLocalVotes] = useState<Record<number, string | null>>({});
  const [accumulatedItems, setAccumulatedItems] = useState<GlobalFeedItem[]>([]);

  const { data: feed, isLoading } = useGetGlobalFeed(
    { patternType: patternType || undefined, page, limit: 20 },
    {
      query: {
        ...getGetGlobalFeedQueryOptions({
          patternType: patternType || undefined,
          page,
          limit: 20,
        }),
      },
    },
  );

  useEffect(() => {
    if (feed?.items) {
      if (page === 1) {
        setAccumulatedItems(feed.items);
      } else {
        setAccumulatedItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const newItems = feed.items.filter((i) => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [feed, page]);

  const handleFilterChange = useCallback((value: string) => {
    setPatternType(value);
    setPage(1);
    setAccumulatedItems([]);
    setLocalVotes({});
  }, []);

  const feedbackMutation = useSubmitFeedback();

  async function handleVote(targetId: number, vote: "up" | "down") {
    if (!authenticated) return;
    try {
      const currentVote = targetId in localVotes ? localVotes[targetId] : (accumulatedItems.find(i => i.id === targetId)?.userVote ?? null);
      const result = await feedbackMutation.mutateAsync({
        data: { targetType: "pattern" as const, targetId, vote },
      });
      if (result.action === "removed") {
        setLocalVotes((prev) => ({ ...prev, [targetId]: null }));
      } else {
        setLocalVotes((prev) => ({ ...prev, [targetId]: result.vote ?? vote }));
      }
      setAccumulatedItems((prev) =>
        prev.map((item) => {
          if (item.id !== targetId) return item;
          let { votesUp, votesDown } = item;
          if (result.action === "removed") {
            if (currentVote === "up") votesUp = Math.max(0, votesUp - 1);
            if (currentVote === "down") votesDown = Math.max(0, votesDown - 1);
          } else if (result.action === "changed") {
            if (vote === "up") { votesUp += 1; votesDown = Math.max(0, votesDown - 1); }
            if (vote === "down") { votesDown += 1; votesUp = Math.max(0, votesUp - 1); }
          } else if (result.action === "created") {
            if (vote === "up") votesUp += 1;
            if (vote === "down") votesDown += 1;
          }
          return { ...item, votesUp, votesDown };
        })
      );
      queryClient.invalidateQueries({
        queryKey: getGetGlobalFeedQueryOptions({}).queryKey?.slice(0, 1),
      });
    } catch (err) {
      console.error("Vote failed:", err);
    }
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[900px] mx-auto">
      <div className="mb-10">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2">
          Global Wisdom
        </p>
        <h1 className="text-[32px] md:text-[40px] font-light tracking-[-0.03em] text-[#111]">
          Wisdom Feed
        </h1>
        <p className="text-[14px] text-[#888] mt-1">
          The best collective insights from across the GuruForge network.
        </p>
      </div>

      <div className="flex gap-1 flex-wrap mb-8">
        {PATTERN_TYPES.map((pt) => (
          <button
            key={pt.value}
            onClick={() => handleFilterChange(pt.value)}
            className={`text-[11px] font-medium tracking-[0.04em] uppercase px-3 py-2 border transition-colors cursor-pointer ${
              patternType === pt.value
                ? "text-[#111] bg-[#f0f0f0] border-[#999]"
                : "text-[#888] bg-white border-[#e0e0e0] hover:border-[#999]"
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-[#f0f0f0] p-5">
              <div className="h-4 w-1/4 bg-[#f0f0f0] mb-3" />
              <div className="h-3 w-3/4 bg-[#f5f5f5]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && accumulatedItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[48px] font-light text-[#eee] leading-none mb-4">0</p>
          <p className="text-[15px] text-[#888]">
            {patternType
              ? "No insights match this filter."
              : "No collective insights yet. Wisdom builds over time."}
          </p>
        </div>
      )}

      {accumulatedItems.length > 0 && (
        <>
          <div className="space-y-0 border border-[#e0e0e0] divide-y divide-[#e0e0e0]">
            {accumulatedItems.map((item) => {
              const badge = patternBadge(item.patternType);
              const conf = confidenceLabel(item.confidence);
              const userVote = item.id in localVotes ? localVotes[item.id] : (item.userVote ?? null);

              return (
                <div key={item.id} className="px-5 py-5 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-0.5 border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          className={`text-[10px] font-medium tracking-[0.04em] uppercase ${conf.className}`}
                        >
                          {conf.text} confidence
                        </span>
                        <span className="text-[10px] text-[#ccc] ml-auto">
                          {new Date(item.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {item.publishTitle && (
                        <h3 className="text-[15px] font-medium text-[#222] mb-1">
                          {item.publishTitle}
                        </h3>
                      )}
                      <p className="text-[13px] text-[#666] leading-[1.6]">
                        {item.redactedSummary}
                      </p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <Link
                          href={`/guru/${item.guruSlug}`}
                          className="flex items-center gap-1.5 no-underline group"
                        >
                          {item.guruAvatarUrl ? (
                            <img
                              src={item.guruAvatarUrl}
                              alt={item.guruName}
                              className="w-4 h-4 object-cover"
                            />
                          ) : (
                            <div className="w-4 h-4 bg-[#111] text-white flex items-center justify-center text-[8px] font-semibold">
                              {item.guruName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-[11px] text-[#888] group-hover:text-[#444] transition-colors">
                            {item.guruName}
                          </span>
                          <ChevronRight className="w-3 h-3 text-[#ccc] group-hover:text-[#888] transition-colors" />
                        </Link>
                        <div className="flex items-center gap-1 text-[10px] text-[#bbb]">
                          <Users className="w-3 h-3" />
                          <span>
                            {item.sourceCount}{" "}
                            {item.sourceCount === 1 ? "contributor" : "contributors"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#bbb]">
                          <TrendingUp className="w-3 h-3" />
                          <span>Seen {item.frequency}x</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleVote(item.id, "up")}
                        disabled={!authenticated}
                        className={`p-1.5 border transition-colors ${
                          !authenticated
                            ? "border-[#f0f0f0] text-[#e0e0e0] cursor-not-allowed"
                            : userVote === "up"
                              ? "border-[#2a7a2a] text-[#2a7a2a] bg-[#f0f8f0] cursor-pointer"
                              : "border-[#e0e0e0] text-[#ccc] hover:text-[#888] hover:border-[#999] cursor-pointer"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-center text-[#bbb]">
                        {item.votesUp}
                      </span>
                      <button
                        onClick={() => handleVote(item.id, "down")}
                        disabled={!authenticated}
                        className={`p-1.5 border transition-colors ${
                          !authenticated
                            ? "border-[#f0f0f0] text-[#e0e0e0] cursor-not-allowed"
                            : userVote === "down"
                              ? "border-[#aa3a3a] text-[#aa3a3a] bg-[#fff0f0] cursor-pointer"
                              : "border-[#e0e0e0] text-[#ccc] hover:text-[#888] hover:border-[#999] cursor-pointer"
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-center text-[#bbb]">
                        {item.votesDown}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {feed && feed.totalPages > 1 && page < feed.totalPages && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isLoading}
                className="text-[11px] font-medium tracking-[0.04em] uppercase px-5 py-2.5 border border-[#e0e0e0] text-[#888] hover:border-[#999] hover:text-[#444] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors bg-white"
              >
                {isLoading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}

          {feed && (
            <p className="text-[11px] text-[#bbb] text-center mt-3">
              Showing {accumulatedItems.length} of {feed.total}{" "}
              {feed.total === 1 ? "insight" : "insights"}
            </p>
          )}
        </>
      )}
    </div>
  );
}

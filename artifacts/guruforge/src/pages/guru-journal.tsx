import { useRoute, Link } from "wouter";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useGetGuruJournal,
  useGetGuru,
  useGetJournalMyVotes,
  useSubmitFeedback,
  getGetGuruJournalQueryOptions,
  getGetGuruQueryOptions,
  getGetJournalMyVotesQueryOptions,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Users, TrendingUp } from "lucide-react";

const PATTERN_TYPES = [
  { value: "", label: "All" },
  { value: "common_questions", label: "Common Questions" },
  { value: "successful_strategies", label: "Strategies" },
  { value: "pitfalls", label: "Pitfalls" },
  { value: "trends", label: "Trends" },
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

export default function GuruJournal() {
  const [, params] = useRoute("/guru/:slug/journal");
  const slug = params?.slug ?? "";
  const { authenticated } = usePrivy();
  const queryClient = useQueryClient();

  const [patternType, setPatternType] = useState("");
  const [page, setPage] = useState(1);

  const { data: guru, isLoading: guruLoading } = useGetGuru(slug, {
    query: { ...getGetGuruQueryOptions(slug), enabled: !!slug },
  });

  const guruId = guru?.id ?? 0;

  const { data: journal, isLoading: journalLoading } = useGetGuruJournal(
    guruId,
    { patternType: patternType || undefined, page, limit: 20 },
    {
      query: {
        ...getGetGuruJournalQueryOptions(guruId, {
          patternType: patternType || undefined,
          page,
          limit: 20,
        }),
        enabled: !!guru?.id,
      },
    },
  );

  const { data: myVotes } = useGetJournalMyVotes(guruId, {
    query: {
      ...getGetJournalMyVotesQueryOptions(guruId),
      enabled: !!guru?.id && !!authenticated,
    },
  });

  const feedbackMutation = useSubmitFeedback();

  async function handleVote(targetId: number, vote: "up" | "down") {
    if (!authenticated) return;
    try {
      await feedbackMutation.mutateAsync({ data: { targetType: "pattern" as const, targetId, vote } });
      queryClient.invalidateQueries({ queryKey: getGetGuruJournalQueryOptions(guruId).queryKey?.slice(0, 2) });
      queryClient.invalidateQueries({ queryKey: getGetJournalMyVotesQueryOptions(guruId).queryKey });
    } catch {}
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
        href={guru ? `/guru/${guru.slug}` : "/marketplace"}
        className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#888] no-underline border-b border-[#ccc] pb-0.5 hover:text-[#444] hover:border-[#888] transition-colors inline-block mb-8"
      >
        Back to {guru?.name ?? "Marketplace"}
      </Link>

      <div className="mb-10">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2">Guru Journal</p>
        <h1 className="text-[32px] md:text-[40px] font-light tracking-[-0.03em] text-[#111]">
          {guru?.name ?? "Guru"}
        </h1>
        <p className="text-[14px] text-[#888] mt-1">
          Collective wisdom and patterns discovered across all users. Anonymized and curated.
        </p>
      </div>

      <div className="flex gap-1 flex-wrap mb-8">
        {PATTERN_TYPES.map((pt) => (
          <button
            key={pt.value}
            onClick={() => { setPatternType(pt.value); setPage(1); }}
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

      {journalLoading && (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-[#f0f0f0] p-5">
              <div className="h-4 w-1/4 bg-[#f0f0f0] mb-3" />
              <div className="h-3 w-3/4 bg-[#f5f5f5]" />
            </div>
          ))}
        </div>
      )}

      {!journalLoading && journal && journal.items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[48px] font-light text-[#eee] leading-none mb-4">0</p>
          <p className="text-[15px] text-[#888]">
            {patternType
              ? "No entries match this filter."
              : "No journal entries yet. Collective wisdom builds over time."}
          </p>
        </div>
      )}

      {!journalLoading && journal && journal.items.length > 0 && (
        <>
          <div className="space-y-0 border border-[#e0e0e0] divide-y divide-[#e0e0e0]">
            {journal.items.map((item) => {
              const badge = patternBadge(item.patternType);
              const conf = confidenceLabel(item.confidence);
              const userVote = myVotes?.votes?.[String(item.id)] ?? null;

              return (
                <div key={item.id} className="px-5 py-5 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-0.5 border ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[10px] font-medium tracking-[0.04em] uppercase ${conf.className}`}>
                          {conf.text} confidence
                        </span>
                        <span className="text-[10px] text-[#ccc] ml-auto">
                          {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {item.publishTitle && (
                        <h3 className="text-[15px] font-medium text-[#222] mb-1">{item.publishTitle}</h3>
                      )}
                      <p className="text-[13px] text-[#666] leading-[1.6]">{item.redactedSummary}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-[10px] text-[#bbb]">
                          <Users className="w-3 h-3" />
                          <span>{item.sourceCount} {item.sourceCount === 1 ? "contributor" : "contributors"}</span>
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
                      <span className="text-[10px] text-center text-[#bbb]">{item.votesUp}</span>
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
                      <span className="text-[10px] text-center text-[#bbb]">{item.votesDown}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {journal.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 border border-[#e0e0e0] text-[#888] hover:border-[#999] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[12px] text-[#888]">
                Page {journal.page} of {journal.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(journal.totalPages, page + 1))}
                disabled={page >= journal.totalPages}
                className="p-2 border border-[#e0e0e0] text-[#888] hover:border-[#999] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-[11px] text-[#bbb] text-center mt-3">
            {journal.total} {journal.total === 1 ? "entry" : "entries"} total
          </p>
        </>
      )}
    </div>
  );
}

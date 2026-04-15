import { useRoute, Link, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetGuru,
  useListGuruRatings,
  useCheckSubscription,
  useCreateCheckoutSession,
  useGetTelegramStatus,
  useToggleWisdomContribution,
  useGetContributionScore,
  useGetLeaderboard,
  useGetCreatorLeaderboard,
  useUpdateGuru,
  useLaunchToken,
  useDistributeRewards,
  useGetRewardHistory,
  useGetRewardReadiness,
  getGetGuruQueryOptions,
  getGetGuruQueryKey,
  getGetRewardHistoryQueryKey,
  getGetRewardReadinessQueryKey,
  getListGuruRatingsQueryOptions,
  getCheckSubscriptionQueryOptions,
  getGetTelegramStatusQueryOptions,
} from "@workspace/api-client-react";
import type { Rating, LeaderboardContributor, CreatorContributor, RewardDistributionItem, RewardRecipient } from "@workspace/api-client-react";
import TelegramConnectModal from "@/components/telegram-connect-modal";

function formatMemoryPolicy(policy: string | null | undefined): string {
  if (!policy) return "Standard";
  try {
    const parsed = JSON.parse(policy);
    const parts: string[] = [];
    if (parsed.personalMemory) parts.push("Personal");
    if (parsed.sharedLearning) parts.push("Shared");
    if (parts.length === 0) return "None";
    return parts.join(" + ");
  } catch {
    if (policy.toLowerCase().includes("no memory")) return "None";
    return policy;
  }
}

function formatPrice(cents: number, interval: string) {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return `$${dollars}/${interval === "yearly" ? "year" : "month"}`;
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[#e0e0e0] px-5 py-4">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] block mb-1">{label}</span>
      <span className="text-[20px] font-light text-[#111]">{value}</span>
    </div>
  );
}

function RatingItem({ rating }: { rating: Rating }) {
  const stars = "★".repeat(rating.rating) + "☆".repeat(5 - rating.rating);
  return (
    <div className="border-b border-[#f0f0f0] py-4 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-[#333]">
          {rating.userName ?? "Anonymous"}
        </span>
        <span className="text-[13px] text-[#ccc] tracking-[0.05em]">{stars}</span>
      </div>
      {rating.comment && (
        <p className="text-[13px] text-[#777] leading-[1.6]">{rating.comment}</p>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[900px] mx-auto animate-pulse">
      <div className="h-4 w-20 bg-[#f0f0f0] mb-6" />
      <div className="h-3 w-24 bg-[#f5f5f5] mb-4" />
      <div className="h-10 w-2/3 bg-[#f0f0f0] mb-3" />
      <div className="h-5 w-1/2 bg-[#f5f5f5] mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e0e0e0] mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5"><div className="h-8 bg-[#f5f5f5]" /></div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-[#f5f5f5]" />
        <div className="h-4 w-5/6 bg-[#f5f5f5]" />
        <div className="h-4 w-2/3 bg-[#f5f5f5]" />
      </div>
    </div>
  );
}

export default function GuruProfile() {
  const [, params] = useRoute("/guru/:slug");
  const slug = params?.slug ?? "";
  const searchString = useSearch();
  const [checkoutResult] = useState(() => {
    const params = new URLSearchParams(searchString);
    return params.get("checkout");
  });

  const { authenticated, login } = usePrivy();
  const queryClient = useQueryClient();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  const { data: guru, isLoading, isError } = useGetGuru(slug, {
    query: { ...getGetGuruQueryOptions(slug), enabled: !!slug },
  });

  const guruId = guru?.id ?? 0;
  const { data: ratings, isLoading: ratingsLoading, isError: ratingsError } = useListGuruRatings(guruId, {
    query: { ...getListGuruRatingsQueryOptions(guruId), enabled: !!guru?.id },
  });

  const { data: subCheck, isLoading: subCheckLoading } = useCheckSubscription(guruId, {
    query: {
      ...getCheckSubscriptionQueryOptions(guruId),
      enabled: !!guru?.id && !!authenticated,
    },
  });

  const checkoutMutation = useCreateCheckoutSession();

  const isSubscribed = subCheck?.subscribed === true;

  const { data: telegramStatus } = useGetTelegramStatus(guruId, {
    query: {
      ...getGetTelegramStatusQueryOptions(guruId),
      enabled: !!guru?.id && !!authenticated && isSubscribed,
    },
  });

  const isTelegramConnected = telegramStatus?.connected === true;
  const [wisdomEnabled, setWisdomEnabled] = useState(true);
  const wisdomToggleMutation = useToggleWisdomContribution();
  const updateGuruMutation = useUpdateGuru();
  const [cadenceValue, setCadenceValue] = useState<string>(guru?.proactiveCadence ?? "off");

  const { data: contributionScore } = useGetContributionScore(guruId, {
    query: { enabled: !!guru?.id && !!authenticated && isSubscribed },
  });

  const [leaderboardView, setLeaderboardView] = useState<"public" | "creator">("public");

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenLaunching, setTokenLaunching] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState<string | null>(null);
  const launchTokenMutation = useLaunchToken();

  const [distributeAmount, setDistributeAmount] = useState("");
  const [distributing, setDistributing] = useState(false);
  const [distributeError, setDistributeError] = useState<string | null>(null);
  const [distributeSuccess, setDistributeSuccess] = useState<string | null>(null);
  const [showDistributePreview, setShowDistributePreview] = useState(false);
  const distributeRewardsMutation = useDistributeRewards();

  const { data: rewardReadiness } = useGetRewardReadiness(guruId, {
    query: { enabled: !!guru?.id && !!authenticated && !!guru?.isCreator && !!guru?.tokenAddress },
  });

  const { data: rewardHistory } = useGetRewardHistory(guruId, {
    query: { enabled: !!guru?.id && !!authenticated && !!guru?.isCreator },
  });

  const { data: leaderboard } = useGetLeaderboard(guruId, {}, {
    query: { enabled: !!guru?.id },
  });

  const { data: creatorLeaderboard } = useGetCreatorLeaderboard(guruId, {}, {
    query: { enabled: !!guru?.id && !!authenticated && !!guru?.isCreator },
  });

  async function handleLaunchToken() {
    if (!guru?.id || !tokenName.trim() || !tokenSymbol.trim()) return;
    setTokenLaunching(true);
    setTokenError(null);
    setTokenSuccess(null);
    try {
      const result = await launchTokenMutation.mutateAsync({
        guruId: guru.id,
        data: { name: tokenName.trim(), symbol: tokenSymbol.trim().toUpperCase() },
      });
      setTokenSuccess(`Token $${result.tokenSymbol} launched at ${result.tokenAddress}`);
      setTokenName("");
      setTokenSymbol("");
      queryClient.invalidateQueries({ queryKey: getGetGuruQueryKey(slug) });
    } catch (err: unknown) {
      setTokenError(err instanceof Error ? err.message : "Failed to launch token");
    } finally {
      setTokenLaunching(false);
    }
  }

  function handleShowPreview() {
    if (!distributeAmount.trim() || isNaN(Number(distributeAmount)) || Number(distributeAmount) <= 0) {
      setDistributeError("Enter a positive amount");
      return;
    }
    setDistributeError(null);
    setShowDistributePreview(true);
  }

  async function handleConfirmDistribute() {
    if (!guru?.id || !distributeAmount.trim()) return;
    setDistributing(true);
    setDistributeError(null);
    setDistributeSuccess(null);
    try {
      const result = await distributeRewardsMutation.mutateAsync({
        guruId: guru.id,
        data: { totalAmount: distributeAmount.trim() },
      });
      setDistributeSuccess(`Distributed ${result.totalAmount} ${guru.tokenSymbol} to ${result.recipientCount} contributors`);
      setDistributeAmount("");
      setShowDistributePreview(false);
      queryClient.invalidateQueries({ queryKey: getGetRewardHistoryQueryKey(guruId) });
      queryClient.invalidateQueries({ queryKey: getGetRewardReadinessQueryKey(guruId) });
    } catch (err: unknown) {
      setDistributeError(err instanceof Error ? err.message : "Failed to distribute rewards");
    } finally {
      setDistributing(false);
    }
  }

  useEffect(() => {
    if (telegramStatus?.contributesToWisdom !== undefined) {
      setWisdomEnabled(telegramStatus.contributesToWisdom);
    }
  }, [telegramStatus?.contributesToWisdom]);

  useEffect(() => {
    if (guru?.proactiveCadence) {
      setCadenceValue(guru.proactiveCadence);
    }
  }, [guru?.proactiveCadence]);

  async function handleCadenceChange(newCadence: string) {
    if (!guru?.id) return;
    const prev = cadenceValue;
    setCadenceValue(newCadence);
    try {
      await updateGuruMutation.mutateAsync({
        id: guru.id,
        data: { proactiveCadence: newCadence as "off" | "daily" | "every_few_days" | "weekly" },
      });
    } catch {
      setCadenceValue(prev);
    }
  }

  async function handleWisdomToggle() {
    if (!guru?.id) return;
    const newValue = !wisdomEnabled;
    setWisdomEnabled(newValue);
    try {
      await wisdomToggleMutation.mutateAsync({
        guruId: guru.id,
        data: { contributesToWisdom: newValue },
      });
    } catch {
      setWisdomEnabled(!newValue);
    }
  }

  useEffect(() => {
    if (guru?.name) {
      document.title = `${guru.name} — GuruForge`;
    }
  }, [guru?.name]);

  useEffect(() => {
    if (checkoutResult === "success") {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [checkoutResult]);

  async function handleSubscribe() {
    if (!authenticated) {
      login();
      return;
    }
    if (!guru?.id) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const result = await checkoutMutation.mutateAsync({ data: { guruId: guru.id } });
      if (result.url) {
        window.location.href = result.url;
      } else {
        setCheckoutError("Unable to start checkout. Please try again.");
      }
    } catch (err: unknown) {
      let msg = "Something went wrong. Please try again.";
      if (err instanceof Error) {
        msg = err.message;
      }
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const response = (err as Record<string, unknown>).response as Record<string, unknown>;
        if (typeof response.data === "object" && response.data !== null) {
          const data = response.data as Record<string, unknown>;
          if (typeof data.error === "string") {
            msg = data.error;
          }
        }
      }
      setCheckoutError(msg);
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !guru) {
    return (
      <div className="px-6 md:px-10 py-16 text-center max-w-[600px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">Not found</p>
        <p className="text-[64px] font-light text-[#eee] leading-none mb-6">404</p>
        <p className="text-[15px] text-[#777] mb-8">This Guru doesn't exist or hasn't been published yet.</p>
        <Link
          href="/marketplace"
          className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[900px] mx-auto">
      <Link
        href="/marketplace"
        className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#888] no-underline border-b border-[#ccc] pb-0.5 hover:text-[#444] hover:border-[#888] transition-colors inline-block mb-8"
        data-testid="back-marketplace"
      >
        Back to Marketplace
      </Link>

      {checkoutResult === "success" && (
        <div className="border border-[#d0e8d0] bg-[#f7fdf7] px-5 py-4 mb-6">
          <p className="text-[13px] font-medium text-[#2a7a2a]">Subscription activated</p>
          <p className="text-[12px] text-[#5a9a5a] mt-1">You now have access to this Guru.</p>
        </div>
      )}

      {checkoutResult === "cancel" && (
        <div className="border border-[#e0d8c8] bg-[#fdfbf5] px-5 py-4 mb-6">
          <p className="text-[13px] font-medium text-[#8a7a4a]">Checkout cancelled</p>
          <p className="text-[12px] text-[#aaa080] mt-1">You can subscribe anytime.</p>
        </div>
      )}

      <section className="mb-10">
        {guru.categoryName && (
          <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#999] border border-[#e0e0e0] px-2 py-0.5 inline-block mb-4">
            {guru.categoryName}
          </span>
        )}
        <h1 className="text-[36px] md:text-[44px] font-light tracking-[-0.03em] leading-[1.1] text-[#111] mb-3">
          {guru.name}
        </h1>
        {guru.tagline && (
          <p className="text-[17px] text-[#666] leading-[1.5] mb-4">{guru.tagline}</p>
        )}
        {guru.creatorName && (
          <p className="text-[13px] text-[#999]">
            Created by <span className="text-[#555] font-medium">{guru.creatorName}</span>
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e0e0e0] mb-10">
        <StatBlock label="Wisdom Score" value={guru.wisdomScore ?? 0} />
        <StatBlock label="Satisfaction" value={guru.satisfactionScore ? `${guru.satisfactionScore}%` : "—"} />
        <StatBlock label="Active Users" value={guru.userCount ?? 0} />
        <StatBlock label="Price" value={formatPrice(guru.priceCents, guru.priceInterval)} />
      </section>

      {guru.description && (
        <section className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">About</p>
          <p className="text-[15px] text-[#555] leading-[1.8] whitespace-pre-line">{guru.description}</p>
        </section>
      )}

      {guru.topics && guru.topics.length > 0 && (
        <section className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Topics</p>
          <div className="flex flex-wrap gap-2">
            {guru.topics.map((topic) => (
              <span
                key={topic}
                className="text-[11px] font-medium tracking-[0.04em] uppercase px-3 py-1 border border-[#e0e0e0] text-[#666]"
              >
                {topic}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/guru/${slug}/journal`}
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#555] bg-white px-7 py-3 border border-[#ddd] hover:border-[#999] hover:text-[#333] transition-colors no-underline text-center"
          >
            View Guru Journal
          </Link>
          {isSubscribed && (
            <Link
              href={`/guru/${slug}/wisdom`}
              className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#5a5aaa] bg-[#f0f0ff] px-7 py-3 border border-[#c8c8e8] hover:border-[#9a9aca] transition-colors no-underline text-center"
            >
              My Wisdom Feed
            </Link>
          )}
        </div>
      </section>

      <section className="mb-10">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Trust & capabilities</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#e0e0e0]">
          <div className="bg-white px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Memory policy</span>
            <span className="text-[14px] text-[#333] capitalize">{formatMemoryPolicy(guru.memoryPolicy)}</span>
          </div>
          <div className="bg-white px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Introductions</span>
            <span className="text-[14px] text-[#333]">{guru.introEnabled ? "Enabled" : "Disabled"}</span>
          </div>
          <div className="bg-white px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Personality</span>
            <span className="text-[14px] text-[#333] capitalize">{guru.personalityStyle ?? "Friendly"}</span>
          </div>
          <div className="bg-white px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">AI model</span>
            <span className="text-[14px] text-[#333]">Powered by {guru.modelTier === "grok" ? "Grok" : "GPT"}</span>
          </div>
        </div>
      </section>

      {guru.isCreator && (
        <section className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Creator settings</p>
          <div className="border border-[#e0e0e0] px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-3">Proactive check-ins</span>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "off", label: "Off" },
                { value: "daily", label: "Daily" },
                { value: "every_few_days", label: "Every few days" },
                { value: "weekly", label: "Weekly" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleCadenceChange(opt.value)}
                  className={`text-[12px] font-medium tracking-[0.04em] uppercase px-4 py-2 border transition-colors cursor-pointer ${
                    cadenceValue === opt.value
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#555] border-[#ddd] hover:border-[#999]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {guru.tokenAddress && (
        <section className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Token</p>
          <div className="border border-[#e0e0e0] px-5 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[16px] font-medium text-[#111]">${guru.tokenSymbol}</span>
              <span className="text-[12px] text-[#999] font-mono">{guru.tokenAddress}</span>
              <span className="text-[10px] font-medium tracking-[0.06em] uppercase text-[#888] border border-[#e0e0e0] px-2 py-0.5">{guru.tokenChain || "base"}</span>
            </div>
          </div>
        </section>
      )}

      {guru.isCreator && (
        <section className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Token & rewards</p>

          {guru.tokenAddress ? (
            <div className="border border-[#e0e0e0] mb-4">
              <div className="border-b border-[#e0e0e0] px-5 py-4">
                <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-3">Distribute rewards</span>
                {!showDistributePreview ? (
                  <>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-[11px] text-[#aaa] block mb-1">Amount of ${guru.tokenSymbol} to distribute</label>
                        <input
                          type="text"
                          value={distributeAmount}
                          onChange={(e) => setDistributeAmount(e.target.value)}
                          placeholder="e.g. 1000"
                          className="w-full text-[14px] px-3 py-2 border border-[#ddd] bg-white text-[#333] focus:outline-none focus:border-[#999]"
                        />
                      </div>
                      <button
                        onClick={handleShowPreview}
                        disabled={!distributeAmount.trim() || !rewardReadiness || rewardReadiness.totalContributors === 0}
                        className="text-[12px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-5 py-2.5 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Preview
                      </button>
                    </div>
                    {rewardReadiness && rewardReadiness.totalContributors === 0 && (
                      <p className="text-[12px] text-[#aaa] mt-2">No eligible contributors with wallet addresses yet.</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-[#555] mb-3">
                      Distributing <span className="font-medium text-[#111]">{distributeAmount} ${guru.tokenSymbol}</span> to {rewardReadiness?.totalContributors} contributors proportionally by score:
                    </p>
                    {rewardReadiness && rewardReadiness.recipients.length > 0 && (
                      <div className="border border-[#e0e0e0] mb-3">
                        <div className="grid grid-cols-[1fr_80px_80px] bg-[#fafafa] px-3 py-1.5 border-b border-[#e0e0e0]">
                          <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Wallet</span>
                          <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Share</span>
                          <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Amount</span>
                        </div>
                        {rewardReadiness.recipients.slice(0, 20).map((r: RewardRecipient) => {
                          const amount = ((r.sharePercent / 100) * Number(distributeAmount)).toFixed(4);
                          return (
                            <div key={r.walletAddress} className="grid grid-cols-[1fr_80px_80px] px-3 py-2 border-b border-[#f0f0f0] last:border-0">
                              <span className="text-[12px] text-[#555] font-mono truncate">{r.walletAddress.slice(0, 8)}...{r.walletAddress.slice(-6)}</span>
                              <span className="text-[12px] text-[#888] text-right">{r.sharePercent}%</span>
                              <span className="text-[12px] text-[#333] text-right font-medium">{amount}</span>
                            </div>
                          );
                        })}
                        {rewardReadiness.recipients.length > 20 && (
                          <div className="px-3 py-1.5 bg-[#fafafa]">
                            <span className="text-[11px] text-[#aaa]">+{rewardReadiness.recipients.length - 20} more</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmDistribute}
                        disabled={distributing}
                        className="text-[12px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-5 py-2.5 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {distributing ? "Distributing..." : "Confirm & distribute"}
                      </button>
                      <button
                        onClick={() => setShowDistributePreview(false)}
                        disabled={distributing}
                        className="text-[12px] font-medium tracking-[0.04em] uppercase text-[#555] bg-white px-5 py-2.5 border border-[#ddd] hover:border-[#999] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
                {distributeError && <p className="text-[12px] text-[#c44] mt-2">{distributeError}</p>}
                {distributeSuccess && <p className="text-[12px] text-[#2a7a2a] mt-2">{distributeSuccess}</p>}
              </div>
            </div>
          ) : (
            <div className="border border-[#e0e0e0] px-5 py-4 mb-4">
              <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-3">Launch token</span>
              <p className="text-[13px] text-[#777] mb-4">Deploy an ERC-20 token on Base to reward your top contributors.</p>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-[11px] text-[#aaa] block mb-1">Token name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="e.g. Guru Wisdom Token"
                    className="w-full text-[14px] px-3 py-2 border border-[#ddd] bg-white text-[#333] focus:outline-none focus:border-[#999]"
                  />
                </div>
                <div className="w-[120px]">
                  <label className="text-[11px] text-[#aaa] block mb-1">Symbol</label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="e.g. GWT"
                    className="w-full text-[14px] px-3 py-2 border border-[#ddd] bg-white text-[#333] focus:outline-none focus:border-[#999] uppercase"
                  />
                </div>
              </div>
              <button
                onClick={handleLaunchToken}
                disabled={tokenLaunching || !tokenName.trim() || !tokenSymbol.trim()}
                className="text-[12px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-6 py-2.5 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tokenLaunching ? "Launching..." : "Launch Token"}
              </button>
              {tokenError && <p className="text-[12px] text-[#c44] mt-2">{tokenError}</p>}
              {tokenSuccess && <p className="text-[12px] text-[#2a7a2a] mt-2">{tokenSuccess}</p>}
            </div>
          )}

          {rewardHistory && rewardHistory.distributions.length > 0 && (
            <div className="border border-[#e0e0e0]">
              <div className="px-4 py-2 bg-[#fafafa] border-b border-[#e0e0e0]">
                <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Distribution history</span>
              </div>
              {rewardHistory.distributions.map((d: RewardDistributionItem) => (
                <div key={d.id} className="px-4 py-3 border-b border-[#f0f0f0] last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-[#333] font-medium">{d.totalAmount} {d.tokenSymbol}</span>
                    <span className={`text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-0.5 border ${
                      d.status === "completed" ? "text-[#2a7a2a] border-[#c8e0c8] bg-[#f7fdf7]" :
                      d.status === "failed" ? "text-[#c44] border-[#e8c8c8] bg-[#fdf7f7]" :
                      d.status === "partial" ? "text-[#a67c00] border-[#e0d8b0] bg-[#fdf9ee]" :
                      "text-[#888] border-[#e0e0e0] bg-[#fafafa]"
                    }`}>{d.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#999]">
                    <span>{d.recipientCount} recipient{d.recipientCount !== 1 ? "s" : ""}</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  {d.errorMessage && <p className="text-[11px] text-[#c44] mt-1">{d.errorMessage}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {isSubscribed && contributionScore && (contributionScore.score > 0 || contributionScore.turnCount > 0) && (
        <section className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Your contribution</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#e0e0e0]">
            <div className="bg-white px-5 py-4">
              <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Contribution score</span>
              <span className="text-[14px] text-[#333]">{Math.round(contributionScore.score)}</span>
            </div>
            <div className="bg-white px-5 py-4">
              <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Turns</span>
              <span className="text-[14px] text-[#333]">{contributionScore.turnCount}</span>
            </div>
            <div className="bg-white px-5 py-4">
              <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Patterns contributed</span>
              <span className="text-[14px] text-[#333]">{contributionScore.patternsContributed}</span>
            </div>
          </div>
        </section>
      )}

      {leaderboard && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888]">Top contributors</p>
            {guru.isCreator && creatorLeaderboard && (
              <div className="flex gap-px bg-[#e0e0e0]">
                <button
                  onClick={() => setLeaderboardView("public")}
                  className={`text-[10px] font-medium tracking-[0.06em] uppercase px-3 py-1.5 border-0 cursor-pointer transition-colors ${
                    leaderboardView === "public"
                      ? "bg-[#111] text-white"
                      : "bg-white text-[#888] hover:text-[#555]"
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setLeaderboardView("creator")}
                  className={`text-[10px] font-medium tracking-[0.06em] uppercase px-3 py-1.5 border-0 cursor-pointer transition-colors ${
                    leaderboardView === "creator"
                      ? "bg-[#111] text-white"
                      : "bg-white text-[#888] hover:text-[#555]"
                  }`}
                >
                  Creator view
                </button>
              </div>
            )}
          </div>

          {leaderboardView === "public" && leaderboard.contributors.length === 0 && (
            <div className="border border-[#e0e0e0] px-5 py-8 text-center">
              <p className="text-[13px] text-[#aaa]">No contributions yet. Start a conversation to be the first contributor.</p>
            </div>
          )}

          {leaderboardView === "public" && leaderboard.contributors.length > 0 && (
            <div className="border border-[#e0e0e0]">
              <div className="grid grid-cols-[48px_1fr_80px_80px] bg-[#fafafa] px-4 py-2 border-b border-[#e0e0e0]">
                <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">#</span>
                <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Contributor</span>
                <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Score</span>
                <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Patterns</span>
              </div>
              {leaderboard.contributors.map((c: LeaderboardContributor) => (
                <div
                  key={c.rank}
                  className={`grid grid-cols-[48px_1fr_80px_80px] px-4 py-3 border-b border-[#f0f0f0] last:border-0 ${
                    c.isYou ? "bg-[#f8f8ff]" : ""
                  }`}
                >
                  <span className={`text-[13px] ${c.rank <= 3 ? "font-medium text-[#111]" : "text-[#999]"}`}>
                    {c.rank <= 3 ? ["1st", "2nd", "3rd"][c.rank - 1] : c.rank}
                  </span>
                  <span className="text-[13px] text-[#555]">
                    {c.displayName}
                    {c.isYou && <span className="text-[10px] font-medium tracking-[0.06em] uppercase text-[#7a7acc] ml-2">You</span>}
                  </span>
                  <span className="text-[13px] text-[#333] text-right font-medium">{c.score}</span>
                  <span className="text-[13px] text-[#888] text-right">{c.patternsContributed}</span>
                </div>
              ))}
              {leaderboard.myPosition && !leaderboard.contributors.some((c: LeaderboardContributor) => c.isYou) && (
                <div className="grid grid-cols-[48px_1fr_80px_80px] px-4 py-3 bg-[#f8f8ff] border-t border-[#e0e0e0]">
                  <span className="text-[13px] text-[#999]">{leaderboard.myPosition.rank}</span>
                  <span className="text-[13px] text-[#555]">
                    You
                    <span className="text-[10px] font-medium tracking-[0.06em] uppercase text-[#7a7acc] ml-2">Your rank</span>
                  </span>
                  <span className="text-[13px] text-[#333] text-right font-medium">{leaderboard.myPosition.score}</span>
                  <span className="text-[13px] text-[#888] text-right">{leaderboard.myPosition.patternsContributed}</span>
                </div>
              )}
              <div className="px-4 py-2 bg-[#fafafa] border-t border-[#e0e0e0]">
                <span className="text-[11px] text-[#aaa]">{leaderboard.total} total contributor{leaderboard.total !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}

          {leaderboardView === "creator" && guru.isCreator && creatorLeaderboard && (
            <div className="border border-[#e0e0e0]">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[40px_1fr_1fr_120px_56px_56px_56px_56px_56px] min-w-[700px] bg-[#fafafa] px-4 py-2 border-b border-[#e0e0e0]">
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">#</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Name</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Email</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Wallet</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Score</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Turns</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Ptns</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Qual</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Rel</span>
                </div>
                {creatorLeaderboard.contributors.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-[13px] text-[#aaa]">No contributors yet.</p>
                  </div>
                )}
                {creatorLeaderboard.contributors.map((c: CreatorContributor) => (
                  <div
                    key={c.rank}
                    className="grid grid-cols-[40px_1fr_1fr_120px_56px_56px_56px_56px_56px] min-w-[700px] px-4 py-3 border-b border-[#f0f0f0] last:border-0"
                  >
                    <span className="text-[13px] text-[#999]">{c.rank}</span>
                    <span className="text-[13px] text-[#333] truncate">{c.name}</span>
                    <span className="text-[12px] text-[#777] truncate">{c.email}</span>
                    <span className="text-[11px] text-[#999] font-mono truncate">
                      {c.walletAddress ? `${c.walletAddress.slice(0, 6)}...${c.walletAddress.slice(-4)}` : "No wallet"}
                    </span>
                    <span className="text-[13px] text-[#333] text-right font-medium">{c.score}</span>
                    <span className="text-[13px] text-[#888] text-right">{c.turnCount}</span>
                    <span className="text-[13px] text-[#888] text-right">{c.patternsContributed}</span>
                    <span className="text-[13px] text-[#888] text-right">{c.avgContributionQuality}</span>
                    <span className="text-[13px] text-[#888] text-right">{c.avgDomainRelevance}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-[#fafafa] border-t border-[#e0e0e0]">
                <span className="text-[11px] text-[#aaa]">{creatorLeaderboard.total} total contributor{creatorLeaderboard.total !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}

          {leaderboardView === "creator" && guru.isCreator && creatorLeaderboard && creatorLeaderboard.qualityOverTime.length > 0 && (
            <div className="border border-[#e0e0e0] mt-4">
              <div className="px-4 py-2 bg-[#fafafa] border-b border-[#e0e0e0]">
                <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Quality over time</span>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[120px_80px_80px_60px] min-w-[340px] px-4 py-2 border-b border-[#e0e0e0] bg-[#fafafa]">
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Week</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Quality</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Relevance</span>
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Turns</span>
                </div>
                {creatorLeaderboard.qualityOverTime.map((point) => (
                  <div
                    key={point.week}
                    className="grid grid-cols-[120px_80px_80px_60px] min-w-[340px] px-4 py-2.5 border-b border-[#f0f0f0] last:border-0"
                  >
                    <span className="text-[12px] text-[#555]">{point.week}</span>
                    <span className="text-[12px] text-[#333] text-right">{point.avgContributionQuality}</span>
                    <span className="text-[12px] text-[#333] text-right">{point.avgDomainRelevance}</span>
                    <span className="text-[12px] text-[#888] text-right">{point.turnCount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mb-10">
        <div className="flex flex-col sm:flex-row gap-3">
          {isSubscribed ? (
            <div
              className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#2a7a2a] bg-[#f0f8f0] px-7 py-3 border border-[#c8e0c8] text-center"
              data-testid="badge-subscribed"
            >
              Subscribed
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={checkoutLoading || subCheckLoading}
              className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-subscribe"
            >
              {checkoutLoading ? "Redirecting..." : `Subscribe — ${formatPrice(guru.priceCents, guru.priceInterval)}`}
            </button>
          )}
          {isSubscribed && (
            isTelegramConnected ? (
              <div
                className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#2a7a2a] bg-[#f0f8f0] px-7 py-3 border border-[#c8e0c8] text-center"
                data-testid="badge-telegram-connected"
              >
                Connected on Telegram
              </div>
            ) : (
              <button
                onClick={() => setShowTelegramModal(true)}
                className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#555] bg-white px-7 py-3 border border-[#ddd] hover:border-[#999] hover:text-[#333] transition-colors cursor-pointer"
                data-testid="button-telegram"
              >
                Connect on Telegram
              </button>
            )
          )}
          {isSubscribed && isTelegramConnected && (
            <button
              onClick={handleWisdomToggle}
              className={`text-[13px] font-medium tracking-[0.04em] uppercase px-7 py-3 border transition-colors cursor-pointer ${
                wisdomEnabled
                  ? "text-[#555] bg-white border-[#ddd] hover:border-[#999]"
                  : "text-[#999] bg-[#fafafa] border-[#e8e8e8] hover:border-[#ccc]"
              }`}
              data-testid="button-wisdom-toggle"
            >
              {wisdomEnabled ? "Contributing to Wisdom" : "Wisdom Contribution Off"}
            </button>
          )}
        </div>
        {checkoutError && (
          <p className="text-[12px] text-[#c44] mt-2">{checkoutError}</p>
        )}
        {!isSubscribed && (
          <p className="text-[11px] text-[#aaa] mt-2">Secure payments powered by Stripe.</p>
        )}
      </section>

      <section>
        <div className="flex items-center gap-4 mb-4">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888]">Ratings</p>
          {guru.avgRating != null && (
            <span className="text-[13px] text-[#555]">
              {guru.avgRating.toFixed(1)} avg — {guru.totalRatings} review{guru.totalRatings !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {ratingsLoading && (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 bg-[#f0f0f0]" />
            <div className="h-3 w-2/3 bg-[#f5f5f5]" />
          </div>
        )}
        {ratingsError && (
          <p className="text-[13px] text-[#aaa]">Unable to load ratings right now.</p>
        )}
        {!ratingsLoading && !ratingsError && ratings && ratings.length > 0 && (
          <div>
            {ratings.map((r) => (
              <RatingItem key={r.id} rating={r} />
            ))}
          </div>
        )}
        {!ratingsLoading && !ratingsError && (!ratings || ratings.length === 0) && (
          <p className="text-[13px] text-[#aaa]">No ratings yet. Be the first to review this Guru.</p>
        )}
      </section>

      {guru && (
        <TelegramConnectModal
          guruId={guru.id}
          guruName={guru.name}
          isOpen={showTelegramModal}
          onClose={() => setShowTelegramModal(false)}
        />
      )}
    </div>
  );
}

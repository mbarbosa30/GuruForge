import { useRoute, Link, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import {
  useGetGuru,
  useListGuruRatings,
  useCheckSubscription,
  useCreateCheckoutSession,
  useGetTelegramStatus,
  useToggleWisdomContribution,
  getGetGuruQueryOptions,
  getListGuruRatingsQueryOptions,
  getCheckSubscriptionQueryOptions,
  getGetTelegramStatusQueryOptions,
} from "@workspace/api-client-react";
import type { Rating } from "@workspace/api-client-react";
import TelegramConnectModal from "@/components/telegram-connect-modal";

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

  const { isSignedIn } = useAuth();
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
      enabled: !!guru?.id && !!isSignedIn,
    },
  });

  const checkoutMutation = useCreateCheckoutSession();

  const isSubscribed = subCheck?.subscribed === true;

  const { data: telegramStatus } = useGetTelegramStatus(guruId, {
    query: {
      ...getGetTelegramStatusQueryOptions(guruId),
      enabled: !!guru?.id && !!isSignedIn && isSubscribed,
    },
  });

  const isTelegramConnected = telegramStatus?.connected === true;
  const [wisdomEnabled, setWisdomEnabled] = useState(true);
  const wisdomToggleMutation = useToggleWisdomContribution();

  useEffect(() => {
    if (telegramStatus?.contributesToWisdom !== undefined) {
      setWisdomEnabled(telegramStatus.contributesToWisdom);
    }
  }, [telegramStatus?.contributesToWisdom]);

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
    if (checkoutResult === "success") {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [checkoutResult]);

  async function handleSubscribe() {
    if (!isSignedIn) {
      window.location.href = import.meta.env.BASE_URL + "sign-in";
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
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Trust & capabilities</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#e0e0e0]">
          <div className="bg-white px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Memory policy</span>
            <span className="text-[14px] text-[#333] capitalize">{guru.memoryPolicy ?? "Standard"}</span>
          </div>
          <div className="bg-white px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Introductions</span>
            <span className="text-[14px] text-[#333]">{guru.introEnabled ? "Enabled" : "Disabled"}</span>
          </div>
          <div className="bg-white px-5 py-4">
            <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888] block mb-1">Personality</span>
            <span className="text-[14px] text-[#333] capitalize">{guru.personalityStyle ?? "Friendly"}</span>
          </div>
        </div>
      </section>

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

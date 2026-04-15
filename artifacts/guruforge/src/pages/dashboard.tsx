import { Link } from "wouter";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useListMySubscriptions,
  useCreatePortalSession,
  useGetMe,
  useGetPortfolio,
  getListMySubscriptionsQueryOptions,
} from "@workspace/api-client-react";
import type { PortfolioToken } from "@workspace/api-client-react";
import TelegramStatusBadge from "@/components/telegram-status-badge";

function formatPrice(cents: number, interval: string) {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return `$${dollars}/${interval === "yearly" ? "yr" : "mo"}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardContent() {
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: subscriptions, isLoading, isError } = useListMySubscriptions({
    query: getListMySubscriptionsQueryOptions(),
  });

  const portalMutation = useCreatePortalSession();

  const { data: me } = useGetMe({ query: { enabled: true } });
  const isCreatorOrAdmin = me?.role === "creator" || me?.role === "admin";
  const { data: portfolio } = useGetPortfolio({ query: { enabled: isCreatorOrAdmin } });

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const result = await portalMutation.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      } else {
        setPortalLoading(false);
      }
    } catch {
      setPortalLoading(false);
    }
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2">Dashboard</p>
          <h1 className="text-[32px] md:text-[40px] font-light tracking-[-0.03em] text-[#111]">
            Your Subscriptions
          </h1>
        </div>
        {subscriptions && subscriptions.length > 0 && (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="text-[12px] font-medium tracking-[0.04em] uppercase text-[#555] border border-[#ddd] px-5 py-2.5 hover:border-[#999] hover:text-[#333] transition-colors cursor-pointer disabled:opacity-50"
            data-testid="button-manage-billing"
          >
            {portalLoading ? "Loading..." : "Manage Billing"}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-[#f0f0f0] p-5">
              <div className="h-5 w-1/3 bg-[#f0f0f0] mb-3" />
              <div className="h-3 w-1/2 bg-[#f5f5f5]" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="border border-[#e8d8d8] bg-[#fdf7f7] px-5 py-4">
          <p className="text-[13px] text-[#c44]">Unable to load your subscriptions. Please try again later.</p>
        </div>
      )}

      {!isLoading && !isError && subscriptions && subscriptions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[48px] font-light text-[#eee] leading-none mb-4">0</p>
          <p className="text-[15px] text-[#888] mb-6">You don't have any active subscriptions yet.</p>
          <Link
            href="/marketplace"
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      )}

      {!isLoading && !isError && subscriptions && subscriptions.length > 0 && (
        <div className="space-y-0 border border-[#e0e0e0] divide-y divide-[#e0e0e0]">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between px-5 py-5 bg-white">
              <div className="flex items-center gap-4">
                {sub.guruAvatarUrl ? (
                  <img
                    src={sub.guruAvatarUrl}
                    alt={sub.guruName}
                    className="w-10 h-10 object-cover border border-[#e0e0e0]"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#f5f5f5] border border-[#e0e0e0] flex items-center justify-center">
                    <span className="text-[14px] font-light text-[#bbb]">
                      {sub.guruName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/guru/${sub.guruSlug}`}
                      className="text-[15px] font-medium text-[#222] no-underline hover:text-[#555] transition-colors"
                    >
                      {sub.guruName}
                    </Link>
                    <TelegramStatusBadge guruId={sub.guruId} guruName={sub.guruName} guruSlug={sub.guruSlug} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[12px] text-[#999]">
                      Since {formatDate(sub.startedAt)}
                    </p>
                    <Link
                      href={`/guru/${sub.guruSlug}/wisdom`}
                      className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#5a5aaa] no-underline hover:text-[#3a3a8a] transition-colors"
                    >
                      Wisdom Feed
                    </Link>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[14px] font-light text-[#333]">
                  {formatPrice(sub.guruPriceCents, sub.guruPriceInterval)}
                </span>
                <span className="block text-[10px] font-medium tracking-[0.08em] uppercase text-[#2a7a2a] mt-0.5">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreatorOrAdmin && portfolio && portfolio.tokens.length > 0 && (
        <div className="mt-12">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Platform wallet</p>
          <div className="border border-[#e0e0e0]">
            <div className="grid grid-cols-[1fr_100px_100px_80px] bg-[#fafafa] px-4 py-2 border-b border-[#e0e0e0]">
              <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa]">Token</span>
              <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Symbol</span>
              <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Balance</span>
              <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#aaa] text-right">Chain</span>
            </div>
            {portfolio.tokens.map((t: PortfolioToken) => (
              <div key={t.tokenAddress} className="grid grid-cols-[1fr_100px_100px_80px] px-4 py-3 border-b border-[#f0f0f0] last:border-0">
                <div>
                  <span className="text-[13px] text-[#333] font-medium block">{t.name}</span>
                  <span className="text-[11px] text-[#999] font-mono">{t.tokenAddress.slice(0, 8)}...{t.tokenAddress.slice(-6)}</span>
                </div>
                <span className="text-[13px] text-[#555] text-right self-center">${t.symbol}</span>
                <span className="text-[13px] text-[#333] text-right font-medium self-center">{t.balance}</span>
                <span className="text-[11px] text-[#888] text-right uppercase self-center">{t.chain}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { authenticated, login } = usePrivy();

  if (!authenticated) {
    return (
      <div className="px-6 md:px-10 py-16 text-center max-w-[600px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">Dashboard</p>
        <p className="text-[15px] text-[#777] mb-8">Sign in to view your subscriptions.</p>
        <button
          onClick={() => login()}
          className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors cursor-pointer border-none"
        >
          Sign In
        </button>
      </div>
    );
  }

  return <DashboardContent />;
}

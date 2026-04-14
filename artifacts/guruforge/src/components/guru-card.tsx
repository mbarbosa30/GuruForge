import { Link } from "wouter";
import type { GuruListItem } from "@workspace/api-client-react";

function formatPrice(cents: number, interval: string) {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return `$${dollars}/${interval === "yearly" ? "yr" : "mo"}`;
}

function WisdomBar({ score }: { score: number | null | undefined }) {
  const val = score ?? 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#888]">Wisdom</span>
      <div className="flex-1 h-1 bg-[#eee]">
        <div className="h-full bg-[#111] transition-all" style={{ width: `${Math.min(val, 100)}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-[#111] tabular-nums">{val}</span>
    </div>
  );
}

export default function GuruCard({ guru }: { guru: GuruListItem }) {
  return (
    <Link
      href={`/guru/${guru.slug}`}
      className="group flex flex-col border border-[#e0e0e0] bg-white p-6 hover:border-[#999] transition-colors no-underline text-[#111]"
      data-testid={`guru-card-${guru.slug}`}
    >
      <div className="flex items-start justify-between mb-4">
        {guru.categoryName && (
          <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#999] border border-[#e0e0e0] px-2 py-0.5 truncate max-w-[60%]">
            {guru.categoryName}
          </span>
        )}
        <span className="text-[13px] font-semibold text-[#111] shrink-0 ml-auto">
          {formatPrice(guru.priceCents, guru.priceInterval)}
        </span>
      </div>

      <h3 className="text-[17px] font-semibold mb-1.5 text-[#111] group-hover:text-[#333] line-clamp-1">
        {guru.name}
      </h3>
      <p className="text-[13px] text-[#777] leading-[1.5] mb-4 line-clamp-2 min-h-[39px]">
        {guru.tagline || "\u00A0"}
      </p>

      <div className="mt-auto">
        <WisdomBar score={guru.wisdomScore} />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0f0f0]">
          <div className="flex items-center gap-4">
            {guru.userCount != null && (
              <span className="text-[11px] text-[#888]">
                <span className="font-semibold text-[#555]">{guru.userCount}</span> users
              </span>
            )}
            {guru.satisfactionScore != null && (
              <span className="text-[11px] text-[#888]">
                <span className="font-semibold text-[#555]">{guru.satisfactionScore}%</span> satisfaction
              </span>
            )}
          </div>
          {guru.creatorName && (
            <span className="text-[11px] text-[#aaa]">by {guru.creatorName}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

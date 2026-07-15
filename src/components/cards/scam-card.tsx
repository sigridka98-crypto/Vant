import Link from "next/link";
import { ArrowRight, BellRing, Coins, Gem, LockKeyhole, Sparkles, TriangleAlert } from "lucide-react";

import { BookmarkToggle } from "@/components/cards/bookmark-toggle";
import { cn, formatCredits } from "@/lib/utils";
import type { ScamCard } from "@/types";

type ScamCardProps = {
  card: ScamCard;
};

export function ScamCard({ card }: ScamCardProps) {
  const accessState = card.accessState ?? (card.isFree ? "free" : "locked");
  const isLocked = accessState === "locked";
  const severityLabel =
    card.severity === "high_risk"
      ? "High risk"
      : card.severity === "trending"
        ? "Trending"
        : "Common";
  const severityClassName =
    card.severity === "high_risk"
      ? "bg-rose-400/15 text-rose-100"
      : card.severity === "trending"
        ? "bg-amber-300/15 text-amber-100"
        : "bg-slate-300/12 text-slate-200";
  const ctaLabel =
    accessState === "free"
      ? "Open free card"
      : accessState === "locked"
        ? "Unlock premium"
        : "Continue learning";
  const totalSubLessons = card.steps.length;

  return (
    <article className="vant-card vant-card-hover group relative overflow-hidden rounded-[30px] p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.12),transparent_26%)] opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
              {card.category}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-text-main">{card.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", severityClassName)}>
                {severityLabel}
              </span>
              {card.isNewAlert ? (
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
                  <BellRing className="mr-1 inline h-3.5 w-3.5" />
                  New Update Alert
                </span>
              ) : null}
              {card.isTrendingAlert ? (
                <span className="rounded-full bg-fuchsia-400/15 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                  Trending Update
                </span>
              ) : null}
              {card.isMostReported ? (
                <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-100">
                  <TriangleAlert className="mr-1 inline h-3.5 w-3.5" />
                  Most Reported
                </span>
              ) : null}
              {(card.isNewAlert || card.isTrendingAlert || card.isMostReported) ? (
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-200">
                  {card.isAlertSeen ? "Seen" : "Unseen"}
                </span>
              ) : null}
              {card.majorUpdateReunlockCost !== null ? (
                <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-100">
                  Updated lesson
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <BookmarkToggle
              cardId={card.id}
              slug={card.slug}
              isBookmarked={Boolean(card.isBookmarked)}
              compact
            />
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                card.isFree
                  ? "bg-emerald-400/15 text-emerald-200"
                  : "bg-fuchsia-400/15 text-fuchsia-100"
              )}
            >
              {card.isFree ? <Coins className="h-3.5 w-3.5" /> : <Gem className="h-3.5 w-3.5" />}
              {card.isFree ? "Free" : formatCredits(card.creditCost)}
            </span>
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-6 text-text-secondary">
          {card.description || "This template is published, but the admin still needs to add the lesson summary."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-bg-secondary/70 px-3 py-1 text-xs font-semibold text-text-main">
            {totalSubLessons} sub-lessons
          </span>
        </div>
        {card.alertSummary ? (
          <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
            {card.alertSummary}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            {accessState === "free" ? (
              <Coins className="h-4 w-4 text-emerald-200" />
            ) : isLocked ? (
              <LockKeyhole className="h-4 w-4 text-fuchsia-200" />
            ) : (
              <Sparkles className="h-4 w-4 text-cyan-200" />
            )}
            <span>
              {accessState === "free"
                ? "Free access card"
                : isLocked
                  ? "Coin unlock required"
                  : "Premium access granted"}
            </span>
          </div>
          <Link
            href={`/cards/${card.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-main transition hover:text-primary"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

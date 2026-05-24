import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Coins, Gem, RefreshCw } from "lucide-react";

import { AlertSeenTracker } from "@/components/cards/alert-seen-tracker";
import { BookmarkToggle } from "@/components/cards/bookmark-toggle";
import { CardSections } from "@/components/cards/card-sections";
import { LockedUnlockPanel } from "@/components/cards/locked-unlock-panel";
import { ScamCard } from "@/components/cards/scam-card";
import { getPublishedCardBySlug, getPublishedCards } from "@/lib/supabase/queries";
import { compareAlertCards, formatCredits } from "@/lib/utils";
import type { ScamCard as ScamCardType } from "@/types";

type CardPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function CardPage({ params, searchParams }: CardPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const [{ card, hasFullAccess }, { cards }] = await Promise.all([
    getPublishedCardBySlug(slug),
    getPublishedCards()
  ]);

  if (!card) {
    notFound();
  }

  const isLocked = !hasFullAccess;
  const currentIndex = cards.findIndex((item) => item.slug === card.slug);
  const previousCard = currentIndex > 0 ? cards[currentIndex - 1] : null;
  const nextCard = currentIndex >= 0 && currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;
  const relatedCards = cards
    .filter((item) => item.id !== card.id)
    .sort((a, b) => rankRelatedCard(card, a) - rankRelatedCard(card, b) || compareAlertCards(a, b))
    .slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      {(card.isNewAlert || card.isTrendingAlert || card.isMostReported) && !card.isAlertSeen ? (
        <AlertSeenTracker cardId={card.id} />
      ) : null}

      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-main">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <section className="vant-card rounded-[32px] p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">{card.category}</p>
            <h1 className="mt-3 text-4xl font-semibold text-text-main">{card.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-text-secondary">{card.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <BookmarkToggle
              cardId={card.id}
              slug={card.slug}
              isBookmarked={Boolean(card.isBookmarked)}
            />
            <span className="vant-card rounded-2xl px-4 py-2 text-sm text-text-secondary">
              Version {card.currentVersion}
            </span>
            <span className="vant-card inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-primary">
              {card.isFree ? <Coins className="h-4 w-4" /> : <Gem className="h-4 w-4" />}
              {card.isFree ? "Free access" : formatCredits(card.creditCost)}
            </span>
            {card.majorUpdateReunlockCost ? (
              <span className="vant-card inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-fuchsia-100">
                <RefreshCw className="h-4 w-4" />
                Diamond refresh: {formatCredits(card.majorUpdateReunlockCost)}
              </span>
            ) : null}
            {card.isNewAlert ? (
              <span className="rounded-full bg-cyan-400/15 px-4 py-2 text-sm text-cyan-100">New Scam Alert</span>
            ) : null}
            {card.isTrendingAlert ? (
              <span className="rounded-full bg-fuchsia-400/15 px-4 py-2 text-sm text-fuchsia-100">Trending Scam</span>
            ) : null}
            {card.isMostReported ? (
              <span className="rounded-full bg-rose-400/15 px-4 py-2 text-sm text-rose-100">Most Reported</span>
            ) : null}
          </div>
        </div>
        {card.alertSummary ? (
          <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
            {card.alertSummary}
          </div>
        ) : null}
      </section>

      {query.error ? (
        <section className="vant-card rounded-[28px] border-rose-300/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
          {query.error}
        </section>
      ) : null}

      {query.message ? (
        <section className="vant-card rounded-[28px] border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
          {query.message}
        </section>
      ) : null}

      {isLocked ? (
        <LockedUnlockPanel
          cardId={card.id}
          slug={card.slug}
          title={card.title}
          version={card.currentVersion}
          creditCost={card.creditCost}
          reUnlockCost={card.majorUpdateReunlockCost}
        />
      ) : card.steps.length ? null : (
        <section className="vant-card rounded-[32px] border-dashed p-8">
          <p className="text-lg font-medium text-text-main">This template has been created but not fully filled in yet.</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            The admin still needs to add the step-by-step scam flow, red flags, and protection guidance for this card.
          </p>
        </section>
      )}

      {hasFullAccess && card.steps.length ? <CardSections card={card} /> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <NavigationCard
          direction="Previous"
          card={previousCard}
          href={previousCard ? `/cards/${previousCard.slug}` : "/dashboard"}
          fallbackLabel="Back to dashboard"
        />
        <NavigationCard
          direction="Next"
          card={nextCard}
          href={nextCard ? `/cards/${nextCard.slug}` : "/dashboard"}
          fallbackLabel="Explore dashboard"
          align="right"
        />
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Related lessons</p>
          <h2 className="mt-2 text-3xl font-semibold text-text-main">Keep learning with similar scam cards</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
            These suggestions are pulled from the same scam library so users can compare related fraud patterns, warning signs, and protection steps.
          </p>
        </div>

        {relatedCards.length ? (
          <div className="grid gap-5 xl:grid-cols-3">
            {relatedCards.map((relatedCard) => (
              <ScamCard key={relatedCard.id} card={relatedCard} />
            ))}
          </div>
        ) : (
          <div className="vant-card rounded-[28px] border-dashed p-6 text-sm text-text-secondary">
            More related scam lessons will show here as the library grows.
          </div>
        )}
      </section>
    </main>
  );
}

function rankRelatedCard(currentCard: ScamCardType, candidate: ScamCardType) {
  let score = 0;

  if (candidate.category !== currentCard.category) score += 20;
  if (candidate.severity !== currentCard.severity) score += 8;
  if ((candidate.accessState ?? "locked") === "locked") score += 2;

  const updatedAt = Date.parse(candidate.updatedAt || candidate.createdAt || "");
  if (!Number.isNaN(updatedAt)) {
    score -= updatedAt / 1_000_000_000_000;
  }

  return score;
}

function NavigationCard({
  direction,
  card,
  href,
  fallbackLabel,
  align = "left"
}: {
  direction: "Previous" | "Next";
  card: ScamCardType | null;
  href: string;
  fallbackLabel: string;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={href}
      className={`vant-card vant-card-hover rounded-[28px] p-5 transition ${align === "right" ? "text-right" : ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">{direction} lesson</p>
      {card ? (
        <>
          <h3 className="mt-3 text-xl font-semibold text-text-main">{card.title}</h3>
          <p className="mt-2 text-sm text-text-secondary">{card.category}</p>
          <div className={`mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary ${align === "right" ? "ml-auto" : ""}`}>
            {align === "right" ? null : <ArrowLeft className="h-4 w-4" />}
            {align === "right" ? "Continue forward" : "Go back one lesson"}
            {align === "right" ? <ArrowRight className="h-4 w-4" /> : null}
          </div>
        </>
      ) : (
        <>
          <h3 className="mt-3 text-xl font-semibold text-text-main">{fallbackLabel}</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {direction === "Previous"
              ? "Return to the main library and choose another scam lesson."
              : "Jump back into the scam dashboard and keep exploring."}
          </p>
          <div className={`mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary ${align === "right" ? "ml-auto" : ""}`}>
            {align === "right" ? null : <ArrowLeft className="h-4 w-4" />}
            {fallbackLabel}
            {align === "right" ? <ArrowRight className="h-4 w-4" /> : null}
          </div>
        </>
      )}
    </Link>
  );
}

import Link from "next/link";
import { ArrowLeft, Bookmark, Coins, ShieldAlert } from "lucide-react";

import { ScamCard } from "@/components/cards/scam-card";
import { getAuthContext } from "@/lib/auth";
import { getBookmarkedCards } from "@/lib/supabase/queries";

type BookmarksPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const [{ cards }, auth, query] = await Promise.all([
    getBookmarkedCards(),
    getAuthContext(),
    searchParams
  ]);

  const learnedCards = cards.filter((card) => (card.accessState ?? "locked") !== "locked").length;
  const lockedCards = cards.length - learnedCards;
  const totalCoinValue = cards.reduce((sum, card) => sum + card.creditCost, 0);
  const userName = auth.profile?.fullName || auth.user?.email?.split("@")[0] || "VANT User";

  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-main"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Saved Cards
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-text-main">Your bookmarked scam library</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
            Save lessons you want to revisit later, compare scam patterns side by side, and keep high-priority warnings close at hand.
          </p>
        </div>

        <div className="vant-card rounded-[28px] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Account</p>
          <p className="mt-2 text-lg font-semibold text-text-main">{userName}</p>
          <p className="text-sm text-text-secondary">{auth.user?.email ?? "Protected account"}</p>
        </div>
      </div>

      {query.message ? (
        <section className="vant-card rounded-[24px] border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
          {query.message}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="vant-card rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-text-secondary">Saved cards</p>
              <p className="mt-3 text-3xl font-semibold text-text-main">{cards.length}</p>
            </div>
            <span className="vant-glass rounded-2xl p-3 text-primary">
              <Bookmark className="h-5 w-5" />
            </span>
          </div>
        </article>
        <article className="vant-card rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-text-secondary">Ready to learn</p>
              <p className="mt-3 text-3xl font-semibold text-text-main">{learnedCards}</p>
            </div>
            <span className="vant-glass rounded-2xl p-3 text-cyan-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
        </article>
        <article className="vant-card rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-text-secondary">Locked coin value</p>
              <p className="mt-3 text-3xl font-semibold text-text-main">{totalCoinValue}</p>
              <p className="mt-2 text-xs text-text-secondary">{lockedCards} saved cards still need coins</p>
            </div>
            <span className="vant-glass rounded-2xl p-3 text-fuchsia-100">
              <Coins className="h-5 w-5" />
            </span>
          </div>
        </article>
      </section>

      {cards.length ? (
        <section className="grid gap-5 xl:grid-cols-2 3xl:grid-cols-3">
          {cards.map((card) => (
            <ScamCard key={card.id} card={card} />
          ))}
        </section>
      ) : (
        <section className="vant-card rounded-[32px] border-dashed p-8">
          <p className="text-lg font-medium text-text-main">No bookmarked scam cards yet.</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Save important lessons from the dashboard or card detail page and they will appear here for quick access.
          </p>
          <Link href="/dashboard" className="vant-btn mt-6 inline-flex items-center justify-center">
            Explore scam cards
          </Link>
        </section>
      )}
    </main>
  );
}

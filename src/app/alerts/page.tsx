import Link from "next/link";
import { ArrowLeft, BellRing, ShieldAlert, TriangleAlert, TrendingUp } from "lucide-react";

import { ScamCard } from "@/components/cards/scam-card";
import { getPublishedCards } from "@/lib/supabase/queries";
import { compareAlertCards, isAlertCard } from "@/lib/utils";

function EmptyAlertsState() {
  return (
    <section className="vant-card rounded-[32px] border-dashed p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/12 text-cyan-100">
        <BellRing className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-text-main">No active update alerts right now</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
        When the admin flags a lesson as a new update alert, trending update, or most reported topic,
        it will appear here for faster awareness.
      </p>
      <Link href="/dashboard" className="vant-btn mt-6 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
    </section>
  );
}

export default async function AlertsPage() {
  const { cards } = await getPublishedCards();
  const alertCards = cards.filter(isAlertCard).sort(compareAlertCards);
  const unseenAlerts = alertCards.filter((card) => !card.isAlertSeen).length;
  const newAlerts = alertCards.filter((card) => card.isNewAlert).length;
  const trendingAlerts = alertCards.filter((card) => card.isTrendingAlert).length;
  const mostReported = alertCards.filter((card) => card.isMostReported).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
      <section className="relative overflow-hidden rounded-[36px] border border-cyan-300/12 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(8,15,30,0.98)_42%,rgba(244,63,94,0.14))] px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:px-8">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
              Update Alerts Center
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-text-main md:text-5xl">
              New update highlights curated by the GetUpdated admin
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-200/90 md:text-base">
              This page collects new update alerts, trending update patterns, and the most reported
              topics so users can focus on the lessons that matter most right now.
            </p>
            <p className="mt-4 text-sm font-medium text-cyan-100">
              {unseenAlerts
                ? `${unseenAlerts} unseen update${unseenAlerts === 1 ? "" : "s"} are still waiting for review.`
                : "You have reviewed the current update queue."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="vant-btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <article className="vant-card rounded-[26px] bg-slate-950/25 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-100">
                <BellRing className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-text-secondary">Unseen updates</p>
                <p className="mt-1 text-3xl font-semibold text-text-main">{unseenAlerts}</p>
              </div>
            </div>
          </article>

          <article className="vant-card rounded-[26px] bg-slate-950/25 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-fuchsia-400/15 p-3 text-fuchsia-100">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-text-secondary">Trending updates</p>
                <p className="mt-1 text-3xl font-semibold text-text-main">{trendingAlerts}</p>
              </div>
            </div>
          </article>

          <article className="vant-card rounded-[26px] bg-slate-950/25 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-rose-400/15 p-3 text-rose-100">
                <TriangleAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-text-secondary">Most reported</p>
                <p className="mt-1 text-3xl font-semibold text-text-main">{mostReported}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {alertCards.length ? (
        <section className="grid gap-5 xl:grid-cols-2">
          {alertCards.map((card) => (
            <ScamCard key={card.id} card={card} />
          ))}
        </section>
      ) : (
        <EmptyAlertsState />
      )}

      <section className="vant-card rounded-[32px] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
              How alerts work
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-text-main">
              Admin-led updates built for quick awareness
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
              The admin can mark update lessons as new update alerts, trending updates, or most reported
              topics. Those cards rise to the top of the library and appear here first so users
              notice them quickly.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/4 px-4 py-3 text-sm text-text-secondary">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Updates here are educational notices, not live chat messages.
          </div>
        </div>
      </section>
    </main>
  );
}

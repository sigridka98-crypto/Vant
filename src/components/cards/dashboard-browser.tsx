"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Coins,
  CreditCard,
  Flame,
  FolderKanban,
  Gem,
  GraduationCap,
  Home,
  LockKeyhole,
  Settings,
  ShieldAlert,
  Sparkles,
  Wallet2
} from "lucide-react";

import { ScamCard } from "@/components/cards/scam-card";
import { compareAlertCards, isAlertCard } from "@/lib/utils";
import type { CardAccessState, CreditTransaction, ScamCard as ScamCardType } from "@/types";

type DashboardBrowserProps = {
  cards: ScamCardType[];
  categories: string[];
  isConfigured: boolean;
  balance: number;
  transactions: CreditTransaction[];
  userName: string;
  userEmail: string;
};

type AccessFilter = "all" | "free" | "locked" | "unlocked";
type SortMode = "newest" | "title" | "cost_high" | "cost_low";
type ScamFocus =
  | "all"
  | "phishing"
  | "job"
  | "romance"
  | "investment"
  | "impersonation"
  | "marketplace"
  | "crypto"
  | "loan"
  | "giveaway";

const scamFocusOptions: Array<{
  id: ScamFocus;
  label: string;
  matcher?: string[];
}> = [
  { id: "all", label: "All update cards" },
  { id: "phishing", label: "Phishing", matcher: ["phishing", "email", "sms", "smish", "link"] },
  { id: "job", label: "Job updates", matcher: ["job", "recruit", "employment", "offer"] },
  { id: "romance", label: "Romance updates", matcher: ["romance", "dating", "lover"] },
  { id: "investment", label: "Investment updates", matcher: ["investment", "trading", "forex", "ponzi"] },
  { id: "impersonation", label: "Impersonation", matcher: ["imperson", "fake agent", "government", "bank"] },
  { id: "marketplace", label: "Marketplace updates", matcher: ["marketplace", "buyer", "seller", "delivery"] },
  { id: "crypto", label: "Crypto updates", matcher: ["crypto", "bitcoin", "wallet", "token"] },
  { id: "loan", label: "Loan updates", matcher: ["loan", "credit", "grant"] },
  { id: "giveaway", label: "Giveaway updates", matcher: ["giveaway", "promo", "prize", "winner"] }
];

function matchesAccess(card: ScamCardType, filter: AccessFilter) {
  if (filter === "all") return true;
  if (filter === "free") return card.isFree;
  return (card.accessState ?? "locked") === filter;
}

function sortCards(cards: ScamCardType[], sortMode: SortMode) {
  const next = [...cards];
  const withPriority = (secondaryCompare?: (a: ScamCardType, b: ScamCardType) => number) =>
    next.sort((a, b) => {
      const alertCompare = compareAlertCards(a, b);

      if (alertCompare !== 0) {
        return alertCompare;
      }

      return secondaryCompare ? secondaryCompare(a, b) : 0;
    });

  if (sortMode === "title") {
    return withPriority((a, b) => a.title.localeCompare(b.title));
  }

  if (sortMode === "cost_high") {
    return withPriority((a, b) => b.creditCost - a.creditCost);
  }

  if (sortMode === "cost_low") {
    return withPriority((a, b) => a.creditCost - b.creditCost);
  }

  return withPriority();
}

function EmptyResults({
  isConfigured,
  hasAnyCards
}: {
  isConfigured: boolean;
  hasAnyCards: boolean;
}) {
  return (
    <section className="dashboard-empty grid gap-6 rounded-[32px] border border-dashed border-white/10 bg-white/4 p-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-lg font-medium text-white">
          {hasAnyCards
            ? "No cards match the current update type or filter."
            : isConfigured
              ? "No update cards have been published yet."
              : "No locally published update cards yet."}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          {hasAnyCards
            ? "Try another update type, category, or access filter."
            : "When the admin creates and publishes the first update card, it will appear here automatically."}
        </p>
      </div>

      <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-400/10 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Quick test path</p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-cyan-50/90">
          <p>1. Go to the admin panel and create a new update card draft.</p>
          <p>2. Publish the card when you are ready to surface it publicly.</p>
          <p>3. Return here and test wallet top-ups and premium unlocks.</p>
        </div>
      </div>
    </section>
  );
}

function initialsForName(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardBrowser({
  cards,
  categories,
  isConfigured,
  balance,
  transactions,
  userName,
  userEmail
}: DashboardBrowserProps) {
  const [category, setCategory] = useState("all");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [scamFocus, setScamFocus] = useState<ScamFocus>("all");
  const pathname = usePathname();
  const filteredCards = sortCards(
    cards.filter((card) => {
      const focusOption = scamFocusOptions.find((option) => option.id === scamFocus);
      const focusHaystack = [
        card.title,
        card.category,
        card.description,
        card.severity.replaceAll("_", " ")
      ]
        .join(" ")
        .toLowerCase();
      const matchesFocus =
        scamFocus === "all" ||
        (focusOption?.matcher?.some((term) => focusHaystack.includes(term)) ?? false);

      const matchesCategory = category === "all" || card.category === category;
      const matchesAccessFilter = matchesAccess(card, accessFilter);

      return matchesCategory && matchesAccessFilter && matchesFocus;
    }),
    sortMode
  );

  const statusCounts = cards.reduce(
    (acc, card) => {
      const state = (card.accessState ?? (card.isFree ? "free" : "locked")) as CardAccessState;
      acc.all += 1;
      if (card.isFree) acc.free += 1;
      if (state === "locked") acc.locked += 1;
      if (state === "unlocked") acc.unlocked += 1;
      return acc;
    },
    { all: 0, free: 0, locked: 0, unlocked: 0 }
  );

  const accessibleCards = cards.filter((card) => {
    const state = card.accessState ?? (card.isFree ? "free" : "locked");
    return state !== "locked";
  }).length;
  const freeTemplatesUsed = Math.min(statusCounts.free, 5);
  const lockedCards = cards.filter((card) => (card.accessState ?? "locked") === "locked");
  const premiumLockedCount = lockedCards.length;
  const premiumCreditAverage = premiumLockedCount
    ? Math.round(
        lockedCards.reduce((total, card) => total + card.creditCost, 0) / premiumLockedCount
      )
    : 0;
  const learningStreak = Math.max(1, Math.min(7, accessibleCards || transactions.length || 1));
  const alertCards = [...cards].filter(isAlertCard).sort(compareAlertCards);
  const unseenAlertCount = alertCards.filter((card) => !card.isAlertSeen).length;

  const sidebarItems = [
    { label: "Overview", icon: Home, href: "/dashboard" },
    { label: "Alerts", icon: Bell, href: "/alerts" },
    { label: "Browse Updates", icon: ShieldAlert, href: "/dashboard" },
    { label: "Saved Cards", icon: Bookmark, href: "/bookmarks" },
    { label: "Wallet", icon: Wallet2, href: "/wallet" },
    { label: "Settings", icon: Settings, href: "/settings" }
  ];

  const statCards = [
    {
      label: "Available Credits",
      value: `${balance}`,
      meta: "Ready for new premium lessons",
      icon: Coins,
      accent: "from-cyan-400/20 to-cyan-500/5 text-cyan-100"
    },
    {
      label: "Free Templates Used",
      value: `${freeTemplatesUsed}/5`,
      meta: `${statusCounts.free} free lessons published`,
      icon: FolderKanban,
      accent: "from-emerald-400/20 to-emerald-500/5 text-emerald-100"
    },
    {
      label: "Updates Learned",
      value: `${accessibleCards}`,
      meta: "Cards currently open in your library",
      icon: GraduationCap,
      accent: "from-amber-400/20 to-amber-500/5 text-amber-100"
    },
    {
      label: "Wallet Balance",
      value: `${balance} coins`,
      meta: premiumLockedCount ? `Average premium card: ${premiumCreditAverage} credits` : "Top up when you are ready",
      icon: Wallet2,
      accent: "from-fuchsia-400/20 to-fuchsia-500/5 text-fuchsia-100"
    }
  ];

  return (
    <section className="dashboard-shell vant-glass overflow-hidden rounded-[34px] bg-bg-primary shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
      <div className="grid min-h-[calc(100vh-150px)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="dashboard-sidebar border-b border-white/8 bg-[linear-gradient(180deg,rgba(17,94,89,0.18),rgba(5,10,22,0.92)_35%,rgba(5,10,22,0.96))] p-6 lg:border-b-0 lg:border-r">
          <div className="vant-card rounded-[28px] bg-primary/10 p-5 shadow-[0_16px_50px_rgba(20,184,166,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">GetUpdated Workspace</p>
            <h2 className="mt-3 text-2xl font-semibold text-text-main">Stay one step ahead of online updates</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Browse real updates, keep your learning streak alive, and unlock deeper lessons with credits.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    pathname === item.href ? "vant-card bg-primary/12 text-text-main shadow-[0_18px_40px_rgba(20,184,166,0.12)]"
                      : "border border-transparent text-text-secondary hover:border-white/8 hover:bg-white/5 hover:text-text-main"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${pathname === item.href ? "text-cyan-200" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="vant-card mt-8 rounded-[28px] bg-fuchsia-400/10 p-5">
            <div className="flex items-center gap-3">
              <span className="vant-glass rounded-2xl p-3 text-fuchsia-100">
                <Gem className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-main">Premium awareness unlocks</p>
                <p className="text-xs text-text-secondary">Use credits to access advanced update breakdowns.</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="dashboard-main bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_18%),linear-gradient(180deg,#07101d_0%,#040814_100%)]">
          <header className="border-b border-white/8 px-5 py-5 md:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Dashboard</p>
                <h1 className="mt-2 text-3xl font-semibold text-text-main md:text-4xl">
                  See your GetUpdated learning at a glance
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary md:text-base">
                  Explore update types people face online every day, track progress, and unlock deeper learning from one clean workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/alerts"
                  className="vant-card vant-card-hover inline-flex items-center gap-3 rounded-[22px] px-4 py-3 text-text-secondary"
                >
                  <span className="relative inline-flex">
                    <Bell className="h-5 w-5" />
                    {unseenAlertCount ? (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 text-[10px] font-semibold text-white">
                        {Math.min(unseenAlertCount, 9)}
                      </span>
                    ) : null}
                  </span>
                  <span className="hidden text-left md:block">
                    <span className="block text-xs uppercase tracking-[0.2em] text-text-muted">
                      Alerts
                    </span>
                    <span className="block text-sm text-text-main">
                      {unseenAlertCount
                        ? `${unseenAlertCount} unseen update${unseenAlertCount === 1 ? "" : "s"}`
                        : "No unseen updates"}
                    </span>
                  </span>
                </Link>
                <div className="vant-card flex items-center gap-3 rounded-[22px] px-3 py-2 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/14 text-sm font-semibold text-cyan-100">
                    {initialsForName(userName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-main">{userName}</p>
                    <p className="text-xs text-text-secondary">{userEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 p-5 md:p-8 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              {alertCards.length ? (
                <section className="dashboard-alert-hero relative overflow-hidden rounded-[32px] border border-rose-300/12 bg-[linear-gradient(135deg,rgba(244,63,94,0.16),rgba(8,15,30,0.98)_45%,rgba(34,211,238,0.12))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.24)]">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-rose-400/15 blur-3xl" />
                  <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-100/80">
                        Active Update Alerts
                      </p>
                      <h2 className="mt-3 text-3xl font-semibold text-text-main">
                        Fresh updates from the GetUpdated admin desk
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-200/90">
                        New update alerts, trending patterns, and the most reported topics are pushed to the top here so users can stay current quickly.
                      </p>
                      <p className="mt-3 text-sm font-medium text-rose-100">
                        {unseenAlertCount
                          ? `${unseenAlertCount} unseen update${unseenAlertCount === 1 ? "" : "s"} waiting for review.`
                          : "You are caught up on the current update queue."}
                      </p>
                    </div>

                    <Link href="/alerts" className="vant-btn inline-flex items-center justify-center gap-2">
                      View all alerts
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="relative mt-6 grid gap-4 xl:grid-cols-3">
                    {alertCards.slice(0, 3).map((card) => (
                      <Link
                        key={card.id}
                        href={`/cards/${card.slug}`}
                        className="vant-card vant-card-hover rounded-[26px] border-rose-300/10 bg-slate-950/30 p-5"
                      >
                        <div className="flex flex-wrap gap-2">
                          {card.isMostReported ? (
                            <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-100">
                              Most Reported
                            </span>
                          ) : null}
                          {card.isTrendingAlert ? (
                            <span className="rounded-full bg-fuchsia-400/15 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                              Trending Update
                            </span>
                          ) : null}
                          {card.isNewAlert ? (
                            <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
                              New Update Alert
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-4 text-lg font-semibold text-text-main">{card.title}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-200/85">
                          {card.alertSummary || "This card has been flagged by the admin as a priority update for users."}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.label}
                      className={`vant-card rounded-[28px] bg-gradient-to-br ${item.accent} p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-text-secondary">{item.label}</p>
                          <p className="mt-4 text-3xl font-semibold text-text-main">{item.value}</p>
                        </div>
                        <span className="vant-glass rounded-2xl p-3 text-text-main">
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-text-secondary">{item.meta}</p>
                    </article>
                  );
                })}
              </section>

              <section className="vant-card rounded-[30px] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] md:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Update Library</p>
                    <h2 className="mt-2 text-2xl font-semibold text-text-main">Explore update card options by type</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                      Pick from common update patterns seen across the internet, then narrow the cards by access level, category, or cost.
                    </p>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[170px_170px] xl:min-w-[350px]">
                    <select
                      value={accessFilter}
                      onChange={(event) => setAccessFilter(event.target.value as AccessFilter)}
                      className="vant-input text-sm"
                    >
                      <option value="all">All access</option>
                      <option value="free">Free</option>
                      <option value="locked">Locked</option>
                      <option value="unlocked">Unlocked</option>
                    </select>

                    <select
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value as SortMode)}
                      className="vant-input text-sm"
                    >
                      <option value="newest">Newest</option>
                      <option value="title">Title A-Z</option>
                      <option value="cost_low">Lowest cost</option>
                      <option value="cost_high">Highest cost</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {scamFocusOptions.map((option) => {
                    const active = scamFocus === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setScamFocus(option.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                          active
                            ? "border-primary/30 bg-primary/12 text-text-main"
                            : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                        }`}
                      >
                        <ShieldAlert className="h-4 w-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      category === "all"
                        ? "border-fuchsia-300/25 bg-fuchsia-400/12 text-text-main"
                        : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                    }`}
                  >
                    <FolderKanban className="h-4 w-4" />
                    All categories
                  </button>
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        category === item
                          ? "border-fuchsia-300/25 bg-fuchsia-400/12 text-text-main"
                          : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                      }`}
                    >
                      <FolderKanban className="h-4 w-4" />
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    { id: "all", label: "All cards", count: statusCounts.all, icon: ShieldAlert },
                    { id: "free", label: "Free", count: statusCounts.free, icon: Coins },
                    { id: "locked", label: "Locked", count: statusCounts.locked, icon: LockKeyhole },
                    { id: "unlocked", label: "Unlocked", count: statusCounts.unlocked, icon: Gem },
                  ].map((chip) => {
                    const Icon = chip.icon;
                    const active = accessFilter === chip.id;

                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setAccessFilter(chip.id as AccessFilter)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                          active
                            ? "border-cyan-300/25 bg-cyan-400/12 text-text-main"
                            : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {chip.label}
                        <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-xs text-text-secondary">
                          {chip.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  {filteredCards.length ? (
                    <section className="grid gap-5 xl:grid-cols-2 3xl:grid-cols-3">
                      {filteredCards.map((card) => (
                        <ScamCard key={card.id} card={card} />
                      ))}
                    </section>
                  ) : (
                    <EmptyResults isConfigured={isConfigured} hasAnyCards={cards.length > 0} />
                  )}
                </div>
              </section>

              <section className="vant-card rounded-[32px] bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(8,15,30,0.98)_60%)] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.24)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Coin Top-Up</p>
                    <h2 className="mt-3 text-3xl font-semibold text-text-main">Keep your coin wallet ready for more premium lessons</h2>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
                      NGN 3,125 adds 50 coins to the wallet. Each admin-priced premium card deducts from that balance as users unlock more update lessons.
                    </p>
                  </div>
                  <Link href="/wallet" className="vant-btn inline-flex items-center justify-center">
                    Buy 50 coins
                  </Link>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="vant-card rounded-[30px] bg-primary/10 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-main">Update alerts</p>
                    <p className="text-xs text-text-secondary">Admin-published update highlights</p>
                  </div>
                  <span className="vant-card rounded-2xl px-3 py-1 text-xs text-primary">
                    {unseenAlertCount} unseen
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {alertCards.length ? (
                    alertCards.slice(0, 4).map((card) => (
                      <Link
                        key={card.id}
                        href={`/cards/${card.slug}`}
                        className="vant-card vant-card-hover block rounded-[22px] border-cyan-300/12 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(8,15,30,0.9))] p-4"
                      >
                        <div className="flex flex-wrap gap-2">
                          {card.isNewAlert ? (
                            <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
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
                              Most Reported
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm font-medium text-text-main">{card.title}</p>
                        <p className="mt-2 text-xs leading-5 text-text-secondary">
                          {card.alertSummary || "Admin marked this lesson as a live update alert for users."}
                        </p>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                          {card.isAlertSeen ? "Seen" : "Unseen"}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="vant-card rounded-[22px] p-4">
                      <p className="text-sm font-medium text-text-main">No active update alerts right now</p>
                      <p className="mt-2 text-xs leading-5 text-text-secondary">
                        When the admin flags a lesson as new, trending, or most reported, it will appear here as part of the latest updates.
                      </p>
                    </div>
                  )}
                </div>

                {alertCards.length ? (
                  <Link
                    href="/alerts"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-cyan-200"
                  >
                    Browse every active alert
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </section>

              <section className="vant-card rounded-[30px] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-3">
                  <span className="vant-glass rounded-2xl p-3 text-cyan-100">
                    <Flame className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-main">Learning streak</p>
                    <p className="text-xs text-text-secondary">Keep your awareness fresh every day</p>
                  </div>
                </div>
                <p className="mt-6 text-5xl font-semibold text-text-main">{learningStreak} days</p>
                <div className="mt-5 flex gap-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 flex-1 rounded-full ${
                        index < learningStreak ? "bg-cyan-400" : "bg-white/8"
                      }`}
                    />
                  ))}
                </div>
              </section>

              <section className="vant-card rounded-[30px] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-main">Recent activity</p>
                    <p className="text-xs text-text-secondary">Latest wallet and learning actions</p>
                  </div>
                  <span className="vant-card rounded-2xl px-3 py-1 text-xs text-text-secondary">
                    {transactions.length} items
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {transactions.length ? (
                    transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="vant-card rounded-[22px] p-4"
                      >
                        <p className="text-sm font-medium text-text-main">{transaction.label}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                          <span>{transaction.date}</span>
                          <span className="font-semibold text-primary">{transaction.amount}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="vant-card rounded-[22px] border-dashed p-4">
                      <p className="text-sm font-medium text-text-main">No recent activity yet</p>
                      <p className="mt-2 text-xs leading-5 text-text-secondary">
                        Start unlocking update lessons or topping up your wallet and activity will show here.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="vant-card rounded-[30px] bg-fuchsia-400/10 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
                <p className="text-sm font-semibold text-text-main">Premium update cards waiting</p>
                <p className="mt-3 text-4xl font-semibold text-text-main">{premiumLockedCount}</p>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Locked cards reveal full update breakdowns, red flags, and protection steps once credits are used.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}



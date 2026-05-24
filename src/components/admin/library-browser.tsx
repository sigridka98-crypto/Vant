"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Coins, Filter, Gem, PencilLine, Rocket, Search, ShieldAlert, Trash2, TriangleAlert } from "lucide-react";

import { bulkUpdateCards, deleteCard, togglePublishCard } from "@/app/admin/actions";
import { buildCardReadiness, validateSafeExampleText } from "@/lib/admin-card-review";
import type { ScamCard } from "@/types";

type AdminLibraryBrowserProps = {
  cards: ScamCard[];
};

type StatusFilter = "all" | "draft" | "published" | "incomplete" | "alerts" | "free" | "premium";

function matchesStatus(card: ScamCard, filter: StatusFilter) {
  const readiness = buildCardReadiness(card);

  if (filter === "all") return true;
  if (filter === "draft") return !card.isPublished;
  if (filter === "published") return card.isPublished;
  if (filter === "incomplete") return !readiness.ready;
  if (filter === "alerts") return card.isNewAlert || card.isTrendingAlert || card.isMostReported;
  if (filter === "free") return card.isFree;
  if (filter === "premium") return !card.isFree;

  return true;
}

export function AdminLibraryBrowser({ cards }: AdminLibraryBrowserProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(
    () => [...new Set(cards.map((card) => card.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [cards]
  );

  const filteredCards = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    return cards.filter((card) => {
      const readiness = buildCardReadiness(card);
      const matchesQuery =
        !normalized ||
        card.title.toLowerCase().includes(normalized) ||
        card.category.toLowerCase().includes(normalized) ||
        card.description.toLowerCase().includes(normalized) ||
        card.severity.replaceAll("_", " ").toLowerCase().includes(normalized);
      const matchesCategory = categoryFilter === "all" || card.category === categoryFilter;
      const matchesStatusFilter = matchesStatus(card, statusFilter);

      return matchesQuery && matchesCategory && matchesStatusFilter && (readiness.ready || statusFilter !== "incomplete" || !readiness.ready);
    });
  }, [cards, deferredQuery, categoryFilter, statusFilter]);

  const filteredCardIds = filteredCards.map((card) => card.id);
  const selectedVisibleCount = filteredCardIds.filter((id) => selectedIds.includes(id)).length;

  function toggleSelected(cardId: string) {
    setSelectedIds((current) =>
      current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId]
    );
  }

  function toggleSelectAllVisible() {
    setSelectedIds((current) => {
      const visibleSet = new Set(filteredCardIds);
      const allVisibleSelected =
        filteredCardIds.length > 0 && filteredCardIds.every((id) => current.includes(id));

      if (allVisibleSelected) {
        return current.filter((id) => !visibleSet.has(id));
      }

      const next = new Set(current);
      filteredCardIds.forEach((id) => next.add(id));
      return [...next];
    });
  }

  const counts = useMemo(
    () => ({
      all: cards.length,
      draft: cards.filter((card) => !card.isPublished).length,
      published: cards.filter((card) => card.isPublished).length,
      incomplete: cards.filter((card) => !buildCardReadiness(card).ready).length,
      alerts: cards.filter((card) => card.isNewAlert || card.isTrendingAlert || card.isMostReported).length,
      free: cards.filter((card) => card.isFree).length,
      premium: cards.filter((card) => !card.isFree).length
    }),
    [cards]
  );

  return (
    <div className="space-y-6">
      <section className="vant-card rounded-[30px] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Library controls</p>
            <h3 className="mt-2 text-2xl font-semibold text-text-main">Filter templates before you edit or publish</h3>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px] xl:min-w-[720px]">
            <label className="vant-card flex items-center gap-3 rounded-2xl px-4 py-3 text-text-secondary">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
                placeholder="Search templates"
              />
            </label>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="vant-input text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="vant-input text-sm"
            >
              <option value="all">All templates</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="incomplete">Incomplete</option>
              <option value="alerts">Alert-tagged</option>
              <option value="free">Free cards</option>
              <option value="premium">Premium cards</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "draft", label: "Drafts", count: counts.draft },
            { id: "published", label: "Published", count: counts.published },
            { id: "incomplete", label: "Incomplete", count: counts.incomplete },
            { id: "alerts", label: "Alerts", count: counts.alerts },
            { id: "free", label: "Free", count: counts.free },
            { id: "premium", label: "Premium", count: counts.premium }
          ].map((chip) => {
            const active = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id as StatusFilter)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-cyan-300/25 bg-cyan-400/12 text-text-main"
                    : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                }`}
              >
                <Filter className="h-4 w-4" />
                {chip.label}
                <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-xs text-text-secondary">
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <form action={bulkUpdateCards} className="vant-card rounded-[30px] p-5">
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Bulk actions</p>
            <h3 className="mt-2 text-2xl font-semibold text-text-main">Manage multiple templates at once</h3>
            <p className="mt-2 text-sm text-text-secondary">
              {selectedIds.length
                ? `${selectedIds.length} template${selectedIds.length === 1 ? "" : "s"} selected`
                : "Select templates below to publish, draft, or delete them together."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              className="vant-btn-secondary px-4 py-2 text-sm"
            >
              {selectedVisibleCount === filteredCardIds.length && filteredCardIds.length > 0
                ? "Clear visible"
                : "Select visible"}
            </button>
            <button
              type="submit"
              name="bulkAction"
              value="publish"
              disabled={!selectedIds.length}
              className="vant-btn-secondary px-4 py-2 text-sm text-emerald-100 disabled:opacity-50"
            >
              Publish selected
            </button>
            <button
              type="submit"
              name="bulkAction"
              value="draft"
              disabled={!selectedIds.length}
              className="vant-btn-secondary px-4 py-2 text-sm text-amber-100 disabled:opacity-50"
            >
              Move to draft
            </button>
            <button
              type="submit"
              name="bulkAction"
              value="delete"
              disabled={!selectedIds.length}
              className="vant-btn-secondary px-4 py-2 text-sm text-rose-100 disabled:opacity-50"
            >
              Delete selected
            </button>
          </div>
        </div>
      </form>

      {!filteredCards.length ? (
        <div className="vant-card rounded-[30px] border-dashed p-6">
          <p className="text-lg font-medium text-text-main">No templates match the current admin filters.</p>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Try another category, search phrase, or status filter to bring the right templates back into view.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCards.map((card) => {
            const readiness = buildCardReadiness(card);

            return (
              <article key={card.id} className="vant-card rounded-[30px] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <label className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(card.id)}
                        onChange={() => toggleSelected(card.id)}
                        className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
                      />
                      Select for bulk action
                    </label>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      {card.category}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-text-main">{card.title || "Untitled template"}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {card.isNewAlert ? (
                        <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
                          New Scam Alert
                        </span>
                      ) : null}
                      {card.isTrendingAlert ? (
                        <span className="rounded-full bg-fuchsia-400/15 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                          Trending Scam
                        </span>
                      ) : null}
                      {card.isMostReported ? (
                        <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-100">
                          Most Reported
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          readiness.ready
                            ? "bg-emerald-400/15 text-emerald-200"
                            : "bg-amber-300/15 text-amber-100"
                        }`}
                      >
                        {readiness.ready ? "Publish ready" : `${readiness.completed}/${readiness.total} complete`}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">
                      {card.description || "Empty draft. Add the learning content before publishing."}
                    </p>
                    {card.alertSummary ? (
                      <p className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
                        {card.alertSummary}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="vant-card rounded-2xl px-3 py-1 text-xs text-text-main">
                      v{card.currentVersion}
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs ${
                        card.isFree
                          ? "border border-amber-300/15 bg-amber-300/10 text-amber-100"
                          : "border border-fuchsia-300/15 bg-fuchsia-300/10 text-fuchsia-100"
                      }`}
                    >
                      {card.isFree ? <Coins className="h-3.5 w-3.5" /> : <Gem className="h-3.5 w-3.5" />}
                      {card.isFree ? "Free" : `${card.creditCost} coins`}
                    </span>
                    <span
                      className={`rounded-2xl px-3 py-1 text-xs ${
                        card.isPublished
                          ? "border border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                          : "border border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      {card.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="vant-card rounded-2xl px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">How it works</p>
                    <p className="mt-2 text-lg font-semibold text-text-main">{readiness.howItWorksCount}</p>
                  </div>
                  <div className="vant-card rounded-2xl px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Red flags</p>
                    <p className="mt-2 text-lg font-semibold text-text-main">{readiness.redFlagsCount}</p>
                  </div>
                  <div className="vant-card rounded-2xl px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Protection</p>
                    <p className="mt-2 text-lg font-semibold text-text-main">{readiness.protectionCount}</p>
                  </div>
                  <div className="vant-card rounded-2xl px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Safe example</p>
                    <p className={`mt-2 text-sm font-semibold ${validateSafeExampleText(card.safeExample) ? "text-amber-100" : "text-emerald-200"}`}>
                      {validateSafeExampleText(card.safeExample) ? "Needs cleanup" : "Ready"}
                    </p>
                  </div>
                </div>

                {!readiness.ready ? (
                  <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                    <div className="flex items-center gap-2">
                      <TriangleAlert className="h-4 w-4" />
                      This template still has missing or unsafe publish requirements.
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/cards/${card.id}/edit`}
                    className="vant-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm text-primary"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit template
                  </Link>

                  <form action={togglePublishCard}>
                    <input type="hidden" name="id" value={card.id} />
                    <input type="hidden" name="nextState" value={String(!card.isPublished)} />
                    <button
                      type="submit"
                      className="vant-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm text-amber-100"
                    >
                      <Rocket className="h-4 w-4" />
                      {card.isPublished ? "Move to draft" : "Publish now"}
                    </button>
                  </form>

                  <form action={deleteCard}>
                    <input type="hidden" name="id" value={card.id} />
                    <button
                      type="submit"
                      className="vant-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm text-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

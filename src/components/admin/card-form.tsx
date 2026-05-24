"use client";

import { useState } from "react";
import { buildCardReadiness, validateSafeExampleText } from "@/lib/admin-card-review";
import type { CardUpdateType, ScamCard } from "@/types";

type CardFormProps = {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  card?: ScamCard;
  error?: string;
};

function stepsToText(card: ScamCard | undefined, stepType: "how_it_works" | "red_flags" | "protection") {
  if (!card) return "";

  return card.steps
    .filter((step) => step.stepType === stepType)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((step) => step.content)
    .join("\n");
}

type DraftState = {
  title: string;
  category: string;
  description: string;
  safeExample: string;
  quickMemoryRule: string;
  howItWorks: string;
  redFlags: string;
  protection: string;
  alertSummary: string;
  isPublished: boolean;
  isNewAlert: boolean;
  isTrendingAlert: boolean;
  isMostReported: boolean;
  updateType: CardUpdateType;
  changeSummary: string;
};

function createInitialState(card?: ScamCard): DraftState {
  return {
    title: card?.title ?? "",
    category: card?.category ?? "",
    description: card?.description ?? "",
    safeExample: card?.safeExample ?? "",
    quickMemoryRule: card?.quickMemoryRule ?? "",
    howItWorks: stepsToText(card, "how_it_works"),
    redFlags: stepsToText(card, "red_flags"),
    protection: stepsToText(card, "protection"),
    alertSummary: card?.alertSummary ?? "",
    isPublished: card?.isPublished ?? false,
    isNewAlert: card?.isNewAlert ?? false,
    isTrendingAlert: card?.isTrendingAlert ?? false,
    isMostReported: card?.isMostReported ?? false,
    updateType: "minor",
    changeSummary: ""
  };
}

function countLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function buildChecklist(state: DraftState) {
  return buildCardReadiness({
    title: state.title,
    category: state.category,
    description: state.description,
    safeExample: state.safeExample,
    quickMemoryRule: state.quickMemoryRule,
    alertSummary: state.alertSummary,
    isNewAlert: state.isNewAlert,
    isTrendingAlert: state.isTrendingAlert,
    isMostReported: state.isMostReported,
    steps: [
      ...state.howItWorks
        .split("\n")
        .map((line, index) => ({ id: `how-${index}`, stepType: "how_it_works" as const, content: line.trim(), sortOrder: index + 1 }))
        .filter((step) => step.content),
      ...state.redFlags
        .split("\n")
        .map((line, index) => ({ id: `red-${index}`, stepType: "red_flags" as const, content: line.trim(), sortOrder: index + 1 }))
        .filter((step) => step.content),
      ...state.protection
        .split("\n")
        .map((line, index) => ({ id: `protection-${index}`, stepType: "protection" as const, content: line.trim(), sortOrder: index + 1 }))
        .filter((step) => step.content)
    ]
  }).items;
}

export function CardForm({ mode, action, card, error }: CardFormProps) {
  const [draft, setDraft] = useState<DraftState>(() => createInitialState(card));
  const [inlineError, setInlineError] = useState("");
  const checklist = buildChecklist(draft);
  const publishReady = checklist.every((item) => item.ok);
  const safeExampleIssue = validateSafeExampleText(draft.safeExample);

  return (
    <form
      action={action}
      className="vant-card space-y-6 rounded-[32px] p-6"
      onSubmit={(event) => {
        if (draft.isPublished && !publishReady) {
          event.preventDefault();
          setInlineError("This card is not ready to publish yet. Fix the checklist items first.");
        }
      }}
    >
      {card ? <input type="hidden" name="id" value={card.id} /> : null}

      {error ? (
        <div className="vant-card rounded-2xl border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {inlineError ? (
        <div className="vant-card rounded-2xl border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {inlineError}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="vant-card rounded-[28px] bg-primary/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Publish readiness</p>
          <div className="mt-4 space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="vant-card rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-text-main">{item.label}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.ok ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-100"
                    }`}
                  >
                    {item.ok ? "Ready" : "Missing"}
                  </span>
                </div>
                {item.detail ? <p className="mt-2 text-xs text-amber-100">{item.detail}</p> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="vant-card rounded-[28px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-secondary">Publishing rules</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
            <p>Only fully structured scam lessons should be published to users.</p>
            <p>Safe examples must stay educational and sanitized.</p>
            <p>Alert tags should only be used when you want the dashboard to notify users about urgent scam changes.</p>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-bg-secondary/60 px-4 py-3 text-sm text-text-main">
            {draft.isPublished
              ? publishReady
                ? "This card is ready to publish."
                : "This card is marked for publish, but the checklist still has missing items."
              : "This card is currently in draft mode. You can save incomplete work safely."}
          </div>
          {mode === "edit" ? (
            <div className="mt-4 rounded-2xl border border-cyan-300/12 bg-cyan-400/8 px-4 py-3 text-sm text-text-secondary">
              Use the update fields below when you want this save to appear in the template history. Major updates should usually bump the version and can include a reduced re-unlock cost.
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Title</span>
          <input
            name="title"
            defaultValue={card?.title ?? ""}
            className="vant-input"
            placeholder="Untitled template"
            onChange={(event) => {
              setDraft((current) => ({ ...current, title: event.target.value }));
              setInlineError("");
            }}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Category</span>
          <input
            name="category"
            defaultValue={card?.category ?? ""}
            className="vant-input"
            placeholder="Job Scams"
            onChange={(event) => {
              setDraft((current) => ({ ...current, category: event.target.value }));
              setInlineError("");
            }}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Severity</span>
          <select
            name="severity"
            defaultValue={card?.severity ?? "common"}
            className="vant-input"
          >
            <option value="common">Common</option>
            <option value="trending">Trending</option>
            <option value="high_risk">High risk</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Diamond cost</span>
          <input
            name="creditCost"
            type="number"
            min="0"
            defaultValue={card?.creditCost ?? 0}
            className="vant-input"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="vant-card flex items-center gap-3 rounded-2xl px-4 py-3 text-text-main">
          <input
            name="isFree"
            type="checkbox"
            defaultChecked={card?.isFree ?? false}
            className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
          />
          <span>Mark as one of the free cards</span>
        </label>
        <label className="vant-card flex items-center gap-3 rounded-2xl px-4 py-3 text-text-main">
          <input
            name="isPublished"
            type="checkbox"
            defaultChecked={card?.isPublished ?? false}
            className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
            onChange={(event) => {
              setDraft((current) => ({ ...current, isPublished: event.target.checked }));
              setInlineError("");
            }}
          />
          <span>Publish immediately</span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="vant-card flex items-center gap-3 rounded-2xl px-4 py-3 text-text-main">
          <input
            name="isNewAlert"
            type="checkbox"
            defaultChecked={card?.isNewAlert ?? false}
            className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
            onChange={(event) => {
              setDraft((current) => ({ ...current, isNewAlert: event.target.checked }));
              setInlineError("");
            }}
          />
          <span>New Scam Alert</span>
        </label>
        <label className="vant-card flex items-center gap-3 rounded-2xl px-4 py-3 text-text-main">
          <input
            name="isTrendingAlert"
            type="checkbox"
            defaultChecked={card?.isTrendingAlert ?? false}
            className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
            onChange={(event) => {
              setDraft((current) => ({ ...current, isTrendingAlert: event.target.checked }));
              setInlineError("");
            }}
          />
          <span>Trending Scam</span>
        </label>
        <label className="vant-card flex items-center gap-3 rounded-2xl px-4 py-3 text-text-main">
          <input
            name="isMostReported"
            type="checkbox"
            defaultChecked={card?.isMostReported ?? false}
            className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
            onChange={(event) => {
              setDraft((current) => ({ ...current, isMostReported: event.target.checked }));
              setInlineError("");
            }}
          />
          <span>Most Reported</span>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-text-secondary">Alert summary</span>
        <textarea
          name="alertSummary"
          defaultValue={card?.alertSummary ?? ""}
          rows={3}
          className="vant-input min-h-[100px] rounded-3xl"
          placeholder="Short admin alert message users should notice on the dashboard."
          onChange={(event) => {
            setDraft((current) => ({ ...current, alertSummary: event.target.value }));
            setInlineError("");
          }}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-text-secondary">Description</span>
        <textarea
          name="description"
          defaultValue={card?.description ?? ""}
          rows={4}
          className="vant-input min-h-[120px] rounded-3xl"
          placeholder="Explain what this scam is in simple words."
          onChange={(event) => {
            setDraft((current) => ({ ...current, description: event.target.value }));
            setInlineError("");
          }}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-text-secondary">Safe example</span>
        <textarea
          name="safeExample"
          defaultValue={card?.safeExample ?? ""}
          rows={4}
          className="vant-input min-h-[120px] rounded-3xl"
          placeholder="Use a modified non-operational example."
          onChange={(event) => {
            setDraft((current) => ({ ...current, safeExample: event.target.value }));
            setInlineError("");
          }}
        />
        {safeExampleIssue ? (
          <p className="mt-2 text-xs text-amber-100">{safeExampleIssue}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-text-secondary">Quick memory rule</span>
        <input
          name="quickMemoryRule"
          defaultValue={card?.quickMemoryRule ?? ""}
          className="vant-input"
          placeholder="Short memorable safety rule"
          onChange={(event) => {
            setDraft((current) => ({ ...current, quickMemoryRule: event.target.value }));
            setInlineError("");
          }}
        />
      </label>

      <div className="grid gap-6 xl:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">How the scam works</span>
          <textarea
            name="howItWorks"
            defaultValue={stepsToText(card, "how_it_works")}
            rows={8}
            className="vant-input min-h-[220px] rounded-3xl"
            placeholder="One step per line"
            onChange={(event) => {
              setDraft((current) => ({ ...current, howItWorks: event.target.value }));
              setInlineError("");
            }}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Red flags</span>
          <textarea
            name="redFlags"
            defaultValue={stepsToText(card, "red_flags")}
            rows={8}
            className="vant-input min-h-[220px] rounded-3xl"
            placeholder="One warning sign per line"
            onChange={(event) => {
              setDraft((current) => ({ ...current, redFlags: event.target.value }));
              setInlineError("");
            }}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">How to protect yourself</span>
          <textarea
            name="protection"
            defaultValue={stepsToText(card, "protection")}
            rows={8}
            className="vant-input min-h-[220px] rounded-3xl"
            placeholder="One protection step per line"
            onChange={(event) => {
              setDraft((current) => ({ ...current, protection: event.target.value }));
              setInlineError("");
            }}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Current version</span>
          <input
            name="currentVersion"
            type="number"
            min="1"
            defaultValue={card?.currentVersion ?? 1}
            className="vant-input"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Re-unlock diamond cost</span>
          <input
            name="majorUpdateReunlockCost"
            type="number"
            min="0"
            defaultValue={card?.majorUpdateReunlockCost ?? ""}
            className="vant-input"
            placeholder="Optional"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Slug override</span>
          <input
            name="slug"
            defaultValue={card?.slug ?? ""}
            className="vant-input"
            placeholder="auto-generated-if-empty"
          />
        </label>
      </div>

      {mode === "edit" ? (
        <section className="grid gap-4 rounded-[28px] border border-white/10 bg-bg-secondary/40 p-5 md:grid-cols-[180px_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-2 block text-sm text-text-secondary">Update type</span>
            <select
              name="updateType"
              value={draft.updateType}
              onChange={(event) => {
                setDraft((current) => ({ ...current, updateType: event.target.value as CardUpdateType }));
                setInlineError("");
              }}
              className="vant-input"
            >
              <option value="minor">Minor</option>
              <option value="major">Major</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text-secondary">Change summary</span>
            <textarea
              name="changeSummary"
              value={draft.changeSummary}
              onChange={(event) => {
                setDraft((current) => ({ ...current, changeSummary: event.target.value }));
                setInlineError("");
              }}
              rows={3}
              className="vant-input min-h-[100px] rounded-3xl"
              placeholder="Optional for routine saves. Add this when you want the update to appear in the card history."
            />
          </label>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="vant-btn">
          {mode === "create" ? "Create template" : "Save changes"}
        </button>
        <p className="self-center text-sm text-text-secondary">
          Publishing requires the full 7-field lesson structure and a sanitized safe example.
        </p>
      </div>
    </form>
  );
}

import type { ScamCard } from "@/types";

function SectionList({
  items,
  tone = "default",
  sublessonPrefix
}: {
  items: string[];
  tone?: "default" | "alert" | "safe";
  sublessonPrefix: string;
}) {
  const toneClassName =
    tone === "alert"
      ? "border-rose-300/15 bg-rose-400/8"
      : tone === "safe"
        ? "border-emerald-300/15 bg-emerald-400/8"
        : "bg-bg-secondary/70";

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${sublessonPrefix}-${index}`} className={`vant-card rounded-2xl border px-4 py-4 ${toneClassName}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            {sublessonPrefix} {index + 1}
          </p>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function CardSections({ card }: { card: ScamCard }) {
  const howItWorks = card.steps
    .filter((step) => step.stepType === "how_it_works")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((step) => step.content);
  const redFlags = card.steps
    .filter((step) => step.stepType === "red_flags")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((step) => step.content);
  const protection = card.steps
    .filter((step) => step.stepType === "protection")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((step) => step.content);
  const totalSubLessons = howItWorks.length + redFlags.length + protection.length;

  return (
    <div className="space-y-8">
      <section className="vant-card rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Lesson overview</p>
        <p className="mt-4 text-base leading-7 text-text-main">{card.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 bg-bg-secondary/70 px-4 py-2 text-sm text-text-main">
            {totalSubLessons} sub-lessons inside this card
          </span>
          <span className="rounded-full border border-white/10 bg-bg-secondary/70 px-4 py-2 text-sm text-text-main">
            {howItWorks.length} core lessons
          </span>
          <span className="rounded-full border border-white/10 bg-bg-secondary/70 px-4 py-2 text-sm text-text-main">
            {redFlags.length} warning lessons
          </span>
          <span className="rounded-full border border-white/10 bg-bg-secondary/70 px-4 py-2 text-sm text-text-main">
            {protection.length} action lessons
          </span>
        </div>
      </section>

      <section className="vant-card rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
          Core sub-lessons
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          These are the main lesson points users should understand first.
        </p>
        <div className="mt-4">
          <SectionList items={howItWorks} sublessonPrefix="Core sub-lesson" />
        </div>
      </section>

      <section className="vant-card rounded-[28px] border-rose-300/20 bg-rose-400/8 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">Red flag sub-lessons</p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          These teach users what to watch for before a bad decision is made.
        </p>
        <div className="mt-4">
          <SectionList items={redFlags} tone="alert" sublessonPrefix="Red flag" />
        </div>
      </section>

      <section className="vant-card rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Safe example</p>
        <p className="mt-4 text-base leading-7 text-text-main">{card.safeExample}</p>
      </section>

      <section className="vant-card rounded-[28px] border-emerald-300/20 bg-emerald-400/8 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
          Protection sub-lessons
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          These give users the actions they can take immediately.
        </p>
        <div className="mt-4">
          <SectionList items={protection} tone="safe" sublessonPrefix="Protection step" />
        </div>
      </section>

      <section className="vant-card rounded-[28px] bg-primary/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Quick memory rule</p>
        <p className="mt-4 text-lg font-medium text-text-main">{card.quickMemoryRule}</p>
      </section>
    </div>
  );
}

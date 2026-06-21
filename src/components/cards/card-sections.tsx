import type { ScamCard } from "@/types";

function SectionList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-6 text-text-secondary">
      {items.map((item) => (
        <li key={item} className="vant-card rounded-2xl bg-bg-secondary/70 px-4 py-3">
          {item}
        </li>
      ))}
    </ul>
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

  return (
    <div className="space-y-8">
      <section className="vant-card rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Description</p>
        <p className="mt-4 text-base leading-7 text-text-main">{card.description}</p>
      </section>

      <section className="vant-card rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
          How The Update Works
        </p>
        <div className="mt-4">
          <SectionList items={howItWorks} />
        </div>
      </section>

      <section className="vant-card rounded-[28px] border-rose-300/20 bg-rose-400/8 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">Red Flags</p>
        <div className="mt-4">
          <SectionList items={redFlags} />
        </div>
      </section>

      <section className="vant-card rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Safe Example</p>
        <p className="mt-4 text-base leading-7 text-text-main">{card.safeExample}</p>
      </section>

      <section className="vant-card rounded-[28px] border-emerald-300/20 bg-emerald-400/8 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
          How To Protect Yourself
        </p>
        <div className="mt-4">
          <SectionList items={protection} />
        </div>
      </section>

      <section className="vant-card rounded-[28px] bg-primary/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Quick Memory Rule</p>
        <p className="mt-4 text-lg font-medium text-text-main">{card.quickMemoryRule}</p>
      </section>
    </div>
  );
}

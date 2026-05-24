import type { ScamCard } from "@/types";

export type AdminReadinessItem = {
  label: string;
  ok: boolean;
  detail?: string;
};

export function validateSafeExampleText(value: string) {
  const rules = [
    { pattern: /(https?:\/\/|www\.)/i, message: "Safe example must not include links or websites." },
    { pattern: /\b\d{6,}\b/, message: "Safe example must not include long number strings or account-like numbers." },
    { pattern: /(account number|wallet address|routing number|sort code)/i, message: "Safe example must stay sanitized and avoid real payment details." }
  ];

  return rules.find((rule) => rule.pattern.test(value))?.message ?? "";
}

export function buildCardReadiness(card: Pick<
  ScamCard,
  | "title"
  | "category"
  | "description"
  | "safeExample"
  | "quickMemoryRule"
  | "alertSummary"
  | "isNewAlert"
  | "isTrendingAlert"
  | "isMostReported"
  | "steps"
>) {
  const hasAlertTag = card.isNewAlert || card.isTrendingAlert || card.isMostReported;
  const safeExampleIssue = validateSafeExampleText(card.safeExample);
  const howItWorksCount = card.steps.filter((step) => step.stepType === "how_it_works").length;
  const redFlagsCount = card.steps.filter((step) => step.stepType === "red_flags").length;
  const protectionCount = card.steps.filter((step) => step.stepType === "protection").length;

  const items: AdminReadinessItem[] = [
    { label: "Title is filled", ok: Boolean(card.title.trim()) },
    { label: "Category is filled", ok: Boolean(card.category.trim()) },
    { label: "Description is filled", ok: Boolean(card.description.trim()) },
    {
      label: "Safe example is filled and sanitized",
      ok: Boolean(card.safeExample.trim()) && !safeExampleIssue,
      detail: safeExampleIssue || undefined
    },
    { label: "Quick memory rule is filled", ok: Boolean(card.quickMemoryRule.trim()) },
    { label: "How the scam works has at least one step", ok: howItWorksCount > 0 },
    { label: "Red flags has at least one item", ok: redFlagsCount > 0 },
    { label: "Protection steps has at least one item", ok: protectionCount > 0 },
    {
      label: "Alert summary is filled when alert tags are used",
      ok: !hasAlertTag || Boolean(card.alertSummary.trim())
    }
  ];

  const completed = items.filter((item) => item.ok).length;

  return {
    items,
    completed,
    total: items.length,
    ready: items.every((item) => item.ok),
    hasAlertTag,
    howItWorksCount,
    redFlagsCount,
    protectionCount
  };
}

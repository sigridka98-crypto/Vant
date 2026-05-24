import { clsx } from "clsx";

import type { ScamCard } from "@/types";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatCredits(credits: number) {
  return `${credits} credit${credits === 1 ? "" : "s"}`;
}

export function isAlertCard(card: Pick<ScamCard, "isNewAlert" | "isTrendingAlert" | "isMostReported">) {
  return card.isNewAlert || card.isTrendingAlert || card.isMostReported;
}

export function getAlertPriority(card: Pick<ScamCard, "isNewAlert" | "isTrendingAlert" | "isMostReported">) {
  let score = 0;

  if (card.isMostReported) score += 4;
  if (card.isTrendingAlert) score += 3;
  if (card.isNewAlert) score += 2;

  return score;
}

export function compareAlertCards(
  a: Pick<ScamCard, "isNewAlert" | "isTrendingAlert" | "isMostReported" | "updatedAt" | "createdAt">,
  b: Pick<ScamCard, "isNewAlert" | "isTrendingAlert" | "isMostReported" | "updatedAt" | "createdAt">
) {
  const aPriority = getAlertPriority(a);
  const bPriority = getAlertPriority(b);
  
  const priorityDiff = bPriority - aPriority;

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  if (aPriority === 0 && bPriority === 0) {
    return 0;
  }

  const bDate = Date.parse(b.updatedAt || b.createdAt || "");
  const aDate = Date.parse(a.updatedAt || a.createdAt || "");

  if (!Number.isNaN(bDate) && !Number.isNaN(aDate) && bDate !== aDate) {
    return bDate - aDate;
  }

  return 0;
}

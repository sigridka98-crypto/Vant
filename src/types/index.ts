export type CardStepType = "how_it_works" | "red_flags" | "protection";

export type ScamCardStep = {
  id: string;
  stepType: CardStepType;
  content: string;
  sortOrder: number;
};

export type ScamSeverity = "common" | "trending" | "high_risk";
export type CardAccessState = "free" | "locked" | "unlocked" | "subscription";
export type ScamAlertTag = "new_scam_alert" | "trending_scam" | "most_reported";
export type CardUpdateType = "minor" | "major";

export type ScamCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  safeExample: string;
  quickMemoryRule: string;
  category: string;
  severity: ScamSeverity;
  isFree: boolean;
  creditCost: number;
  currentVersion: number;
  majorUpdateReunlockCost: number | null;
  isPublished: boolean;
  isNewAlert: boolean;
  isTrendingAlert: boolean;
  isMostReported: boolean;
  alertSummary: string;
  createdAt: string;
  updatedAt: string;
  isAlertSeen?: boolean;
  isBookmarked?: boolean;
  steps: ScamCardStep[];
  accessState?: CardAccessState;
};

export type CardUpdateLog = {
  id: string;
  cardId: string;
  oldVersion: number;
  newVersion: number;
  updateType: CardUpdateType;
  changeSummary: string;
  reunlockCost: number | null;
  createdBy: string | null;
  createdAt: string;
};

export type Profile = {
  id: string;
  fullName: string;
  role: "user" | "admin";
};

export type WalletSummary = {
  balance: number;
};

export type CreditBundle = {
  id: string;
  coins: number;
  priceLabel: string;
  amountKobo: number;
  stripeAmountCents?: number;
  stripePriceLabel?: string;
  paystackAmountKobo?: number;
  paystackPriceLabel?: string;
  diamondsBonus?: number;
};

export type CreditTransaction = {
  id: string;
  label: string;
  amount: string;
  date: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  priceLabel: string;
  amountKobo: number;
  billingLabel: string;
  description: string;
  features: string[];
};

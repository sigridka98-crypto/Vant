import { cache } from "react";

import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/env";
import { readLocalDb } from "@/lib/local-dev-store";
import {
  getLocalBalance,
  getLocalBookmarks,
  getLocalSeenAlerts,
  getLocalTransactions,
  getLocalUnlocks
} from "@/lib/local-user-state";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import type { CardUpdateLog, CreditTransaction, ScamCard } from "@/types";

function mapCardRecord(record: {
  id: string;
  slug: string;
  title: string;
  description: string;
  safe_example: string;
  quick_memory_rule: string;
  category: string;
  severity: "common" | "trending" | "high_risk";
  is_free: boolean;
  credit_cost: number;
  current_version: number;
  major_update_reunlock_cost: number | null;
  is_published: boolean;
  is_new_alert: boolean;
  is_trending_alert: boolean;
  is_most_reported: boolean;
  alert_summary: string;
  created_at: string;
  updated_at: string;
}): ScamCard {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    safeExample: record.safe_example,
    quickMemoryRule: record.quick_memory_rule,
    category: record.category,
    severity: record.severity,
    isFree: record.is_free,
    creditCost: record.credit_cost,
    currentVersion: record.current_version,
    majorUpdateReunlockCost: record.major_update_reunlock_cost,
    isPublished: record.is_published,
    isNewAlert: record.is_new_alert,
    isTrendingAlert: record.is_trending_alert,
    isMostReported: record.is_most_reported,
    alertSummary: record.alert_summary,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    steps: []
  };
}

type CardRecord = Parameters<typeof mapCardRecord>[0];

function mapCardUpdateLogRecord(record: {
  id: string;
  card_id: string;
  old_version: number;
  new_version: number;
  update_type: "minor" | "major";
  change_summary: string;
  reunlock_cost: number | null;
  created_by: string | null;
  created_at: string;
}): CardUpdateLog {
  return {
    id: record.id,
    cardId: record.card_id,
    oldVersion: record.old_version,
    newVersion: record.new_version,
    updateType: record.update_type,
    changeSummary: record.change_summary,
    reunlockCost: record.reunlock_cost,
    createdBy: record.created_by,
    createdAt: record.created_at
  };
}

async function getUserAccessMap(cardIds: string[]) {
  if (!isSupabaseConfigured() || !cardIds.length) {
    const unlocks = await getLocalUnlocks();
    const seenAlerts = await getLocalSeenAlerts();
    const bookmarks = await getLocalBookmarks();
    return {
      unlockedVersions: new Map<string, number>(
        cardIds
          .filter((cardId) => unlocks[cardId] !== undefined)
          .map((cardId) => [cardId, unlocks[cardId]])
      ),
      bookmarkedIds: new Set<string>(
        cardIds.filter((cardId) => bookmarks[cardId] !== undefined)
      ),
      seenAlerts: new Set<string>(
        cardIds.filter((cardId) => seenAlerts[cardId] !== undefined)
      )
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      unlockedVersions: new Map<string, number>(),
      bookmarkedIds: new Set<string>(),
      seenAlerts: new Set<string>()
    };
  }

  const [{ data: unlocks }, { data: seenAlerts }, { data: bookmarks }] = await Promise.all([
    supabase
      .from("user_card_unlocks")
      .select("card_id, unlocked_version")
      .eq("user_id", user.id)
      .in("card_id", cardIds),
    supabase
      .from("user_alert_views")
      .select("card_id")
      .eq("user_id", user.id)
      .in("card_id", cardIds),
    supabase
      .from("user_bookmarks")
      .select("card_id")
      .eq("user_id", user.id)
      .in("card_id", cardIds)
  ]);

  const unlockedVersions = new Map<string, number>();
  (unlocks ?? []).forEach((unlock) => {
    unlockedVersions.set(unlock.card_id, unlock.unlocked_version);
  });

  return {
    bookmarkedIds: new Set<string>((bookmarks ?? []).map((item) => item.card_id)),
    unlockedVersions,
    seenAlerts: new Set<string>((seenAlerts ?? []).map((item) => item.card_id))
  };
}

const baseCardSelect = [
  "id",
  "slug",
  "title",
  "description",
  "safe_example",
  "quick_memory_rule",
  "category",
  "severity",
  "is_free",
  "credit_cost",
  "current_version",
  "major_update_reunlock_cost",
  "is_published",
  "is_new_alert",
  "is_trending_alert",
  "is_most_reported",
  "alert_summary",
  "created_at",
  "updated_at"
].join(", ");

export const getPublishedCards = cache(async () => {
  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const records = db.cards
      .filter((card) => card.is_published)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const access = await getUserAccessMap(records.map((card) => card.id));
    const cards = records.map((record) => {
      const card = mapCardRecord(record);
      const unlockedVersion = access.unlockedVersions.get(card.id);

      card.accessState = card.isFree
        ? "free"
        : unlockedVersion === card.currentVersion
          ? "unlocked"
          : "locked";
      card.isAlertSeen = access.seenAlerts.has(card.id);
      card.isBookmarked = access.bookmarkedIds.has(card.id);

      return card;
    });

    return {
      cards,
      categories: [...new Set(cards.map((card) => card.category))],
      isConfigured: false
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scam_cards")
    .select(baseCardSelect)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      cards: [] as ScamCard[],
      categories: [] as string[],
      isConfigured: true
    };
  }

  const records = (data ?? []) as unknown as CardRecord[];
  const access = await getUserAccessMap(records.map((card) => card.id));
  const cards = records.map((record) => {
    const card = mapCardRecord(record);
    const unlockedVersion = access.unlockedVersions.get(card.id);

    card.accessState = card.isFree
      ? "free"
      : unlockedVersion === card.currentVersion
        ? "unlocked"
        : "locked";
    card.isAlertSeen = access.seenAlerts.has(card.id);
    card.isBookmarked = access.bookmarkedIds.has(card.id);

    return card;
  });

  const categories = [...new Set(cards.map((card) => card.category))];

  return {
    cards,
    categories,
    isConfigured: true
  };
});

export const getPublishedCardBySlug = cache(async (slug: string) => {
  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const record = db.cards.find((card) => card.slug === slug && card.is_published);

    if (!record) {
      return {
        card: null as ScamCard | null,
        hasFullAccess: false,
        isConfigured: false
      };
    }

    const card = mapCardRecord(record);
    const access = await getUserAccessMap([card.id]);
    const unlockedVersion = access.unlockedVersions.get(card.id);
    const hasFullAccess = card.isFree || unlockedVersion === card.currentVersion;

    card.accessState = card.isFree
      ? "free"
      : unlockedVersion === card.currentVersion
        ? "unlocked"
        : "locked";
    card.isAlertSeen = access.seenAlerts.has(card.id);
    card.isBookmarked = access.bookmarkedIds.has(card.id);

    if (hasFullAccess) {
      card.steps = record.steps.map((step) => ({
        id: step.id,
        stepType: step.step_type,
        content: step.content,
        sortOrder: step.sort_order
      }));
    }

    return {
      card,
      hasFullAccess,
      isConfigured: false
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: record } = await supabase
    .from("scam_cards")
    .select(baseCardSelect)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!record) {
    return {
      card: null as ScamCard | null,
      hasFullAccess: false,
      isConfigured: true
    };
  }

  const card = mapCardRecord(record as unknown as CardRecord);
  const access = await getUserAccessMap([card.id]);
  const unlockedVersion = access.unlockedVersions.get(card.id);
  const hasFullAccess = card.isFree || unlockedVersion === card.currentVersion;

  card.accessState = card.isFree
    ? "free"
    : unlockedVersion === card.currentVersion
      ? "unlocked"
      : "locked";
  card.isAlertSeen = access.seenAlerts.has(card.id);
  card.isBookmarked = access.bookmarkedIds.has(card.id);

  if (!hasFullAccess || !isSupabaseServiceConfigured()) {
    return {
      card,
      hasFullAccess,
      isConfigured: true
    };
  }

  const serviceSupabase = createSupabaseServiceClient();
  const { data: steps } = await serviceSupabase
    .from("scam_card_steps")
    .select("id, step_type, content, sort_order")
    .eq("card_id", card.id)
    .order("sort_order", { ascending: true });

  card.steps = (steps ?? []).map((step) => ({
    id: step.id,
    stepType: step.step_type,
    content: step.content,
    sortOrder: step.sort_order
  }));

  return {
    card,
    hasFullAccess,
    isConfigured: true
  };
});

export const getBookmarkedCards = cache(async () => {
  const { cards, isConfigured } = await getPublishedCards();
  const bookmarkedCards = cards.filter((card) => card.isBookmarked);

  return {
    isConfigured,
    cards: bookmarkedCards,
    categories: [...new Set(bookmarkedCards.map((card) => card.category))]
  };
});

export const getWalletPageData = cache(async () => {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      balance: await getLocalBalance(),
      transactions: await getLocalTransactions(),
      bankTransferRequests: [] as Array<any>
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isConfigured: true,
      balance: 0,
      transactions: [] as CreditTransaction[],
      bankTransferRequests: [] as Array<any>
    };
  }

  const [{ data: wallet }, { data: transactions }] = await Promise.all([
    supabase.from("wallets").select("credit_balance").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("credit_transactions")
      .select("id, amount, type, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    isConfigured: true,
    balance: wallet?.credit_balance ?? 0,
    transactions: (transactions ?? []).map((transaction) => ({
      id: transaction.id,
      label: transaction.note || transaction.type.replaceAll("_", " "),
      amount: transaction.amount > 0 ? `+${transaction.amount}` : `${transaction.amount}`,
      date: new Date(transaction.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    })),
    bankTransferRequests: [] as Array<any>
  };
});

export const getAdminCardOverview = cache(async () => {
  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const publishedCards = db.cards.filter((card) => card.is_published).length;
    return {
      isConfigured: false,
      totalCards: db.cards.length,
      publishedCards,
      draftCards: db.cards.length - publishedCards
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("scam_cards").select("id, is_published");

  if (error || !data) {
    return {
      isConfigured: true,
      totalCards: 0,
      publishedCards: 0,
      draftCards: 0
    };
  }

  const publishedCards = data.filter((card) => card.is_published).length;

  return {
    isConfigured: true,
    totalCards: data.length,
    publishedCards,
    draftCards: data.length - publishedCards
  };
});

export const getAdminCards = cache(async () => {
  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    return {
      isConfigured: false,
      cards: db.cards.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(mapCardRecord)
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scam_cards")
    .select(baseCardSelect)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return {
      isConfigured: true,
      cards: [] as ScamCard[]
    };
  }

  return {
    isConfigured: true,
    cards: ((data ?? []) as unknown as CardRecord[]).map(mapCardRecord)
  };
});

export const getAdminCardById = cache(async (id: string) => {
  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const record = db.cards.find((card) => card.id === id);

    if (!record) {
      return {
        isConfigured: false,
        card: null as ScamCard | null
      };
    }

    const card = mapCardRecord(record);
    card.steps = record.steps.map((step) => ({
      id: step.id,
      stepType: step.step_type,
      content: step.content,
      sortOrder: step.sort_order
    }));

    return {
      isConfigured: false,
      card
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: cardRecord, error } = await supabase
    .from("scam_cards")
    .select(baseCardSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !cardRecord) {
    return {
      isConfigured: true,
      card: null as ScamCard | null
    };
  }

  const { data: steps } = await supabase
    .from("scam_card_steps")
    .select("id, step_type, content, sort_order")
    .eq("card_id", id)
    .order("sort_order", { ascending: true });

  const card = mapCardRecord(cardRecord as unknown as CardRecord);
  card.steps = (steps ?? []).map((step) => ({
    id: step.id,
    stepType: step.step_type,
    content: step.content,
    sortOrder: step.sort_order
  }));

  return {
    isConfigured: true,
    card
  };
});

export const getAdminCardUpdateLogs = cache(async (cardId: string) => {
  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    return {
      isConfigured: false,
      logs: db.card_update_logs
        .filter((log) => log.card_id === cardId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(mapCardUpdateLogRecord)
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("card_update_logs")
    .select("id, card_id, old_version, new_version, update_type, change_summary, reunlock_cost, created_by, created_at")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      isConfigured: true,
      logs: [] as CardUpdateLog[]
    };
  }

  return {
    isConfigured: true,
    logs: (data as Array<Parameters<typeof mapCardUpdateLogRecord>[0]>).map(mapCardUpdateLogRecord)
  };
});

import { cookies } from "next/headers";

type LocalUnlockMap = Record<string, number>;
type LocalSeenAlertMap = Record<string, string>;
type LocalBookmarkMap = Record<string, string>;

type LocalTransaction = {
  id: string;
  label: string;
  amount: string;
  date: string;
};

const COOKIE_KEYS = {
  balance: "scamshield_local_balance",
  unlocks: "scamshield_local_unlocks",
  transactions: "scamshield_local_transactions",
  admin: "scamshield_local_admin_access",
  seenAlerts: "scamshield_local_seen_alerts",
  bookmarks: "scamshield_local_bookmarks"
} as const;

async function getCookieStore() {
  return cookies();
}

function parseJSON<T>(value: string | undefined, fallback: T) {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getLocalBalance() {
  const store = await getCookieStore();
  const raw = store.get(COOKIE_KEYS.balance)?.value;
  const balance = Number(raw ?? 0);
  return Number.isFinite(balance) ? balance : 0;
}

export async function setLocalBalance(balance: number) {
  const store = await getCookieStore();
  store.set(COOKIE_KEYS.balance, String(Math.max(0, balance)), {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });
}

export async function getLocalUnlocks() {
  const store = await getCookieStore();
  return parseJSON<LocalUnlockMap>(store.get(COOKIE_KEYS.unlocks)?.value, {});
}

export async function setLocalUnlocks(unlocks: LocalUnlockMap) {
  const store = await getCookieStore();
  store.set(COOKIE_KEYS.unlocks, JSON.stringify(unlocks), {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });
}

export async function getLocalTransactions() {
  const store = await getCookieStore();
  return parseJSON<LocalTransaction[]>(store.get(COOKIE_KEYS.transactions)?.value, []);
}

export async function addLocalTransaction(transaction: Omit<LocalTransaction, "id" | "date">) {
  const transactions = await getLocalTransactions();
  const updated = [
    {
      id: crypto.randomUUID(),
      label: transaction.label,
      amount: transaction.amount,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    },
    ...transactions
  ].slice(0, 12);

  const store = await getCookieStore();
  store.set(COOKIE_KEYS.transactions, JSON.stringify(updated), {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });
}

export async function getLocalAdminAccess() {
  const store = await getCookieStore();
  return store.get(COOKIE_KEYS.admin)?.value === "true";
}

export async function setLocalAdminAccess(active: boolean) {
  const store = await getCookieStore();
  store.set(COOKIE_KEYS.admin, active ? "true" : "false", {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });
}

export async function getLocalSeenAlerts() {
  const store = await getCookieStore();
  return parseJSON<LocalSeenAlertMap>(store.get(COOKIE_KEYS.seenAlerts)?.value, {});
}

export async function setLocalSeenAlerts(seenAlerts: LocalSeenAlertMap) {
  const store = await getCookieStore();
  store.set(COOKIE_KEYS.seenAlerts, JSON.stringify(seenAlerts), {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });
}

export async function markLocalAlertSeen(cardId: string) {
  const seenAlerts = await getLocalSeenAlerts();
  seenAlerts[cardId] = new Date().toISOString();
  await setLocalSeenAlerts(seenAlerts);
}

export async function getLocalBookmarks() {
  const store = await getCookieStore();
  return parseJSON<LocalBookmarkMap>(store.get(COOKIE_KEYS.bookmarks)?.value, {});
}

export async function setLocalBookmarks(bookmarks: LocalBookmarkMap) {
  const store = await getCookieStore();
  store.set(COOKIE_KEYS.bookmarks, JSON.stringify(bookmarks), {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });
}

export async function toggleLocalBookmark(cardId: string, bookmarked: boolean) {
  const bookmarks = await getLocalBookmarks();

  if (bookmarked) {
    bookmarks[cardId] = new Date().toISOString();
  } else {
    delete bookmarks[cardId];
  }

  await setLocalBookmarks(bookmarks);
}

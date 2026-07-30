"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import {
  addLocalTransaction,
  getLocalBalance,
  getLocalUnlocks,
  setLocalBalance,
  setLocalUnlocks
} from "@/lib/local-user-state";
import { unlockCardForUser } from "@/lib/supabase/live-access";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function unlockCardAccess(formData: FormData) {
  const cardId = textValue(formData, "cardId");
  const slug = textValue(formData, "slug");
  const title = textValue(formData, "title");
  const version = numberValue(formData, "version", 1);
  const cost = numberValue(formData, "cost", 0);

  if (!cardId || !slug) {
    redirect("/dashboard");
  }

  if (!isSupabaseConfigured()) {
    const balance = await getLocalBalance();

    if (balance < cost) {
      redirect(`/cards/${slug}?error=${encodeURIComponent("Not enough coins yet. Top up your wallet first.")}`);
    }

    const unlocks = await getLocalUnlocks();
    unlocks[cardId] = version;
    await setLocalUnlocks(unlocks);
    await setLocalBalance(balance - cost);
    await addLocalTransaction({
      label: `Unlocked ${title}`,
      amount: `-${cost}`
    });

    redirect(`/cards/${slug}?message=${encodeURIComponent("Premium card unlocked successfully.")}`);
  }

  const auth = await getAuthContext();

  if (!auth.user) {
    redirect(`/login?message=${encodeURIComponent("Create your personal profile or sign in to unlock premium update lessons.")}&next=${encodeURIComponent(`/cards/${slug}`)}`);
  }

  const result = await unlockCardForUser(auth.user.id, {
    cardId
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath(`/cards/${slug}`);

  if (!result.ok) {
    redirect(`/cards/${slug}?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/cards/${slug}?message=${encodeURIComponent(result.message)}`);
}



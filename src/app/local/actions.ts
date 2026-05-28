"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeLocalDb } from "@/lib/local-dev-store";
import {
  setLocalBalance,
  setLocalBookmarks,
  setLocalSeenAlerts,
  setLocalUnlocks
} from "@/lib/local-user-state";

export async function resetLocalDemoState() {
  await writeLocalDb({ cards: [], card_update_logs: [] });
  await setLocalBalance(0);
  await setLocalBookmarks({});
  await setLocalUnlocks({});
  await setLocalSeenAlerts({});

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/admin");

  redirect("/admin?message=Local demo state reset. You can start testing from a clean slate.");
}

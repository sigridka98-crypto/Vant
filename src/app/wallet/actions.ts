"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function redeemPurchaseCode(formData: FormData) {
  const auth = await getAuthContext();

  if (!auth.user) redirect("/login?message=Sign in before redeeming a purchase code.");
  if (!isSupabaseConfigured()) redirect("/wallet?error=Connect Supabase before redeeming purchase codes.");

  const code = String(formData.get("purchaseCode") ?? "").trim();
  if (!code) redirect("/wallet?error=Enter your GetUpdated purchase code.");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("redeem_access_code", { p_code: code });

  if (error) redirect(`/wallet?error=${encodeURIComponent(error.message)}`);

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.ok) redirect(`/wallet?error=${encodeURIComponent(result?.message ?? "This code could not be redeemed.")}`);

  revalidatePath("/wallet");
  revalidatePath("/dashboard");
  redirect(`/wallet?message=${encodeURIComponent(result.message)}`);
}

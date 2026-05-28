import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isSupabaseConfigured } from "@/lib/env";
import {
  addLocalTransaction,
  getLocalBalance,
  setLocalBalance
} from "@/lib/local-user-state";
import { creditBundles } from "@/lib/payments-config";
import { applyMockWalletTopUp } from "@/lib/supabase/live-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const flow = searchParams.get("flow");
  const outcome = searchParams.get("outcome");

  if (outcome === "cancel") {
    return NextResponse.redirect(new URL("/wallet/cancel", origin));
  }

  if (!isSupabaseConfigured()) {
    if (flow === "wallet") {
      const bundleId = searchParams.get("bundle");
      const bundle = creditBundles.find((item) => item.id === bundleId);

      if (bundle) {
        const balance = await getLocalBalance();
        await setLocalBalance(balance + bundle.coins);
        await addLocalTransaction({
          label: `Mock Paystack top-up (${bundle.coins} coins)`,
          amount: `+${bundle.coins}`
        });
      }

      return NextResponse.redirect(new URL(`/wallet/success?bundle=${bundleId ?? ""}`, origin));
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?message=Sign in before using the wallet.", origin));
  }

  if (flow === "wallet") {
    const bundleId = searchParams.get("bundle");
    const bundle = creditBundles.find((item) => item.id === bundleId);

    if (!bundle) {
      return NextResponse.redirect(new URL("/wallet?error=Unknown+bundle+selected.", origin));
    }

    const result = await applyMockWalletTopUp(user.id, bundle);
    revalidatePath("/", "layout");
    revalidatePath("/wallet");
    revalidatePath("/dashboard");

    if (!result.ok) {
      return NextResponse.redirect(
        new URL(`/wallet?error=${encodeURIComponent(result.message)}`, origin)
      );
    }

    return NextResponse.redirect(
      new URL(`/wallet/success?bundle=${bundle.id}&message=${encodeURIComponent(result.message)}`, origin)
    );
  }

  return NextResponse.redirect(new URL("/wallet/success?mode=placeholder", origin));
}

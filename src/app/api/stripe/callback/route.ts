import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getStripeBundleById, retrieveStripeCheckoutSession } from "@/lib/stripe";
import { processVerifiedWalletPayment } from "@/lib/supabase/live-access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const reference = url.searchParams.get("reference");
  const origin = url.origin;

  if (!sessionId || !reference) {
    return NextResponse.redirect(new URL("/wallet/cancel?message=Missing+Stripe+payment+details.", origin));
  }

  try {
    const session = await retrieveStripeCheckoutSession(sessionId);
    const metadata = session.metadata ?? {};
    const bundleId = typeof metadata.bundleId === "string" ? metadata.bundleId : "";

    const result = await processVerifiedWalletPayment(
      "stripe",
      reference,
      {
        reference,
        amount: session.amount_total ?? 0,
        status: session.payment_status ?? session.status ?? "failed",
        metadata
      },
      {
        walletBundle: bundleId ? getStripeBundleById(bundleId) : null
      }
    );

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/wallet");

    if (!result.ok) {
      return NextResponse.redirect(
        new URL(`/wallet?error=${encodeURIComponent(result.message)}`, origin)
      );
    }

    return NextResponse.redirect(
      new URL(`/wallet/success?message=${encodeURIComponent(result.message)}`, origin)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/wallet/cancel?message=Unable+to+verify+this+Stripe+payment.", origin)
    );
  }
}

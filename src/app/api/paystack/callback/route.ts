import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getBundleById, verifyPaystackTransaction } from "@/lib/paystack";
import { processVerifiedPaystackTransaction } from "@/lib/supabase/live-access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");
  const origin = url.origin;

  if (!reference) {
    return NextResponse.redirect(new URL("/wallet/cancel?message=Missing+payment+reference.", origin));
  }

  try {
    const verification = await verifyPaystackTransaction(reference);
    const metadata = verification.data?.metadata ?? {};
    const bundleId = typeof metadata.bundleId === "string" ? metadata.bundleId : "";

    const result = await processVerifiedPaystackTransaction(reference, {
      reference,
      amount: verification.data?.amount ?? 0,
      status: verification.data?.status ?? "failed",
      paid_at: verification.data?.paid_at ?? null,
      metadata,
      plan: verification.data?.plan ?? null
    }, {
      walletBundle: bundleId ? getBundleById(bundleId) : null
    });

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
      new URL("/wallet/cancel?message=Unable+to+verify+this+Paystack+payment.", origin)
    );
  }
}

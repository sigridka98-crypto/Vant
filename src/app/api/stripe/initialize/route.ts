import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/env";
import { creditBundles } from "@/lib/payments-config";
import { createStripeCheckoutSession, createStripeReference } from "@/lib/stripe";
import { createPendingPayment } from "@/lib/supabase/live-access";

type InitializeRequestBody = {
  bundleId: string;
};

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { ok: false, message: "Stripe environment variables are not configured yet." },
        { status: 500 }
      );
    }

    const auth = await getAuthContext();

    if (!auth.user || !auth.user.email) {
      return NextResponse.json(
        { ok: false, message: "Sign in before starting a payment." },
        { status: 401 }
      );
    }

    const { bundleId } = (await request.json()) as InitializeRequestBody;
    const bundle = creditBundles.find((item) => item.id === bundleId);

    if (!bundle || !bundle.stripeAmountCents) {
      return NextResponse.json(
        { ok: false, message: "Unknown Stripe coin bundle selected." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        { ok: false, message: "NEXT_PUBLIC_APP_URL is missing." },
        { status: 500 }
      );
    }

    const reference = createStripeReference(auth.user.id);

    await createPendingPayment(auth.user.id, {
      provider: "stripe",
      reference,
      amount: bundle.stripeAmountCents,
      paymentKind: "credit_topup",
      metadata: {
        flow: "wallet",
        bundleId: bundle.id
      }
    });

    const session = await createStripeCheckoutSession({
      email: auth.user.email,
      reference,
      bundleId: bundle.id,
      amountCents: bundle.stripeAmountCents,
      coins: bundle.coins,
      successUrl: `${appUrl}/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}&reference=${encodeURIComponent(reference)}`,
      cancelUrl: `${appUrl}/wallet/cancel?message=${encodeURIComponent("Stripe checkout was cancelled.")}`
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, message: "Unable to initialize Stripe checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl: session.url
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to initialize Stripe checkout."
      },
      { status: 500 }
    );
  }
}

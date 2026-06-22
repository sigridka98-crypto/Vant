import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth";
import { isPaystackConfigured } from "@/lib/env";
import { MAX_WALLET_COINS } from "@/lib/payments-config";
import {
  createPaystackReference,
  getBundleById,
  initializePaystackTransaction
} from "@/lib/paystack";
import { createPendingPayment } from "@/lib/supabase/live-access";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type InitializeRequestBody =
  { flow: "wallet"; bundleId: string };

export async function POST(request: Request) {
  try {
    if (!isPaystackConfigured()) {
      return NextResponse.json(
        { ok: false, message: "Paystack environment variables are not configured yet." },
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

    const body = (await request.json()) as InitializeRequestBody;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        { ok: false, message: "NEXT_PUBLIC_APP_URL is missing." },
        { status: 500 }
      );
    }

    const reference = createPaystackReference(body.flow, auth.user.id);

    if (body.flow === "wallet") {
      const bundle = getBundleById(body.bundleId);

      if (!bundle) {
        return NextResponse.json(
          { ok: false, message: "Unknown coin bundle selected." },
          { status: 400 }
        );
      }

      const serviceSupabase = createSupabaseServiceClient();
      const { data: wallet } = await serviceSupabase
        .from("wallets")
        .select("credit_balance")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      const currentBalance = wallet?.credit_balance ?? 0;

      if (currentBalance + bundle.coins > MAX_WALLET_COINS) {
        return NextResponse.json(
          {
            ok: false,
            message: `You can only hold up to ${MAX_WALLET_COINS} coins at a time. Spend some coins before topping up again.`
          },
          { status: 400 }
        );
      }

      await createPendingPayment(auth.user.id, {
        provider: "paystack",
        reference,
        amount: bundle.paystackAmountKobo ?? bundle.amountKobo,
        paymentKind: "credit_topup",
        metadata: {
          flow: "wallet",
          bundleId: bundle.id
        }
      });

      const response = await initializePaystackTransaction({
        email: auth.user.email,
        amount: String(bundle.paystackAmountKobo ?? bundle.amountKobo),
        reference,
        callback_url: `${appUrl}/api/paystack/callback`,
        channels: ["card"],
        metadata: {
          flow: "wallet",
          bundleId: bundle.id,
          userId: auth.user.id
        }
      });

      if (!response.status || !response.data?.authorization_url) {
        return NextResponse.json(
          { ok: false, message: response.message || "Unable to initialize Paystack checkout." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Only wallet top-up payments are active right now."
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to initialize Paystack checkout."
      },
      { status: 500 }
    );
  }
}

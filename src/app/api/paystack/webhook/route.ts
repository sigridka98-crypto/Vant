import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getBundleById, verifyPaystackSignature } from "@/lib/paystack";
import { processVerifiedPaystackTransaction } from "@/lib/supabase/live-access";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    status?: string;
    paid_at?: string | null;
    metadata?: Record<string, unknown> | null;
    plan?: {
      plan_code?: string | null;
    } | null;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PaystackWebhookEvent;

  if (event.event !== "charge.success" || !event.data?.reference) {
    return NextResponse.json({ ok: true });
  }

  const metadata = event.data.metadata ?? {};
  const bundleId = typeof metadata.bundleId === "string" ? metadata.bundleId : "";

  await processVerifiedPaystackTransaction(
    event.data.reference,
    {
      reference: event.data.reference,
      amount: event.data.amount ?? 0,
      status: event.data.status ?? "failed",
      paid_at: event.data.paid_at ?? null,
      metadata,
      plan: event.data.plan ?? null
    },
    {
      walletBundle: bundleId ? getBundleById(bundleId) : null
    }
  );

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");

  return NextResponse.json({ ok: true });
}

import { creditBundles } from "@/lib/payments-config";

type StripeCheckoutSessionResponse = {
  id: string;
  url?: string | null;
  payment_status?: string;
  status?: string | null;
  amount_total?: number | null;
  metadata?: Record<string, string> | null;
};

function getStripeSecretKey() {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return secret;
}

async function stripeRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const raw = await response.text();
  const data = raw ? (JSON.parse(raw) as T & { error?: { message?: string } }) : ({} as T & { error?: { message?: string } });

  if (!response.ok) {
    throw new Error(data.error?.message || "Stripe request failed.");
  }

  return data as T;
}

export function createStripeReference(userId: string) {
  return `vant-stripe-${userId.slice(0, 8)}-${Date.now()}`;
}

export async function createStripeCheckoutSession(input: {
  email: string;
  reference: string;
  successUrl: string;
  cancelUrl: string;
  bundleId: string;
  amountCents: number;
  coins: number;
}) {
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", input.successUrl);
  form.set("cancel_url", input.cancelUrl);
  form.set("customer_email", input.email);
  form.set("client_reference_id", input.reference);
  form.set("metadata[flow]", "wallet");
  form.set("metadata[bundleId]", input.bundleId);
  form.set("metadata[reference]", input.reference);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  form.set("line_items[0][price_data][product_data][name]", `${input.coins} VANT coins`);
  form.set(
    "line_items[0][price_data][product_data][description]",
    "One-time wallet top-up for unlocking premium scam-awareness cards."
  );

  return stripeRequest<StripeCheckoutSessionResponse>("/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  return stripeRequest<StripeCheckoutSessionResponse>(
    `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`
  );
}

export function getStripeBundleById(bundleId: string) {
  return creditBundles.find((bundle) => bundle.id === bundleId) ?? null;
}

import crypto from "crypto";

import { creditBundles } from "@/lib/payments-config";

type InitializePayload = {
  email: string;
  amount?: number | string;
  reference: string;
  callback_url: string;
  metadata: Record<string, unknown>;
  plan?: string;
  channels?: string[];
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    paid_at?: string | null;
    metadata?: Record<string, unknown> | null;
    customer?: {
      email?: string | null;
    } | null;
    plan?: {
      plan_code?: string | null;
    } | null;
    authorization?: {
      reusable?: boolean | null;
    } | null;
  };
};

function getSecretKey() {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error("Missing PAYSTACK_SECRET_KEY.");
  }

  return secret;
}

export function createPaystackReference(prefix: "wallet" | "subscription", userId: string) {
  return `vant-${prefix}-${userId.slice(0, 8)}-${Date.now()}`;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const raw = await response.text();
  const data = raw ? (JSON.parse(raw) as T) : ({} as T);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Paystack request failed.";
    throw new Error(message);
  }

  return data;
}

export async function initializePaystackTransaction(payload: InitializePayload) {
  return paystackRequest<PaystackInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackVerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET"
    }
  );
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const hash = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  return hash === signature;
}

export function getBundleById(bundleId: string) {
  return creditBundles.find((bundle) => bundle.id === bundleId) ?? null;
}

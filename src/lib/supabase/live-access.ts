import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { CreditBundle } from "@/types";

type OperationResult = {
  ok: boolean;
  message: string;
};

type VerifiedPaystackTransaction = {
  reference: string;
  amount: number;
  status: string;
  paid_at?: string | null;
  metadata?: Record<string, unknown> | null;
  plan?: {
    plan_code?: string | null;
  } | null;
};

type VerifiedWalletPayment = {
  reference: string;
  amount: number;
  status: string;
  paid_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

async function ensureWalletBalance(userId: string) {
  const serviceSupabase = createSupabaseServiceClient();
  const { data: wallet } = await serviceSupabase
    .from("wallets")
    .select("credit_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (wallet) {
    return wallet.credit_balance;
  }

  const { error } = await serviceSupabase
    .from("wallets")
    .insert({
      user_id: userId,
      credit_balance: 0
    });

  if (error) {
    throw new Error(error.message);
  }

  return 0;
}

export async function applyMockWalletTopUp(userId: string, bundle: CreditBundle): Promise<OperationResult> {
  const serviceSupabase = createSupabaseServiceClient();
  const startingBalance = await ensureWalletBalance(userId);
  const nextBalance = startingBalance + bundle.coins;
  const reference = `mock-wallet-${userId.slice(0, 8)}-${Date.now()}`;

  const { error: walletError } = await serviceSupabase
    .from("wallets")
    .update({
      credit_balance: nextBalance
    })
    .eq("user_id", userId);

  if (walletError) {
    return {
      ok: false,
      message: walletError.message
    };
  }

  const { data: payment, error: paymentError } = await serviceSupabase
    .from("payments")
    .insert({
      user_id: userId,
      provider: "paystack",
      reference,
      amount: bundle.amountKobo,
      credits_awarded: bundle.coins,
      payment_kind: "credit_topup",
      status: "success",
      metadata: {
        mode: "mock",
        bundle_id: bundle.id
      }
    })
    .select("id")
    .single();

  if (paymentError) {
    return {
      ok: false,
      message: paymentError.message
    };
  }

  const { error: transactionError } = await serviceSupabase.from("credit_transactions").insert({
    user_id: userId,
    amount: bundle.coins,
    type: "topup",
    payment_id: payment.id,
    note: `Mock Paystack top-up (${bundle.coins} coins)`
  });

  if (transactionError) {
    return {
      ok: false,
      message: transactionError.message
    };
  }

  return {
    ok: true,
    message: `${bundle.coins} coins added to your wallet.`
  };
}

export async function unlockCardForUser(
  userId: string,
  input: {
    cardId: string;
  }
): Promise<OperationResult> {
  const serviceSupabase = createSupabaseServiceClient();
  const { data: card, error: cardError } = await serviceSupabase
    .from("scam_cards")
    .select("id, title, is_free, is_published, credit_cost, current_version, major_update_reunlock_cost")
    .eq("id", input.cardId)
    .maybeSingle();

  if (cardError || !card || !card.is_published) {
    return {
      ok: false,
      message: "This card is not available for unlocking right now."
    };
  }

  if (card.is_free) {
    return {
      ok: true,
      message: "This card is already free to open."
    };
  }

  const { data: latestUnlock } = await serviceSupabase
    .from("user_card_unlocks")
    .select("unlocked_version")
    .eq("user_id", userId)
    .eq("card_id", input.cardId)
    .order("unlocked_version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestUnlock?.unlocked_version === card.current_version) {
    return {
      ok: true,
      message: "This lesson is already unlocked in your library."
    };
  }

  const isReunlock = (latestUnlock?.unlocked_version ?? 0) > 0;
  const cost =
    isReunlock && card.major_update_reunlock_cost !== null
      ? card.major_update_reunlock_cost
      : card.credit_cost;

  const startingBalance = await ensureWalletBalance(userId);

  if (startingBalance < cost) {
    return {
      ok: false,
      message: "Not enough coins yet. Top up your wallet first."
    };
  }

  const nextBalance = startingBalance - cost;
  const { error: walletError } = await serviceSupabase
    .from("wallets")
    .update({
      credit_balance: nextBalance
    })
    .eq("user_id", userId);

  if (walletError) {
    return {
      ok: false,
      message: walletError.message
    };
  }

  const { error: unlockError } = await serviceSupabase.from("user_card_unlocks").insert({
    user_id: userId,
    card_id: input.cardId,
    unlocked_version: card.current_version,
    unlock_type: isReunlock ? "reunlock" : "credit"
  });

  if (unlockError) {
    return {
      ok: false,
      message: unlockError.message
    };
  }

  const { error: transactionError } = await serviceSupabase.from("credit_transactions").insert({
    user_id: userId,
    amount: -cost,
    type: isReunlock ? "reunlock" : "unlock",
    card_id: input.cardId,
    note: isReunlock ? `Refreshed ${card.title}` : `Unlocked ${card.title}`
  });

  if (transactionError) {
    return {
      ok: false,
      message: transactionError.message
    };
  }

  return {
    ok: true,
    message: isReunlock
      ? `${card.title} was refreshed for the latest version.`
      : `${card.title} unlocked successfully.`
  };
}

export async function createPendingPayment(
  userId: string,
  input: {
    provider?: "paystack";
    reference: string;
    amount: number;
    paymentKind: "credit_topup";
    metadata: Record<string, unknown>;
  }
) {
  const serviceSupabase = createSupabaseServiceClient();

  const { error } = await serviceSupabase.from("payments").upsert(
    {
      user_id: userId,
      provider: input.provider ?? "paystack",
      reference: input.reference,
      amount: input.amount,
      payment_kind: input.paymentKind,
      status: "pending",
      metadata: input.metadata
    },
    {
      onConflict: "reference"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function processVerifiedWalletPayment(
  provider: "paystack",
  reference: string,
  transaction: VerifiedWalletPayment,
  input: {
    walletBundle?: CreditBundle | null;
  }
): Promise<OperationResult & { flow?: "wallet" }> {
  const serviceSupabase = createSupabaseServiceClient();

  if (transaction.status !== "success" && transaction.status !== "paid") {
    const { error } = await serviceSupabase
      .from("payments")
      .update({
        status: "failed",
        metadata: {
          ...(transaction.metadata ?? {}),
          verified_status: transaction.status
        }
      })
      .eq("reference", reference)
      .neq("status", "success");

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: false,
      message: `Payment is currently ${transaction.status}.`,
      flow: (transaction.metadata?.flow as "wallet" | undefined) ?? undefined
    };
  }

  const { data: pendingPayment, error: pendingError } = await serviceSupabase
    .from("payments")
    .update({
      status: "success",
      metadata: {
        ...(transaction.metadata ?? {}),
        paid_at: transaction.paid_at ?? null
      }
    })
    .eq("reference", reference)
    .neq("status", "success")
    .select("id, user_id, payment_kind, metadata")
    .maybeSingle();

  if (pendingError) {
    return { ok: false, message: pendingError.message };
  }

  if (!pendingPayment) {
    const { data: existingPayment, error: existingError } = await serviceSupabase
      .from("payments")
      .select("status, payment_kind, metadata")
      .eq("reference", reference)
      .maybeSingle();

    if (existingError) {
      return { ok: false, message: existingError.message };
    }

    return {
      ok: existingPayment?.status === "success",
      message:
        existingPayment?.status === "success"
          ? "Payment already verified."
          : "Payment could not be verified.",
      flow: (existingPayment?.metadata as Record<string, unknown> | null)?.flow as "wallet" | undefined
    };
  }

  const flow = (pendingPayment.metadata?.flow as "wallet" | undefined) ?? undefined;

  if (pendingPayment.payment_kind !== "credit_topup") {
    return {
      ok: false,
      message: "Only wallet top-ups are active right now.",
      flow
    };
  }

  const bundle = input.walletBundle;

  if (!bundle) {
    return { ok: false, message: "Wallet bundle was not found for this transaction.", flow };
  }

  const startingBalance = await ensureWalletBalance(pendingPayment.user_id);
  const nextBalance = startingBalance + bundle.coins;

  const { error: walletError } = await serviceSupabase
    .from("wallets")
    .update({
      credit_balance: nextBalance
    })
    .eq("user_id", pendingPayment.user_id);

  if (walletError) {
    return { ok: false, message: walletError.message, flow };
  }

  const { error: transactionError } = await serviceSupabase.from("credit_transactions").insert({
    user_id: pendingPayment.user_id,
    amount: bundle.coins,
    type: "topup",
    payment_id: pendingPayment.id,
    note: `Paystack top-up (${bundle.coins} coins)`
  });

  if (transactionError) {
    return { ok: false, message: transactionError.message, flow };
  }

  return {
    ok: true,
    message: `${bundle.coins} coins added to your wallet.`,
    flow
  };
}

export async function processVerifiedPaystackTransaction(
  reference: string,
  transaction: VerifiedPaystackTransaction,
  input: {
    walletBundle?: CreditBundle | null;
  }
): Promise<OperationResult & { flow?: "wallet" }> {
  return processVerifiedWalletPayment("paystack", reference, transaction, {
    walletBundle: input.walletBundle
  });
}

export async function markAlertSeenForUser(
  userId: string,
  input: {
    cardId: string;
  }
): Promise<OperationResult> {
  const serviceSupabase = createSupabaseServiceClient();

  const { error } = await serviceSupabase.from("user_alert_views").upsert(
    {
      user_id: userId,
      card_id: input.cardId,
      seen_at: new Date().toISOString()
    },
    {
      onConflict: "user_id,card_id"
    }
  );

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  return {
    ok: true,
    message: "Alert marked as seen."
  };
}

export async function setBookmarkForUser(
  userId: string,
  input: {
    cardId: string;
    bookmarked: boolean;
  }
): Promise<OperationResult> {
  const serviceSupabase = createSupabaseServiceClient();

  if (input.bookmarked) {
    const { error } = await serviceSupabase.from("user_bookmarks").upsert(
      {
        user_id: userId,
        card_id: input.cardId
      },
      {
        onConflict: "user_id,card_id"
      }
    );

    if (error) {
      return {
        ok: false,
        message: error.message
      };
    }

    return {
      ok: true,
      message: "Card saved to bookmarks."
    };
  }

  const { error } = await serviceSupabase
    .from("user_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("card_id", input.cardId);

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  return {
    ok: true,
    message: "Card removed from bookmarks."
  };
}

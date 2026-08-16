import { createSupabaseServiceClient } from "@/lib/supabase/server";

type OperationResult = {
  ok: boolean;
  message: string;
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

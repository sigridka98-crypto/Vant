import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type AdminAccessCode = {
  id: string;
  batchId: string;
  hint: string;
  status: "active" | "redeemed" | "revoked" | "expired";
  redeemedBy: string | null;
  redeemedAt: string | null;
};

export type AdminAccessCodeBatch = {
  id: string;
  name: string;
  codeCount: number;
  coinsPerCode: number;
  expiresAt: string | null;
  createdAt: string;
  activeCount: number;
  redeemedCount: number;
  unavailableCount: number;
  codes: AdminAccessCode[];
};

export async function getAdminAccessCodeBatches(): Promise<AdminAccessCodeBatch[]> {
  const supabase = createSupabaseServiceClient();
  const { data: batches, error: batchError } = await supabase
    .from("access_code_batches")
    .select("id, name, code_count, coins_per_code, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (batchError || !batches?.length) return [];

  const batchIds = batches.map((batch) => batch.id);
  const { data: codes } = await supabase
    .from("access_codes")
    .select("id, batch_id, code_hint, status, redeemed_by, redeemed_at")
    .in("batch_id", batchIds)
    .order("created_at", { ascending: false });

  const now = Date.now();

  return batches.map((batch) => {
    const batchExpired = batch.expires_at ? new Date(batch.expires_at).getTime() <= now : false;
    const batchCodes: AdminAccessCode[] = (codes ?? [])
      .filter((code) => code.batch_id === batch.id)
      .map((code) => ({
        id: code.id,
        batchId: code.batch_id,
        hint: code.code_hint,
        status: batchExpired && code.status === "active" ? "expired" : code.status,
        redeemedBy: code.redeemed_by,
        redeemedAt: code.redeemed_at
      }));

    return {
      id: batch.id,
      name: batch.name,
      codeCount: batch.code_count,
      coinsPerCode: batch.coins_per_code,
      expiresAt: batch.expires_at,
      createdAt: batch.created_at,
      activeCount: batchCodes.filter((code) => code.status === "active").length,
      redeemedCount: batchCodes.filter((code) => code.status === "redeemed").length,
      unavailableCount: batchCodes.filter((code) => code.status === "revoked" || code.status === "expired").length,
      codes: batchCodes
    };
  });
}

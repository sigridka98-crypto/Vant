"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { accessCodeHint, generateAccessCode, hashAccessCode } from "@/lib/access-code-format";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type GenerateCodesState = {
  error: string;
  message: string;
  batchName: string;
  codes: string[];
};

const initialGenerateCodesState: GenerateCodesState = {
  error: "",
  message: "",
  batchName: "",
  codes: []
};

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function generateAccessCodeBatch(
  _previousState: GenerateCodesState,
  formData: FormData
): Promise<GenerateCodesState> {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return { ...initialGenerateCodesState, error: "Connect Supabase before generating sale codes." };
  }

  const batchName = textValue(formData, "batchName");
  const quantity = Number(formData.get("quantity"));
  const expiryInput = textValue(formData, "expiresAt");

  if (batchName.length < 2 || batchName.length > 80) {
    return { ...initialGenerateCodesState, error: "Enter a batch name containing between 2 and 80 characters." };
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    return { ...initialGenerateCodesState, error: "Generate between 1 and 50 codes in each batch." };
  }

  let expiresAt: string | null = null;
  if (expiryInput) {
    const expiryDate = new Date(expiryInput);
    if (Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return { ...initialGenerateCodesState, error: "Choose an expiry date in the future." };
    }
    expiresAt = expiryDate.toISOString();
  }

  const uniqueCodes = new Set<string>();
  while (uniqueCodes.size < quantity) uniqueCodes.add(generateAccessCode());

  const codes = [...uniqueCodes];
  const codeHashes = await Promise.all(codes.map(hashAccessCode));
  const codeHints = codes.map(accessCodeHint);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("create_access_code_batch", {
    p_name: batchName,
    p_code_hashes: codeHashes,
    p_code_hints: codeHints,
    p_expires_at: expiresAt
  });

  if (error) return { ...initialGenerateCodesState, error: error.message };

  revalidatePath("/admin/codes");
  return {
    error: "",
    message: `${quantity} single-use codes created. Download them now because the full codes are not stored or shown again.`,
    batchName,
    codes
  };
}

export async function revokeAccessCode(formData: FormData) {
  await requireAdmin();
  const codeId = textValue(formData, "codeId");
  if (!codeId) redirect("/admin/codes?error=Missing code id.");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("revoke_access_code", { p_code_id: codeId });

  if (error) redirect(`/admin/codes?error=${encodeURIComponent(error.message)}`);
  if (!data) redirect("/admin/codes?error=Only active codes can be revoked.");

  revalidatePath("/admin/codes");
  redirect("/admin/codes?message=Purchase code revoked.");
}

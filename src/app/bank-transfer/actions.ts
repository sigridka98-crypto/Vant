"use server";

import { redirect } from "next/navigation";

export async function submitBankTransferRequest(formData: FormData) {
  void formData;
  redirect("/wallet");
}

export async function reviewBankTransferRequest(formData: FormData) {
  void formData;
  redirect("/admin");
}

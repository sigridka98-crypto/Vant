"use server";

import { redirect } from "next/navigation";

import { setLocalAdminAccess } from "@/lib/local-user-state";

export async function localAdminSignIn(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  const expectedPassword = process.env.LOCAL_ADMIN_PASSWORD || "admin123";

  if (password !== expectedPassword) {
    redirect("/admin?error=Incorrect admin password.");
  }

  await setLocalAdminAccess(true);
  redirect("/admin?message=Admin access granted.");
}

export async function localAdminSignOut() {
  await setLocalAdminAccess(false);
  redirect("/?message=Admin mode closed.");
}

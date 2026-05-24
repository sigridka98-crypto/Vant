import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocalAdminAccess } from "@/lib/local-user-state";

export async function requireAdmin() {
  const auth = await getAuthContext();

  if (!isSupabaseConfigured()) {
    const hasLocalAdminAccess = await getLocalAdminAccess();

    if (!hasLocalAdminAccess) {
      redirect("/admin?error=Admin access required.");
    }

    return auth;
  }

  if (auth.isConfigured && !auth.user) {
    redirect("/login?message=Sign in to access the admin panel.");
  }

  if (auth.isConfigured && auth.profile?.role !== "admin") {
    redirect("/admin?error=Admin access required.");
  }

  return auth;
}

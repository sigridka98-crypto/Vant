import { cache } from "react";

import {
  getBootstrapAdminEmails,
  isSupabaseConfigured,
  isSupabaseServiceConfigured
} from "@/lib/env";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient
} from "@/lib/supabase/server";
import type { Profile } from "@/types";

type AuthContext = {
  isConfigured: boolean;
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
};

async function syncBootstrapAdminRole(userId: string, email: string | null) {
  if (!email || !isSupabaseServiceConfigured()) {
    return false;
  }

  const bootstrapAdminEmails = getBootstrapAdminEmails();
  const normalizedEmail = email.toLowerCase();

  if (!bootstrapAdminEmails.includes(normalizedEmail)) {
    return false;
  }

  const serviceSupabase = createSupabaseServiceClient();
  const fallbackName = email.split("@")[0] ?? "Admin";

  await serviceSupabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fallbackName,
      role: "admin"
    },
    {
      onConflict: "id"
    }
  );

  await serviceSupabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  return true;
}

export const getAuthContext = cache(async (): Promise<AuthContext> => {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      user: null,
      profile: null
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isConfigured: true,
      user: null,
      profile: null
    };
  }

  const isBootstrapAdmin = await syncBootstrapAdminRole(user.id, user.email ?? null);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const effectiveProfile: Profile | null = profile
    ? {
        id: profile.id,
        fullName: profile.full_name,
        role: isBootstrapAdmin ? "admin" : profile.role
      }
    : isBootstrapAdmin
      ? {
          id: user.id,
          fullName: user.email?.split("@")[0] || "Admin",
          role: "admin"
        }
      : null;

  return {
    isConfigured: true,
    user: {
      id: user.id,
      email: user.email ?? null
    },
    profile: effectiveProfile
  };
});

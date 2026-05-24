import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

type AuthContext = {
  isConfigured: boolean;
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
};

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isConfigured: true,
    user: {
      id: user.id,
      email: user.email ?? null
    },
    profile: profile
      ? {
          id: profile.id,
          fullName: profile.full_name,
          role: profile.role
        }
      : null
  };
});

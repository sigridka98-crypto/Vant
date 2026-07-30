"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeAuthError(error: unknown, fallback: string) {
  if (typeof error === "string") {
    const message = error.trim();
    return message && message !== "{}" ? message : fallback;
  }

  if (error instanceof Error) {
    const message = error.message?.trim();
    if (message && message !== "{}") {
      return message;
    }

    const details = JSON.stringify(
      {
        name: error.name,
        cause: error.cause ?? null
      },
      null,
      0
    );

    return details && details !== "{}" ? details : fallback;
  }

  if (error && typeof error === "object") {
    const candidate = Reflect.get(error, "message");
    if (typeof candidate === "string") {
      const message = candidate.trim();
      if (message && message !== "{}") {
        return message;
      }
    }

    try {
      const details = JSON.stringify(error);
      return details && details !== "{}" ? details : fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function normalizeAuthIdentifier(value: string) {
  return value.trim();
}

function isPhoneIdentifier(value: string) {
  return /^\+?[0-9()\-\s]{7,20}$/.test(value.trim());
}

export async function signIn(formData: FormData) {
  const identifier = normalizeAuthIdentifier(String(formData.get("identifier") ?? ""));
  const password = String(formData.get("password") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  try {
    const credentials = isPhoneIdentifier(identifier)
      ? { phone: identifier, password }
      : { email: identifier, password };

    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      redirect(
        `/login?error=${encodeURIComponent(
          normalizeAuthError(error, "Unable to sign in right now. Please try again.")
        )}`
      );
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?error=Unable to confirm this admin session right now.");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      redirect("/login?error=Only admins can sign in here. Users can open the app directly without logging in.");
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      `/login?error=${encodeURIComponent(
        normalizeAuthError(error, "Unable to sign in right now. Please try again.")
      )}`
    );
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

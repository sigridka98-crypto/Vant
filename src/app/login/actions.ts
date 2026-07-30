"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { getBootstrapAdminEmails } from "@/lib/env";
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

function getNextPath(formData: FormData) {
  const next = String(formData.get("next") ?? "").trim();
  return next.startsWith("/") ? next : "/dashboard";
}

async function resolvePostAuthRedirect(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, fallback: string) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return fallback;
  }

  const adminEmails = getBootstrapAdminEmails();
  const isBootstrapAdmin = user.email ? adminEmails.includes(user.email.toLowerCase()) : false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (isBootstrapAdmin || profile?.role === "admin") {
    return "/admin";
  }

  return fallback;
}

export async function signIn(formData: FormData) {
  const identifier = normalizeAuthIdentifier(String(formData.get("identifier") ?? ""));
  const password = String(formData.get("password") ?? "").trim();
  const next = getNextPath(formData);
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
        )}&next=${encodeURIComponent(next)}`
      );
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      `/login?error=${encodeURIComponent(
        normalizeAuthError(error, "Unable to sign in right now. Please try again.")
      )}&next=${encodeURIComponent(next)}`
    );
  }

  redirect(await resolvePostAuthRedirect(supabase, next));
}

export async function signUp(formData: FormData) {
  const identifier = normalizeAuthIdentifier(String(formData.get("identifier") ?? ""));
  const password = String(formData.get("password") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const next = getNextPath(formData);
  const supabase = await createSupabaseServerClient();

  try {
    const credentials = isPhoneIdentifier(identifier)
      ? {
          phone: identifier,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        }
      : {
          email: identifier,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        };

    const { error } = await supabase.auth.signUp(credentials);

    if (error) {
      redirect(
        `/login?error=${encodeURIComponent(
          normalizeAuthError(error, "Unable to create your account right now. Please try again.")
        )}&next=${encodeURIComponent(next)}`
      );
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      `/login?error=${encodeURIComponent(
        normalizeAuthError(error, "Unable to create your account right now. Please try again.")
      )}&next=${encodeURIComponent(next)}`
    );
  }

  redirect(await resolvePostAuthRedirect(supabase, next));
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

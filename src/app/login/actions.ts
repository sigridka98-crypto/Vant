"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { isSupabaseServiceConfigured } from "@/lib/env";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient
} from "@/lib/supabase/server";

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

async function confirmUserEmailIfNeeded(email: string) {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY is not configured on the deployed app yet." };
  }

  const serviceSupabase = createSupabaseServiceClient();
  const { data, error } = await serviceSupabase.auth.admin.listUsers();

  if (error) {
    return {
      ok: false,
      message: normalizeAuthError(error, "Unable to inspect this account right now.")
    };
  }

  const existingUser = data.users.find(
    (item) => item.email?.toLowerCase() === email.toLowerCase()
  );

  if (!existingUser) {
    return {
      ok: false,
      message: "We could not find an account with that email address."
    };
  }

  const { error: updateError } = await serviceSupabase.auth.admin.updateUserById(
    existingUser.id,
    {
      email_confirm: true
    }
  );

  if (updateError) {
    return {
      ok: false,
      message: normalizeAuthError(updateError, "Unable to confirm this account yet.")
    };
  }

  return { ok: true, message: "" };
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  try {
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error && normalizeAuthError(error, "").toLowerCase().includes("email not confirmed")) {
      const confirmResult = await confirmUserEmailIfNeeded(email);

      if (!confirmResult.ok) {
        redirect(
          `/login?error=${encodeURIComponent(
            confirmResult.message || "This account still needs email confirmation before it can sign in."
          )}`
        );
      }

      const retry = await supabase.auth.signInWithPassword({
        email,
        password
      });
      error = retry.error;
    }

    if (error) {
      redirect(
        `/login?error=${encodeURIComponent(
          normalizeAuthError(error, "Unable to sign in right now. Please try again.")
        )}`
      );
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

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      redirect(
        `/login?error=${encodeURIComponent(
          normalizeAuthError(error, "Unable to create your account right now. Please try again.")
        )}`
      );
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      `/login?error=${encodeURIComponent(
        normalizeAuthError(error, "Unable to create your account right now. Please try again.")
      )}`
    );
  }

  redirect("/login?message=Account created successfully. You can sign in now.");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

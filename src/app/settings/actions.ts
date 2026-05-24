"use server";

import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateProfile(formData: FormData) {
  const auth = await getAuthContext();

  if (!auth.user?.id) {
    redirect("/login?message=Sign in to update your settings.");
  }

  const fullName = textValue(formData, "fullName");

  if (fullName.length < 2) {
    redirect("/settings?error=Please enter your full name.");
  }

  const supabase = await createSupabaseServerClient();

  const [{ error: profileError }, { error: userError }] = await Promise.all([
    supabase.from("profiles").update({ full_name: fullName }).eq("id", auth.user.id),
    supabase.auth.updateUser({
      data: {
        full_name: fullName
      }
    })
  ]);

  const errorMessage = profileError?.message || userError?.message;

  if (errorMessage) {
    redirect(`/settings?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/settings?message=Profile updated successfully.");
}

export async function updatePassword(formData: FormData) {
  const auth = await getAuthContext();

  if (!auth.user?.id) {
    redirect("/login?message=Sign in to update your password.");
  }

  const password = textValue(formData, "password");
  const confirmPassword = textValue(formData, "confirmPassword");

  if (password.length < 8) {
    redirect("/settings?error=Your new password must be at least 8 characters long.");
  }

  if (password !== confirmPassword) {
    redirect("/settings?error=The password confirmation does not match.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/settings?message=Password updated successfully.");
}

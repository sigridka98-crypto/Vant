"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ResetPasswordClientProps = {
  errorMessage?: string;
  successMessage?: string;
};

export function ResetPasswordClient({ errorMessage, successMessage }: ResetPasswordClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inlineError, setInlineError] = useState("");
  const [inlineMessage, setInlineMessage] = useState(successMessage ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecovery = async () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (data.session && hash.includes("type=recovery")) {
        setRecoveryReady(true);
        setInlineMessage("Recovery link confirmed. You can set your new password now.");
      }
    };

    checkRecovery();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session && window.location.hash.includes("type=recovery"))) {
        setRecoveryReady(true);
        setInlineError("");
        setInlineMessage("Recovery link confirmed. You can set your new password now.");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInlineError("");
    setInlineMessage("");

    if (password.length < 8) {
      setInlineError("Your new password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setInlineError("The password confirmation does not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setInlineError(error.message || "Unable to update your password right now.");
      return;
    }

    router.push("/login?message=Password updated successfully. Sign in with your new password.");
    router.refresh();
  }

  return (
    <section className="space-y-5">
      {errorMessage ? (
        <div className="vant-card rounded-2xl border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">
          {errorMessage}
        </div>
      ) : null}
      {inlineError ? (
        <div className="vant-card rounded-2xl border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">
          {inlineError}
        </div>
      ) : null}
      {inlineMessage ? (
        <div className="vant-card rounded-2xl border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-100">
          {inlineMessage}
        </div>
      ) : null}

      <section className="vant-card rounded-[28px] p-6">
        <p className="text-sm font-semibold text-text-main">Reset your password</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {recoveryReady
            ? "Choose a new password for your account below."
            : "Open the password reset link from your email. Once the recovery link is confirmed, the password form will unlock here automatically."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-text-secondary">New password</span>
            <input
              type="password"
              className="vant-input"
              placeholder="At least 8 characters"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!recoveryReady || submitting}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text-secondary">Confirm new password</span>
            <input
              type="password"
              className="vant-input"
              placeholder="Repeat the new password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={!recoveryReady || submitting}
              required
            />
          </label>

          <button type="submit" className="vant-btn w-full" disabled={!recoveryReady || submitting}>
            {submitting ? "Updating password..." : "Save new password"}
          </button>
        </form>
      </section>
    </section>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, Mail, ShieldCheck, User2, Wallet2 } from "lucide-react";

import { signOut } from "@/app/login/actions";
import { ThemeToggleCard } from "@/components/layout/theme-toggle-card";
import { updatePassword, updateProfile } from "@/app/settings/actions";
import { getAuthContext } from "@/lib/auth";
import { getWalletPageData } from "@/lib/supabase/queries";

type SettingsPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const [auth, walletSummary] = await Promise.all([getAuthContext(), getWalletPageData()]);
  const { isConfigured, user, profile } = auth;

  if (isConfigured && !user) {
    redirect("/login?message=Sign in to manage your account settings.");
  }

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "GetUpdated user";
  const email = user?.email ?? "No email available";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="vant-glass rounded-[36px] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Settings</p>
        <h1 className="mt-4 text-4xl font-semibold text-text-main">Manage your GetUpdated account</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-text-secondary">
          Keep your profile details current, review your wallet status, and protect your account with a stronger password.
        </p>
      </section>

      {params.error ? (
        <section className="vant-card rounded-[28px] border-rose-300/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
          {params.error}
        </section>
      ) : null}

      {params.message ? (
        <section className="vant-card rounded-[28px] border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
          {params.message}
        </section>
      ) : null}

      {!isConfigured ? (
        <section className="vant-card rounded-[32px] p-8">
          <p className="text-lg font-medium text-text-main">Supabase is not connected in this environment.</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Settings become fully interactive when authentication is connected. Your dashboard and content flows can still be tested, but account management is disabled in local-only mode.
          </p>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="vant-card rounded-[32px] p-8">
            <div className="flex items-center gap-3">
              <span className="vant-glass rounded-2xl p-3 text-primary">
                <User2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-main">Profile details</p>
                <p className="text-xs text-text-secondary">Update the name shown across your learning dashboard.</p>
              </div>
            </div>

            <form action={updateProfile} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Full name</span>
                <input
                  name="fullName"
                  defaultValue={profile?.fullName ?? ""}
                  className="vant-input"
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Email address</span>
                <div className="vant-card flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-text-secondary">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{email}</span>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Your email is managed by your authentication account and is shown here for reference.
                </p>
              </label>

              <button type="submit" className="vant-btn">
                Save profile changes
              </button>
            </form>
          </section>

          <section className="vant-card rounded-[32px] p-8">
            <div className="flex items-center gap-3">
              <span className="vant-glass rounded-2xl p-3 text-fuchsia-100">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-main">Security</p>
                <p className="text-xs text-text-secondary">Set a new password for your login account.</p>
              </div>
            </div>

            <form action={updatePassword} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">New password</span>
                <input
                  name="password"
                  type="password"
                  className="vant-input"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Confirm new password</span>
                <input
                  name="confirmPassword"
                  type="password"
                  className="vant-input"
                  placeholder="Repeat the new password"
                  minLength={8}
                  required
                />
              </label>

              <button type="submit" className="vant-btn-secondary">
                Update password
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <ThemeToggleCard />

          <section className="vant-card rounded-[32px] bg-primary/10 p-8">
            <div className="flex items-center gap-3">
              <span className="vant-glass rounded-2xl p-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-main">Account summary</p>
                <p className="text-xs text-text-secondary">A quick view of your current GetUpdated account status.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="vant-card rounded-[24px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Display name</p>
                <p className="mt-2 text-lg font-medium text-text-main">{displayName}</p>
              </div>
              <div className="vant-card rounded-[24px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Account role</p>
                <p className="mt-2 text-lg font-medium capitalize text-text-main">{profile?.role ?? "user"}</p>
              </div>
              <div className="vant-card rounded-[24px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Wallet balance</p>
                <p className="mt-2 text-lg font-medium text-text-main">{walletSummary.balance} coins</p>
              </div>
            </div>
          </section>

          <section className="vant-card rounded-[32px] p-8">
            <div className="flex items-center gap-3">
              <span className="vant-glass rounded-2xl p-3 text-cyan-100">
                <Wallet2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-main">Wallet and access</p>
                <p className="text-xs text-text-secondary">Top up more coins or continue learning from your library.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Link href="/wallet" className="vant-btn inline-flex items-center justify-center">
                Manage wallet
              </Link>
              <Link href="/dashboard" className="vant-btn-secondary inline-flex items-center justify-center">
                Back to dashboard
              </Link>
            </div>
          </section>

          <section className="vant-card rounded-[32px] border-rose-300/15 bg-rose-400/5 p-8">
            <p className="text-sm font-semibold text-text-main">Session actions</p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              If you are using a shared device, sign out after updating your settings.
            </p>

            <form action={signOut} className="mt-6">
              <button type="submit" className="vant-btn-secondary text-sm text-rose-100">
                Sign out of this account
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

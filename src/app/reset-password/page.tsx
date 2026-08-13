import Link from "next/link";

import { requestPasswordReset } from "@/app/login/actions";
import { ResetPasswordClient } from "@/components/auth/reset-password-client";

type ResetPasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const errorMessage = params.error?.trim();
  const successMessage = params.message?.trim();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl items-center px-6 py-10">
      <section className="vant-glass grid w-full gap-8 rounded-[36px] p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Password recovery</p>
          <h1 className="mt-4 text-4xl font-semibold text-text-main">Reset your password safely</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
            Request a secure reset link for your email account, then choose a new password on this same page after the recovery link opens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="vant-btn-secondary">
              Back to sign in
            </Link>
            <Link href="/" className="vant-btn">
              Back home
            </Link>
          </div>

          <form action={requestPasswordReset} className="vant-card mt-8 rounded-[28px] p-6">
            <p className="text-sm font-semibold text-text-main">Send a reset link</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Enter the email address linked to your account and we will send the recovery link there.
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm text-text-secondary">Email address</span>
              <input name="identifier" type="email" className="vant-input" placeholder="you@example.com" required />
            </label>
            <button type="submit" className="vant-btn mt-5 w-full">
              Email reset link
            </button>
          </form>
        </div>

        <ResetPasswordClient errorMessage={errorMessage} successMessage={successMessage} />
      </section>
    </main>
  );
}

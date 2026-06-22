import { redirect } from "next/navigation";

import { signIn, signUp } from "@/app/login/actions";
import { getAuthContext } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, auth] = await Promise.all([searchParams, getAuthContext()]);
  const errorMessage = params.error?.trim();
  const successMessage = params.message?.trim();

  if (auth.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl items-center px-6 py-10">
      <section className="vant-glass grid w-full gap-8 rounded-[36px] p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Authentication</p>
          <h1 className="mt-4 text-4xl font-semibold text-text-main">Sign in or create your account</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
            Access your update dashboard, wallet, alerts, and saved cards with your email and password.
          </p>
        </div>

        <div className="space-y-5">
          {errorMessage ? (
            <div className="vant-card rounded-2xl border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">
              {errorMessage}
            </div>
          ) : null}
          {successMessage ? (
            <div className="vant-card rounded-2xl border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-100">
              {successMessage}
            </div>
          ) : null}

          <form action={signIn} className="vant-card rounded-[28px] p-6">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Email</span>
                <input name="email" type="email" className="vant-input" placeholder="you@example.com" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Password</span>
                <input name="password" type="password" className="vant-input" placeholder="Enter your password" required />
              </label>
            </div>

            <button type="submit" className="vant-btn mt-6 w-full">
              Sign in
            </button>
          </form>

          <form action={signUp} className="vant-card rounded-[28px] p-6">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Full name</span>
                <input name="fullName" type="text" className="vant-input" placeholder="Your name" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Email</span>
                <input name="email" type="email" className="vant-input" placeholder="you@example.com" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Password</span>
                <input
                  name="password"
                  type="password"
                  className="vant-input"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </label>
            </div>

            <button type="submit" className="vant-btn-secondary mt-6 w-full">
              Create account
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

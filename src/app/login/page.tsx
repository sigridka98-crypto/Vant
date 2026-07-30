import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/login/actions";
import { getAuthContext } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, auth] = await Promise.all([searchParams, getAuthContext()]);
  const errorMessage = params.error?.trim();
  const successMessage = params.message?.trim();

  if (auth.user && auth.profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-5xl items-center px-6 py-10">
      <section className="vant-glass grid w-full gap-8 rounded-[36px] p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Admin access</p>
          <h1 className="mt-4 text-4xl font-semibold text-text-main">Only admins sign in here</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
            Regular users do not need an account to open GetUpdated right now. This page is only for admins who manage templates, pricing, and publishing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="vant-btn">
              Open app
            </Link>
            <Link href="/" className="vant-btn-secondary">
              Back home
            </Link>
          </div>
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
                <span className="mb-2 block text-sm text-text-secondary">Admin email or phone number</span>
                <input
                  name="identifier"
                  type="text"
                  className="vant-input"
                  placeholder="admin@example.com or +2348012345678"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-text-secondary">Password</span>
                <input name="password" type="password" className="vant-input" placeholder="Enter admin password" required />
              </label>
            </div>

            <button type="submit" className="vant-btn mt-6 w-full">
              Open admin panel
            </button>
            <p className="mt-3 text-xs leading-6 text-text-secondary">
              If you are not an admin, go back and open the app directly. User browsing does not require login.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

import { ArrowRight, Coins, DatabaseZap, Gem, History, Wallet } from "lucide-react";

import { resetLocalDemoState } from "@/app/local/actions";
import { PaystackCheckoutButton } from "@/components/payments/paystack-checkout-button";
import { getAuthContext } from "@/lib/auth";
import { getWalletPageData } from "@/lib/supabase/queries";

export default async function WalletPage() {
  const [{ user }, walletSummary] = await Promise.all([getAuthContext(), getWalletPageData()]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="vant-card rounded-[32px] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Wallet</p>
          <div className="mt-6 flex items-center gap-4">
            <span className="vant-glass rounded-2xl p-4 text-primary">
              <Coins className="h-6 w-6" />
            </span>
            <div>
              <p className="text-5xl font-semibold text-text-main">{walletSummary.balance}</p>
              <p className="mt-2 text-sm text-text-secondary">Available coins</p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-6 text-text-secondary">
            {walletSummary.isConfigured
                ? user
                ? "Your wallet is now reading from Supabase, and users can top up coins through Paystack card payments."
                : "Sign in to see your real wallet balance and transaction history."
              : "Connect Supabase to activate live wallet balances and transaction history."}
          </p>
          {!walletSummary.isConfigured ? (
            <div className="vant-card mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-primary">
              <DatabaseZap className="h-4 w-4" />
              Wallet is using local fallback cookies
            </div>
          ) : null}
        </div>

        <div className="vant-card rounded-[32px] p-8">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold text-text-main">Buy coins with Paystack</h1>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
            The main top-up pack gives users 50 coins for NGN 3,125 through Paystack. Each locked card deducts its own admin-set coin price from the wallet until the user needs another card payment top-up.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {walletSummary.bundles.map((bundle) => (
              <article
                key={bundle.id}
                className="vant-card vant-card-hover rounded-[28px] p-5"
              >
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-semibold text-text-main">{bundle.coins}</p>
                </div>
                <p className="mt-1 text-sm text-text-secondary">coins</p>
                <div className="vant-card mt-4 inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs text-primary">
                  <Gem className="h-3.5 w-3.5" />+{bundle.diamondsBonus ?? 0} diamonds visual bonus
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-fuchsia-300/12 bg-fuchsia-400/8 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/80">Paystack</p>
                    <p className="mt-2 text-lg font-medium text-fuchsia-100">{bundle.paystackPriceLabel}</p>
                    <p className="mt-1 text-xs text-text-secondary">Card payments through Paystack</p>
                  </div>
                  <PaystackCheckoutButton
                    flow="wallet"
                    bundleId={bundle.id}
                    label="Pay with card"
                    className="vant-btn w-full text-sm"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div id="top-up-pack" className="vant-card rounded-[32px] bg-primary/10 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Coin access pack</p>
          <h2 className="mt-3 text-3xl font-semibold text-text-main">{walletSummary.pack.name}</h2>
          <p className="mt-4 text-sm leading-7 text-text-secondary">{walletSummary.pack.description}</p>
          <p className="mt-5 text-4xl font-semibold text-text-main">
            {walletSummary.pack.priceLabel}
            <span className="ml-2 text-lg font-medium text-primary/80">{walletSummary.pack.billingLabel}</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a href="#top-up-pack" className="vant-btn inline-flex items-center gap-2">
              Buy coins now
              <ArrowRight className="h-4 w-4" />
            </a>
            {!walletSummary.isConfigured ? (
              <form action={resetLocalDemoState}>
                <button type="submit" className="vant-btn-secondary text-sm">
                  Reset local wallet state
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      <section className="vant-card rounded-[32px] p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-text-secondary" />
            <h2 className="text-2xl font-semibold text-text-main">Recent wallet activity</h2>
          </div>
          <span className="vant-card inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-primary">
            <Gem className="h-4 w-4" />
            Premium card prices deduct real coins from the wallet
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {!walletSummary.transactions.length ? (
            <div className="vant-card rounded-2xl border-dashed px-5 py-6">
              <p className="font-medium text-text-main">No wallet activity yet.</p>
              <p className="mt-2 text-sm text-text-secondary">
                Coin top-ups and unlock deductions will appear here once the user starts using the platform.
              </p>
            </div>
          ) : null}
          {walletSummary.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="vant-card flex flex-col gap-3 rounded-2xl px-5 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-text-main">{transaction.label}</p>
                <p className="mt-1 text-sm text-text-secondary">{transaction.date}</p>
              </div>
              <p className="text-lg font-semibold text-primary">{transaction.amount}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

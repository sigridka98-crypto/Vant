import { Coins, DatabaseZap, Gem, History, KeyRound } from "lucide-react";

import { redeemPurchaseCode } from "@/app/wallet/actions";
import { getAuthContext } from "@/lib/auth";
import { getWalletPageData } from "@/lib/supabase/queries";
import { MAX_WALLET_COINS } from "@/lib/wallet-config";

type WalletPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function WalletPage({ searchParams }: WalletPageProps) {
  const params = await searchParams;
  const [{ user }, walletSummary] = await Promise.all([getAuthContext(), getWalletPageData()]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      {params.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {params.error}
        </div>
      ) : null}
      {params.message ? (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-300">
          {params.message}
        </div>
      ) : null}

      <section className="vant-card rounded-[32px] border-primary/20 bg-primary/5 p-8">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-primary/10 p-3 text-primary"><KeyRound className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Partner purchase</p>
            <h1 className="mt-2 text-2xl font-semibold text-text-main">Redeem your 100-coin purchase code</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Enter the single-use code supplied after your external purchase. Codes can be redeemed only when your wallet balance is zero.
            </p>
          </div>
        </div>

        {user ? (
          <form action={redeemPurchaseCode} className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input name="purchaseCode" className="vant-input font-mono uppercase sm:flex-1" placeholder="GU-482913-K7P2" autoComplete="off" maxLength={32} required />
            <button type="submit" disabled={walletSummary.balance !== 0} className="vant-btn whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50">
              Redeem 100 coins
            </button>
          </form>
        ) : (
          <a href="/login?message=Sign in before redeeming your purchase code." className="vant-btn mt-6 inline-flex">Sign in to redeem</a>
        )}

        {user && walletSummary.balance !== 0 ? (
          <p className="mt-3 text-sm text-amber-300">
            Your balance is {walletSummary.balance} coins. Spend the remaining coins first; your unused code will remain valid.
          </p>
        ) : null}
      </section>

      <section>
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
                ? "Your wallet is connected to Supabase. Redeem a valid purchase code whenever your balance reaches zero."
                : "Sign in to see your real wallet balance and transaction history."
              : "Connect Supabase to activate live wallet balances and transaction history."}
          </p>
          <div className="vant-card mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-primary">
            <Coins className="h-4 w-4" />
            Wallet limit: {MAX_WALLET_COINS} coins
          </div>
          {!walletSummary.isConfigured ? (
            <div className="vant-card mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-primary">
              <DatabaseZap className="h-4 w-4" />
              Wallet is using local fallback cookies
            </div>
          ) : null}
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

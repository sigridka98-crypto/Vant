import Link from "next/link";
import { Coins, Gem, LockKeyhole, RefreshCw } from "lucide-react";

import { unlockCardAccess } from "@/app/cards/actions";
import { PaystackCheckoutButton } from "@/components/payments/paystack-checkout-button";
import { formatCredits } from "@/lib/utils";

type LockedUnlockPanelProps = {
  cardId: string;
  slug: string;
  title: string;
  version: number;
  creditCost: number;
  reUnlockCost: number | null;
};

export function LockedUnlockPanel({
  cardId,
  slug,
  title,
  version,
  creditCost,
  reUnlockCost
}: LockedUnlockPanelProps) {
  return (
    <section className="vant-card rounded-[34px] bg-fuchsia-400/10 p-8">
      <div className="flex items-start gap-4">
        <span className="vant-glass mt-1 rounded-2xl p-3 text-fuchsia-100">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <div className="w-full">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-100">
            Locked premium card
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-text-main">
            {title} needs a diamond unlock before the full lesson opens
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
            The public preview stays visible, but the full breakdown stays protected until the user
            unlocks the current version with enough coins in the wallet.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="vant-card rounded-[28px] bg-bg-secondary/70 p-5">
              <div className="flex items-center gap-2 text-fuchsia-100">
                <Gem className="h-5 w-5" />
                <p className="font-medium">Standard unlock</p>
              </div>
              <p className="mt-4 text-3xl font-semibold text-text-main">{formatCredits(creditCost)}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Spend your premium value to unlock this lesson permanently for the current version.
              </p>
            </div>

            <div className="vant-card rounded-[28px] bg-bg-secondary/70 p-5">
              <div className="flex items-center gap-2 text-amber-100">
                <RefreshCw className="h-5 w-5" />
                <p className="font-medium">Major update refresh</p>
              </div>
              <p className="mt-4 text-3xl font-semibold text-text-main">
                {reUnlockCost !== null ? formatCredits(reUnlockCost) : "No refresh set"}
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                When the admin publishes a major update, returning users can refresh access at a reduced diamond cost.
              </p>
            </div>

            <div className="vant-card rounded-[28px] bg-bg-secondary/70 p-5">
              <div className="flex items-center gap-2 text-cyan-100">
                <Coins className="h-5 w-5" />
                <p className="font-medium">50 coin top-up pack</p>
              </div>
              <p className="mt-4 text-3xl font-semibold text-text-main">NGN 3,125</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Buy 50 coins, then unlock admin-priced cards one by one until your wallet runs low.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <form action={unlockCardAccess}>
              <input type="hidden" name="cardId" value={cardId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="version" value={String(version)} />
              <input type="hidden" name="cost" value={String(creditCost)} />
              <button type="submit" className="vant-btn bg-none">
                Unlock now with {formatCredits(creditCost)}
              </button>
            </form>
            <PaystackCheckoutButton
              flow="wallet"
              bundleId="bundle-50"
              label="Buy 50 coins with Paystack"
              className="vant-btn"
            />
            <Link href="/wallet" className="vant-btn-secondary inline-flex items-center gap-2">
              <Coins className="h-4 w-4" />
              View wallet balance
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

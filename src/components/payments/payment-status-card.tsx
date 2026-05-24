import Link from "next/link";
import { CheckCircle2, Coins, Gem, XCircle } from "lucide-react";

type PaymentStatusCardProps = {
  variant: "success" | "cancel";
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function PaymentStatusCard({
  variant,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}: PaymentStatusCardProps) {
  const isSuccess = variant === "success";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-4xl items-center px-6 py-10">
      <section
        className={`w-full rounded-[36px] border p-8 md:p-10 ${
          isSuccess
            ? "border-emerald-300/15 bg-emerald-400/10"
            : "border-rose-300/15 bg-rose-400/10"
        }`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <span
              className={`rounded-3xl p-4 ${
                isSuccess ? "bg-emerald-300/12 text-emerald-100" : "bg-rose-300/12 text-rose-100"
              }`}
            >
              {isSuccess ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                {isSuccess ? "Payment complete" : "Payment cancelled"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-white">{title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/82">{description}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/65 p-6">
              <div className="flex items-center gap-3 text-amber-100">
                <Coins className="h-5 w-5" />
                <p className="font-medium">Coins fund your wallet</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Use coins for normal wallet balance and top-ups through Paystack bundles.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/65 p-6">
              <div className="flex items-center gap-3 text-fuchsia-100">
                <Gem className="h-5 w-5" />
                <p className="font-medium">Diamonds unlock premium cards</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Premium lessons and major version refreshes are shown as diamond-value unlocks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={primaryHref}
              className="rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

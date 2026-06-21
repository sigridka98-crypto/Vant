import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Coins,
  Gem,
  PlayCircle,
  Shield,
  Sparkles,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import { getPublishedCards } from "@/lib/supabase/queries";

const valueCards = [
  {
    title: "Learn how updates work",
    description: "Study real update patterns through short educational cards that explain the setup and trap clearly.",
    icon: BookOpen
  },
  {
    title: "See what is changing",
    description: "Follow the urgency, impersonation, payment pressure, and trust patterns that keep showing up across new updates.",
    icon: TriangleAlert
  },
  {
    title: "Stay current earlier",
    description: "Build better awareness habits early, instead of trying to catch up only after something goes wrong.",
    icon: Shield
  }
];

const navItems = ["Home", "Explore Updates", "How It Works", "Pricing", "About GetUpdated", "Blog"];

function PhoneMockupLeft() {
  return (
    <div className="relative z-10 w-[260px] rotate-[-8deg] rounded-[40px] border border-white/15 bg-slate-950/95 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
      <div className="rounded-[30px] border border-white/8 bg-[#09101b] p-4">
        <div className="mb-4 flex items-center justify-between text-[10px] text-slate-400">
          <span>9:41</span>
          <span>GetUpdated</span>
        </div>
        <p className="text-xl font-semibold text-white">Stay informed.</p>
        <p className="mt-1 text-xs text-slate-400">Study update patterns before they reach you.</p>

        <div className="mt-5 rounded-[24px] bg-gradient-to-br from-emerald-400/25 to-cyan-400/20 p-4">
          <p className="text-xs text-emerald-50/80">Coin Balance</p>
          <p className="mt-2 text-3xl font-semibold text-white">120</p>
          <button className="mt-3 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-950">
            Buy Coins
          </button>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-white">Continue Learning</p>
          <div className="mt-3 rounded-2xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Fake Job Offer Update</p>
                <p className="text-xs text-slate-400">50% complete</p>
              </div>
              <Shield className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-white">Free Lessons (5/5)</p>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            {["Prize Update", "Lottery Update", "Fake Job Offer", "Phishing Email", "Social Media Update"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                <span>{item}</span>
                <span className="text-emerald-300">✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockupRight() {
  return (
    <div className="relative z-20 -ml-6 mt-10 w-[260px] rotate-[8deg] rounded-[40px] border border-white/15 bg-slate-950/95 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
      <div className="rounded-[30px] border border-white/8 bg-[#09101b] p-4">
        <div className="mb-4 flex items-center justify-between text-[10px] text-slate-400">
          <span>9:41</span>
          <span>Update Details</span>
        </div>

        <span className="inline-flex rounded-full bg-fuchsia-400/15 px-3 py-1 text-[10px] font-semibold text-fuchsia-100">
          Job Update
        </span>
        <h3 className="mt-4 text-2xl font-semibold text-white">Fake Job Offer Update</h3>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Attackers pretend to offer jobs and then ask for money or sensitive details before any real work begins.
        </p>

        <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">How It Works</p>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            {[
              "You receive a job offer",
              "They seem legitimate",
              "They ask for payment",
              "They disappear"
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-[10px] text-emerald-200">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-rose-300/12 bg-rose-400/8 p-4">
          <p className="text-sm font-medium text-rose-100">Red Flags</p>
          <div className="mt-3 space-y-2 text-xs text-rose-50/90">
            {[
              "Asks for money upfront",
              "Too good to be true",
              "Poor grammar or spelling",
              "No official contact"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <TriangleAlert className="h-3.5 w-3.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950">
          <Gem className="h-4 w-4" />
          Unlock for 15 Credits
        </button>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const { cards } = await getPublishedCards();
  const publishedCount = cards.length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:py-10">
      <section className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white/95 px-8 py-8 shadow-[0_30px_100px_rgba(8,17,32,0.08)] md:px-10 lg:px-12 lg:py-10">
        <div className="absolute inset-x-1/2 top-[52%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-48 w-[65%] -translate-x-1/2 rounded-full border border-cyan-200/40 bg-[radial-gradient(circle,rgba(34,211,238,0.18),rgba(34,211,238,0.02)_55%,transparent_70%)] blur-sm" />

        <div className="relative z-20 flex flex-col gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
              <Shield className="h-6 w-6" />
            </span>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-slate-950">GetUpdated</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-600 lg:flex">
            {navItems.map((item, index) => (
              <span
                key={item}
                className={`relative cursor-default transition ${
                  index === 0 ? "text-slate-950" : "text-slate-600"
                }`}
              >
                {item}
                {index === 0 ? <span className="absolute -bottom-3 left-0 h-0.5 w-full rounded-full bg-emerald-300" /> : null}
              </span>
            ))}
          </nav>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative z-10">
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800">
              <Shield className="h-4 w-4" />
              Stay current. Stay informed.
            </span>

            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-slate-950 md:text-6xl xl:text-7xl">
              See the <span className="text-emerald-300">update</span>
              <br />
              before it
              <br />
              sees <span className="text-cyan-300">you.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              GetUpdated is an awareness app built to help people recognize online fraud before it succeeds.
              It teaches how updates work, highlights the repeated patterns people should notice, and explains everything through simple, structured learning cards.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500">
              Instead of confusing people with noise, GetUpdated organizes update education into clear lessons:
              title, description, how the update works, key signs to notice, safe examples, helpful response steps, and a quick memory rule.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 px-6 py-4 font-semibold text-slate-950 transition hover:brightness-110"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-4 font-medium text-slate-900 transition hover:bg-slate-100"
              >
                Buy 50 Coins
                <PlayCircle className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[0, 1, 2].map((item) => (
                    <span
                      key={item}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-sm font-semibold text-white"
                    >
                      V
                    </span>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-emerald-300">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Sparkles key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Built for practical update awareness at scale.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[650px] items-center justify-center">
            <PhoneMockupLeft />
            <PhoneMockupRight />
          </div>
        </div>
      </section>

      <section className="vant-glass grid gap-0 overflow-hidden rounded-[34px] bg-white/90 lg:grid-cols-3">
        {valueCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="border-b border-slate-200 p-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <span className="vant-glass inline-flex rounded-2xl p-3 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-text-main">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-text-secondary">{description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[34px] border border-slate-200 bg-white/90 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">What GetUpdated does</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-950">A simple update-learning app built for real awareness.</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              GetUpdated teaches update recognition through structured cards instead of long articles or scattered tips.
            </p>
            <p>
              Each card explains the update, shows the key signs to notice, and helps users understand how to respond clearly.
            </p>
            <p>
              New update cards can keep being added as online threats evolve, so the app stays useful over time.
            </p>
          </div>
        </div>

        <div className="rounded-[34px] border border-fuchsia-200 bg-white/90 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Quick summary</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Published update cards</p>
              <p className="mt-2 text-4xl font-semibold text-emerald-300">{publishedCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Free learning path</p>
              <p className="mt-2 text-lg leading-7 text-slate-600">
                Users begin with free cards, then unlock deeper premium cards with coins.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Top-up model</p>
              <p className="mt-2 text-lg leading-7 text-slate-600">
                One Paystack card payment adds coins that users spend across locked update cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-emerald-300/15 bg-gradient-to-r from-[#0b1b1b] to-[#0a1320] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.3)] md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-semibold text-white md:text-5xl">Ready to stay updated?</h2>
            <p className="mt-4 text-lg leading-8 text-slate-100">
              Start with the free lessons, understand how new online patterns unfold, and use GetUpdated to stay informed as more updates appear.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 px-8 py-4 text-lg font-semibold text-slate-950 transition hover:brightness-110"
          >
            Start Free Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

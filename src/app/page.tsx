import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Gem,
  PlayCircle,
  Shield,
  Sparkles,
  TriangleAlert,
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

const navItems = ["Home", "Explore Updates", "How It Works", "Pricing", "About GetUpdated"];

function PhoneMockupLeft() {
  return (
    <div className="relative z-10 w-[260px] rotate-[-8deg] rounded-[40px] border border-[#1F3B60] bg-[#0A1830] p-3 shadow-lg shadow-black/30">
      <div className="rounded-[30px] border border-[#2C537F] bg-[#0F203C] p-4">
        <div className="mb-4 flex items-center justify-between text-[10px] text-[#AFC4DE]">
          <span>9:41</span>
          <span>GetUpdated</span>
        </div>
        <p className="text-xl font-semibold text-[#FFFFFF]">Stay informed.</p>
        <p className="mt-1 text-xs text-[#E7F3FF]">Study update patterns before they reach you.</p>

        <div className="mt-5 rounded-[24px] border border-[#1EF2C3]/20 bg-[#1EF2C3]/10 p-4">
          <p className="text-xs text-[#C8FFF0]">Coin Balance</p>
          <p className="mt-2 text-3xl font-semibold text-[#FFFFFF]">100</p>
          <button className="mt-3 rounded-full bg-[#1EF2C3] px-4 py-2 text-xs font-semibold text-[#041311]">
            Buy Coins
          </button>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-[#FFFFFF]">Continue Learning</p>
          <div className="mt-3 rounded-2xl border border-[#1F3B60] bg-[#0B1930] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#FFFFFF]">Fake Job Offer Update</p>
                <p className="text-xs text-[#AFC4DE]">50% complete</p>
              </div>
              <Shield className="h-5 w-5 text-[#1EF2C3]" />
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#173960]">
              <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-[#1EF2C3] to-[#53F7D5]" />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-[#FFFFFF]">Free Lessons (5/5)</p>
          <div className="mt-3 space-y-2 text-xs text-[#E7F3FF]">
            {["Prize Update", "Lottery Update", "Fake Job Offer", "Phishing Email", "Social Media Update"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-[#1F3B60] bg-[#0B1930] px-3 py-2">
                <span>{item}</span>
                <span className="text-[#1EF2C3]">?</span>
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
    <div className="relative z-20 -ml-6 mt-10 w-[260px] rotate-[8deg] rounded-[40px] border border-[#1F3B60] bg-[#0A1830] p-3 shadow-lg shadow-black/30">
      <div className="rounded-[30px] border border-[#2C537F] bg-[#0F203C] p-4">
        <div className="mb-4 flex items-center justify-between text-[10px] text-[#AFC4DE]">
          <span>9:41</span>
          <span>Update Details</span>
        </div>

        <span className="inline-flex rounded-full border border-[#1EF2C3]/20 bg-[#1EF2C3]/10 px-3 py-1 text-[10px] font-semibold text-[#C8FFF0]">
          Job Update
        </span>
        <h3 className="mt-4 text-2xl font-semibold text-[#FFFFFF]">Fake Job Offer Update</h3>
        <p className="mt-3 text-xs leading-5 text-[#E7F3FF]">
          Attackers pretend to offer jobs and then ask for money or sensitive details before any real work begins.
        </p>

        <div className="mt-5 rounded-2xl border border-[#1F3B60] bg-[#0B1930] p-4">
          <p className="text-sm font-medium text-[#FFFFFF]">How It Works</p>
          <div className="mt-3 space-y-2 text-xs text-[#E7F3FF]">
            {[
              "You receive a job offer",
              "They seem legitimate",
              "They ask for payment",
              "They disappear"
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1EF2C3]/10 text-[10px] text-[#C8FFF0]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-300">Red Flags</p>
          <div className="mt-3 space-y-2 text-xs text-amber-100">
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

        <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1EF2C3] px-4 py-3 text-sm font-semibold text-[#041311] hover:bg-[#53F7D5]">
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
      <section className="relative overflow-hidden rounded-[40px] border border-[#1F3B60] bg-[#0A1830] px-8 py-8 shadow-lg shadow-black/20 md:px-10 lg:px-12 lg:py-10">
        <div className="absolute inset-x-1/2 top-[52%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1EF2C3]/10 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-48 w-[65%] -translate-x-1/2 rounded-full border border-[#1EF2C3]/10 bg-[radial-gradient(circle,rgba(0,224,155,0.16),rgba(0,191,166,0.03)_55%,transparent_70%)] blur-sm" />

        <div className="relative z-20 flex flex-col gap-5 border-b border-[#1F3B60] pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1EF2C3]/20 bg-[#1EF2C3]/10 text-[#1EF2C3]">
              <Shield className="h-6 w-6" />
            </span>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-[#FFFFFF]">GetUpdated</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-[#E7F3FF] lg:flex">
            {navItems.map((item, index) => (
              <span
                key={item}
                className={`relative cursor-default transition ${
                  index === 0 ? "text-[#FFFFFF]" : "text-[#E7F3FF]"
                }`}
              >
                {item}
                {index === 0 ? <span className="absolute -bottom-3 left-0 h-0.5 w-full rounded-full bg-[#53F7D5]" /> : null}
              </span>
            ))}
          </nav>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-[#1EF2C3] px-5 py-3 text-sm font-semibold text-[#041311] transition hover:bg-[#53F7D5]"
            >
              Open App
            </Link>
            <Link
              href="/wallet"
              className="rounded-2xl border border-[#2C537F] bg-[#0F203C] px-5 py-3 text-sm font-medium text-[#FFFFFF] transition hover:bg-[#133054]"
            >
              Buy Coins
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative z-10">
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#1EF2C3]/20 bg-[#1EF2C3]/10 px-4 py-2 text-sm font-medium text-[#C8FFF0]">
              <Shield className="h-4 w-4" />
              Stay current. Stay informed.
            </span>

            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-[#FFFFFF] md:text-6xl xl:text-7xl">
              See the <span className="text-[#1EF2C3]">update</span>
              <br />
              early before it
              <br />
              goes <span className="text-[#C8FFF0]">viral.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#E7F3FF]">
              GetUpdated is a clean learning app that helps people understand new online update patterns early, before they spread widely.
              It turns complex internet behavior into simple, structured cards people can read quickly and remember clearly.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#AFC4DE]">
              Instead of long scrolling pages, users get direct lessons with the core idea, warning signs, simple explanations, and practical steps that keep them updated.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#1EF2C3] px-6 py-4 font-semibold text-[#041311] transition hover:bg-[#53F7D5]"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-2 rounded-full border border-[#2C537F] bg-[#0F203C] px-6 py-4 font-medium text-[#FFFFFF] transition hover:bg-[#133054]"
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
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0A1830] bg-[#173960] text-sm font-semibold text-[#C8FFF0]"
                    >
                      V
                    </span>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[#1EF2C3]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Sparkles key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-[#E7F3FF]">Built for fast, practical update awareness.</p>
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

      <section className="vant-glass grid gap-0 overflow-hidden rounded-[34px] border border-[#1F3B60] bg-[#0A1830] lg:grid-cols-3">
        {valueCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="border-b border-[#1F3B60] p-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <span className="inline-flex rounded-2xl border border-[#1EF2C3]/20 bg-[#1EF2C3]/10 p-3 text-[#1EF2C3]">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-[#FFFFFF]">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[#E7F3FF]">{description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[34px] border border-[#1F3B60] bg-[#0F203C] p-8 shadow-lg shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">What GetUpdated does</p>
          <h2 className="mt-4 text-4xl font-semibold text-[#FFFFFF]">A simple update-learning app built for real awareness.</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#E7F3FF]">
            <p>
              GetUpdated teaches update recognition through structured cards instead of long articles or scattered tips.
            </p>
            <p>
              Each card explains the update, shows the key signs to notice, and helps users understand how to respond clearly.
            </p>
            <p>
              New update cards can keep being added as online patterns evolve, so the app stays useful over time.
            </p>
          </div>
        </div>

        <div className="rounded-[34px] border border-[#1F3B60] bg-[#0F203C] p-8 shadow-lg shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Quick summary</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#1F3B60] bg-[#0B1930] px-5 py-4">
              <p className="text-sm font-medium text-[#FFFFFF]">Published update cards</p>
              <p className="mt-2 text-4xl font-semibold text-[#1EF2C3]">{publishedCount}</p>
            </div>
            <div className="rounded-2xl border border-[#1F3B60] bg-[#0B1930] px-5 py-4">
              <p className="text-sm font-medium text-[#FFFFFF]">Free learning path</p>
              <p className="mt-2 text-lg leading-7 text-[#E7F3FF]">
                Users begin with free cards, then unlock deeper premium cards with coins.
              </p>
            </div>
            <div className="rounded-2xl border border-[#1F3B60] bg-[#0B1930] px-5 py-4">
              <p className="text-sm font-medium text-[#FFFFFF]">Top-up model</p>
              <p className="mt-2 text-lg leading-7 text-[#E7F3FF]">
                One Paystack card payment adds coins that users spend across locked update cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-[#1F3B60] bg-[#0A1830] p-8 shadow-lg shadow-black/20 md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-semibold text-[#FFFFFF] md:text-5xl">Ready to stay updated?</h2>
            <p className="mt-4 text-lg leading-8 text-[#E7F3FF]">
              Start with the free lessons, understand how new online patterns unfold, and use GetUpdated to stay informed as more updates appear.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1EF2C3] px-8 py-4 text-lg font-semibold text-[#041311] transition hover:bg-[#53F7D5]"
          >
            Start Free Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}




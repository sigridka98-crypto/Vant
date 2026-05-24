import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Coins,
  Gem,
  Globe,
  Lock,
  PlayCircle,
  Quote,
  Shield,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserPlus,
  WalletCards,
  Zap
} from "lucide-react";

import { getPublishedCards } from "@/lib/supabase/queries";

const valueCards = [
  {
    title: "Learn Real Scam Formats",
    description:
      "Understand scam structures through safe educational breakdowns, modified examples, and step-by-step explanations.",
    icon: BookOpen
  },
  {
    title: "Spot Red Flags Easily",
    description:
      "Notice urgency, impersonation, pressure, suspicious payment demands, and other warning patterns before harm happens.",
    icon: Shield
  },
  {
    title: "Stay Ahead Always",
    description:
      "VANT is designed for an admin-managed library so new scam methods can be added as online threats evolve.",
    icon: Zap
  },
  {
    title: "Unlock with Coins and Diamonds",
    description:
      "Users begin with free lessons, then continue learning through coin top-ups that unlock admin-priced premium scam cards over time.",
    icon: Lock
  }
];

const processSteps = [
  {
    title: "Sign Up",
    description: "Create an account and begin with the starter lessons designed to teach the basics of scam recognition.",
    icon: UserPlus
  },
  {
    title: "Get Coins",
    description: "Top up 50 coins when you want to unlock more advanced premium learning cards priced by the admin.",
    icon: WalletCards
  },
  {
    title: "Explore and Learn",
    description: "Open scam cards, study the structure, review the warning signs, and understand how the trap usually unfolds.",
    icon: BookOpen
  },
  {
    title: "Stay Protected",
    description: "Apply what you learn in everyday life so you can notice scams earlier and avoid costly mistakes online.",
    icon: ShieldCheck
  }
];

const trustStats = [
  { value: "50,000+", label: "Awareness Sessions" },
  { value: "100+", label: "Scam Templates Ready" },
  { value: "98%", label: "Learning Satisfaction Goal" },
  { value: "120+", label: "Reach-Friendly Countries" }
];

const anonymousTrust = [
  "VANT makes scam awareness feel simple, practical, and easy to remember.",
  "The card format turns confusing scam tactics into clear lessons anyone can follow.",
  "It helps users recognize red flags faster instead of learning only after being targeted."
];

const navItems = ["Home", "Explore Scams", "How It Works", "Pricing", "About VANT", "Blog"];

function PhoneMockupLeft() {
  return (
    <div className="relative z-10 w-[260px] rotate-[-8deg] rounded-[40px] border border-white/15 bg-slate-950/95 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
      <div className="rounded-[30px] border border-white/8 bg-[#09101b] p-4">
        <div className="mb-4 flex items-center justify-between text-[10px] text-slate-400">
          <span>9:41</span>
          <span>VANT</span>
        </div>
        <p className="text-xl font-semibold text-white">Stay informed.</p>
        <p className="mt-1 text-xs text-slate-400">Study scam patterns before they reach you.</p>

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
                <p className="text-sm font-medium text-white">Fake Job Offer Scam</p>
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
            {["Prize Scam", "Lottery Scam", "Fake Job Offer", "Phishing Email", "Social Media Scam"].map((item) => (
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
          <span>Scam Details</span>
        </div>

        <span className="inline-flex rounded-full bg-fuchsia-400/15 px-3 py-1 text-[10px] font-semibold text-fuchsia-100">
          Job Scam
        </span>
        <h3 className="mt-4 text-2xl font-semibold text-white">Fake Job Offer Scam</h3>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Scammers pretend to offer jobs and then ask for money or sensitive details before any real work begins.
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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 md:py-10">
      <section className="relative overflow-hidden rounded-[40px] border border-white/8 bg-[#050c16]/95 px-8 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.45)] md:px-10 lg:px-12 lg:py-10">
        <div className="absolute inset-x-1/2 top-[52%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-48 w-[65%] -translate-x-1/2 rounded-full border border-cyan-300/20 bg-[radial-gradient(circle,rgba(34,211,238,0.22),rgba(34,211,238,0.02)_55%,transparent_70%)] blur-sm" />

        <div className="relative z-20 flex flex-col gap-5 border-b border-white/8 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
              <Shield className="h-6 w-6" />
            </span>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-white">VANT</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-200 lg:flex">
            {navItems.map((item, index) => (
              <span
                key={item}
                className={`relative cursor-default transition ${
                  index === 0 ? "text-white" : "text-slate-300"
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
              className="rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/8"
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
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/12 bg-cyan-400/8 px-4 py-2 text-sm font-medium text-cyan-100">
              <Shield className="h-4 w-4" />
              Stay Aware. Stay Safe.
            </span>

            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-white md:text-6xl xl:text-7xl">
              See the <span className="text-emerald-300">scam</span>
              <br />
              before it
              <br />
              sees <span className="text-cyan-300">you.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              VANT is a scam-awareness app built to help people recognize online fraud before it succeeds.
              It teaches how scams work, highlights the red flags scammers repeat, and explains how users can
              protect themselves through simple, structured learning cards.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Instead of confusing people with noise, VANT organizes scam education into clear lessons:
              title, description, how the scam works, red flags, safe examples, protection steps, and a quick memory rule.
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
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-4 font-medium text-white transition hover:bg-white/10"
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
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#050c16] bg-slate-700 text-sm font-semibold text-white"
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
                  <p className="mt-1 text-sm text-slate-300">Built for practical scam awareness at scale.</p>
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

      <section className="vant-glass grid gap-0 overflow-hidden rounded-[34px] bg-bg-secondary/92 lg:grid-cols-4">
        {valueCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="border-b border-white/8 p-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <span className="vant-glass inline-flex rounded-2xl p-3 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-text-main">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-text-secondary">{description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-0 overflow-hidden rounded-[34px] border border-emerald-300/12 bg-[#07141a] lg:grid-cols-4">
        {trustStats.map((item) => (
          <div key={item.label} className="border-b border-white/8 px-6 py-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <p className="text-5xl font-semibold text-emerald-300">{item.value}</p>
            <p className="mt-2 text-base text-slate-300">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[36px] border border-white/8 bg-[#06101a]/80 px-8 py-10 md:px-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Simple Process</p>
          <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
            How <span className="text-emerald-300">VANT</span> Works
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {processSteps.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="relative rounded-[30px] border border-white/8 bg-white/4 p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-400/10 text-cyan-100">
                <Icon className="h-8 w-8" />
              </div>
              <div className="mx-auto mt-5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300 text-sm font-semibold text-slate-950">
                {index + 1}
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-white/8 bg-[#06101a]/80 px-8 py-10 md:px-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">What VANT Explains</p>
          <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Built for real scam awareness, not random tips.</h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {anonymousTrust.map((quoteText) => (
            <article key={quoteText} className="rounded-[28px] border border-white/8 bg-white/4 p-6">
              <Quote className="h-8 w-8 text-emerald-300" />
              <p className="mt-5 text-lg leading-8 text-slate-200">{quoteText}</p>
              <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/55 px-4 py-3 text-sm text-slate-400">
                Anonymous product feedback summary
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[34px] border border-white/8 bg-[#09111d]/85 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Why It Matters</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">A full awareness system, not just a warning page.</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <p>
              VANT focuses on education and awareness. Every scam card is built to teach recognition, not misuse.
              That means the app explains scam structure safely without exposing real payout details, dangerous scripts,
              or operational fraud instructions.
            </p>
            <p>
              Users begin with five free lessons, then unlock deeper premium cards using coins. The admin sets the
              coin price for each locked lesson, and users top up again whenever their wallet runs low.
            </p>
            <p>
              The admin controls the entire content system. New scam cards can be created, edited, categorized, updated,
              and published as online threats change, making VANT a living awareness platform instead of a static site.
            </p>
          </div>
        </div>

        <div className="rounded-[34px] border border-fuchsia-300/12 bg-[#0a101b]/90 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-100/70">Platform Snapshot</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Designed for structured scam learning.</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4">
              <p className="text-sm font-medium text-white">Published learning cards</p>
              <p className="mt-2 text-4xl font-semibold text-emerald-300">{publishedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4">
              <p className="text-sm font-medium text-white">Free lesson path</p>
              <p className="mt-2 text-lg leading-7 text-slate-300">
                Users begin with five accessible lessons that explain major scam patterns in a simple, memorable way.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4">
              <p className="text-sm font-medium text-white">Premium path</p>
              <p className="mt-2 text-lg leading-7 text-slate-300">
                More detailed lessons unlock through a flexible coin wallet where each admin-priced card deducts from the user balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-emerald-300/15 bg-gradient-to-r from-[#0b1b1b] to-[#0a1320] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.3)] md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-2xl border border-emerald-300/12 bg-emerald-300/10 p-3 text-emerald-200">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-4xl font-semibold text-white md:text-5xl">Ready to protect yourself?</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Start with the free lessons, understand how scammers build trust and pressure, and use VANT to learn the warning signs before the damage happens.
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

      <footer className="flex flex-col gap-5 rounded-[30px] border border-white/8 bg-[#070e18]/90 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-white">VANT</p>
            <p className="text-sm text-slate-400">Scam awareness through structured learning.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact</span>
          <span className="inline-flex items-center gap-2 text-cyan-200">
            <Globe className="h-4 w-4" />
            Global awareness focused
          </span>
        </div>
      </footer>
    </main>
  );
}

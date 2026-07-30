import Link from "next/link";
import { Bell, Coins, ShieldAlert } from "lucide-react";

import { signOut } from "@/app/login/actions";
import { getAuthContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocalAdminAccess } from "@/lib/local-user-state";
import { getPublishedCards, getWalletPageData } from "@/lib/supabase/queries";
import { isAlertCard } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Updates" },
  { href: "/alerts", label: "Alerts" },
  { href: "/wallet", label: "Wallet" },
  { href: "/settings", label: "Settings" }
];

export async function SiteHeader() {
  const [{ user, profile }, wallet, { cards }, localAdminAccess] = await Promise.all([
    getAuthContext(),
    getWalletPageData(),
    getPublishedCards(),
    isSupabaseConfigured() ? Promise.resolve(false) : getLocalAdminAccess()
  ]);
  const showAdminNav = profile?.role === "admin" || localAdminAccess;
  const alertCount = cards.filter((card) => isAlertCard(card) && !card.isAlertSeen).length;

  return (
    <header className="site-shell-header border-b border-white/10 bg-bg-primary/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-text-main">
          <span className="vant-glass flex h-11 w-11 items-center justify-center text-primary">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
              GetUpdated
            </p>
            <p className="font-semibold text-text-main">Stay informed early</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-text-secondary lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-text-main">
              {item.label}
            </Link>
          ))}
          {showAdminNav ? (
            <Link href="/admin" className="transition hover:text-text-main">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {showAdminNav ? (
            <Link
              href="/admin"
              className="vant-card vant-card-hover inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-text-main lg:hidden"
            >
              Admin
            </Link>
          ) : null}

          <Link
            href="/alerts"
            className="vant-card vant-card-hover inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-text-main"
          >
            <span className="relative inline-flex">
              <Bell className="h-4 w-4 text-primary" />
              {alertCount ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 text-[10px] font-semibold text-white">
                  {Math.min(alertCount, 9)}
                </span>
              ) : null}
            </span>
            <span className="hidden md:inline">Alerts</span>
          </Link>

          <Link
            href="/wallet"
            className="vant-card vant-card-hover inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-primary"
          >
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">{wallet.balance} coins</span>
            <span className="sm:hidden">Wallet</span>
          </Link>

          {user ? (
            <form action={signOut}>
              <button type="submit" className="vant-btn-secondary px-4 py-2 text-sm">
                Sign out
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="vant-btn px-4 py-2 text-sm">
                Open app
              </Link>
              <Link href="/login" className="vant-btn-secondary px-4 py-2 text-sm">
                Admin login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}



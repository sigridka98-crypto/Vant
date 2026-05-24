import { DashboardBrowser } from "@/components/cards/dashboard-browser";
import { getAuthContext } from "@/lib/auth";
import { getPublishedCards } from "@/lib/supabase/queries";
import { getWalletPageData } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const [{ cards, categories, isConfigured }, auth, wallet] = await Promise.all([
    getPublishedCards(),
    getAuthContext(),
    getWalletPageData()
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col px-4 py-4 md:px-6 md:py-6">
      <DashboardBrowser
        cards={cards}
        categories={categories}
        isConfigured={isConfigured}
        balance={wallet.balance}
        transactions={wallet.transactions}
        userName={auth.profile?.fullName || auth.user?.email?.split("@")[0] || "VANT User"}
        userEmail={auth.user?.email ?? "Protected account"}
      />
    </main>
  );
}

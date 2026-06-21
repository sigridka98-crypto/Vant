import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, DatabaseZap, Gem, PencilLine, Plus, Rocket, Trash2 } from "lucide-react";

import { createCard, deleteCard, togglePublishCard } from "@/app/admin/actions";
import { localAdminSignIn, localAdminSignOut } from "@/app/admin/local-actions";
import { resetLocalDemoState } from "@/app/local/actions";
import { CardForm } from "@/components/admin/card-form";
import { AdminLibraryBrowser } from "@/components/admin/library-browser";
import { getAuthContext } from "@/lib/auth";
import { buildCardReadiness } from "@/lib/admin-card-review";
import { getLocalAdminAccess } from "@/lib/local-user-state";
import { getAdminCardOverview, getAdminCards } from "@/lib/supabase/queries";

const adminTasks = [
  "Create update cards with the exact 7-field structure",
  "Edit title, description, safe example, and quick memory rule",
  "Manage red flags, update steps, and protection steps as ordered lists",
  "Set free or premium access, credit cost, and category",
  "Publish cards and mark updates as minor or major"
];

type AdminPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const auth = await getAuthContext();
  const { user, profile, isConfigured } = auth;
  const [overview, cardData, localAdminAccess] = await Promise.all([
    getAdminCardOverview(),
    getAdminCards(),
    isConfigured ? Promise.resolve(false) : getLocalAdminAccess()
  ]);
  const incompleteCards = cardData.cards.filter((card) => !buildCardReadiness(card).ready).length;
  const alertTaggedCards = cardData.cards.filter(
    (card) => card.isNewAlert || card.isTrendingAlert || card.isMostReported
  ).length;

  if (isConfigured && !user) {
    redirect("/login?message=Sign in to access the admin panel.");
  }

  if (!isConfigured && !localAdminAccess) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <section className="vant-glass rounded-[36px] p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Admin access</p>
          <h1 className="mt-4 text-4xl font-semibold text-text-main">This area is hidden from regular users.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary">
            In local mode, use your admin password to unlock the content studio. This keeps the admin area out of the normal user flow even before Supabase roles are connected.
          </p>

          {params.error ? (
            <div className="vant-card mt-6 rounded-[28px] border-rose-300/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
              {params.error}
            </div>
          ) : null}

          <form action={localAdminSignIn} className="vant-card mt-8 max-w-md rounded-[28px] p-6">
            <label className="block">
              <span className="mb-2 block text-sm text-text-secondary">Admin password</span>
              <input
                name="password"
                type="password"
                className="vant-input"
                placeholder="Enter admin password"
                required
              />
            </label>
            <button type="submit" className="vant-btn mt-5">
              Unlock admin
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (isConfigured && profile?.role !== "admin") {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <section className="vant-card rounded-[36px] border-rose-300/20 bg-rose-400/10 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-100">Access denied</p>
          <h1 className="mt-4 text-4xl font-semibold text-text-main">This route is reserved for admins.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary">
            Promote a user in the `profiles` table by setting their role to `admin`, then sign back in.
          </p>
          <Link href="/dashboard" className="vant-btn-secondary mt-6 inline-flex">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="vant-glass rounded-[36px] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Admin panel</p>
        <h1 className="mt-4 text-4xl font-semibold text-text-main">Admin-managed content for every update lesson</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-text-secondary">
          This admin route is now role-aware and ready for card CRUD. Create empty templates first, then fill each card with its update structure before publishing.
        </p>
        {!isConfigured ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="vant-card inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-primary">
              <DatabaseZap className="h-4 w-4" />
              Saving to local fallback storage
            </div>
            <form action={localAdminSignOut}>
              <button type="submit" className="vant-btn-secondary px-4 py-2 text-sm">
                Close admin mode
              </button>
            </form>
          </div>
        ) : null}
      </section>

      {params.error ? (
        <section className="vant-card rounded-[28px] border-rose-300/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
          {params.error}
        </section>
      ) : null}

      {params.message ? (
        <section className="vant-card rounded-[28px] border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
          {params.message}
        </section>
      ) : null}

      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="vant-card rounded-[30px] p-6">
          <h2 className="text-2xl font-semibold text-text-main">What this panel will control</h2>
          <div className="mt-6 space-y-4">
            {adminTasks.map((task) => (
              <div key={task} className="vant-card rounded-2xl bg-bg-secondary/70 px-4 py-4 text-sm leading-6 text-text-secondary">
                {task}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="vant-card rounded-[30px] bg-primary/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Template state</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-semibold text-text-main">{overview.totalCards}</p>
                <p className="mt-1 text-sm text-text-secondary">Templates created</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-text-main">{overview.publishedCards}</p>
                <p className="mt-1 text-sm text-text-secondary">Published</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-text-main">{overview.draftCards}</p>
                <p className="mt-1 text-sm text-text-secondary">Drafts</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-300/12 bg-amber-300/8 px-4 py-4">
                <p className="text-2xl font-semibold text-text-main">{incompleteCards}</p>
                <p className="mt-1 text-sm text-text-secondary">Incomplete templates</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/12 bg-cyan-300/8 px-4 py-4">
                <p className="text-2xl font-semibold text-text-main">{alertTaggedCards}</p>
                <p className="mt-1 text-sm text-text-secondary">Alert-tagged cards</p>
              </div>
            </div>
          </div>

          <div className="vant-card rounded-[30px] bg-primary/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-100">Versioning rule</p>
            <h2 className="mt-4 text-2xl font-semibold text-text-main">Major updates can trigger reduced re-unlock pricing</h2>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              This is already reflected in the data model so future admin edits can distinguish between minor changes and deeper lesson updates.
            </p>
          </div>

          {!isConfigured ? (
            <div className="vant-card rounded-[30px] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-secondary">Local testing control</p>
              <h2 className="mt-4 text-2xl font-semibold text-text-main">Reset templates and local user state</h2>
              <p className="mt-4 text-sm leading-6 text-text-secondary">
                Use this when you want to clear all locally stored templates, wallet balance, and unlocks before another test run.
              </p>
              <form action={resetLocalDemoState} className="mt-5">
                <button type="submit" className="vant-btn-secondary text-sm text-rose-100">
                  Reset local demo state
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Create template</p>
              <h2 className="mt-2 text-3xl font-semibold text-text-main">Start with an empty draft or fill it immediately</h2>
            </div>
            <div className="vant-card hidden rounded-2xl px-4 py-2 text-sm text-primary md:inline-flex">
              <Plus className="mr-2 h-4 w-4" />
              New update card
            </div>
          </div>

          <CardForm mode="create" action={createCard} />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Template library</p>
            <h2 className="mt-2 text-3xl font-semibold text-text-main">Manage all created update cards</h2>
          </div>

          {!cardData.cards.length ? (
            <div className="vant-card rounded-[30px] border-dashed p-6">
              <p className="text-lg font-medium text-text-main">
                {cardData.isConfigured ? "No templates created yet." : "Connect Supabase to store templates."}
              </p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Use the form to create your first empty update card draft. It can stay hidden until you finish the content and publish it.
              </p>
            </div>
          ) : (
            <AdminLibraryBrowser cards={cardData.cards} />
          )}
        </div>
      </section>
    </main>
  );
}

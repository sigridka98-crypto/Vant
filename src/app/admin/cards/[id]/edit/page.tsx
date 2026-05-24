import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateCard } from "@/app/admin/actions";
import { CardForm } from "@/components/admin/card-form";
import { requireAdmin } from "@/lib/admin";
import { getAdminCardById, getAdminCardUpdateLogs } from "@/lib/supabase/queries";

type EditCardPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function EditCardPage({ params, searchParams }: EditCardPageProps) {
  await requireAdmin();

  const { id } = await params;
  const query = await searchParams;
  const [{ card }, { logs }] = await Promise.all([getAdminCardById(id), getAdminCardUpdateLogs(id)]);

  if (!card) {
    notFound();
  }

  if (!card) {
    redirect("/admin?error=Template not found.");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Edit template</p>
          <h1 className="mt-2 text-4xl font-semibold text-text-main">
            {card.title || "Untitled template"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            Update the card structure, leave fields empty while drafting, and publish only when the lesson is ready for users.
          </p>
        </div>

        <Link href="/admin" className="vant-btn-secondary text-sm">
          Back to admin
        </Link>
      </div>

      {query.message ? (
        <section className="vant-card rounded-[28px] border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
          {query.message}
        </section>
      ) : null}

      <section className="vant-card rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Update history</p>
            <h2 className="mt-2 text-2xl font-semibold text-text-main">Version and change log</h2>
          </div>
          <span className="vant-card rounded-2xl px-3 py-1 text-xs text-text-secondary">
            {logs.length} logged update{logs.length === 1 ? "" : "s"}
          </span>
        </div>

        {logs.length ? (
          <div className="mt-5 space-y-3">
            {logs.map((log) => (
              <article key={log.id} className="vant-card rounded-[24px] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      log.updateType === "major"
                        ? "bg-fuchsia-400/15 text-fuchsia-100"
                        : "bg-cyan-400/15 text-cyan-100"
                    }`}
                  >
                    {log.updateType === "major" ? "Major update" : "Minor update"}
                  </span>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-text-secondary">
                    v{log.oldVersion} to v{log.newVersion}
                  </span>
                  {log.reunlockCost !== null ? (
                    <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs text-amber-100">
                      Re-unlock: {log.reunlockCost} coins
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-text-main">{log.changeSummary}</p>
                <p className="mt-3 text-xs text-text-secondary">
                  {new Date(log.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-dashed border-white/10 px-5 py-5 text-sm text-text-secondary">
            No update history has been logged for this template yet. Add a change summary when saving future edits to build the history trail.
          </div>
        )}
      </section>

      <CardForm mode="edit" action={updateCard} card={card} error={query.error} />
    </main>
  );
}

import Link from "next/link";
import { Ban, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

import { revokeAccessCode } from "@/app/admin/codes/actions";
import { AccessCodeGenerator } from "@/components/admin/access-code-generator";
import { getAdminAccessCodeBatches } from "@/lib/access-codes";
import { requireAdmin } from "@/lib/admin";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/env";

type AdminCodesPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "No expiry";
  return new Date(value).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
  });
}

const statusStyles = {
  active: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  redeemed: "border-green-500/20 bg-green-500/10 text-green-300",
  revoked: "border-red-500/20 bg-red-500/10 text-red-300",
  expired: "border-amber-500/20 bg-amber-500/10 text-amber-300"
};

export default async function AdminCodesPage({ searchParams }: AdminCodesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const ready = isSupabaseConfigured() && isSupabaseServiceConfigured();
  const batches = ready ? await getAdminAccessCodeBatches() : [];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="vant-glass rounded-[36px] p-8 md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Admin sales inventory</p>
            <h1 className="mt-4 text-4xl font-semibold text-text-main">GetUpdated purchase codes</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary">
              Generate protected batches for your sales partner, monitor redemptions, and revoke any unused code that should no longer be sold.
            </p>
          </div>
          <Link href="/admin" className="vant-btn-secondary inline-flex">Back to admin</Link>
        </div>
      </section>

      {params.error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">{params.error}</div> : null}
      {params.message ? <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-300">{params.message}</div> : null}

      {!ready ? (
        <section className="vant-card rounded-[30px] border-amber-500/20 bg-amber-500/10 p-6 text-amber-200">
          Supabase and its service role key must be configured before managing purchase-code inventory.
        </section>
      ) : <AccessCodeGenerator />}

      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">Recent inventory</p>
          <h2 className="mt-2 text-3xl font-semibold text-text-main">Generated batches</h2>
        </div>

        {!batches.length ? (
          <div className="vant-card rounded-[28px] border-dashed p-6 text-sm text-text-secondary">
            No purchase-code batches have been created yet. Run migration 006, then generate your first batch above.
          </div>
        ) : null}

        {batches.map((batch) => (
          <article key={batch.id} className="vant-card rounded-[30px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-text-main">{batch.name}</h3>
                <p className="mt-2 text-sm text-text-secondary">Created {formatDate(batch.createdAt)} · Expires {formatDate(batch.expiresAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-300"><Clock3 className="h-3.5 w-3.5" />{batch.activeCount} active</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-green-300"><CheckCircle2 className="h-3.5 w-3.5" />{batch.redeemedCount} redeemed</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-300"><Ban className="h-3.5 w-3.5" />{batch.unavailableCount} unavailable</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary"><ShieldCheck className="h-3.5 w-3.5" />{batch.coinsPerCode} coins each</span>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border-primary">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-bg-input text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium">Protected code</th><th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Redeemed by</th><th className="px-4 py-3 font-medium">Redeemed at</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.codes.map((code) => (
                    <tr key={code.id} className="border-t border-border-primary hover:bg-bg-hover">
                      <td className="px-4 py-3 font-mono text-text-main">{code.hint}</td>
                      <td className="px-4 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${statusStyles[code.status]}`}>{code.status}</span></td>
                      <td className="px-4 py-3 text-text-secondary">{code.redeemedBy ? `${code.redeemedBy.slice(0, 8)}...` : "—"}</td>
                      <td className="px-4 py-3 text-text-secondary">{code.redeemedAt ? formatDate(code.redeemedAt) : "—"}</td>
                      <td className="px-4 py-3">
                        {code.status === "active" ? (
                          <form action={revokeAccessCode}>
                            <input type="hidden" name="codeId" value={code.id} />
                            <button type="submit" className="text-sm text-red-300 hover:text-red-200">Revoke</button>
                          </form>
                        ) : <span className="text-text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

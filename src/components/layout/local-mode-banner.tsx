import { FlaskConical, RefreshCcw, ShieldEllipsis } from "lucide-react";

import { resetLocalDemoState } from "@/app/local/actions";
import { isSupabaseConfigured } from "@/lib/env";

export function LocalModeBanner() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <section className="border-b border-cyan-300/10 bg-cyan-400/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-2 text-cyan-100">
            <FlaskConical className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-cyan-100">Local testing mode is active</p>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-cyan-50/85">
              Templates, wallet coins, and premium unlocks are currently running
              from local fallback storage so you can keep building before Supabase is connected.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/65 px-4 py-2 text-sm text-white/85">
            <ShieldEllipsis className="h-4 w-4" />
            No live backend yet
          </span>
          <form action={resetLocalDemoState}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset local test state
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

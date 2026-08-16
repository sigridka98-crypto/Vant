"use client";

import { useActionState } from "react";
import { Download, KeyRound, LoaderCircle } from "lucide-react";

import { generateAccessCodeBatch } from "@/app/admin/codes/actions";

const initialGenerateCodesState = {
  error: "",
  message: "",
  batchName: "",
  codes: [] as string[]
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function AccessCodeGenerator() {
  const [state, formAction, pending] = useActionState(generateAccessCodeBatch, initialGenerateCodesState);

  function downloadCodes() {
    if (!state.codes.length) return;

    const rows = [
      ["batch", "purchase_code", "coins"],
      ...state.codes.map((code) => [state.batchName, code, "100"])
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${state.batchName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "getupdated"}-codes.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="vant-card rounded-[30px] p-6 md:p-8">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-primary/10 p-3 text-primary"><KeyRound className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Code generator</p>
          <h2 className="mt-2 text-2xl font-semibold text-text-main">Create a sales batch</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Every generated code is single-use and awards exactly 100 coins when redeemed at a zero wallet balance.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-text-secondary">Batch name</span>
          <input name="batchName" className="vant-input" placeholder="August partner sales" minLength={2} maxLength={80} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Number of codes</span>
          <input name="quantity" type="number" className="vant-input" min={1} max={50} defaultValue={50} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Expiry date (optional)</span>
          <input name="expiresAt" type="datetime-local" className="vant-input" />
        </label>
        <button type="submit" disabled={pending} className="vant-btn inline-flex items-center justify-center gap-2 md:col-span-2">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {pending ? "Creating protected codes..." : "Generate purchase codes"}
        </button>
      </form>

      {state.error ? <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</div> : null}

      {state.codes.length ? (
        <div className="mt-6 rounded-[24px] border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm font-medium text-text-main">{state.message}</p>
          <textarea readOnly value={state.codes.join("\n")} className="vant-input mt-4 min-h-52 font-mono text-sm" aria-label="Newly generated purchase codes" />
          <button type="button" onClick={downloadCodes} className="vant-btn mt-4 inline-flex items-center gap-2">
            <Download className="h-4 w-4" />Download CSV now
          </button>
        </div>
      ) : null}
    </div>
  );
}

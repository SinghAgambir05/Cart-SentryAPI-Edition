"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlay, FiRotateCcw, FiUpload } from "react-icons/fi";
import type { Cart, DecisionResult } from "@/lib/types";
import { parseCartCsv, MAX_UPLOAD_ROWS } from "@/lib/csv";
import { MAX_DISCOUNT } from "@/lib/guardrails";
import { CartCard } from "./CartCard";
import { StatBar, type Stats } from "./StatBar";
import { ScrollDivider } from "./ornaments";

type RowStatus = "pending" | "loading" | "done";
type DatasetSource = { kind: "sample" } | { kind: "upload"; fileName: string };

export function Dashboard() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [sampleCarts, setSampleCarts] = useState<Cart[]>([]);
  const [source, setSource] = useState<DatasetSource>({ kind: "sample" });
  const [results, setResults] = useState<Record<string, DecisionResult>>({});
  const [statusByCart, setStatusByCart] = useState<Record<string, RowStatus>>({});
  const [running, setRunning] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvTruncated, setCsvTruncated] = useState(false);
  const [maxDiscount, setMaxDiscount] = useState<number>(MAX_DISCOUNT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/carts")
      .then((r) => r.json())
      .then((data) => {
        setSampleCarts(data.carts);
        setCarts(data.carts);
        resetStatuses(data.carts);
      })
      .catch(() => setLoadError("Could not load the docket. Check the deployment logs."));
  }, []);

  function resetStatuses(rows: Cart[]) {
    const initial: Record<string, RowStatus> = {};
    rows.forEach((c) => (initial[c.cart_id] = "pending"));
    setStatusByCart(initial);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { carts: parsedCarts, errors, truncated } = parseCartCsv(text);

      setCsvErrors(errors);
      setCsvTruncated(truncated);
      setResults({});

      if (parsedCarts.length === 0) {
        setLoadError("No valid cart rows found in that CSV — check the column names and try again.");
        return;
      }

      setLoadError(null);
      setCarts(parsedCarts);
      setSource({ kind: "upload", fileName: file.name });
      resetStatuses(parsedCarts);
    };
    reader.onerror = () => setLoadError("Could not read that file.");
    reader.readAsText(file);
  }

  function useSampleData() {
    setCarts(sampleCarts);
    setSource({ kind: "sample" });
    setResults({});
    setCsvErrors([]);
    setCsvTruncated(false);
    setLoadError(null);
    resetStatuses(sampleCarts);
  }

  async function runSimulation() {
    setRunning(true);
    setResults({});
    for (const cart of carts) {
      setStatusByCart((s) => ({ ...s, [cart.cart_id]: "loading" }));
      try {
        const res = await fetch("/api/decide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart, max_discount: maxDiscount }),
        });
        const data: DecisionResult = await res.json();
        setResults((r) => ({ ...r, [cart.cart_id]: data }));
      } catch {
        // leave as loading -> falls back to pending visually on error
      }
      setStatusByCart((s) => ({ ...s, [cart.cart_id]: "done" }));
    }
    setRunning(false);
  }

  function reset() {
    setResults({});
    resetStatuses(carts);
  }

  const stats: Stats = useMemo(() => {
    const rows = Object.values(results);
    return {
      processed: rows.length,
      total: carts.length,
      discountsProposed: rows.filter((r) => r.proposed.action === "discount").length,
      ratified: rows.filter((r) => r.verdict === "ratified").length,
      amended: rows.filter((r) => r.verdict === "amended").length,
      vetoed: rows.filter((r) => r.verdict === "vetoed").length,
      totalDiscountFinal: rows.reduce((sum, r) => sum + r.final.discount_amount, 0),
    };
  }, [results, carts.length]);

  const hasRun = Object.keys(results).length > 0;

  return (
    <section id="dashboard" className="marble-surface px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-[family-name:var(--font-serif)] text-[2rem] text-[var(--ink)]">
              The Docket
            </h2>
            <p className="mt-2 max-w-md text-[15px] text-[var(--ink-soft)]">
              {carts.length || "—"} abandoned carts, live. Every proposal and every
              ruling, in order, with nothing decided off the record.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {hasRun && !running && (
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-full border border-[var(--ink)]/15 px-5 py-2.5 text-[13px] font-semibold text-[var(--ink)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                <FiRotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={runSimulation}
              disabled={running || carts.length === 0}
              className="flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-2.5 text-[13px] font-semibold text-[var(--marble)] shadow-[0_8px_24px_-8px_rgba(169,124,47,0.55)] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPlay className="h-3.5 w-3.5" />
              {running ? "In session…" : "Run Simulation"}
            </button>
          </div>
        </div>

        <ScrollDivider className="my-10" />

        {/* Docket controls: dataset source + max discount */}
        <div className="grid gap-4 rounded-2xl border border-[var(--marble-vein)] bg-[var(--marble)] p-5 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
              Evidence submitted
            </p>
            <p className="mt-1 text-[13.5px] text-[var(--ink)]">
              {source.kind === "sample"
                ? `Sample docket — ${carts.length} synthetic carts`
                : `${source.fileName} — ${carts.length} carts`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={running}
                className="flex items-center gap-2 rounded-full border border-[var(--ink)]/15 px-4 py-2 text-[12.5px] font-semibold text-[var(--ink)] transition hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiUpload className="h-3.5 w-3.5" />
                Upload cart CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelected}
                className="hidden"
              />
              {source.kind === "upload" && !running && (
                <button
                  onClick={useSampleData}
                  className="rounded-full px-4 py-2 text-[12.5px] font-semibold text-[var(--ink-soft)] underline decoration-[var(--marble-vein)] underline-offset-4 hover:text-[var(--gold)]"
                >
                  Revert to sample data
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-[var(--ink-soft)]">
              Columns: cart_value, item_count, time_since_abandonment_hours,
              previous_orders, customer_type (new / returning / loyal).
              cart_id, customer_id, abandoned_at are optional. Max {MAX_UPLOAD_ROWS} rows per upload.
            </p>
          </div>

          <div>
            <label htmlFor="max-discount" className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
              Maximum discount the Senate will permit
            </label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[15px] text-[var(--ink-soft)]">₹</span>
              <input
                id="max-discount"
                type="number"
                min={0}
                step={50}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Math.max(0, Number(e.target.value) || 0))}
                disabled={running}
                className="w-32 rounded-lg border border-[var(--marble-vein)] bg-white px-3 py-2 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <p className="mt-2 text-[11px] text-[var(--ink-soft)]">
              Any discount the advisor proposes above this is amended down before it&apos;s final —
              enforced server-side, not by the model. Applies to the next run.
            </p>
          </div>
        </div>

        {(loadError || csvErrors.length > 0 || csvTruncated) && (
          <div className="mt-4 space-y-1.5 rounded-xl bg-[var(--bronze-soft)] px-4 py-3 text-[13px] text-[var(--bronze)]">
            {loadError && <p>{loadError}</p>}
            {csvTruncated && (
              <p>Only the first {MAX_UPLOAD_ROWS} valid rows were loaded — the rest of the file was ignored.</p>
            )}
            {csvErrors.slice(0, 5).map((err, i) => (
              <p key={i} className="text-[12px]">{err}</p>
            ))}
            {csvErrors.length > 5 && (
              <p className="text-[12px]">…and {csvErrors.length - 5} more row error(s).</p>
            )}
          </div>
        )}

        <div className="mt-10">
          <StatBar stats={stats} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {carts.map((cart) => (
            <CartCard
              key={cart.cart_id}
              cart={cart}
              result={results[cart.cart_id] ?? null}
              status={statusByCart[cart.cart_id] ?? "pending"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

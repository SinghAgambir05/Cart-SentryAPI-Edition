export interface Stats {
  processed: number;
  total: number;
  discountsProposed: number;
  ratified: number;
  amended: number;
  vetoed: number;
  totalDiscountFinal: number;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-6 py-4 text-center sm:items-start">
      <span className="font-[family-name:var(--font-serif)] text-[1.9rem] leading-none text-[var(--ink)]">
        {value}
      </span>
      <span className="mt-1.5 text-[11.5px] uppercase tracking-wide text-[var(--ink-soft)]">
        {label}
      </span>
    </div>
  );
}

export function StatBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-[var(--marble-vein)] rounded-2xl border border-[var(--marble-vein)] bg-[var(--marble)] sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
      <Stat label="Docket" value={`${stats.processed} / ${stats.total}`} />
      <Stat label="Discounts proposed" value={stats.discountsProposed} />
      <Stat label="Ratified" value={stats.ratified} />
      <Stat label="Amended" value={stats.amended} />
      <Stat label="Vetoed" value={stats.vetoed} />
      <Stat label="Final total" value={`₹${stats.totalDiscountFinal.toLocaleString("en-IN")}`} />
    </div>
  );
}

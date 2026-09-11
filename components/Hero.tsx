import { ColumnMotif, LaurelIcon, ScrollDivider } from "./ornaments";

export function Hero() {
  return (
    <section className="marble-surface relative overflow-hidden border-b border-[var(--marble-vein)] px-6 pt-20 pb-24">
      <ColumnMotif className="pointer-events-none absolute left-6 top-1/2 hidden h-[220px] w-auto -translate-y-1/2 opacity-70 lg:block" />
      <ColumnMotif className="pointer-events-none absolute right-6 top-1/2 hidden h-[220px] w-auto -translate-y-1/2 opacity-70 lg:block" />

      <div className="relative mx-auto max-w-3xl text-center">
        <LaurelIcon className="mx-auto mb-6 h-6 w-16" />

        <h1 className="font-[family-name:var(--font-display)] text-[15px] font-medium tracking-[0.35em] text-[var(--gold)]">
          CARTSENTRY
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance font-[family-name:var(--font-serif)] text-[2.6rem] leading-[1.15] text-[var(--ink)] sm:text-[3.2rem]">
          An advisor proposes.
          <br />
          A senate rules.
          <br />
          <span className="italic text-[var(--gold)]">Every</span> cart gets its verdict.
        </p>

        <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-[var(--ink-soft)]">
          CartSentry is an autonomous cart-recovery agent. An AI advisor reviews each
          abandoned cart and proposes an action — a deterministic guardrail, answerable
          to no model, hands down the final ruling. Built for Razorpay&apos;s AI Builder
          2026, Track 1: AI Growth &amp; Agentic Commerce.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#dashboard"
            className="rounded-full bg-[var(--gold)] px-7 py-3 font-[family-name:var(--font-sans)] text-[14px] font-semibold text-[var(--marble)] shadow-[0_8px_24px_-8px_rgba(169,124,47,0.55)] transition hover:bg-[var(--gold-bright)]"
          >
            Convene the Senate
          </a>
          <a
            href="https://github.com/SinghAgambir05/Cart-Sentry-"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--ink)]/15 px-7 py-3 font-[family-name:var(--font-sans)] text-[14px] font-semibold text-[var(--ink)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            View the Repository
          </a>
        </div>

        <ScrollDivider className="mt-16" />
      </div>
    </section>
  );
}

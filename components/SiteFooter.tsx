import { LaurelIcon } from "./ornaments";

export function SiteFooter() {
  return (
    <footer className="marble-surface-deep px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <LaurelIcon className="h-4 w-8" />
          <span className="font-[family-name:var(--font-display)] text-[12px] tracking-[0.18em] text-[var(--ink-soft)]">
            CARTSENTRY
          </span>
        </div>
        <p className="text-[12.5px] text-[var(--ink-soft)]">
          Agambir Singh Jammu · Razorpay AI Builder 2026, Track 1
        </p>
        <a
          href="https://github.com/SinghAgambir05/Cart-Sentry-"
          target="_blank"
          rel="noreferrer"
          className="text-[12.5px] font-medium text-[var(--gold)] hover:underline"
        >
          github.com/SinghAgambir05/Cart-Sentry-
        </a>
      </div>
    </footer>
  );
}

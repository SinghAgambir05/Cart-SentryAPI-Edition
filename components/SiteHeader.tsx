"use client";

import { LaurelIcon } from "./ornaments";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--marble-vein)] bg-[var(--marble)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <LaurelIcon className="h-5 w-9" />
          <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[0.18em] text-[var(--ink)]">
            CARTSENTRY
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <a
            href="#tribunal"
            className="hidden font-[family-name:var(--font-sans)] text-[13px] font-medium text-[var(--ink-soft)] transition hover:text-[var(--gold)] sm:block"
          >
            How it rules
          </a>
          <a
            href="#dashboard"
            className="rounded-full bg-[var(--ink)] px-4 py-2 font-[family-name:var(--font-sans)] text-[13px] font-semibold text-[var(--marble)] transition hover:bg-[var(--gold)]"
          >
            Open the Ledger
          </a>
        </nav>
      </div>
    </header>
  );
}

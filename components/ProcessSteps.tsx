import { FiBookOpen, FiCpu, FiFileText, FiShield } from "react-icons/fi";
import { MeanderRule } from "./ornaments";

const STEPS = [
  {
    icon: FiFileText,
    title: "The Record",
    body: "Each abandoned cart — value, items, time since abandonment, customer history — is entered into evidence.",
  },
  {
    icon: FiCpu,
    title: "The Advisor",
    body: "Your model, reached through OmniRoute, weighs the record and proposes one action: reminder, discount, or none.",
  },
  {
    icon: FiShield,
    title: "The Senate",
    body: "A deterministic rule, immune to persuasion, reviews the proposal and either ratifies, amends, or vetoes it.",
  },
  {
    icon: FiBookOpen,
    title: "The Ledger",
    body: "What was proposed and what was ruled are both recorded — nothing is decided off the record.",
  },
];

export function ProcessSteps() {
  return (
    <section id="tribunal" className="marble-surface-deep border-b border-[var(--marble-vein)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-[2rem] text-[var(--ink)]">
            How it rules
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-[var(--ink-soft)]">
            One agentic loop. The model recommends; it never has the final word on money.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative rounded-2xl border border-[var(--marble-vein)] bg-[var(--marble)] p-6 shadow-[0_1px_0_var(--marble-vein)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ink)]">
                  <Icon className="h-5 w-5 text-[var(--gold-pale)]" />
                </div>
                <p className="mt-5 font-[family-name:var(--font-serif)] text-[17px] text-[var(--ink)]">
                  {String(i + 1).padStart(2, "0")} — {step.title}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>

        <MeanderRule className="mx-auto mt-16 h-3 w-full max-w-md opacity-60" />
      </div>
    </section>
  );
}

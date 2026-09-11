import type { AgentAction, FinalDecision, ProposedDecision } from "./types";

const VALID_ACTIONS = new Set<AgentAction>(["reminder", "discount", "no_action"]);

// Same flat cap as the original Python edition — a deliberate, documented
// limitation (see the project README): a proportional cap is the natural
// next iteration, not implemented here.
export const MAX_DISCOUNT = 300;

export function applyGuardrails(
  decision: ProposedDecision,
  maxDiscount: number = MAX_DISCOUNT
): FinalDecision {
  const action = decision.action;
  let discount_amount = decision.discount_amount;
  let guardrail_triggered = false;

  if (!VALID_ACTIONS.has(action)) {
    return {
      action: "no_action",
      discount_amount: 0,
      reason: "Invalid action proposed by decision engine",
      guardrail_triggered: true,
    };
  }

  if (typeof discount_amount !== "number" || Number.isNaN(discount_amount)) {
    discount_amount = 0;
    guardrail_triggered = true;
  }

  if (discount_amount < 0) {
    discount_amount = 0;
    guardrail_triggered = true;
  }

  if (action !== "discount") {
    if (discount_amount !== 0) guardrail_triggered = true;
    discount_amount = 0;
  }

  if (action === "discount" && discount_amount === 0) {
    return {
      action: "no_action",
      discount_amount: 0,
      reason: "Discount action had a zero discount amount",
      guardrail_triggered: true,
    };
  }

  if (action === "discount" && discount_amount > maxDiscount) {
    discount_amount = maxDiscount;
    guardrail_triggered = true;
  }

  return {
    action,
    discount_amount,
    reason: decision.reason ?? "",
    guardrail_triggered,
  };
}

/** Maps the raw guardrail result onto the Roman "ruling" vocabulary the UI shows. */
export function verdictFor(
  proposed: ProposedDecision,
  final: FinalDecision
): "ratified" | "amended" | "vetoed" {
  if (!final.guardrail_triggered) return "ratified";
  if (final.action !== proposed.action) return "vetoed";
  return "amended";
}

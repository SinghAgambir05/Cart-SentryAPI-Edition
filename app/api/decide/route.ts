import { NextRequest, NextResponse } from "next/server";
import { decideWithAntigravity } from "@/lib/antigravity";
import { applyGuardrails, MAX_DISCOUNT, verdictFor } from "@/lib/guardrails";
import type { Cart, CustomerType, DecisionResult } from "@/lib/types";

export const runtime = "nodejs";

const VALID_CUSTOMER_TYPES = new Set<CustomerType>(["new", "returning", "loyal"]);

// Hard ceiling on the client-configurable cap, independent of whatever the
// UI sends — a guardrail exists to protect the business, so its own upper
// bound can't be raised to something meaningless from the browser.
const ABSOLUTE_MAX_DISCOUNT_CEILING = 50_000;

function isValidCart(v: unknown): v is Cart {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.cart_id === "string" &&
    typeof c.customer_id === "string" &&
    typeof c.cart_value === "number" &&
    c.cart_value >= 0 &&
    typeof c.item_count === "number" &&
    c.item_count >= 0 &&
    typeof c.time_since_abandonment_hours === "number" &&
    c.time_since_abandonment_hours >= 0 &&
    typeof c.previous_orders === "number" &&
    c.previous_orders >= 0 &&
    typeof c.customer_type === "string" &&
    VALID_CUSTOMER_TYPES.has(c.customer_type as CustomerType) &&
    typeof c.abandoned_at === "string"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!isValidCart(body?.cart)) {
    return NextResponse.json({ error: "Invalid or missing cart" }, { status: 400 });
  }
  const cart = body.cart as Cart;

  let maxDiscount = MAX_DISCOUNT;
  if (body.max_discount !== undefined) {
    const requested = Number(body.max_discount);
    if (!Number.isFinite(requested) || requested < 0) {
      return NextResponse.json({ error: "max_discount must be a non-negative number" }, { status: 400 });
    }
    maxDiscount = Math.min(requested, ABSOLUTE_MAX_DISCOUNT_CEILING);
  }

  const proposed = await decideWithAntigravity(cart);
  const final = applyGuardrails(proposed, maxDiscount);

  // An engine-level failure is always surfaced as a hard veto, never as a
  // routine "amended" correction — those mean different things to a
  // reviewer and must not collapse into the same badge.
  if (proposed.engine_error) {
    final.guardrail_triggered = true;
  }

  const result: DecisionResult = {
    cart,
    proposed,
    final,
    verdict: proposed.engine_error ? "vetoed" : verdictFor(proposed, final),
  };

  return NextResponse.json(result);
}

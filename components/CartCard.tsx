"use client";

import { FiCheck, FiEdit3, FiXCircle } from "react-icons/fi";
import type { Cart, DecisionResult } from "@/lib/types";

const CUSTOMER_LABEL: Record<Cart["customer_type"], string> = {
  new: "New customer",
  returning: "Returning customer",
  loyal: "Loyal customer",
};

const VERDICT_STYLE = {
  ratified: {
    label: "Ratified",
    icon: FiCheck,
    bg: "bg-[var(--gold-pale)]",
    text: "text-[var(--gold)]",
  },
  amended: {
    label: "Amended",
    icon: FiEdit3,
    bg: "bg-[var(--bronze-soft)]",
    text: "text-[var(--bronze)]",
  },
  vetoed: {
    label: "Vetoed",
    icon: FiXCircle,
    bg: "bg-[var(--bronze-soft)]",
    text: "text-[var(--bronze)]",
  },
} as const;

const ACTION_LABEL: Record<string, string> = {
  reminder: "Reminder",
  discount: "Discount",
  no_action: "No action",
};

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function CartCard({
  cart,
  result,
  status,
}: {
  cart: Cart;
  result: DecisionResult | null;
  status: "pending" | "loading" | "done";
}) {
  return (
    <div className="animate-[fadein_0.5s_ease] rounded-2xl border border-[var(--marble-vein)] bg-[var(--marble)] p-5 transition-shadow hover:shadow-[0_4px_20px_-8px_rgba(33,29,23,0.15)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-[family-name:var(--font-serif)] text-[15px] text-[var(--ink)]">
            {cart.cart_id}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--ink-soft)]">
            {CUSTOMER_LABEL[cart.customer_type]} · {cart.previous_orders} past orders
          </p>
        </div>
        <p className="font-[family-name:var(--font-serif)] text-[19px] text-[var(--ink)]">
          {inr(cart.cart_value)}
        </p>
      </div>

      <div className="mt-3 flex gap-4 text-[12px] text-[var(--ink-soft)]">
        <span>{cart.item_count} items</span>
        <span>Abandoned {cart.time_since_abandonment_hours}h ago</span>
      </div>

      <div className="mt-4 h-px bg-[var(--marble-vein)]" />

      {status !== "done" && (
        <div className="mt-4 flex items-center gap-2 text-[13px] text-[var(--ink-soft)]">
          <span
            className={`h-1.5 w-1.5 rounded-full bg-[var(--gold)] ${
              status === "loading" ? "animate-pulse" : "opacity-30"
            }`}
          />
          {status === "loading" ? "The advisor deliberates…" : "Awaiting the docket"}
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[var(--ink-soft)]">Proposed</span>
            <span className="font-medium text-[var(--ink)]">
              {ACTION_LABEL[result.proposed.action]}
              {result.proposed.action === "discount" &&
                ` · ${inr(result.proposed.discount_amount)}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[var(--ink-soft)]">Final ruling</span>
            <span className="font-medium text-[var(--ink)]">
              {ACTION_LABEL[result.final.action]}
              {result.final.action === "discount" &&
                ` · ${inr(result.final.discount_amount)}`}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full ${
              VERDICT_STYLE[result.verdict].bg
            } w-fit px-3 py-1`}
          >
            {(() => {
              const Icon = VERDICT_STYLE[result.verdict].icon;
              return <Icon className={`h-3.5 w-3.5 ${VERDICT_STYLE[result.verdict].text}`} />;
            })()}
            <span className={`text-[11.5px] font-semibold ${VERDICT_STYLE[result.verdict].text}`}>
              {VERDICT_STYLE[result.verdict].label}
            </span>
          </div>

          <p className="text-[12.5px] italic leading-relaxed text-[var(--ink-soft)]">
            “{result.final.reason || result.proposed.reason}”
          </p>
        </div>
      )}
    </div>
  );
}

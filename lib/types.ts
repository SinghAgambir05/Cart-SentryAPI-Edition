export type CustomerType = "new" | "returning" | "loyal";

export interface Cart {
  cart_id: string;
  customer_id: string;
  cart_value: number;
  item_count: number;
  time_since_abandonment_hours: number;
  previous_orders: number;
  customer_type: CustomerType;
  abandoned_at: string;
}

export type AgentAction = "reminder" | "discount" | "no_action";

export interface ProposedDecision {
  action: AgentAction;
  discount_amount: number;
  reason: string;
  engine_error?: boolean;
}

export interface FinalDecision {
  action: AgentAction;
  discount_amount: number;
  reason: string;
  guardrail_triggered: boolean;
}

export interface DecisionResult {
  cart: Cart;
  proposed: ProposedDecision;
  final: FinalDecision;
  verdict: "ratified" | "amended" | "vetoed";
}

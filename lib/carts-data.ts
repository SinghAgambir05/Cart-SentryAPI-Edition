import type { Cart, CustomerType } from "./types";

// Deterministic PRNG (mulberry32) so the demo dataset is stable across
// server restarts and every viewer sees the same 18 carts.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function weightedCustomerType(): CustomerType {
  const r = rand() * 100;
  if (r < 40) return "new";
  if (r < 80) return "returning";
  return "loyal";
}

const NUM_CARTS = 18;

function generateCart(n: number): Cart {
  const cart_id = `CART${String(n).padStart(4, "0")}`;
  const customer_id = `CUST${String(n).padStart(4, "0")}`;
  const cart_value = randInt(500, 15000);
  const item_count = randInt(1, 8);
  const time_since_abandonment_hours = randInt(1, 48);
  const customer_type = weightedCustomerType();

  let previous_orders: number;
  if (customer_type === "new") previous_orders = randInt(0, 1);
  else if (customer_type === "returning") previous_orders = randInt(2, 5);
  else previous_orders = randInt(6, 15);

  const abandoned_at = new Date(
    Date.now() - time_since_abandonment_hours * 3_600_000
  ).toISOString();

  return {
    cart_id,
    customer_id,
    cart_value,
    item_count,
    time_since_abandonment_hours,
    previous_orders,
    customer_type,
    abandoned_at,
  };
}

export const CARTS: Cart[] = Array.from({ length: NUM_CARTS }, (_, i) =>
  generateCart(i + 1)
);

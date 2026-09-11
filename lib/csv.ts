import Papa from "papaparse";
import type { Cart, CustomerType } from "./types";

const VALID_CUSTOMER_TYPES = new Set<CustomerType>(["new", "returning", "loyal"]);

// Each row triggers a real, billed API call once "Run Simulation" is used.
// This cap protects against an accidental huge upload running up cost —
// raise it deliberately if you actually want to test more rows at once.
export const MAX_UPLOAD_ROWS = 200;

export interface CsvParseResult {
  carts: Cart[];
  errors: string[];
  truncated: boolean;
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseCartCsv(text: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const errors: string[] = [];

  if (parsed.errors.length > 0) {
    parsed.errors.slice(0, 3).forEach((e) =>
      errors.push(`Row ${e.row ?? "?"}: ${e.message}`)
    );
  }

  const rows = parsed.data;
  const carts: Cart[] = [];
  let truncated = false;

  rows.forEach((row, i) => {
    if (carts.length >= MAX_UPLOAD_ROWS) {
      truncated = true;
      return;
    }

    const rowNum = i + 2; // +1 for header, +1 for 1-indexing

    const cart_value = toNumber(row.cart_value);
    const item_count = toNumber(row.item_count);
    const time_since_abandonment_hours = toNumber(row.time_since_abandonment_hours);
    const previous_orders = toNumber(row.previous_orders);
    const customer_type = (row.customer_type || "").trim().toLowerCase() as CustomerType;

    const rowErrors: string[] = [];
    if (cart_value === null || cart_value < 0) rowErrors.push("cart_value must be a non-negative number");
    if (item_count === null || item_count < 0) rowErrors.push("item_count must be a non-negative number");
    if (time_since_abandonment_hours === null || time_since_abandonment_hours < 0)
      rowErrors.push("time_since_abandonment_hours must be a non-negative number");
    if (previous_orders === null || previous_orders < 0) rowErrors.push("previous_orders must be a non-negative number");
    if (!VALID_CUSTOMER_TYPES.has(customer_type))
      rowErrors.push('customer_type must be "new", "returning", or "loyal"');

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNum}: ${rowErrors.join("; ")}`);
      return;
    }

    carts.push({
      cart_id: (row.cart_id || `CSV${String(rowNum).padStart(4, "0")}`).trim(),
      customer_id: (row.customer_id || `CSVCUST${String(rowNum).padStart(4, "0")}`).trim(),
      cart_value: cart_value!,
      item_count: item_count!,
      time_since_abandonment_hours: time_since_abandonment_hours!,
      previous_orders: previous_orders!,
      customer_type,
      abandoned_at: row.abandoned_at?.trim() || new Date().toISOString(),
    });
  });

  return { carts, errors, truncated };
}

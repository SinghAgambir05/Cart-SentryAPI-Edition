import "server-only";
import type { Cart, ProposedDecision, AgentAction } from "./types";

const VALID_ACTIONS = new Set<AgentAction>([
  "reminder",
  "discount",
  "no_action",
]);

const GEMINI_INTERACTIONS_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const DEFAULT_AGENT = "antigravity-preview-05-2026";
const DEFAULT_MODEL = "gemini-3.7-flash";
const DEFAULT_MAX_TOTAL_TOKENS = 4000;

function buildPrompt(cart: Cart): string {
  return `You are CartSentry's autonomous abandoned-cart decision agent.

Analyze ONLY the cart data supplied below. Do not browse the web, run code, inspect files, or use tools. This is a small business-decision task and must be completed directly from the supplied cart data.

Choose exactly ONE action:
- reminder
- discount
- no_action

Decision guidance:
- Consider cart value, item count, abandonment time, previous orders, and customer type together.
- Do not default every cart to reminder.
- Do not default every high-value cart to discount.
- Do not default every old cart to no_action.
- A discount is a proposal only. CartSentry's deterministic guardrail independently enforces the maximum discount of ₹300.
- If the action is not discount, discount_amount MUST be 0.
- If the action is discount, choose a positive, commercially sensible amount. The guardrail may reduce it later.
- Keep reason concise and specific to this cart.

Return ONLY one JSON object. No markdown, no code fences, no extra text.

Required JSON shape:
{
  "action": "reminder",
  "discount_amount": 0,
  "reason": "brief cart-specific reason"
}

Cart data:
${JSON.stringify(cart, null, 2)}`;
}

function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end <= start) {
      throw new Error(
        "Antigravity did not return a JSON object.",
      );
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

type InteractionStep = {
  type?: string;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

type InteractionResponse = {
  status?: string;
  steps?: InteractionStep[];
  errors?: Array<{
    message?: string;
  }>;
  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
  usage?: {
    total_tokens?: number;
  };
};

function extractModelText(
  data: InteractionResponse,
): string | null {
  const modelOutputSteps = (data.steps ?? []).filter(
    (step) => step.type === "model_output",
  );

  for (const step of [...modelOutputSteps].reverse()) {
    const text = (step.content ?? [])
      .filter(
        (part) =>
          part.type === "text" &&
          typeof part.text === "string",
      )
      .map((part) => part.text!.trim())
      .filter(Boolean)
      .join("\n");

    if (text) {
      return text;
    }
  }

  return null;
}

/**
 * Calls Google's managed Antigravity agent through the
 * Gemini Interactions API.
 *
 * This file is server-side only, so the API key never
 * reaches the browser.
 *
 * Antigravity currently does not support structured
 * outputs, so the prompt requires JSON and the response
 * is validated locally before it reaches CartSentry's
 * deterministic guardrail pipeline.
 */
export async function decideWithAntigravity(
  cart: Cart,
): Promise<ProposedDecision> {
  const apiKey = process.env.GEMINI_API_KEY;

  const agent =
    process.env.GEMINI_AGENT || DEFAULT_AGENT;

  const model =
    process.env.GEMINI_AGENT_MODEL || DEFAULT_MODEL;

  const maxTotalTokens = Number.parseInt(
    process.env.GEMINI_MAX_TOTAL_TOKENS ||
      String(DEFAULT_MAX_TOTAL_TOKENS),
    10,
  );

  if (!apiKey) {
    return {
      action: "no_action",
      discount_amount: 0,
      reason:
        "Antigravity is not configured (missing GEMINI_API_KEY).",
      engine_error: true,
    };
  }

  try {
    const res = await fetch(
      GEMINI_INTERACTIONS_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          agent,

          input: buildPrompt(cart),

          environment: "remote",

          agent_config: {
            type: "antigravity",
            model,

            max_total_tokens:
              Number.isFinite(maxTotalTokens) &&
              maxTotalTokens > 0
                ? maxTotalTokens
                : DEFAULT_MAX_TOTAL_TOKENS,
          },
        }),

        cache: "no-store",
      },
    );

    const data =
      (await res.json().catch(() => ({}))) as InteractionResponse;

    if (!res.ok) {
      const detail =
        data.errors
          ?.map((e) => e.message)
          .filter(Boolean)
          .join("; ") ||
        data.error?.message ||
        "";

      return {
        action: "no_action",
        discount_amount: 0,

        reason:
          `Antigravity request failed (${res.status})` +
          (detail
            ? `: ${detail.slice(0, 240)}`
            : "."),

        engine_error: true,
      };
    }

    if (data.status !== "completed") {
      return {
        action: "no_action",
        discount_amount: 0,

        reason:
          `Antigravity interaction did not complete ` +
          `(status: ${data.status || "unknown"}).`,

        engine_error: true,
      };
    }

    const content = extractModelText(data);

    if (!content) {
      return {
        action: "no_action",
        discount_amount: 0,
        reason:
          "Antigravity returned no model output.",
        engine_error: true,
      };
    }

    const parsed =
      extractJson(content) as Partial<ProposedDecision>;

    const action = parsed?.action;

    let discountAmount =
      parsed?.discount_amount ?? 0;

    const reason =
      parsed?.reason ?? "";

    if (
      !action ||
      !VALID_ACTIONS.has(action as AgentAction)
    ) {
      return {
        action: "no_action",
        discount_amount: 0,
        reason:
          "Antigravity returned an invalid action.",
        engine_error: true,
      };
    }

    if (
      typeof discountAmount !== "number" ||
      Number.isNaN(discountAmount)
    ) {
      discountAmount = 0;
    }

    if (discountAmount < 0) {
      discountAmount = 0;
    }

    if (action !== "discount") {
      discountAmount = 0;
    }

    return {
      action: action as AgentAction,
      discount_amount: discountAmount,
      reason: String(reason),
    };
  } catch (err) {
    return {
      action: "no_action",
      discount_amount: 0,

      reason:
        `Antigravity decision engine failure: ` +
        `${
          err instanceof Error
            ? err.message
            : "unknown error"
        }`,

      engine_error: true,
    };
  }
}
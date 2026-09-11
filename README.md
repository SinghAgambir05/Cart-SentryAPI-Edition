# CartSentry — Web Edition (v2)

An autonomous cart-recovery agent with a live dashboard. An AI advisor uses Google's Antigravity managed agent through the Gemini Interactions API to propose an
action for each abandoned cart; a deterministic, non-AI guardrail rules on it
before anything is final.

This is the second edition of CartSentry, built for Razorpay's AI Builder 2026.
The original CLI/Python edition lives in `../v1-cli` in this same archive and
still works standalone — this edition does not replace it, it's a new,
separate interface with a live API instead of local Ollama.

## What changed from v1

- **Decision engine**: now calls Google's `antigravity-preview-05-2026` managed agent through the Gemini Interactions API instead of a local Ollama model.
- **Guardrail**: ported 1:1 from the original `guardrails.py` into
  `lib/guardrails.ts`, with one change — the discount cap is no longer a
  hardcoded constant. It's still enforced entirely server-side, in plain
  code the model cannot influence, but the ceiling itself is now settable
  per run (see "Docket controls" below).
- **Interface**: a full web dashboard instead of a terminal script.
- **New — CSV upload**: run the simulation against your own cart data
  instead of only the built-in synthetic dataset. Upload a CSV with columns
  `cart_value, item_count, time_since_abandonment_hours, previous_orders,
  customer_type` (`cart_id`, `customer_id`, `abandoned_at` are optional and
  auto-generated if omitted). Invalid rows are rejected individually with a
  reason, valid rows still run; uploads are capped at 200 rows per run
  (`MAX_UPLOAD_ROWS` in `lib/csv.ts`) since every row is a billed API call.
- **New — configurable max discount**: the "Maximum discount the Senate
  will permit" field on the dashboard sets the guardrail's cap for that run,
  sent to `/api/decide` as `max_discount` and enforced server-side. The API
  also enforces its own absolute ceiling (₹50,000, see
  `ABSOLUTE_MAX_DISCOUNT_CEILING` in `app/api/decide/route.ts`) independent
  of whatever the browser sends, so the cap itself can't be raised to
  something meaningless from client-side input.

## Local setup

```
npm install
cp .env.local.example .env.local
# fill in .env.local with your Gemini API key
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Description |
|--------------------------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key used by the server-side Antigravity agent. |
| `GEMINI_AGENT` | No | Managed agent ID. Defaults to `antigravity-preview-05-2026`. |
| `GEMINI_AGENT_MODEL` | No | Underlying model. Defaults to `gemini-3.8-flash`. |
| `GEMINI_MAX_TOTAL_TOKENS` | No | Per-interaction input + output + thinking budget. Defaults to `4000`. |

These are read only inside `lib/antigravity.ts`, which is marked `server-only`. The API key never reaches the browser bundle.

Antigravity is previewed through the Gemini Interactions API. The integration intentionally keeps the prompt small and caps each interaction at 4000 total tokens so the demo does not waste its free-tier quota. Antigravity does not currently support structured output, so the response is requested as JSON and validated locally before it reaches CartSentry's deterministic guardrail.

## Deploying to Vercel

1. Push this `v2-web` folder to its own GitHub repo (or push the whole
   archive and set Vercel's "Root Directory" to `v2-web`).
2. Import the repo at vercel.com -> Add New Project.
3. In the import screen (or afterward under Settings -> Environment
   Variables), add `GEMINI_API_KEY`, `GEMINI_AGENT`, `GEMINI_AGENT_MODEL`, and
   `GEMINI_MAX_TOTAL_TOKENS` if you want to override the defaults.
4. Deploy. No other configuration needed — Vercel auto-detects Next.js.

## Notes / honest limitations

- The live dashboard runs 18 synthetic carts per session by default (not 50,
  like the original) to keep a live demo fast and inexpensive against a real
  API. Adjust `NUM_CARTS` in `lib/carts-data.ts`, or upload your own CSV
  instead (see above).
- The discount cap is configurable per run now, but its *default* value
  (₹300) is unchanged from v1 and still not proportional to cart size —
  that's still a known limitation, just one you can now work around
  manually per run instead of only in code.
- I was not able to visually verify this UI in a browser during the build
  (sandboxed environment, no network access to download a browser or reach
  the Gemini API). It's typechecked, linted, and builds cleanly, and the CSV
  parser and API validation were tested directly with both valid and
  malformed rows — but look it over yourself with `npm run dev` before you
  rely on it for the video.

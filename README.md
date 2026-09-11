CartSentry
Autonomous AI Agent for Abandoned-Cart Recovery

"AI proposes. Deterministic code protects."

Table of Contents
Project Overview
Problem Statement
Core Architecture
Detailed Component Breakdown
AI Decision Pipeline
Antigravity Section (Current AI Integration)
Deterministic Guardrails
End-to-End Example
Technology Stack
Project Structure
Setup
Environment Variables
Netlify Deployment
Security
Error Handling
Testing
Business Rules
Design Decisions
Performance / Token / Quota Considerations
Current Scope
Out of Scope
Limitations
Future Roadmap
Metrics
Example Scenarios
Development Guidelines
Contributing
License
Author
Project Overview
CartSentry is a web-based autonomous cart-recovery agent built for e-commerce environments. When a customer abandons a cart, the system processes their context—such as cart value, customer loyalty, and time since abandonment—and uses an AI agent to decide on the best intervention: a simple reminder, a financial discount, or no action at all.

However, AI models are inherently probabilistic and cannot be entirely trusted with hard business logic or financial constraints. CartSentry solves this by pairing the contextual reasoning capabilities of an AI agent with the rigorous security of plain-code deterministic guardrails. Pure rules are too rigid for complex human contexts, and unrestricted AI is too risky for business finances; this hybrid approach leverages the best of both.

Problem Statement
Abandoned carts represent lost revenue, but treating every abandoned cart identically wastes margin.

Customer A (a loyal customer who abandoned a ₹12,000 cart 24 hours ago) might need a strong financial incentive to return and complete a large purchase.
Customer B (a new customer who abandoned a ₹600 cart 2 hours ago) might just need a polite reminder, and offering a discount immediately would unnecessarily sacrifice profit.
CartSentry evaluates these unique signals dynamically, preventing a "one-size-fits-all" approach to recovery while guaranteeing maximum discount thresholds.

Core Architecture
text


       Cart Data
           ↓
   AI Decision Agent
           ↓
      AI Proposal
           ↓
       Validation
           ↓
Deterministic Guardrails
           ↓
      Final Action
           ↓
    Audit / Logging
Detailed Component Breakdown
The project is built on Next.js using the App Router. The codebase is strictly divided by responsibility:

app/api/decide/route.ts: The API endpoint that receives cart evaluation requests, orchestrates the call to the AI decision agent, applies the deterministic guardrails, and returns the final verdict.
app/page.tsx & app/layout.tsx: The main frontend React pages serving the live dashboard.
components/: Presentation layer React components (CartCard.tsx, Dashboard.tsx, Hero.tsx, ProcessSteps.tsx, SiteHeader.tsx, SiteFooter.tsx, StatBar.tsx, ornaments.tsx) responsible for rendering carts and real-time decision states.
lib/omniroute.ts: The secure server-side AI integration client. It constructs the prompt, executes the network fetch to the decision engine, parses the JSON response, and manages network failures.
lib/guardrails.ts: The deterministic business logic layer. It enforces the maximum discount, validates actions, and issues "ratified," "amended," or "vetoed" verdicts.
lib/carts-data.ts: A seeded deterministic data generator (using Mulberry32) that provides the 18 synthetic carts used for dashboard simulation.
lib/types.ts: Shared TypeScript interfaces (Cart, ProposedDecision, FinalDecision, DecisionResult).
AI Decision Pipeline
Input Data: The agent is provided with cart_id, customer_id, cart_value, item_count, time_since_abandonment_hours, previous_orders, and customer_type.
Prompt Construction: lib/omniroute.ts injects these properties into a system prompt that outlines strict decision principles (e.g., "Do NOT automatically choose discount for every high-value cart").
Allowed Actions: The prompt constrains the model to choose exactly one action: "reminder", "discount", or "no_action".
Expected Output: The model must return exactly structured JSON containing an action, discount_amount, and reason.
Response Parsing: The code strips potential markdown (e.g., json) and attempts JSON.parse.
Error Handling: If the response is malformed, lacks valid fields, or if the API connection fails, the system immediately flags the response with engine_error: true.
Passing to Guardrails: The parsed proposal (or the safe fallback proposal if an error occurred) is passed to applyGuardrails() for deterministic processing.
Antigravity Section (Current AI Integration)
Note: While project specifications originally referenced Google's Gemini/Antigravity integration, the current actual implementation found in the Next.js v2-web source code utilizes an OpenAI-compatible gateway via OmniRoute.

Agent Identifier / API Used: The integration uses the standard /chat/completions REST API endpoint configured to point to a custom OmniRoute base URL.
Model Identifier: Driven by OMNIROUTE_MODEL, which defaults to gpt-4o-mini if not overridden in the environment.
Server-Side Architecture: The lib/omniroute.ts module utilizes the React server-only package. This physically prevents Next.js from bundling the API client and its associated secrets into the browser build.
Environment Variables: OMNIROUTE_BASE_URL and OMNIROUTE_API_KEY are strictly required.
Request/Response Flow: The server issues an asynchronous fetch() POST request. It expects standard OpenAI-compatible JSON responses (data.choices[0].message.content).
Error Handling: The integration never crashes the user interface. Network timeouts, HTTP errors, and empty responses are safely caught and coerced into a no_action state with the engine_error flag set to true.
Deterministic Guardrails
CartSentry operates on the philosophy that the application does not blindly trust the AI. The AI is treated as an unreliable advisor; the deterministic guardrails act as the final executive authority.

Every AI proposal passes through lib/guardrails.ts, which enforces the following hard constraints:

Action Validation: The action must strictly be one of "reminder", "discount", or "no_action". Invalid hallucinated actions immediately default to "no_action".
Discount Type Safety: If the discount_amount is not a valid number or is negative, it is coerced to 0.
Action Parity: If the action is not "discount", the discount amount is forced to 0. If the action is "discount" but the amount is 0, the action is overridden to "no_action".
Hard Maximum Cap: The application enforces a strict MAX_DISCOUNT limit of ₹300.
If any of these constraints are breached, guardrail_triggered is flagged to true, and the application issues a verdict of amended (if the amount was lowered) or vetoed (if the action was entirely rejected).

Example Scenario based on current configuration:

AI proposes: discount ₹750
Guardrail: maximum ₹300
Final Action: discount ₹300 (Verdict: amended)
End-to-End Example
1. Input Cart Data (CART0001):

json


{
  "cart_id": "CART0001",
  "customer_id": "CUST0001",
  "cart_value": 8500,
  "item_count": 4,
  "time_since_abandonment_hours": 36,
  "previous_orders": 3,
  "customer_type": "returning"
}
2. AI Reasoning & Proposal: The OmniRoute model evaluates the high cart value and the returning customer status, deciding an incentive is worthwhile.

json


{
  "action": "discount",
  "discount_amount": 500,
  "reason": "High value returning customer abandoned for over a day."
}
3. Guardrail Enforcement: The proposal enters applyGuardrails(). The requested discount of 500 exceeds the MAX_DISCOUNT of 300. The amount is modified.

4. Final Action & Audit Record:

json


{
  "action": "discount",
  "discount_amount": 300,
  "reason": "High value returning customer abandoned for over a day.",
  "guardrail_triggered": true
}
The dashboard records the verdict as amended.

Technology Stack
Layer	Technology	Purpose
Framework	Next.js (16.3.4)	React framework orchestrating frontend and backend APIs
UI rendering	React (19.2.8)	Component-based UI rendering
Styling	Tailwind CSS (v4)	Utility-first CSS styling
Icons	react-icons	Dashboard iconography
Fonts	@fontsource	Cinzel, Fraunces, and Manrope typography
Network / AI	Native fetch	Communicating with the OmniRoute Gateway
Security	server-only	Prevents API secrets from leaking to client components
Project Structure
text


CartSentry/
├── app/
│   ├── api/
│   │   └── decide/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CartCard.tsx
│   ├── Dashboard.tsx
│   ├── Hero.tsx
│   ├── ProcessSteps.tsx
│   ├── SiteFooter.tsx
│   ├── SiteHeader.tsx
│   ├── StatBar.tsx
│   └── ornaments.tsx
├── lib/
│   ├── carts-data.ts
│   ├── guardrails.ts
│   ├── omniroute.ts
│   └── types.ts
├── public/
├── package.json
├── .env.local.example
├── next.config.ts
└── tsconfig.json
Setup
Prerequisites: Node.js (v20 or higher).

Clone the repository and navigate to the v2-web directory.
Install dependencies:
bash


npm install
Copy the environment template:
bash


cp .env.local.example .env.local
Populate .env.local with your OmniRoute credentials.
Start the development server:
bash


npm run dev
Visit http://localhost:3000 to view the dashboard.
Production Build:

bash


npm run build
npm start
Environment Variables
These variables must be provided for the application to evaluate carts. Use actual values in your local .env.local or host dashboard.

env


# Your OmniRoute gateway's base URL, ending in /v1 (OpenAI-compatible).
OMNIROUTE_BASE_URL=https://your-omniroute-instance.example.com/v1
# The API key issued from your OmniRoute dashboard.
OMNIROUTE_API_KEY=your_secure_api_key_here
# Which model your OmniRoute gateway should route this to.
OMNIROUTE_MODEL=gpt-4o-mini
Netlify Deployment
While the project was initially tested on Vercel, it is a standard Next.js application and deploys seamlessly to Netlify.

Connect your repository to Netlify.
Ensure the build command is set to npm run build and the publish directory is .next (Netlify's Next.js plugin auto-detects this).
Important: Do not commit .env.local to version control.
In the Netlify dashboard under Site configuration > Environment variables, add OMNIROUTE_BASE_URL, OMNIROUTE_API_KEY, and OMNIROUTE_MODEL.
Trigger a deployment. Because the secrets are securely managed by Netlify's backend environment, the Next.js API routes will execute server-side safely.
Security
Server-Only API Access: The .env.local file contains sensitive API keys that allow billable usage of AI models. Client-side API calls are insecure; therefore, CartSentry proxies all AI communication through the app/api/decide/route.ts backend.
Bundle Protection: By importing the server-only package in lib/omniroute.ts, Next.js will aggressively fail the build if a developer accidentally imports AI logic into a client component.
Secret Management: .env.local is listed in .gitignore and must never be committed. If an API key is accidentally exposed to public version control, it must be rotated immediately.
Error Handling
CartSentry fails gracefully in all unexpected states:

Missing API Key / URL: Fast-fails and returns no_action alongside a UI notification that OmniRoute is misconfigured.
HTTP / Fetch Errors: Logs the failure and returns a safe no_action fallback proposal marked with engine_error.
Malformed Response: If the model hallucinates non-JSON data, parsing fails, triggering an engine_error fallback.
Invalid Actions / Discount Limits: Managed by lib/guardrails.ts, returning amended or vetoed verdicts dynamically.
Testing
Automated testing (e.g., Jest/Vitest unit tests) is not currently implemented in the v2-web codebase.

Recommended Test Coverage
Before moving to production, contributors should implement tests targeting lib/guardrails.ts. Essential test invariants to write:

Assert that discount_amount > 300 always truncates to exactly 300.
Assert that negative discount amounts are coerced to 0.
Assert that action: "no_action" alongside discount_amount: 100 correctly resets the discount to 0 and retains no_action.
Assert that an invalid action string triggers a safe no_action veto.
Business Rules
The following rules are implemented deterministically and cannot be altered by AI reasoning:

Every cart receives exactly one action.
The maximum discount granted to any customer under any circumstance is ₹300.
No discount value is permitted if the final action is a reminder or no_action.
No negative discount amounts are allowed.
Design Decisions
Why AI? Hardcoded rules ("if cart > 5000 and abandoned > 24 hours") fail to capture the nuanced realities of customer loyalty and item count. AI can balance complex signals naturally.
Why Server-Side Integration? Protecting OmniRoute/AI API keys prevents malicious actors from scraping keys and burning request quotas.
Why Deterministic Guardrails? Large Language Models occasionally hallucinate invalid formatting or disobey financial logic. Guardrails ensure that a model cannot accidentally propose a ₹1,000,000 discount and bankrupt the store.
Performance / Token / Quota Considerations
Prompt Size: The system prompt is kept deliberately concise. Carts are serialized into compact facts rather than heavy JSON graphs, lowering token consumption.
Model Configuration: Defaulting to gpt-4o-mini ensures fast API latency and minimal cost per decision, crucial when processing thousands of abandoned carts.
API Latency: Because AI generation takes time, frontend components asynchronously await decisions and render UI skeleton states until the server route responds.
Current Scope
End-to-end evaluation of mock cart data via OmniRoute AI.
Rigid enforcement of a flat ₹300 discount cap.
Stateless, real-time visualization dashboard of 18 synthetic carts.
Out of Scope
Proportional discount caps based on cart percentages (documented as a known limitation to be handled in future iterations).
Persistent database storage of decisions or cart states.
Actual execution of the email/SMS interventions (the project calculates the decision, it does not send the mail).
Limitations
Probabilistic Nature: The model may occasionally suggest no_action when a reminder was clearly better. Guardrails protect against financial loss, but cannot "fix" an overly conservative AI without user feedback loops.
Flat Cap Constraint: The ₹300 discount limit is currently flat and does not dynamically scale with massive carts (e.g., a ₹100,000 cart is capped at the same ₹300).
Hardcoded Dataset: The dashboard relies on a seeded Mulberry32 PRNG to generate 18 carts for live demonstration purposes.
Future Roadmap
Proportional Discount Policies: Implementing guardrails that cap discounts at min(₹300, 10% of cart_value).
Event-Driven Workers: Shifting the POST endpoint logic into asynchronous queue workers to handle high-volume traffic.
A/B Testing: Routing 50% of carts through the AI and 50% through traditional hardcoded rules to measure recovery uplift.
Customer Segmentation & Historical Feedback: Feeding the model data on past recovery successes to tune future interventions.
Metrics
To evaluate CartSentry in a real-world environment, the following metrics should be tracked:

Guardrail Intervention Rate: The percentage of decisions requiring an amended or vetoed ruling (monitors AI reliability).
Net Recovered Revenue: Cart value successfully recovered minus the cost of the discounts issued.
Cart Recovery Rate: Conversion rate of abandoned carts after intervention.
AI Latency & Token Usage: Infrastructure cost associated with OmniRoute queries.
Example Scenarios
Valid Reminder: A ₹600 cart abandoned 1 hour ago by a new customer. The AI proposes "reminder" and ₹0 discount. Guardrail ratifies.
Valid Discount: A ₹5,000 cart abandoned 24 hours ago by a loyal customer. The AI proposes "discount" of ₹250. Guardrail ratifies.
Discount Exceeding Limit: A ₹12,000 cart abandoned 48 hours ago. The AI proposes "discount" of ₹750. Guardrail intervenes, amending the discount to the strict ₹300 cap.
Invalid AI Response: The model hallucinates "action": "send_coupon". The guardrail rejects the invalid action, triggering a veto and falling back to "no_action".
Development Guidelines
If you are extending CartSentry:

Do not put business guarantees in the prompt. If the business requires a new hard limit (e.g., "no discounts for carts under ₹500"), write that rule in lib/guardrails.ts.
The AI prompt should only guide reasoning, not enforce strict state limits.
Keep server-only imports intact to maintain security posture.
Contributing
Fork the repository.
Create a feature branch: git checkout -b feat/new-guardrail.
Make and commit your changes: git commit -m "feat: proportional discount caps".
Run locally to verify Next.js builds.
Push your branch and open a Pull Request.

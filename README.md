# CartSentry

### AI-Powered Abandoned Cart Recovery Agent

CartSentry is an autonomous abandoned-cart recovery system that uses an AI decision agent to determine the best recovery action for each abandoned cart.

For every cart, the system evaluates whether to:

- Send a reminder
- Offer a discount
- Take no action

The AI does **not** have final authority over the customer-facing decision. Its proposal is passed through a deterministic guardrail layer that enforces hard business constraints before a final action is accepted.

The core pipeline is:

```text
Cart Data
    ↓
AI Decision Agent
    ↓
Proposed Action
    ↓
Deterministic Guardrails
    ↓
Final Action
    ↓
Audit / Decision Log

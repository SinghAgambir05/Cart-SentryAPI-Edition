# 🛒 CartSentry

### Autonomous AI Agent for Abandoned-Cart Recovery

> **AI proposes. Deterministic code protects.**

CartSentry is an AI-powered abandoned-cart recovery system designed to make autonomous recovery decisions for customers who leave items in their shopping cart without completing a purchase.

Instead of relying entirely on static business rules or allowing an LLM to make unrestricted commercial decisions, CartSentry combines **AI-based reasoning** with a **deterministic guardrail layer**.

For every abandoned cart, the system follows:

```text
┌───────────────────────┐
│      Cart Data        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│    AI Decision Agent  │
│                       │
│ Analyze customer/cart │
│ context               │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   AI Proposed Action  │
│                       │
│ Reminder / Discount / │
│ No Action             │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Deterministic         │
│ Guardrail Engine      │
│                       │
│ Validate business     │
│ constraints           │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│     Final Action      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│     Audit / Logs      │
└───────────────────────┘

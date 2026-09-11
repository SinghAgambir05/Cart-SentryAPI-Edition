# CartSentry

## Autonomous AI Agent for Abandoned-Cart Recovery

> **AI proposes. Deterministic code protects.**

CartSentry is an AI-powered abandoned-cart recovery application designed around a hybrid decision-making architecture: an AI agent evaluates cart and customer context and proposes a recovery action, while deterministic application logic validates that proposal and enforces hard business constraints before any final action is accepted.

The intended architecture is:

```text
Cart Data
    │
    ▼
AI Decision Agent
    │
    ▼
AI Proposal
    │
    ▼
Validation
    │
    ▼
Deterministic Guardrails
    │
    ▼
Final Action
    │
    ▼
Audit / Logging
```

This repository should be documented from the actual implementation rather than from a theoretical architecture. The available project material does not contain the CartSentry source repository, `package.json`, application files, API routes, configuration files, or environment-variable usage needed to verify the current implementation.

Because those files are not available in the supplied project material, the implementation-specific sections below intentionally do **not** invent filenames, routes, models, environment variables, commands, deployment configuration, tests, licenses, or guardrail values.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Problem Statement](#problem-statement)
* [Core Architecture](#core-architecture)
* [AI Decision Pipeline](#ai-decision-pipeline)
* [Antigravity / Gemini Integration](#antigravity--gemini-integration)
* [Deterministic Guardrails](#deterministic-guardrails)
* [End-to-End Decision Flow](#end-to-end-decision-flow)
* [Repository Components](#repository-components)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Setup](#setup)
* [Environment Variables](#environment-variables)
* [Netlify Deployment](#netlify-deployment)
* [Security](#security)
* [Error Handling](#error-handling)
* [Testing](#testing)
* [Business Rules](#business-rules)
* [Design Decisions](#design-decisions)
* [Performance, Tokens, and Quotas](#performance-tokens-and-quotas)
* [Current Scope](#current-scope)
* [Out of Scope](#out-of-scope)
* [Limitations](#limitations)
* [Future Roadmap](#future-roadmap)
* [Evaluation Metrics](#evaluation-metrics)
* [Example Scenarios](#example-scenarios)
* [Development Guidelines](#development-guidelines)
* [Contributing](#contributing)
* [License](#license)
* [Author](#author)

---

# Project Overview

CartSentry is intended to address a common e-commerce problem: customers add products to a cart but do not complete the purchase.

A simple abandoned-cart system can react using fixed rules:

```text
IF cart abandoned
THEN send reminder
```

That approach is predictable, but it cannot easily distinguish between different customer situations.

For example, consider two customers with carts worth the same amount:

```text
Customer A
-----------
Cart value: ₹5,000
Previously purchased multiple times
Recently active
High purchase intent

Customer B
-----------
Cart value: ₹5,000
First-time visitor
Little prior engagement
No evidence of strong purchase intent
```

Although the cart values are identical, treating both customers identically may not be optimal.

CartSentry's architectural concept is to allow an AI decision agent to reason about contextual information and propose an appropriate recovery strategy.

The AI proposal is then treated as **untrusted input** rather than as an unrestricted business decision.

The application layer is responsible for determining whether the proposal is valid and compliant with deterministic business rules.

This creates a separation of responsibilities:

| Responsibility               | Primary mechanism   |
| ---------------------------- | ------------------- |
| Contextual reasoning         | AI agent            |
| Structured proposal          | AI response         |
| Schema / response validation | Application code    |
| Financial constraints        | Deterministic code  |
| Business-critical guarantees | Deterministic code  |
| Final action                 | Application logic   |
| Auditability                 | Application logging |

---

# Problem Statement

Abandoned carts represent an opportunity to recover otherwise-lost transactions, but recovery strategies involve competing considerations.

Sending the same message to every abandoned cart can be too simplistic.

Giving an AI model unrestricted control over financial or business-critical decisions introduces a different class of problems:

* Model outputs are probabilistic.
* Responses can be malformed.
* Models can produce unexpected values.
* A model may misunderstand a business constraint.
* Provider behavior can change.
* Financial limits should not depend solely on model compliance.

CartSentry therefore follows the principle:

> **AI proposes. Deterministic code protects.**

The AI is responsible for reasoning over available contextual information.

The application remains responsible for enforcing guarantees.

---

# Core Architecture

The conceptual decision pipeline is:

```text
┌──────────────────────────┐
│        Cart Data         │
│                          │
│ Customer + cart context  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    AI Decision Agent     │
│                          │
│ Contextual reasoning     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       AI Proposal        │
│                          │
│ reminder / discount /    │
│ no_action / other valid  │
│ application-defined      │
│ response                 │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       Validation         │
│                          │
│ Parse and validate model │
│ output                   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Deterministic Guardrails │
│                          │
│ Hard business rules      │
│ and financial limits     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      Final Action        │
│                          │
│ Safe application result  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     Audit / Logging      │
│                          │
│ Decision trace / result  │
└──────────────────────────┘
```

The important boundary is between the **AI proposal** and the **final business decision**.

The model should not be treated as an authority capable of overriding deterministic application rules.

---

# AI Decision Pipeline

The intended AI decision flow consists of the following stages.

## 1. Cart Input

The system receives information representing an abandoned cart.

The exact structure of that input, including field names and data types, must be derived from the actual CartSentry source code.

The supplied project material does not contain those source definitions, so no undocumented schema is specified here.

## 2. Prompt Construction

Relevant cart and customer context is provided to the AI decision layer.

The exact prompt template, system instructions, contextual fields, and formatting cannot be documented accurately without the implementation source.

## 3. Allowed Actions

The project concept identifies recovery actions such as:

```text
reminder
discount
no_action
```

The exact authoritative action set must be taken from the implementation rather than assumed from the project description.

## 4. AI Proposal

The model generates a structured proposal.

The application should treat this proposal as untrusted external data.

The model output must therefore be validated before it reaches business-critical logic.

## 5. Response Parsing

The application parses the model response and converts it into the internal decision representation used by the business logic.

The exact parsing mechanism cannot be documented without the actual repository files.

## 6. Validation

Validation should establish that the response conforms to the application's expected structure and permitted values.

Examples of validation concerns include:

* Missing fields
* Unexpected fields
* Invalid action names
* Invalid numerical values
* Malformed model output
* Unexpected API responses

The exact implementation behavior is not available in the supplied files.

## 7. Guardrails

After validation, deterministic application logic enforces hard constraints.

This is the most important security and correctness boundary in the architecture.

## 8. Final Decision

Only the validated and guardrail-compliant result becomes the final action.

---

# Antigravity / Gemini Integration

The project specification identifies a Google Gemini / Antigravity integration.

However, the actual implementation files required to accurately document that integration were not supplied with the project material available for analysis.

The following implementation-specific details therefore require verification directly from the repository before being documented:

| Detail                        | Status                             |
| ----------------------------- | ---------------------------------- |
| Antigravity agent identifier  | Not verifiable from supplied files |
| Model identifier              | Not verifiable from supplied files |
| API mechanism                 | Not verifiable from supplied files |
| Integration source file       | Not verifiable from supplied files |
| Environment variable names    | Not verifiable from supplied files |
| Request format                | Not verifiable from supplied files |
| Response format               | Not verifiable from supplied files |
| Token / request configuration | Not verifiable from supplied files |
| Error handling                | Not verifiable from supplied files |

## Server-Side API Principle

The API credential used to communicate with a model provider must remain on the server side.

A client-side application should never expose a provider API key directly to browser code.

The intended security boundary is:

```text
Browser
   │
   │  Cart / application request
   ▼
Server-side application
   │
   │  Authenticated provider request
   ▼
Gemini / Antigravity
```

rather than:

```text
Browser
   │
   └──────► Gemini API
            ▲
            │
       exposed secret
```

The exact CartSentry implementation must be inspected before stating which server route or module performs this operation.

---

# Deterministic Guardrails

The central architectural principle of CartSentry is that AI output is not automatically trusted.

An AI model can reason about a situation, but deterministic code should enforce requirements that must never be violated.

This distinction is particularly important for discounts and other financially significant actions.

## Discount Guardrails

The project specification explicitly calls for investigation of a possible maximum discount rule, but the actual configured amount and enforcement behavior cannot be confirmed from the supplied project files.

Therefore, this README intentionally does **not** claim that the maximum discount is ₹300.

The implementation-specific behavior should be documented in the following form once verified:

```text
AI proposes:
discount ₹X

Guardrail:
maximum configured discount = ₹Y

Final:
[actual implementation behavior]
```

Possible implementations could include clamping, rejection, conversion to another action, or fallback behavior, but the correct behavior must come from the source code.

## Why This Boundary Matters

Without deterministic enforcement:

```text
AI
 │
 └──► Final financial action
```

A model error could become a business error.

With deterministic enforcement:

```text
AI proposal
     │
     ▼
Validation
     │
     ▼
Business rules
     │
     ▼
Final action
```

the model remains a reasoning component rather than the ultimate authority.

---

# End-to-End Decision Flow

A conceptual CartSentry decision can be represented as:

```text
1. Cart becomes abandoned
            │
            ▼
2. Application receives cart information
            │
            ▼
3. Context is provided to AI decision agent
            │
            ▼
4. AI proposes a recovery action
            │
            ▼
5. Application parses the proposal
            │
            ▼
6. Application validates the proposal
            │
            ▼
7. Deterministic guardrails are applied
            │
            ▼
8. Final action is produced
            │
            ▼
9. Decision is logged / audited
```

## Example Data Shape

The exact CartSentry cart schema must be taken from the implementation.

A generic illustration of the architectural concept is:

```json
{
  "cart": {
    "items": [
      {
        "product": "Example Product",
        "quantity": 1
      }
    ],
    "total": 5000
  },
  "customer": {
    "history": "context-dependent"
  },
  "abandoned": true
}
```

This JSON is an architectural illustration only and is **not** claimed to represent the exact CartSentry request schema.

---

# Repository Components

The requested repository-specific component breakdown cannot be completed accurately because the actual repository contents are not present in the supplied project material.

The following directories are therefore described only conceptually.

## `app/`

Expected responsibility in a Next.js application:

* Application routes
* Pages
* API handlers
* Server-side application entry points

The exact files and route hierarchy must be verified from the repository.

## `components/`

Expected responsibility:

* Reusable UI components
* Presentation-layer logic
* Client-facing application interfaces

The exact components must be derived from the source.

## `lib/`

Expected responsibility:

* Shared application logic
* AI/provider integration
* Validation
* Business rules
* Utility functions

The exact modules and responsibilities must be verified against the source code.

## API Routes

CartSentry's API routes should be documented using the actual route paths implemented by the application.

Those route paths are not available in the supplied material.

No route names are therefore invented here.

## Public Assets

Static files should be documented according to the real contents of `public/`.

The exact assets are not available for inspection.

## Configuration

Configuration should include only files actually present in the repository, such as relevant Next.js, TypeScript, linting, deployment, or build configuration.

The supplied project material does not contain those files.

---

# Technology Stack

The project is described as a Next.js application using Google's Gemini / Antigravity integration, but the exact dependency versions and complete technology stack cannot be verified without `package.json` and the repository source.

| Layer                 | Technology                         | Verification                            |
| --------------------- | ---------------------------------- | --------------------------------------- |
| Application framework | Next.js                            | Project specification                   |
| AI provider           | Google Gemini / Antigravity        | Project specification                   |
| Language              | Not verified                       | Repository required                     |
| UI framework          | Not verified                       | Repository required                     |
| Styling               | Not verified                       | Repository required                     |
| Validation library    | Not verified                       | Repository required                     |
| Deployment            | Netlify mentioned in specification | Project configuration required          |
| Package manager       | npm requested in specification     | `package.json` / lockfile should verify |

No additional libraries or frameworks should be presented as implemented until they are confirmed in the source repository.

---

# Project Structure

The actual project structure must be generated directly from the repository.

A conceptual Next.js structure might look like:

```text
CartSentry/
├── app/
├── components/
├── lib/
├── public/
├── package.json
├── ...
```

This is intentionally not presented as the authoritative repository tree.

Important filenames, routes, configuration files, and provider modules must be added only after inspecting the actual project.

---

# Setup

The exact setup commands should be generated from the repository's actual `package.json` scripts and dependency files.

The project specification requests documentation for the following workflow:

```bash
git clone <repository-url>
cd CartSentry
npm install
```

Environment configuration should then be created using the variables actually referenced by the application.

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Production start:

```bash
npm start
```

These commands should be treated as repository requirements only after verifying the corresponding scripts in `package.json`.

---

# Environment Variables

The project requires documentation of every environment variable actually used by the source code.

Because the source repository is unavailable in the supplied material, the exact variable names cannot be verified.

For example, the project specification mentions a possible variable of the form:

```env
GEMINI_API_KEY=your_key_here
```

but the authoritative variable name must be taken from the actual implementation.

Never place real API keys, passwords, tokens, or credentials in this README.

---

# Netlify Deployment

The project specification identifies Netlify as the deployment target.

The production deployment should preserve the same security boundary used during local development:

```text
Client
  │
  ▼
Netlify-hosted application
  │
  ├── server-side logic
  │
  └── provider credentials
          │
          ▼
      AI provider
```

## Required Deployment Considerations

The exact build configuration must be verified against the repository's Netlify and Next.js configuration.

At minimum:

1. Configure the required production environment variables in Netlify.
2. Do not commit `.env.local`.
3. Do not expose AI provider credentials in browser-side code.
4. Ensure server-side provider requests run within the supported Netlify/Next.js execution model.
5. Use the build command defined by the actual project configuration.

The exact output configuration, build plugins, redirects, or deployment-specific settings cannot be asserted without the repository files.

---

# Security

## API Key Protection

AI provider API keys are credentials and must remain server-side.

They should never be:

* hardcoded into source code,
* committed to Git,
* embedded into client-side JavaScript,
* exposed through public configuration,
* included in documentation.

## `.env.local`

Local secrets should be stored in environment configuration rather than source files.

A typical local environment file may contain values such as:

```env
GEMINI_API_KEY=your_key_here
```

but the actual variable names must be confirmed from the repository.

## Git Protection

Secret-bearing files should be excluded from version control through `.gitignore`.

The exact `.gitignore` configuration must be checked before claiming that a particular file is protected.

## Credential Rotation

If an API key is accidentally exposed:

1. Revoke or rotate the compromised credential.
2. Replace the production credential.
3. Remove the secret from the repository history where appropriate.
4. Verify that deployments use the new credential.
5. Review logs and exposed artifacts.

## Why Client-Side Keys Are Unsafe

Anything delivered to browser code should be considered potentially observable by the user.

Consequently, provider authentication belongs behind a server-side boundary.

---

# Error Handling

The project specification identifies several failure categories that should be inspected in the actual implementation.

The supplied project files do not contain enough information to describe their exact runtime behavior.

| Failure               | Implementation behavior      |
| --------------------- | ---------------------------- |
| Missing API key       | Requires source verification |
| AI request failure    | Requires source verification |
| HTTP error            | Requires source verification |
| Malformed AI response | Requires source verification |
| Invalid action        | Requires source verification |
| Invalid discount      | Requires source verification |
| Final fallback        | Requires source verification |

The README should not claim a particular fallback response until the corresponding application code is inspected.

---

# Testing

The actual repository was not supplied, so the presence or absence of automated tests cannot be verified.

The following therefore cannot currently be claimed:

* existing test files,
* test framework,
* test command,
* coverage percentage,
* passing test suite,
* integration tests,
* end-to-end tests.

## Recommended Test Coverage

Once the implementation is available, the guardrail layer should have deterministic tests covering at least:

```text
Valid reminder
Valid discount
Maximum allowed discount
Discount above maximum
Invalid action
Missing action
Malformed AI response
Provider/API failure
Missing API credentials
Fallback behavior
```

The most important invariant is:

```text
No AI response can bypass deterministic business constraints.
```

---

# Business Rules

The architectural specification establishes the following business principle:

> AI-generated proposals must pass deterministic application validation and guardrails before becoming final actions.

Potential action types include:

```text
reminder
discount
no_action
```

The exact authoritative action set and every additional rule must be extracted from the implementation.

## Deterministic Rules

Any rule involving:

* financial limits,
* allowed actions,
* validation,
* security constraints,
* hard business requirements,

should remain enforceable by deterministic application code.

The AI should not be the sole mechanism responsible for enforcing these guarantees.

---

# Design Decisions

## AI for Reasoning

AI is useful when the decision depends on context and when rigid rules would require a large number of hand-written conditions.

An AI agent can evaluate multiple contextual signals and propose an action.

## Deterministic Code for Guarantees

Hard constraints are better enforced by conventional application logic.

A deterministic rule is:

```text
same input
    +
same rule
    =
same enforced constraint
```

That is important for financial safety and predictable business behavior.

## Server-Side AI Calls

Keeping provider communication server-side protects credentials and establishes a clear security boundary between the application and external model provider.

## Isolated Provider Integration

Keeping AI-provider-specific logic isolated makes the business logic less dependent on provider-specific APIs.

The exact module responsible for this isolation should be identified from the repository.

## Response Validation

AI output is external, probabilistic data.

Validation prevents malformed or unexpected model responses from being trusted directly by business logic.

---

# Performance, Tokens, and Quotas

The actual performance characteristics depend on the implementation and provider configuration.

The following must be verified from the repository before being documented as current behavior:

* prompt construction and prompt size,
* model identifier,
* maximum output tokens,
* request budgets,
* retry configuration,
* timeout configuration,
* caching,
* concurrency controls,
* rate limiting.

## General Performance Considerations

An AI-backed decision introduces network and model inference latency that a purely deterministic rule engine would not have.

Potential future optimization techniques include:

* minimizing prompt payload size,
* limiting unnecessary customer context,
* using structured responses,
* reducing redundant model calls,
* caching safe reusable information,
* measuring end-to-end decision latency,
* monitoring provider quota consumption.

These are optimization considerations rather than claims about current CartSentry behavior.

---

# Current Scope

Based on the supplied project specification, CartSentry is centered around:

```text
Abandoned cart
      │
      ▼
AI-assisted recovery proposal
      │
      ▼
Application validation
      │
      ▼
Deterministic business guardrails
      │
      ▼
Final recovery action
```

The core conceptual actions include:

* `reminder`
* `discount`
* `no_action`

The exact implemented scope must be verified against the repository source.

---

# Out of Scope

No explicit repository-level exclusions were available for verification.

This README therefore does not invent additional out-of-scope functionality.

---

# Limitations

## AI Is Probabilistic

AI-generated proposals can be incorrect, inconsistent, or malformed.

That is the primary reason the deterministic validation boundary exists.

## Provider Dependence

The application depends on the configured external AI provider being available and responding within acceptable limits.

## Model Changes

Changing models or provider behavior can change generated proposals even when the surrounding application code remains unchanged.

## Input Quality

AI decision quality depends on the quality, completeness, and relevance of the information supplied to the model.

## Missing Implementation Visibility

The current project material available for this README does not include the source repository itself, so implementation-specific behavior such as exact routes, schemas, model configuration, scripts, and error handling cannot be asserted without risking inaccurate documentation.

---

# Future Roadmap

The following are architectural possibilities rather than implemented features.

## Historical Conversion Feedback

Use recovered-cart outcomes to evaluate and improve decision quality over time.

## A/B Testing

Compare recovery strategies and quantify differences in conversion and revenue outcomes.

## Customer Segmentation

Apply more specialized strategies for different customer groups.

## Adaptive Discount Policies

Use historical outcomes to improve discount selection while preserving deterministic financial constraints.

## Model Evaluation

Build a repeatable evaluation dataset for measuring AI decisions independently of production outcomes.

## Event-Driven Processing

Move abandoned-cart decisions into event-driven or queued workers for larger-scale processing.

## Richer Analytics

Add structured analytics for:

* action distribution,
* recovery performance,
* guardrail interventions,
* revenue impact,
* AI decision quality.

None of these should be interpreted as current functionality unless implemented in the repository.

---

# Evaluation Metrics

These metrics are useful for evaluating an abandoned-cart recovery system.

They are presented as **evaluation metrics**, not as claims that CartSentry currently implements telemetry for them.

| Metric                      | Purpose                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| Cart recovery rate          | Percentage of abandoned carts resulting in recovery                    |
| Revenue recovered           | Revenue attributable to recovered carts                                |
| Discount cost               | Financial cost of granted discounts                                    |
| Net recovered revenue       | Recovered revenue after discount cost                                  |
| Guardrail intervention rate | Frequency with which deterministic rules modify or reject AI proposals |
| AI agreement rate           | Percentage of proposals accepted without modification                  |
| Decision latency            | Time required to produce a final decision                              |
| Token usage                 | Model resource consumption per decision                                |

The combination of recovery metrics and safety metrics is important.

A model that increases conversion while violating financial constraints would not represent a successful system.

---

# Example Scenarios

The following scenarios describe the intended architectural behavior. Exact fallback and guardrail behavior must match the implementation once the source repository is available.

## Reminder

```text
Cart Data
   │
   ▼
AI Proposal
   │
   └── reminder
          │
          ▼
Validation
          │
          ▼
Guardrails
          │
          ▼
Final: reminder
```

## Valid Discount

```text
Cart Data
   │
   ▼
AI Proposal
   │
   └── discount within configured limit
          │
          ▼
Validation
          │
          ▼
Guardrails
          │
          ▼
Final: discount
```

## Discount Exceeding Limit

```text
AI Proposal
   │
   └── discount above configured maximum
          │
          ▼
Deterministic Guardrail
          │
          ▼
Application-defined safe result
```

The exact result must be taken from the implementation.

## No Action

```text
AI Proposal
   │
   └── no_action
          │
          ▼
Validation
          │
          ▼
Guardrails
          │
          ▼
Final: no_action
```

## Invalid AI Response

```text
AI
 │
 └── malformed / invalid response
          │
          ▼
Application validation
          │
          ▼
Application-defined fallback / error
```

## AI / API Failure

```text
Application
     │
     ▼
AI provider unavailable
     │
     ▼
Application-defined failure handling
```

The exact fallback must not be guessed and should be documented from the actual source code.

---

# Development Guidelines

The most important development rule for CartSentry is:

> **AI reasoning must not replace deterministic enforcement.**

Future changes should preserve the separation between:

```text
AI reasoning
```

and:

```text
business guarantees
```

When introducing a new AI capability:

1. Define the proposal format.
2. Validate model output.
3. Keep hard business constraints in deterministic code.
4. Ensure invalid output cannot directly produce a business-critical action.
5. Keep provider-specific code isolated.
6. Avoid exposing provider credentials to client-side code.
7. Add deterministic tests for every important business invariant.

---

# Contributing

A conventional contribution workflow is:

```text
Fork
  ↓
Create a branch
  ↓
Make changes
  ↓
Run tests / validation
  ↓
Commit
  ↓
Push
  ↓
Open Pull Request
```

Before submitting a pull request, contributors should verify that changes preserve the application's validation and guardrail boundaries.

AI behavior should remain subordinate to deterministic business rules.

---

# License

The repository license could not be verified because the actual project files were not available in the supplied project material.

The definitive license should be taken from the repository's license file or existing project metadata rather than inferred.

---

# Author

Author information could not be verified from the supplied project material.

The definitive author attribution should be taken from the repository metadata, existing README, package metadata, or other project-owned source files.

---

# Implementation Verification Notice

This README intentionally avoids making unsupported claims about:

* exact file names,
* exact directory structure,
* API routes,
* request and response schemas,
* Gemini model identifiers,
* Antigravity agent identifiers,
* environment-variable names,
* discount maximums,
* fallback behavior,
* package versions,
* npm scripts,
* Netlify configuration,
* test frameworks,
* existing test coverage,
* license,
* author information.

Those details require the actual CartSentry repository contents.

The architecture described here preserves the central design principle:

```text
AI proposes.
      │
      ▼
Application validates.
      │
      ▼
Deterministic code protects.
      │
      ▼
Final action is produced.
```

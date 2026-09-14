# Venture Architect Kernel v0.1

## What is the kernel?

The v0.1 kernel is the smallest set of capabilities required to test the business thesis:

```text
visitor
  ↓
landing
  ↓
demo
  ↓
diagnostic CTA
  ↓
lead capture
  ↓
Supabase evidence
  ↓
founder conversation
  ↓
scorecard
  ↓
Venture Committee
  ↓
decision
```

## Frozen interfaces until the Day-8 gate

Unless fixing a regression, avoid changing:
- the public lead contract;
- the public event contract;
- the lead capture endpoint;
- the event capture endpoint;
- the scoreboard field names;
- the production URL structure for landing/demo.

## Allowed work before Day 8

1. regression prevention;
2. observability;
3. instrumentation;
4. sales evidence capture;
5. documentation that reduces operating ambiguity;
6. a customer-requested fix blocking a real conversation or pilot.

## Explicitly deferred

Do not add merely because it is technically interesting:
- authentication;
- multi-tenancy;
- billing;
- generalized CRM;
- agent orchestration;
- vector database;
- generic chatbot;
- mobile app;
- broad design-system rewrite;
- ML scoring beyond evidence available.

## Change test

Before building, answer:

1. Which real user/problem does this change serve?
2. What observable outcome should change?
3. Why is the current kernel insufficient?
4. What is the smallest patch?
5. How can the patch fail?
6. How do we revert it?
7. What should we stop doing to make room for it?

If the first three answers are weak, do not build.

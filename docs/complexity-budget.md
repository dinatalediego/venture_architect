# Complexity Budget

Venture Architect treats complexity as capital expenditure.

A dependency, framework, service, queue, database, agent, model or infrastructure layer is not free merely because its price is zero. It creates maintenance, failure modes, security surface and switching cost.

## Current phase

`v0.1_validation`

The company already has enough infrastructure to test demand:
- GitHub
- Vercel
- Supabase
- browser JavaScript
- Python standard library
- GitHub Actions

Until evidence changes the phase, new infrastructure must justify itself against a real customer or operating bottleneck.

## Admission rule

A complexity increase is admissible only when all are true:

1. **Observed problem** — evidence exists outside developer preference.
2. **Repeated need** — the problem is recurring or materially blocks a qualified opportunity.
3. **Smallest mechanism** — simpler code/rule/process is insufficient.
4. **Measurable result** — success can be observed.
5. **Failure mode known** — we know how the new component can fail.
6. **Rollback exists** — it can be removed without destroying the kernel.
7. **Owner exists** — one subsystem owns its lifecycle.

## Default deny during v0.1

The architecture fitness check blocks accidental introduction of common dependency manifests and AI SDK imports while the budget remains unchanged.

This is not a permanent ban. It means:

> change the budget deliberately before changing the architecture.

A legitimate future PR may update `data/architecture_budget.json` and the implementation together, but the PR must include evidence and rationale.

## Examples

### Reject
“Next.js would make the codebase more modern.”

No observed problem. No external result.

### Potentially accept
“Two paid pilots require authenticated client access; maintaining auth manually is unsafe.”

Observed repeated need, clear risk and measurable capability.

### Reject
“Add a vector database because we will eventually use AI.”

Speculative infrastructure.

### Potentially accept
“Five completed diagnostics show the same unstructured notes must be retrieved across 10k records, and deterministic search misses a measured class of queries.”

Evidence can justify evaluating retrieval infrastructure.

## Deletion bias

When two solutions produce the same external result, prefer the one with:
- fewer services;
- fewer runtime dependencies;
- fewer stateful components;
- fewer credentials;
- simpler recovery.

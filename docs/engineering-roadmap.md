# Engineering Roadmap — Evidence-Gated

This roadmap is intentionally gated by business evidence. Versions are not calendar promises.

## v0.1 — Kernel

**Gate:** current phase.

**Goal:** prove external demand without breaking acquisition or evidence capture.

Allowed:
- regression prevention;
- observability;
- contract tests;
- sales-evidence capture;
- fixes blocking a real prospect.

Deferred:
- auth;
- multi-tenancy;
- billing;
- generic AI agents;
- generalized CRM;
- major framework migration.

**Exit evidence**
- ≥3 qualified B2B demand signals; and
- ≥1 meeting, proposal request or paid pilot.

---

## v0.2 — Domain Core

**Entry condition:** v0.1 external-demand gate passes.

Formalize:
- organization;
- account/contact;
- diagnostic;
- funnel definition;
- recommendation;
- action;
- outcome;
- experiment.

Primary engineering question:
> What concepts repeat across real customer delivery?

Do not introduce multi-tenancy yet unless two active customers require it.

---

## v0.3 — Productized Delivery

**Entry condition:** at least two comparable implementations reveal repeated manual work.

Productize only repeated steps:
- source mapping;
- canonical funnel mapping;
- diagnostic generation;
- action queue;
- recurring management report;
- high-confidence alert.

Primary metric:
- delivery hours per customer ↓ while customer outcome quality stays ≥ baseline.

---

## v0.4 — Multi-client Kernel

**Entry condition:** simultaneous client operation makes isolation a real requirement.

Introduce:
- tenant/organization boundary;
- authenticated users;
- RBAC;
- RLS;
- audit events;
- environment separation.

Primary invariant:
> No customer can access another customer's raw or derived private data.

---

## v0.5 — Revenue Intelligence Engine

**Entry condition:** repeated customer questions justify reusable inference.

Pipeline:

`CRM/events → canonical funnel → features → leakage detection → opportunity ranking → recommended action`

Rule/statistical logic precedes ML unless validated incremental value justifies ML.

---

## v0.6 — Learning Engine

**Entry condition:** enough actions and outcomes exist to learn from.

Close:

`recommendation → action → outcome → learning → next recommendation`

Require counterfactual discipline where possible:
- baseline;
- control/comparison;
- experiment assignment;
- outcome window.

---

## v0.7 — Benchmark Network

**Entry condition:** several consenting clients have sufficiently normalized metrics.

Build privacy-preserving benchmarks:
- percentile;
- peer cohort;
- funnel-stage benchmark;
- operational benchmark.

Never expose identifiable cross-client data.

---

## v1.0 — Revenue Decision OS

A mature closed loop:

`Observe → Diagnose → Prioritize → Recommend → Execute → Measure → Learn`

The product is not “a dashboard with AI.”  
It is an operating loop whose decisions and outcomes are measurable.

## Permanent rule

A version is earned by repeated external evidence, not by feature count.

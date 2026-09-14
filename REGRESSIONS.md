# Regression Constitution — Kernel v0.1

A regression is any change that makes a previously working product capability fail or become materially less reliable.

During the first commercial sprint, regression risk has priority over feature expansion.

## R1 — Acquisition path

The following path must remain available in production:

`landing → demo → diagnostic CTA → form`

Failure examples:
- landing returns non-200;
- demo returns non-200;
- CTA target disappears;
- diagnostic form cannot be reached.

## R2 — Lead integrity

For a legitimate submission:
- exactly one lead should be accepted;
- duplicate protection should not create repeated same-day leads;
- PII must not be exposed through public metrics endpoints.

Failure examples:
- valid submission is silently dropped;
- one submit creates multiple leads;
- lead data becomes publicly queryable.

## R3 — Event integrity

The product must be able to record:
- `page_view`
- `cta_click`
- `form_started`
- `lead_submitted`

Analytics failure must never prevent the landing page from rendering.

## R4 — Management loop

`Record Founder Day` must continue to:
1. validate input;
2. update `data/scoreboard.json`;
3. commit the update;
4. publish a management readout to the CEO Control Tower.

## R5 — Deployment

Every commit merged to `main` must:
- pass repository validation;
- remain deployable on Vercel;
- keep the production landing and demo reachable.

## R6 — Decision traceability

Any material product change must identify:
- user/problem;
- expected result;
- measurable success criterion;
- rollback or kill condition.

## Merge policy

A change that violates R1–R6 is not mergeable unless the pull request explicitly declares and justifies a versioned contract change.

## Severity

**P0** — lead loss, PII exposure, production unavailable. Fix/revert immediately.

**P1** — tracking, scorecard, or management loop broken. Fix before new feature work.

**P2** — degraded UX with core path still functioning. Schedule after P0/P1.

**P3** — cosmetic/non-blocking. Do not interrupt commercial work.

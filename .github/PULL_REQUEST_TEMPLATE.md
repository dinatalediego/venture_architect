## Problem / user

Who has the problem and what observable friction exists?

## Smallest patch

Why is this the smallest reasonable change?

## Expected external result

What customer, operating, reliability or learning metric should change?

## Evidence

Link customer conversation, issue, regression, experiment, production observation, or other evidence.

## Contracts affected

- [ ] None
- [ ] Lead v1
- [ ] Event v1
- [ ] Experiment v1
- [ ] Scoreboard / management
- [ ] Database
- [ ] Other

If a contract changes, explain compatibility and migration.

## Regression review

Which invariants from `REGRESSIONS.md` could this break?

- [ ] R1 Acquisition path
- [ ] R2 Lead integrity
- [ ] R3 Event integrity
- [ ] R4 Management loop
- [ ] R5 Deployment
- [ ] R6 Decision traceability

## Verification

- [ ] Kernel contract tests pass
- [ ] Relevant smoke test exists/passes
- [ ] No real customer data was exposed in tests
- [ ] Production behavior is observable after merge

## Rollback / kill condition

How do we revert the change? What result would tell us to remove it?

## Stop-doing

What are we explicitly *not* building as part of this change?

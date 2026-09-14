# Incident / Regression Runbook

The goal is not to prove who caused a failure. The goal is to restore the kernel quickly, preserve evidence, and prevent recurrence.

## P0

Examples:
- production unavailable;
- lead submissions are lost;
- duplicate submissions are being created materially;
- private lead data is publicly exposed.

### Response
1. Stop unrelated merges.
2. Identify the last known-good deployment/commit.
3. Prefer revert/rollback when the breaking change is known.
4. Verify landing, demo, lead path and data permissions.
5. Record root cause only after service is restored.
6. Add or improve a test that would have detected the failure.

## P1

Examples:
- tracking is broken;
- scorecard workflow cannot record;
- CEO Control Tower cannot update;
- production smoke test fails while core landing still loads.

### Response
1. Pause feature work touching the affected subsystem.
2. Reproduce with the smallest deterministic check.
3. Fix or revert.
4. Re-run kernel contracts and production smoke.
5. Record the decision in the regression issue.

## P2/P3

Do not interrupt commercial work unless the defect materially reduces conversion or trust.

## Revert-first heuristic

Prefer revert when:
- the last change clearly caused the failure;
- rollback is low-risk;
- a forward fix would require guessing;
- customer evidence is currently being lost.

Prefer a forward fix when:
- rollback would reintroduce a known P0/P1;
- the fix is tiny, deterministic and tested;
- data migration makes rollback unsafe.

## Verification checklist

After remediation:
- [ ] production landing HTTP 200
- [ ] demo HTTP 200
- [ ] public config reachable
- [ ] public metrics aggregate only
- [ ] lead endpoint preflight works
- [ ] kernel contract tests pass
- [ ] production smoke tests pass
- [ ] Vercel production deployment READY
- [ ] no PII appears in logs/issues/tests

## Post-incident question

What invariant or contract was missing that allowed this failure to reach production?

The answer should normally become:
- a test,
- a clearer contract,
- a safer deployment rule,
- or a deleted source of complexity.

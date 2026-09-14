# Ten-Point Engineering Roadmap

This is the operating interpretation of the earlier “Torvalds-style” roadmap: small patches, explicit interfaces, regression intolerance, subsystem ownership and evidence before complexity.

| # | Principle | Implementation evidence | Status |
|---|---|---|---|
| 1 | Freeze the v0.1 kernel | `KERNEL.md` | DONE |
| 2 | Divide by subsystem responsibility | `MAINTAINERS.md` | DONE |
| 3 | Explicit maintainership | `MAINTAINERS.md`, `.github/CODEOWNERS` | DONE |
| 4 | One problem per PR | PR investment-memo template | DONE |
| 5 | Keep main deployable | active `Protect main` ruleset + CI + Vercel | DONE |
| 6 | Regression constitution | `REGRESSIONS.md` + Regression Watch + incident runbook | DONE |
| 7 | Contract/smoke tests | `tests/` + `kernel-contracts` | DONE |
| 8 | Stable versioned interfaces | `contracts/*.v1.schema.json` | DONE |
| 9 | Complexity budget | `data/architecture_budget.json` + architecture fitness gate | DONE |
| 10 | AI only after simpler baselines | `docs/ai-automation-policy.md` + architecture fitness gate | DONE |

## What “DONE” means

DONE does not mean “never revisit”.

It means the principle has:
1. a canonical artifact;
2. an executable or reviewable control where practical;
3. a known owner;
4. a path for deliberate change.

## Next roadmap gate

Do **not** create an 11th engineering principle merely to continue building.

The next roadmap transition is commercial evidence:

`v0.1 kernel → qualified demand → v0.2 domain core`

Until the Day-8 evidence gate is met, the preferred engineering outcome is a boring, stable kernel.

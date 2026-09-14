# AI & Automation Admission Policy

AI is an implementation option, not a product requirement.

The default sequence is:

`manual → rule → SQL/statistics → deterministic automation → ML/LLM advisor → bounded automation`

Skip a stage only when evidence demonstrates why the simpler stage is insufficient.

## AI admission gate

Before an AI/LLM component enters the production path, document:

1. the repeated task or decision;
2. the deterministic baseline;
3. the failure class the baseline cannot handle;
4. an evaluation dataset;
5. success/error metrics;
6. cost per useful outcome;
7. latency requirement;
8. fallback behavior;
9. data/privacy boundary;
10. human-review requirement.

If those artifacts do not exist, AI stays outside the critical path.

## Current v0.1 policy

Do not introduce:
- LLM orchestration frameworks;
- vector databases;
- autonomous outbound agents;
- AI-generated customer decisions without review;
- multi-agent committees as production architecture;
- model calls required for lead capture or core acquisition.

Allowed:
- offline exploration;
- drafting assistance;
- synthetic demo content clearly labeled synthetic;
- AI used by the founder outside the customer runtime;
- future bounded experiments after the gate is documented.

## Promotion ladder

### Level 0 — Manual
Human executes and records the workflow.

### Level 1 — Deterministic
Rules/scripts automate stable steps.

### Level 2 — Advisor
Model proposes; human accepts/rejects.

### Level 3 — Bounded automation
Model acts only inside explicit constraints and produces auditable output.

### Level 4 — Autonomous
Not a current target. Requires strong evidence, monitoring, rollback and business necessity.

## Kill criteria

Remove or demote an AI component when:
- it does not beat the deterministic baseline on the agreed metric;
- human correction cost erases the time saved;
- cost/latency becomes material relative to value;
- output cannot be traced sufficiently for the business decision;
- privacy or operational risk exceeds the measured benefit.

## Venture Committee question

Before approving AI:

> What evidence says intelligence is the bottleneck rather than data quality, process ownership, distribution or execution?

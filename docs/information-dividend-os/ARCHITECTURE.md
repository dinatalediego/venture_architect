# Architecture

## Separation of concerns

Information Dividend OS is a supervisory plane, not a data lake. Source systems remain authoritative and retain their own security boundaries.

```text
Source systems
  MEDALLIO / Cygnus
  Revenue Intelligence
  Patrimonio en Monedas
  Gold Decision Lab
  Health for Wealth
       │
       ▼
Read-only adapters / metadata contracts
       │
       ├── snapshot + freshness + quality
       ├── canonical metrics
       ├── analysis/model artifacts
       └── decisions/outcomes
       │
       ▼
Evidence Registry
       │
       ├── Workbench
       ├── Research Studio
       ├── RAG Lab
       ├── MLOps Lab
       └── Reports
```

## Why a supervisory plane

Centralizing all raw data would create unnecessary security, ownership and coupling risk. The supervisor instead stores references, contracts, lineage and safe aggregates/evaluation artifacts. Restricted row-level data is queried only by authorized server-side adapters.

## Evidence identity

Every important object receives a stable identity and version:

- `dataset_snapshot_id`
- `metric_definition_id@version`
- `analysis_run_id`
- `report_id`
- `rag_turn_id` / `rag_eval_run_id`
- `model_run_id` / `model_eval_id`
- `decision_id` / `action_id` / `outcome_id`

This makes a chart and a conversational answer comparable: both can be traced to the same snapshot and semantic definition.

## Adapter contract

A source adapter should expose only what the supervisor needs:

- health/status;
- latest available snapshot/cut;
- freshness age and SLO;
- safe schema metadata;
- quality checks and reconciliation status;
- query/analysis capability for authorized users;
- evidence references for citations;
- optional aggregate metrics.

Credentials remain server-side. No service-role key, database password or private account export belongs in browser code or this repository.

## Workbench execution

The UI describes an analysis as a manifest. Execution engines may differ by source:

- SQL/Postgres for canonical marts and aggregates;
- Python for statistical/econometric/data-science routines;
- source-native analytical views where appropriate.

The output is always persisted as an evidence object with the exact manifest and snapshot lineage.

## RAG execution

RAG retrieves from approved evidence objects, not arbitrary application state. It can invoke canonical calculations through tools/adapters, but must return the exact evidence ids used. Evaluation cases become regression tests for future prompt/retrieval/model changes.

## Production status

Deployment status and analytical production status are intentionally separate. `DEPLOYED` means software is reachable. `PRODUCTION_VERIFIED` means applicable data, analysis, RAG, ML and outcome gates pass.

# Information Dividend OS

Information Dividend OS is the supervisory analytics layer for Venture Architect. Its purpose is to make existing datasets produce recurring informational value rather than isolated dashboards or one-off analyses.

## Supervisor mental model

The product intentionally supports two complementary modes:

1. **Quantitative Workbench** — familiar to Power BI / Jupyter / EViews / Stata users. It exposes dataset status, visual analysis, statistical/econometric diagnostics, experiment/model outputs and reproducible report generation.
2. **Conversational RAG** — a grounded interface over approved datasets, metrics, reports, model cards, experiments and outcomes. Every answer must be attributable to evidence and evaluable.

Both modes converge on the same evidence layer. A chart, notebook result and conversational answer should reference the same canonical metric definition and dataset version.

## Closed loop

`dataset -> quality/freshness -> semantic metric -> analysis -> model/experiment -> decision -> action -> outcome -> evaluation -> new evidence`

The system is not considered healthy merely because a pipeline ran. Production readiness requires evidence across data quality, reproducibility, RAG grounding, model evaluation, observed outcomes and operational freshness.

## Initial dataset families

- Real Estate Intelligence / MEDALLIO-Cygnus
- Revenue Intelligence OS
- Personal Capital / Patrimonio en Monedas
- Gold Decision Lab
- Health for Wealth

Sensitive operational data is never copied into this public repository. The repository contains metadata contracts, adapters and safe demonstration payloads only.

## Core surfaces

- **Command Center** — flywheel status and informational dividend KPIs.
- **Data Catalog** — datasets, owners, freshness, grain, lineage, quality and access class.
- **Workbench** — chart specifications, statistical/econometric tests, notebooks and reproducible analyses.
- **Research Studio** — hypotheses, methods, results and report/thesis generation.
- **RAG Lab** — grounded conversations, citations, evaluation suites, failure review and feedback.
- **MLOps Lab** — model versions, training data snapshots, backtests, calibration, drift, challenger/champion and promotion gates.
- **Decision & Outcome Memory** — decisions, interventions, expected effects, observed outcomes and lessons.

## Production gate

A component may be marked `PRODUCTION_VERIFIED` only when all applicable checks pass:

- canonical data contract exists;
- freshness SLO is met;
- required quality checks pass;
- metric definitions are versioned;
- analysis is reproducible from a snapshot/version;
- RAG answers meet grounding/citation thresholds;
- predictive models have leakage-safe out-of-sample evaluation;
- actions have an outcome-capture path;
- monitoring and rollback/fallback exist.

See `contracts/system.json` for the machine-readable v0 contract.

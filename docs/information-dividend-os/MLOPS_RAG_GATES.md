# RAG + MLOps gates

## RAG evaluation suite

Every promoted RAG configuration must be evaluated on a versioned question set covering:

- exact metric lookup;
- time-window comparison;
- causal/econometric caution;
- dataset freshness questions;
- model-performance questions;
- cross-system synthesis;
- insufficient-evidence / abstention cases.

Minimum recorded fields per evaluation case:

`question_id, prompt_version, retrieval_config_version, corpus_snapshot_id, expected_evidence_ids, answer, cited_evidence_ids, grounded_score, citation_coverage, completeness_score, abstention_expected, abstained, reviewer_feedback`

Promotion blocks:

- uncited substantive claims;
- retrieval from a dataset outside the user's authorized scope;
- stale evidence presented as current;
- model claims without model/run version;
- failure to abstain when required evidence is absent.

## ML evaluation suite

Required lineage:

`training_snapshot -> feature_version -> model_run -> validation_run -> prediction -> action -> outcome`

Promotion requires, where applicable:

- time-aware train/validation/test separation;
- explicit leakage checks;
- baseline comparison;
- calibration evaluation for probabilities;
- cost-sensitive metric aligned to the decision;
- stability by relevant segment;
- drift monitoring;
- rollback/challenger path;
- post-decision outcome capture.

## Analysis/research reproducibility

Every saved analysis should be representable by a manifest containing:

`analysis_id, dataset_snapshot_ids, filters, transformations, variables, estimator_or_method, parameters, software_environment, outputs, created_at`

A report is generated from saved analysis objects rather than manually retyping numbers. This is the bridge between the Power-BI/Jupyter-like surface and a thesis/report-style deliverable.

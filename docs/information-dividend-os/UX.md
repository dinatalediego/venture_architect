# UX contract — supervisor familiar to an econometric/data-science user

The product should feel like a hybrid of Power BI, Jupyter, EViews/Stata and a grounded research assistant, without pretending those tools are interchangeable.

## Persistent supervisor shell

Left rail:
- Command Center
- Catalog
- Workbench
- Research
- RAG Lab
- MLOps
- Decisions & Outcomes
- Reports

Top context bar:
- active dataset family
- environment (demo / connected / production)
- data cut / snapshot timestamp
- freshness state
- active metric-definition version
- evidence badge

Right inspector:
- lineage
- metric definition
- filters / sample restrictions
- model / analysis run id
- citations / source rows or artifacts
- warnings and assumptions

## Workbench mode

Three panes inspired by quantitative tools:

1. **Object navigator** — datasets, series, variables, models, equations, notebooks and saved views.
2. **Analysis canvas** — chart/table/result view, with selectable methods such as descriptive statistics, correlation, distribution, regression, time-series diagnostics, cohort/funnel and experiment analysis.
3. **Specification / output log** — explicit formula, sample, transformations, estimator, robust-SE choice, run id and warnings.

The user must be able to move from a graph to a formal specification and then to a reproducible report without changing the underlying evidence version.

## RAG mode

Conversation is not a separate truth layer. It queries approved evidence objects.

Every substantive answer should expose:
- datasets used;
- data cut / snapshot;
- metric versions;
- retrieval citations;
- calculation / query id when applicable;
- model version when applicable;
- confidence/limitations;
- feedback: correct / incomplete / wrong / investigate.

A conversational answer becomes a test case when the user rates or corrects it.

## Test-as-supervision

The supervisor's final test is not merely "the chatbot sounds right". The UI surfaces four parallel checks:

- **Data:** freshness, schema/contract, missingness, duplicates, reconciliation.
- **Analysis:** reproducibility, sample definition, estimator assumptions, benchmark comparison.
- **RAG:** retrieval precision, citation coverage, answer faithfulness, abstention behavior.
- **ML/MLOps:** leakage, OOS metrics, calibration, drift, outcome capture, champion/challenger promotion.

A green production badge requires all applicable gates, not only a successful deployment.

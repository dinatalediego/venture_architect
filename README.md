# Venture Architect

**Venture Architect** is a capital-efficient venture operating system and its first operating company: **Revenue Intelligence OS for real-estate sales teams**.

This repository is intentionally two products in one:

1. **Revenue Intelligence OS** — a sellable B2B SaaS + productized-service MVP designed to get external demand evidence in 7 days.
2. **Venture Architect OS** — a management committee, experimentation system, decision memory, and GitHub Actions control tower inspired by Peter Drucker's management discipline and Lean Startup's build-measure-learn loop.

## The Day-8 contract

The first phase is not judged by how much software is written. It is judged by **evidence outside the building**.

Primary Day-8 success gate:
- at least **3 qualified B2B leads / positive conversations**, and
- at least **1 meeting booked**, or
- a paid pilot / explicit proposal request.

If there is no external evidence after sufficient outreach, the default response is **change the offer / segment / channel before building more software**.

## First offer

**Revenue Intelligence Diagnostic**

> We connect the commercial funnel, identify where revenue is leaking, and give the sales manager a prioritized action queue — before asking them to buy a large implementation.

Founding offer:
- Diagnostic: free 30–45 min discovery + mini assessment.
- Founding Pilot: **S/ 1,500** for a 14-day implementation sprint.
- Operate: from **S/ 990/month** after the pilot.
- Higher automation tier: from **S/ 1,990/month**.

These are test prices, not truths. Price is an experiment and should move with evidence.

## Repository map

```text
app/                         Static MVP deployable to Vercel
  index.html                 Commercial landing page
  demo.html                  Interactive SaaS demo
  config.js                  Supabase function endpoints
  assets/

data/                        Operating truth in machine-readable form
  scoreboard.json            Daily founder scoreboard
  objectives.json            Objectives + key results
  experiments.json           Lean experiments
  offer.json                 Offer contract
  prospects.csv              20 verified real-estate target accounts + research routes

scripts/
  venture_review.py          Drucker + Lean daily/weekly review engine
  record_day.py              Update the founder scoreboard
  generate_outreach.py       Generate personalized outreach drafts
  validate_repo.py           Repository contract validation

docs/
  7-day-launch.md            Exact manual execution plan
  committee-charter.md       Venture Architect committee constitution
  drucker-lean-os.md         Management operating system
  sales-playbook.md          ICP, discovery, outreach, close
  measurement-contract.md    Metrics definitions and Day-8 gate
  architecture.md            SaaS + data architecture
  deployment.md              Minimal deployment steps
  day8-gate.md               Continue/pivot/stop criteria
  moat-roadmap.md            Service -> software -> proprietary data path
  first-hour.md              One-hour go-live + selling checklist

.github/
  workflows/                 Automated control tower + manual scorecard input
  ISSUE_TEMPLATE/            Interviews, experiments, decisions, leads

supabase/                     Reproducible backend contract
```

## Fastest path to a live company

Start with [`docs/first-hour.md`](docs/first-hour.md). The repository includes safe bootstrap scripts for pushing to the canonical remote after the empty `dinatalediego/venture_architect` repository exists.

The prospecting workbench is pre-seeded with 20 real companies verified from public sources on 2026-09-14. These are research targets, not permission to spam: identify the relevant commercial/marketing decision maker and personalize every founder outreach.

## Local preview

No framework is required for the MVP.

```bash
cd app
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Daily operating ritual

At the end of each workday:

```bash
python scripts/record_day.py \
  --prospects-added 20 \
  --outbound-sent 15 \
  --replies 3 \
  --qualified-conversations 1 \
  --meetings-booked 1 \
  --selling-hours 2.5 \
  --build-hours 1 \
  --learning "Managers respond more to leakage language than dashboard language" \
  --bottleneck "Not enough direct conversations" \
  --tomorrow "Call 10 sales managers before coding"

python scripts/venture_review.py
```

The management principle is deliberately strict:

> **Software is an investment, not activity. Every build item must have a business hypothesis, a user, a measurable expected result, and a kill criterion.**

## Backend already provisioned

The MVP is configured to use Supabase Edge Functions for:
- lead capture,
- behavioral events,
- public-safe aggregate funnel metrics.

Direct table access is denied to `anon` and `authenticated`; functions use privileged server-side access.

## What happens after Day 8

If demand exists:

`manual diagnostic -> reusable delivery kit -> managed recurring service -> workflow automation -> proprietary benchmark data -> vertical SaaS`

If demand does not exist:

`interview evidence -> revise ICP/problem/offer/channel -> repeat a small experiment`

Do **not** respond to weak demand by adding features.

# Venture Architect

**Venture Architect** is a capital-efficient venture operating system and its first operating company: **Revenue Intelligence OS for real-estate sales teams**.

## Live MVP

- **Production:** https://venture-architect-seven.vercel.app
- **Interactive demo:** https://venture-architect-seven.vercel.app/demo.html
- **Deployment:** Vercel production, auto-deploy from `main`
- **Backend:** Supabase Edge Functions + Postgres
- **Management:** GitHub Actions + Issue #1 CEO Control Tower
- **Day-8 gate:** 2026-09-21

Current technical status after go-live:
- Landing: HTTP 200
- Demo: HTTP 200
- GitHub validation workflow: passing
- GitHub → Vercel auto-deploy: verified
- Browser events → Supabase: verified with page views, CTA click and form-start events

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
  experiments.json           Lean experiments

scripts/
  venture_review.py          Drucker + Lean daily/weekly review engine
  record_day.py              Update the founder scoreboard

.github/
  workflows/                 Automated control tower + manual scorecard input
```

## Daily operating ritual

Use **Actions → Record Founder Day** instead of editing the scorecard manually. Record:
- prospects added,
- personalized outbound,
- replies,
- positive replies,
- qualified conversations,
- meetings,
- proposals,
- customers won,
- revenue,
- selling hours,
- build hours,
- biggest learning,
- bottleneck,
- tomorrow's one thing.

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

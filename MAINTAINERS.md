# MAINTAINERS

Venture Architect is organized by **subsystem responsibility**, not by framework.

The maintainer model exists to keep interfaces stable as the product grows. Today the founder is the human owner of every subsystem, but ownership boundaries are explicit from v0.1.

## Acquisition

**Paths**
- `app/`
- future `acquisition/`

**Purpose**
Turn relevant traffic into measurable commercial conversations.

**Invariant**
A valid prospect must always be able to reach the diagnostic flow and submit contact information.

**Primary metrics**
- relevant visits
- CTA clicks
- form starts
- qualified leads

**Do not optimize for**
- vanity traffic
- page count
- design complexity without conversion evidence

---

## Revenue Intelligence

**Paths**
- current demo logic in `app/demo.html`
- future `intelligence/`

**Purpose**
Translate commercial data into prioritized action.

**Invariant**
Every recommendation must be traceable to evidence, a business metric, and an expected outcome.

**Primary metrics**
- leakage detected
- actions accepted
- actions completed
- observed outcome delta

---

## Experimentation

**Paths**
- `data/experiments.json`
- future `experiments/`

**Purpose**
Reduce uncertainty with falsifiable tests.

**Invariant**
Every experiment has a hypothesis, riskiest assumption, metric, target, kill criterion and decision.

**Primary metrics**
- experiments concluded
- assumptions invalidated
- time-to-learning

---

## Venture OS

**Paths**
- `data/scoreboard.json`
- `scripts/record_day.py`
- `scripts/venture_review.py`
- `.github/workflows/`

**Purpose**
Run the company through explicit objectives, evidence and decisions.

**Invariant**
Management output must distinguish activity from external results.

**Primary metrics**
- qualified conversations
- meetings
- paid pilots
- revenue
- selling/build ratio

---

## Platform

**Paths**
- Vercel project
- Supabase project
- GitHub repository

**Purpose**
Keep the product deployable, observable and reversible.

**Invariant**
`main` remains deployable. Production changes are traceable to a commit.

**Primary metrics**
- deployment success
- regression rate
- endpoint health

---

## Review routing

Until there are multiple humans:
- founder remains final business owner;
- engineering changes still require CI validation;
- changes that alter contracts or database shape require an explicit migration/review note;
- changes that can break acquisition or lead capture require production smoke tests.

## Future ownership rule

A subsystem gets a separate human maintainer only when:
1. it has enough recurring change to justify ownership;
2. its interfaces are stable enough to be reviewed independently;
3. the maintainer can own both uptime and product consequences.

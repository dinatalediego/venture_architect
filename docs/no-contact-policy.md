# Commercial No-Contact / Exclusion Policy

This is a **commercial conflict and targeting policy**, not a judgment about the excluded people or companies.

The purpose is to prevent outreach that creates:
- client-conflict risk;
- channel/brand mismatch;
- unwanted geographic overlap;
- founder-defined relationship conflicts.

## Current exclusion rules

### 1. Influencers / public-personality profiles

Do not prospect people the founder classifies as influencers, creators or public-personality profiles.

Current explicit example:
- **Pamela Gálvez — Andiamo**.

This is a **person-level** exclusion. It does not automatically blacklist every employee of the company unless the company is separately excluded.

### 2. Direct competitors of existing clients

Do not prospect a company identified by the founder as a direct competitor of an existing client.

Current explicit example:
- **Ditrenzzo — company-wide exclusion**.
- **Luis Rafael Guillen Huamancaja — explicit person safeguard**.

This exclusion applies even if another contact at Ditrenzzo is later enriched.

### 3. Restricted geography: Jesús María

Do not prospect companies that are **currently developing, marketing or selling a project in Jesús María**.

Historical-only activity does not automatically trigger the rule unless the founder later changes the policy to “ever operated”.

Current confirmed exclusions from the canonical prospect universe:
- Ciudaris
- Ditrenzzo
- Invent Inmobiliaria
- V&V Grupo Inmobiliario
- Abril Grupo Inmobiliario
- Desarrolladora

The evidence source and verification date live in `data/prospect_geography.csv`.

## Enforcement order

Before generating any outreach draft:

1. company explicit exclusion;
2. restricted active geography;
3. person explicit exclusion;
4. only then ICP/tier/enrichment selection.

**Explicit exclusions always win.**

## Data files

- `data/no_contact.csv` — founder/business exclusions.
- `data/prospect_geography.csv` — evidence used for geographic exclusions.
- `data/prospects.csv` — candidate universe.
- `data/decision_makers.csv` — enriched public decision makers.

## Safety behavior

The outreach generator is **fail-closed for explicit exclusions**:
- a blocked company cannot re-enter through `--include-unenriched`;
- a blocked person cannot appear in a draft;
- a company with a current-active project in a blocked district cannot appear.

Unknown geography is not automatically treated as blocked; instead it remains a research gap. Before scaling outreach, geography enrichment should be completed for the candidate account.

## Change control

Only add or remove exclusions when one of these is true:
- founder directive;
- verified client-conflict rule;
- verified geography rule;
- documented commercial-policy decision.

Do not infer exclusions from protected characteristics or personal/sensitive attributes.

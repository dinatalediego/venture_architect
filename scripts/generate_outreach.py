#!/usr/bin/env python3
import argparse
import csv
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

p = argparse.ArgumentParser(description="Generate a small founder-led outreach workbench. Never sends messages.")
p.add_argument("--input", default=ROOT / "data/prospects.csv")
p.add_argument("--decision-makers", default=ROOT / "data/decision_makers.csv")
p.add_argument("--no-contact", default=ROOT / "data/no_contact.csv")
p.add_argument("--geography", default=ROOT / "data/prospect_geography.csv")
p.add_argument("--output", default=ROOT / "artifacts/outreach_drafts.md")
p.add_argument("--tier", default="A")
p.add_argument("--limit", type=int, default=5)
p.add_argument(
    "--include-unenriched",
    action="store_true",
    help="Include accounts without a verified public decision maker. Explicit exclusions still apply.",
)
a = p.parse_args()


def read_csv(path):
    with open(path, encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def norm(value):
    value = (value or "").strip().casefold()
    value = "".join(
        char for char in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(char)
    )
    return " ".join(value.split())


prospects = read_csv(a.input)
decision_rows = read_csv(a.decision_makers) if Path(a.decision_makers).exists() else []
no_contact_rows = read_csv(a.no_contact) if Path(a.no_contact).exists() else []
geography_rows = read_csv(a.geography) if Path(a.geography).exists() else []

decision_makers = {
    norm(row["company"]): row
    for row in decision_rows
    if row.get("company")
}

blocked_companies = {}
blocked_people = {}
blocked_districts = {}
for row in no_contact_rows:
    if norm(row.get("active")) not in {"true", "1", "yes", "si"}:
        continue
    scope = norm(row.get("scope"))
    value = norm(row.get("match_value"))
    if not value:
        continue
    reason = row.get("reason") or row.get("category") or "Commercial exclusion"
    if scope == "company":
        blocked_companies[value] = reason
    elif scope == "person":
        blocked_people[value] = reason
    elif scope == "district":
        blocked_districts[value] = reason

company_active_districts = {}
for row in geography_rows:
    if norm(row.get("activity_status")) != "current_active":
        continue
    company = norm(row.get("company"))
    district = norm(row.get("district"))
    if company and district:
        company_active_districts.setdefault(company, set()).add(district)


def exclusion_reason(company, enriched):
    company_key = norm(company)

    if company_key in blocked_companies:
        return f"company: {blocked_companies[company_key]}"

    for district in company_active_districts.get(company_key, set()):
        if district in blocked_districts:
            return f"district: {blocked_districts[district]}"

    person = norm((enriched or {}).get("contact_name"))
    if person and person in blocked_people:
        return f"person: {blocked_people[person]}"

    return None


selected = []
excluded = []
for row in prospects:
    company = (row.get("company") or "").strip()
    if not company:
        continue

    if a.tier and row.get("tier") != a.tier:
        continue

    enriched = decision_makers.get(norm(company), {})
    blocked = exclusion_reason(company, enriched)
    if blocked:
        excluded.append((company, (enriched.get("contact_name") or "").strip(), blocked))
        continue

    if not enriched and not a.include_unenriched:
        continue

    selected.append((row, enriched))
    if a.limit > 0 and len(selected) >= a.limit:
        break

out = [
    "# Founder Outreach Workbench",
    "",
    "> Drafts only. No message is sent by this script. Verify the public role, personalize the observation, and send manually.",
    "> Commercial exclusions are applied before tier/enrichment selection.",
    "",
    f"Selection: tier={a.tier or 'ALL'} · enriched_only={not a.include_unenriched} · limit={a.limit}",
    f"Policy exclusions encountered in scanned tier: {len(excluded)}",
    "",
]

for prospect, enriched in selected:
    company = prospect["company"].strip()
    name = (enriched.get("contact_name") or prospect.get("contact_name") or "").strip()
    role = (enriched.get("role") or prospect.get("role") or "").strip()
    hypothesis = (enriched.get("outreach_hypothesis") or "").strip()
    why = (prospect.get("why_fit") or "un equipo comercial con leads digitales").strip()
    first_name = name.split()[0] if name else ""
    salutation = f"Hola {first_name}" if first_name else "Hola"

    message = (
        f"{salutation}. Estoy construyendo un workflow de Revenue Intelligence para equipos inmobiliarios "
        f"y estuve revisando el contexto público de {company}. La idea no es sumar otro dashboard: "
        "buscamos convertir señales del funnel —lead, contacto, cita y venta— en una cola semanal de acciones "
        "y luego medir si esas acciones realmente movieron el resultado."
    )
    if hypothesis:
        message += f" Quisiera contrastar una hipótesis contigo: {hypothesis}"
    message += " Si te hace sentido, puedo mostrarte el prototipo y mapear un caso en 20 minutos, sin pedir acceso sensible."

    out += [
        f"## {company} — {name or 'decisor por identificar'}",
        "",
        f"**Rol público:** {role or 'por validar'}",
        f"**Por qué entra al ICP:** {why}",
        f"**Fuente decisor:** {enriched.get('evidence_url') or 'por validar'}",
        "",
        "### Draft",
        "",
        message,
        "",
        "### Before sending",
        "- Confirm role is still current.",
        "- Re-check no-contact/client-conflict/geography policy.",
        "- Replace one generic phrase with a company-specific observation.",
        "- Keep the ask to one 20-minute diagnostic.",
        "- Record reply/objection as evidence; do not debate the prospect.",
        "",
        f"**Next action:** {prospect.get('next_action') or 'Personalize and send'}",
        "",
        "---",
        "",
    ]

if not selected:
    out += [
        "No eligible prospects matched the requested filters.",
        "Do not bypass the no-contact policy to fill the batch; enrich replacement accounts instead.",
    ]

Path(a.output).parent.mkdir(parents=True, exist_ok=True)
Path(a.output).write_text("\n".join(out), encoding="utf-8")
print(f"{a.output} ({len(selected)} drafts, {len(excluded)} excluded)")

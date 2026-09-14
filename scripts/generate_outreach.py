#!/usr/bin/env python3
import argparse
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

p = argparse.ArgumentParser(description="Generate a small founder-led outreach workbench. Never sends messages.")
p.add_argument("--input", default=ROOT / "data/prospects.csv")
p.add_argument("--decision-makers", default=ROOT / "data/decision_makers.csv")
p.add_argument("--output", default=ROOT / "artifacts/outreach_drafts.md")
p.add_argument("--tier", default="A")
p.add_argument("--limit", type=int, default=5)
p.add_argument(
    "--include-unenriched",
    action="store_true",
    help="Include accounts without a verified public decision maker. Default is enriched-only.",
)
a = p.parse_args()


def read_csv(path):
    with open(path, encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


prospects = read_csv(a.input)
decision_rows = read_csv(a.decision_makers) if Path(a.decision_makers).exists() else []
decision_makers = {row["company"].strip(): row for row in decision_rows if row.get("company")}

selected = []
for row in prospects:
    if not row.get("company"):
        continue
    if a.tier and row.get("tier") != a.tier:
        continue
    enriched = decision_makers.get(row["company"].strip())
    if not enriched and not a.include_unenriched:
        continue
    selected.append((row, enriched or {}))
    if a.limit > 0 and len(selected) >= a.limit:
        break

out = [
    "# Founder Outreach Workbench",
    "",
    "> Drafts only. No message is sent by this script. Verify the public role, personalize the observation, and send manually.",
    "",
    f"Selection: tier={a.tier or 'ALL'} · enriched_only={not a.include_unenriched} · limit={a.limit}",
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
        "No matching enriched prospects found.",
        "Use --include-unenriched to include accounts that still need decision-maker research.",
    ]

Path(a.output).parent.mkdir(parents=True, exist_ok=True)
Path(a.output).write_text("\n".join(out), encoding="utf-8")
print(f"{a.output} ({len(selected)} drafts)")

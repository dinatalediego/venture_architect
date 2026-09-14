#!/usr/bin/env python3
import argparse
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument("--input", default=ROOT / "data/prospects.csv")
p.add_argument("--output", default=ROOT / "artifacts/outreach_drafts.md")
a = p.parse_args()

with open(a.input, encoding="utf-8") as handle:
    rows = list(csv.DictReader(handle))

out = [
    "# Founder Outreach Drafts",
    "",
    "> These are drafts, not a bulk-send queue. Identify the relevant buyer and personalize the observation before sending.",
    "",
]

for r in rows:
    if not r.get("company"):
        continue
    name = (r.get("contact_name") or "").strip()
    company = r["company"]
    why = r.get("why_fit") or "un equipo comercial con leads digitales"
    salutation = f"Hola {name}" if name else "Hola"

    out += [
        f"## {company} — {name or 'decisor por identificar'}",
        "",
        (
            f"{salutation}. Estoy construyendo un workflow de Revenue Intelligence para equipos inmobiliarios "
            f"y {company} me pareció relevante por {why.lower()}. La idea no es sumar otro dashboard: "
            "buscamos dónde se pierde revenue entre lead, contacto, cita y venta, y lo convertimos en una "
            "cola semanal de acciones para el gerente comercial. Esta semana estoy abriendo una cohorte "
            "fundadora pequeña. Si hoy tienen fricción en seguimiento, velocidad de respuesta o visibilidad "
            "del funnel, puedo mapearlo contigo en 20 minutos y mostrarte el prototipo."
        ),
        "",
        f"**Next action:** {r.get('next_action') or 'Personalize and send'}",
        "",
        "---",
        "",
    ]

Path(a.output).parent.mkdir(parents=True, exist_ok=True)
Path(a.output).write_text("\n".join(out), encoding="utf-8")
print(a.output)

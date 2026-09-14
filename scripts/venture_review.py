#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, urllib.request
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def live_metrics(url):
    if not url: return {}
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            return json.load(r)
    except Exception as exc:
        return {"_warning": f"Live metrics unavailable: {type(exc).__name__}"}

def totals(days):
    fields=["prospects_added","outbound_sent","replies","positive_replies","qualified_conversations","meetings_booked","proposals_sent","leads_inbound","customers_won"]
    out={f:0 for f in fields}
    out.update({"revenue_pen":0.0,"build_hours":0.0,"selling_hours":0.0,"learning_hours":0.0})
    for d in days:
        for f in out: out[f]+=float(d.get(f,0) or 0)
    return out

def pct(a,b): return 0 if not b else a/b

def status_for(scoreboard, t, live):
    target=scoreboard["targets"]
    qual=t.get("qualified_conversations",0)+float(live.get("funnel",{}).get("leads",0) or 0)
    meets=t.get("meetings_booked",0)
    sell_build=t["selling_hours"]/max(t["build_hours"],0.5)
    if qual>=target["positive_or_qualified_conversations"] and meets>=target["meetings_booked"]: return "GREEN"
    if t["outbound_sent"]>=40 and (t.get("positive_replies",0)+qual)==0: return "RED"
    if t["build_hours"]>0 and sell_build<1 and t["outbound_sent"]<20: return "RED"
    return "AMBER"

def render(scoreboard, experiments, live, mode="daily"):
    t=totals(scoreboard.get("daily",[])); targets=scoreboard["targets"]
    status=status_for(scoreboard,t,live)
    live_f=live.get("funnel",{}) if isinstance(live,dict) else {}
    gate=date.fromisoformat(scoreboard["day8_gate_date"]); today=date.today(); days=max(0,(gate-today).days)
    positive=t.get("positive_replies",0)
    qual=t.get("qualified_conversations",0)
    sell_build=t["selling_hours"]/max(t["build_hours"],0.5)
    active=[e for e in experiments.get("experiments",[]) if e.get("status") in {"planned","running"}]
    latest=scoreboard.get("daily",[])[-1] if scoreboard.get("daily") else {}
    lines=[]
    lines += [f"# {'Weekly Venture Committee' if mode=='committee' else 'CEO Daily Brief'} — {today.isoformat()}", "", f"**Venture health: {status}** · Day-8 gate in **{days} day(s)**", ""]
    lines += ["## Results outside the building", "", "| Metric | Actual | Target |", "|---|---:|---:|",
              f"| Prospects added | {t['prospects_added']:g} | {targets['prospects_added']} |",
              f"| Outbound sent | {t['outbound_sent']:g} | {targets['outbound_sent']} |",
              f"| Positive replies | {positive:g} | leading signal |",
              f"| Qualified conversations | {qual:g} | {targets['qualified_conversations_stretch']} |",
              f"| Meetings booked | {t['meetings_booked']:g} | {targets['meetings_stretch']} |",
              f"| Proposals | {t['proposals_sent']:g} | — |",
              f"| Customers won | {t['customers_won']:g} | {targets['paid_pilots']} |",
              f"| Revenue | S/ {t['revenue_pen']:,.0f} | — |"]
    if live_f:
        lines += ["", "### Live MVP funnel (last 7 days)", "", f"Page views: **{live_f.get('page_views',0)}** · CTA clicks: **{live_f.get('cta_clicks',0)}** · Form starts: **{live_f.get('form_started',0)}** · Leads: **{live_f.get('leads',0)}** · High priority: **{live_f.get('high_priority_leads',0)}**"]
    elif live.get("_warning"):
        lines += ["", f"> {live['_warning']}"]
    lines += ["", "## Management discipline", "", f"- **Selling hours:** {t['selling_hours']:g}", f"- **Build hours:** {t['build_hours']:g}", f"- **Sell/build ratio:** {sell_build:.2f}× (guardrail ≥ {targets['sell_build_ratio_min']}×)", f"- **Reply rate:** {pct(t['replies'],t['outbound_sent']):.1%}", f"- **Qualified / reply:** {pct(qual,t['replies']):.1%}"]
    lines += ["", "## Drucker questions", "", f"- **What must be done?** {latest.get('tomorrow_one_thing','Create external customer evidence before adding product scope.')}", f"- **Current bottleneck:** {latest.get('bottleneck','Not enough customer evidence yet.')}", "- **Opportunity focus:** conversations that can progress to a diagnostic/pilot, not generic audience growth.", "- **Stop-doing candidate:** any build task without a named customer problem and an observable expected result."]
    lines += ["", "## Lean learning loop", ""]
    for e in active[:5]: lines.append(f"- **{e['id']} — {e['name']}** ({e['status']}): {e['riskiest_assumption']} → next: {e['next_action']}")
    if latest.get("biggest_learning"): lines += ["", f"**Latest learning:** {latest['biggest_learning']}"]
    lines += ["", "## Chair decision", ""]
    if status=="GREEN":
        lines += ["**CONTINUE / CONCENTRATE.** Preserve selling intensity. Productize only the repeated delivery step currently blocking qualified opportunities."]
    elif status=="RED":
        lines += ["**INTERVENE.** Do not answer weak evidence with features. Increase customer contact immediately or change one of ICP / pain / offer / channel based on interviews."]
    else:
        lines += ["**CONTINUE THE EXPERIMENT, NOT THE ASSUMPTION.** Evidence is not yet strong enough for scale. The next allocation should maximize qualified conversations."]
    lines += ["", "### Required next evidence", "- One observable customer action (reply, meeting, data sample, proposal request or payment).", "- One explicit objection recorded verbatim.", "- One decision about what *not* to build."]
    return "\n".join(lines)+"\n"

def main():
    p=argparse.ArgumentParser(); p.add_argument('--scoreboard',default=ROOT/'data/scoreboard.json'); p.add_argument('--experiments',default=ROOT/'data/experiments.json'); p.add_argument('--metrics-url',default='https://tlyczyfsboqrtrdpwizp.supabase.co/functions/v1/venture-public-metrics'); p.add_argument('--output',default=ROOT/'artifacts/latest_ceo_brief.md'); p.add_argument('--mode',choices=['daily','committee'],default='daily'); a=p.parse_args()
    sb=load(a.scoreboard); ex=load(a.experiments); live=live_metrics(a.metrics_url); report=render(sb,ex,live,a.mode)
    Path(a.output).parent.mkdir(parents=True,exist_ok=True); Path(a.output).write_text(report,encoding='utf-8'); print(report)
if __name__=='__main__': main()
#!/usr/bin/env python3
import argparse,json
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; PATH=ROOT/'data/scoreboard.json'
p=argparse.ArgumentParser()
for name in ['prospects_added','outbound_sent','replies','positive_replies','qualified_conversations','meetings_booked','proposals_sent','leads_inbound','customers_won']:
    p.add_argument('--'+name.replace('_','-'),type=int,default=0,dest=name)
for name in ['revenue_pen','build_hours','selling_hours','learning_hours']:
    p.add_argument('--'+name.replace('_','-'),type=float,default=0,dest=name)
p.add_argument('--learning',default='',dest='biggest_learning');p.add_argument('--bottleneck',default='');p.add_argument('--tomorrow',default='',dest='tomorrow_one_thing');p.add_argument('--date',default=date.today().isoformat())
a=p.parse_args();data=json.loads(PATH.read_text(encoding='utf-8'));row=vars(a)
existing=[x for x in data['daily'] if x.get('date')!=row['date']];existing.append(row);data['daily']=sorted(existing,key=lambda x:x['date']);PATH.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding='utf-8');print(f"Recorded {row['date']}")
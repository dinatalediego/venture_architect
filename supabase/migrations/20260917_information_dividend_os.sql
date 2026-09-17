-- Information Dividend OS supervisory registry
-- Additive only. No source-system tables are modified.

create table if not exists public.ido_systems (
  id text primary key,
  label text not null,
  family text not null,
  source_ref text,
  gate text not null default 'EVIDENCE_BUILDING',
  status_detail jsonb not null default '{}'::jsonb,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ido_datasets (
  id text primary key,
  system_id text not null references public.ido_systems(id) on delete cascade,
  label text not null,
  grain text not null,
  freshness_slo text,
  sensitivity text not null,
  dividend text not null,
  runtime_mode text not null default 'contract',
  metadata jsonb not null default '{}'::jsonb,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ido_metric_definitions (
  metric_id text not null,
  version text not null default '1.0.0',
  label text not null,
  family text not null,
  formula text,
  time_basis text,
  status text not null default 'draft',
  definition jsonb not null default '{}'::jsonb,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (metric_id, version)
);

create table if not exists public.ido_evidence_objects (
  id uuid primary key default gen_random_uuid(),
  evidence_type text not null,
  system_id text references public.ido_systems(id) on delete set null,
  dataset_id text references public.ido_datasets(id) on delete set null,
  snapshot_key text,
  source_ref text,
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.ido_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'draft',
  manifest jsonb not null,
  output_refs jsonb not null default '[]'::jsonb,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.ido_rag_turns (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  corpus_snapshot_key text,
  prompt_version text,
  retrieval_version text,
  evidence_refs jsonb not null default '[]'::jsonb,
  grounded_score numeric,
  citation_coverage numeric,
  completeness_score numeric,
  abstained boolean not null default false,
  reviewer_feedback text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.ido_model_runs (
  id uuid primary key default gen_random_uuid(),
  system_id text references public.ido_systems(id) on delete set null,
  model_name text not null,
  model_version text not null,
  training_snapshot_key text,
  feature_version text,
  stage text not null default 'research',
  metrics jsonb not null default '{}'::jsonb,
  gates jsonb not null default '{}'::jsonb,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.ido_decision_outcome_links (
  id uuid primary key default gen_random_uuid(),
  system_id text references public.ido_systems(id) on delete set null,
  decision_ref text,
  action_ref text,
  outcome_ref text,
  evidence_refs jsonb not null default '[]'::jsonb,
  expected_effect jsonb not null default '{}'::jsonb,
  observed_effect jsonb not null default '{}'::jsonb,
  lesson text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ido_evidence_system_time_idx on public.ido_evidence_objects(system_id, occurred_at desc);
create index if not exists ido_evidence_dataset_time_idx on public.ido_evidence_objects(dataset_id, occurred_at desc);
create index if not exists ido_analysis_owner_time_idx on public.ido_analysis_runs(owner_id, created_at desc);
create index if not exists ido_rag_owner_time_idx on public.ido_rag_turns(owner_id, created_at desc);
create index if not exists ido_model_owner_time_idx on public.ido_model_runs(owner_id, created_at desc);

alter table public.ido_systems enable row level security;
alter table public.ido_datasets enable row level security;
alter table public.ido_metric_definitions enable row level security;
alter table public.ido_evidence_objects enable row level security;
alter table public.ido_analysis_runs enable row level security;
alter table public.ido_rag_turns enable row level security;
alter table public.ido_model_runs enable row level security;
alter table public.ido_decision_outcome_links enable row level security;

-- Global contract rows (owner_id is null) are readable by authenticated users.
-- User-created rows are readable/writable only by their owner.
create policy "ido_systems_select" on public.ido_systems for select to authenticated
using (owner_id is null or owner_id = (select auth.uid()));
create policy "ido_systems_owner_write" on public.ido_systems for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "ido_datasets_select" on public.ido_datasets for select to authenticated
using (owner_id is null or owner_id = (select auth.uid()));
create policy "ido_datasets_owner_write" on public.ido_datasets for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "ido_metrics_select" on public.ido_metric_definitions for select to authenticated
using (owner_id is null or owner_id = (select auth.uid()));
create policy "ido_metrics_owner_write" on public.ido_metric_definitions for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "ido_evidence_select" on public.ido_evidence_objects for select to authenticated
using (owner_id is null or owner_id = (select auth.uid()));
create policy "ido_evidence_owner_write" on public.ido_evidence_objects for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "ido_analysis_owner" on public.ido_analysis_runs for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "ido_rag_owner" on public.ido_rag_turns for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "ido_models_owner" on public.ido_model_runs for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "ido_decision_outcome_owner" on public.ido_decision_outcome_links for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

revoke all on public.ido_systems, public.ido_datasets, public.ido_metric_definitions,
  public.ido_evidence_objects, public.ido_analysis_runs, public.ido_rag_turns,
  public.ido_model_runs, public.ido_decision_outcome_links from anon;

grant select, insert, update, delete on public.ido_systems, public.ido_datasets,
  public.ido_metric_definitions, public.ido_evidence_objects, public.ido_analysis_runs,
  public.ido_rag_turns, public.ido_model_runs, public.ido_decision_outcome_links to authenticated;

insert into public.ido_systems(id,label,family,source_ref,gate,status_detail,owner_id) values
('medallio','MEDALLIO / Cygnus','real_estate_intelligence','bd_replica_crm','EVIDENCE_BUILDING','{"runtime":"external/local"}',null),
('revenue_intelligence','Revenue Intelligence OS','real_estate_intelligence','venture_architect','LIVE_MVP','{"runtime":"shared_supabase"}',null),
('patrimonio','Patrimonio en Monedas','personal_capital','patrimonio_en_monedas','ANALYTICS_VERIFIED','{"runtime":"shared_supabase"}',null),
('goldlab','Gold Decision Lab','gold_decision','trading_system_oro_pro_max','RESEARCH_PAPER','{"runtime":"separate_supabase"}',null),
('health','Health for Wealth','household_readiness','health_for_wealth','CLOSED_LOOP_BETA','{"runtime":"shared_supabase"}',null)
on conflict (id) do update set label=excluded.label,family=excluded.family,source_ref=excluded.source_ref,gate=excluded.gate,status_detail=excluded.status_detail,updated_at=now();

insert into public.ido_datasets(id,system_id,label,grain,freshness_slo,sensitivity,dividend,runtime_mode,owner_id) values
('medallio_absorption','medallio','MEDALLIO Absorption Mart','project_day','hourly-target','restricted','Repeated commercial analysis from canonical sales/stock history','external',null),
('venture_funnel','revenue_intelligence','Revenue Intelligence Funnel','commercial_event','event-driven','internal','Each interaction improves diagnosis and future benchmarking','connected',null),
('usdpen','patrimonio','USD/PEN Longitudinal Series','fx_observation','business-hours','public-data','Time itself adds observations and strengthens longitudinal evaluation','connected',null),
('gold_decision_memory','goldlab','Gold Decision Memory','prediction_action_outcome','scheduled-research','restricted','Predictions plus outcomes create proprietary evaluation observations','external',null),
('kitchen_events','health','Kitchen Event Memory','inventory_or_meal_event','user-event','private','Normal household use creates data for better replenishment','connected',null)
on conflict (id) do update set label=excluded.label,grain=excluded.grain,freshness_slo=excluded.freshness_slo,sensitivity=excluded.sensitivity,dividend=excluded.dividend,runtime_mode=excluded.runtime_mode,updated_at=now();

-- Information Dividend OS hardening after Supabase advisor review.
-- Additive indexes + RLS policy split to avoid duplicate permissive SELECT policies.

create index if not exists ido_systems_owner_idx on public.ido_systems(owner_id);
create index if not exists ido_datasets_system_idx on public.ido_datasets(system_id);
create index if not exists ido_datasets_owner_idx on public.ido_datasets(owner_id);
create index if not exists ido_metrics_owner_idx on public.ido_metric_definitions(owner_id);
create index if not exists ido_evidence_owner_idx on public.ido_evidence_objects(owner_id);
create index if not exists ido_model_system_idx on public.ido_model_runs(system_id);
create index if not exists ido_decision_links_system_idx on public.ido_decision_outcome_links(system_id);
create index if not exists ido_decision_links_owner_idx on public.ido_decision_outcome_links(owner_id);

drop policy if exists "ido_systems_owner_write" on public.ido_systems;
drop policy if exists "ido_datasets_owner_write" on public.ido_datasets;
drop policy if exists "ido_metrics_owner_write" on public.ido_metric_definitions;
drop policy if exists "ido_evidence_owner_write" on public.ido_evidence_objects;

create policy "ido_systems_owner_insert" on public.ido_systems for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "ido_systems_owner_update" on public.ido_systems for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "ido_systems_owner_delete" on public.ido_systems for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "ido_datasets_owner_insert" on public.ido_datasets for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "ido_datasets_owner_update" on public.ido_datasets for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "ido_datasets_owner_delete" on public.ido_datasets for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "ido_metrics_owner_insert" on public.ido_metric_definitions for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "ido_metrics_owner_update" on public.ido_metric_definitions for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "ido_metrics_owner_delete" on public.ido_metric_definitions for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "ido_evidence_owner_insert" on public.ido_evidence_objects for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "ido_evidence_owner_update" on public.ido_evidence_objects for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "ido_evidence_owner_delete" on public.ido_evidence_objects for delete to authenticated
using (owner_id = (select auth.uid()));

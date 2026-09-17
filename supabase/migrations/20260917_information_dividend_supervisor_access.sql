-- Information Dividend OS supervisor authorization.
-- Membership rows are provisioned out-of-band so personal account identifiers are never committed.

create table if not exists public.ido_supervisors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','analyst','viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.ido_supervisors enable row level security;
revoke all on public.ido_supervisors from anon;
grant select on public.ido_supervisors to authenticated;

create policy "ido_supervisors_self_select"
on public.ido_supervisors
for select to authenticated
using (user_id = (select auth.uid()));

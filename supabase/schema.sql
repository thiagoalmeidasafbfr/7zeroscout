-- 7a0 Scout schema

create table if not exists public.squads (
  id bigserial primary key,
  sel text not null,
  copa integer not null,
  created_at timestamptz not null default now(),
  unique (sel, copa)
);

create table if not exists public.players (
  id bigserial primary key,
  squad_id bigint not null references public.squads(id) on delete cascade,
  player_id text not null,
  name text not null,
  positions text[] not null default '{}',
  number integer,
  force integer check (force is null or (force between 1 and 99)),
  legend boolean not null default false,
  unique (squad_id, player_id)
);

create index if not exists players_squad_id_idx on public.players (squad_id);
create index if not exists players_force_idx on public.players (force desc nulls last);
create index if not exists players_positions_gin on public.players using gin (positions);

-- View to list squads with their average / max / min force.
create or replace view public.squad_stats as
select
  s.id,
  s.sel,
  s.copa,
  s.created_at,
  count(p.id) as player_count,
  count(p.force) as rated_count,
  round(avg(p.force)::numeric, 1) as avg_force,
  max(p.force) as max_force,
  min(p.force) as min_force
from public.squads s
left join public.players p on p.squad_id = s.id
group by s.id;

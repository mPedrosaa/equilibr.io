-- equilibr.io — horário semanal, estudo autónomo e avaliações
-- Executar depois da migration inicial.

-- ---------------------------------------------------------------------------
-- Aulas semanais
-- ---------------------------------------------------------------------------

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text references public.courses (id) on delete set null,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists class_sessions_user_day_idx
  on public.class_sessions (user_id, day_of_week, start_time);

-- ---------------------------------------------------------------------------
-- Blocos de estudo autónomo
-- ---------------------------------------------------------------------------

create table if not exists public.study_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists study_blocks_user_day_idx
  on public.study_blocks (user_id, day_of_week, start_time);

-- ---------------------------------------------------------------------------
-- Avaliações e exames
-- ---------------------------------------------------------------------------

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text references public.courses (id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  kind text not null default 'teste'
    check (kind in ('teste', 'avaliacao', 'exame')),
  assessment_date date not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed')),
  expected_min numeric(4, 2) check (expected_min is null or expected_min between 0 and 20),
  expected_max numeric(4, 2) check (expected_max is null or expected_max between 0 and 20),
  confidence text check (confidence is null or confidence in ('baixa', 'media', 'alta')),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    status <> 'completed'
    or (expected_min is not null and expected_max is not null and expected_min <= expected_max)
  )
);

create index if not exists assessments_user_date_idx
  on public.assessments (user_id, assessment_date desc);

drop trigger if exists assessments_set_updated_at on public.assessments;
create trigger assessments_set_updated_at
before update on public.assessments
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.class_sessions enable row level security;
alter table public.study_blocks enable row level security;
alter table public.assessments enable row level security;

drop policy if exists class_sessions_select_own on public.class_sessions;
create policy class_sessions_select_own on public.class_sessions
for select using (auth.uid() = user_id);

drop policy if exists class_sessions_insert_own on public.class_sessions;
create policy class_sessions_insert_own on public.class_sessions
for insert with check (auth.uid() = user_id);

drop policy if exists class_sessions_delete_own on public.class_sessions;
create policy class_sessions_delete_own on public.class_sessions
for delete using (auth.uid() = user_id);

drop policy if exists study_blocks_select_own on public.study_blocks;
create policy study_blocks_select_own on public.study_blocks
for select using (auth.uid() = user_id);

drop policy if exists study_blocks_insert_own on public.study_blocks;
create policy study_blocks_insert_own on public.study_blocks
for insert with check (auth.uid() = user_id);

drop policy if exists study_blocks_delete_own on public.study_blocks;
create policy study_blocks_delete_own on public.study_blocks
for delete using (auth.uid() = user_id);

drop policy if exists assessments_select_own on public.assessments;
create policy assessments_select_own on public.assessments
for select using (auth.uid() = user_id);

drop policy if exists assessments_insert_own on public.assessments;
create policy assessments_insert_own on public.assessments
for insert with check (auth.uid() = user_id);

drop policy if exists assessments_update_own on public.assessments;
create policy assessments_update_own on public.assessments
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists assessments_delete_own on public.assessments;
create policy assessments_delete_own on public.assessments
for delete using (auth.uid() = user_id);

grant select, insert, delete on public.class_sessions to authenticated;
grant select, insert, delete on public.study_blocks to authenticated;
grant select, insert, update, delete on public.assessments to authenticated;

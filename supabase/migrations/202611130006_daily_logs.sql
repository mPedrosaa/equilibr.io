-- equilibr.io — registos diários persistidos por utilizador

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text references public.courses (id) on delete set null,
  type text not null check (type in ('aula', 'estudo', 'projeto', 'descanso')),
  minutes integer not null check (minutes > 0 and minutes <= 1440),
  log_date date not null default current_date,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_logs_user_date_idx
  on public.activity_logs (user_id, log_date desc);

create index if not exists activity_logs_user_course_idx
  on public.activity_logs (user_id, course_id);

drop trigger if exists activity_logs_set_updated_at on public.activity_logs;
create trigger activity_logs_set_updated_at
before update on public.activity_logs
for each row execute function public.set_updated_at();

alter table public.activity_logs enable row level security;

drop policy if exists activity_logs_select_own on public.activity_logs;
create policy activity_logs_select_own on public.activity_logs
for select using (auth.uid() = user_id);

drop policy if exists activity_logs_insert_own on public.activity_logs;
create policy activity_logs_insert_own on public.activity_logs
for insert with check (auth.uid() = user_id);

drop policy if exists activity_logs_update_own on public.activity_logs;
create policy activity_logs_update_own on public.activity_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists activity_logs_delete_own on public.activity_logs;
create policy activity_logs_delete_own on public.activity_logs
for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.activity_logs to authenticated;

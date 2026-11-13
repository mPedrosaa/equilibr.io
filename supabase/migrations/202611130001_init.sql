-- equilibr.io — esquema inicial para Supabase
-- Executar no SQL Editor do projeto ou com `supabase db push`.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  degree_code text not null default 'LEI',
  year smallint not null default 1 check (year between 1 and 5),
  semester smallint not null default 1 check (semester between 1 and 2),
  semester_weeks smallint not null default 20 check (semester_weeks between 1 and 30),
  rest_weekly_target_hours numeric(4, 1) not null default 14
    check (rest_weekly_target_hours >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catálogo de unidades curriculares
-- ---------------------------------------------------------------------------

create table if not exists public.courses (
  id text primary key,
  code text not null unique,
  name text not null,
  ects numeric(4, 1) not null check (ects > 0),
  contact_hours numeric(4, 1) not null default 0 check (contact_hours >= 0),
  color text not null default '#000080'
    check (color ~ '^#[0-9a-fA-F]{6}$'),
  degree_code text not null default 'LEI',
  year smallint not null default 1 check (year between 1 and 5),
  semester smallint not null default 1 check (semester between 1 and 2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_degree_semester_idx
  on public.courses (degree_code, year, semester, active);

-- ---------------------------------------------------------------------------
-- Inscrições e registos de atividade
-- ---------------------------------------------------------------------------

create table if not exists public.user_courses (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

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

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists activity_logs_set_updated_at on public.activity_logs;
create trigger activity_logs_set_updated_at
before update on public.activity_logs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Perfil criado automaticamente no registo
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.user_courses enable row level security;
alter table public.activity_logs enable row level security;

-- Perfis: cada utilizador lê e altera apenas o seu.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

-- Catálogo: leitura pública das UCs ativas.
drop policy if exists courses_select_active on public.courses;
create policy courses_select_active on public.courses
for select using (active = true);

-- Inscrições: apenas o próprio utilizador.
drop policy if exists user_courses_select_own on public.user_courses;
create policy user_courses_select_own on public.user_courses
for select using (auth.uid() = user_id);

drop policy if exists user_courses_insert_own on public.user_courses;
create policy user_courses_insert_own on public.user_courses
for insert with check (auth.uid() = user_id);

drop policy if exists user_courses_delete_own on public.user_courses;
create policy user_courses_delete_own on public.user_courses
for delete using (auth.uid() = user_id);

-- Registos: CRUD limitado ao próprio utilizador.
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

-- ---------------------------------------------------------------------------
-- Permissões de API
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.courses to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, delete on public.user_courses to authenticated;
grant select, insert, update, delete on public.activity_logs to authenticated;

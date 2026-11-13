-- equilibr.io — UCs do catálogo vs. UCs personalizadas

alter table public.courses
  add column if not exists owner_id uuid references auth.users (id) on delete cascade;

alter table public.courses
  drop constraint if exists courses_code_key;

create unique index if not exists courses_catalog_code_idx
  on public.courses (code)
  where owner_id is null;

create unique index if not exists courses_owner_code_idx
  on public.courses (owner_id, code)
  where owner_id is not null;

create index if not exists courses_owner_idx
  on public.courses (owner_id, active);

drop policy if exists courses_select_active on public.courses;
create policy courses_select_active on public.courses
for select using (
  active = true
  and (owner_id is null or owner_id = auth.uid())
);

drop policy if exists courses_insert_own on public.courses;
create policy courses_insert_own on public.courses
for insert with check (owner_id = auth.uid());

drop policy if exists courses_update_own on public.courses;
create policy courses_update_own on public.courses
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists courses_delete_own on public.courses;
create policy courses_delete_own on public.courses
for delete using (owner_id = auth.uid());

grant insert, update, delete on public.courses to authenticated;

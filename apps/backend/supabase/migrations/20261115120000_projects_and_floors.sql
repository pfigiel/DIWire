create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create index projects_owner_id_idx on public.projects (owner_id);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  position integer not null,
  step text not null default 'file'
    check (step in ('file', 'crop', 'scale', 'walls', 'dimensions', 'openings')),
  -- The traced image: { name, page, imagePath, width, height }.
  plan jsonb,
  rotation_deg double precision not null default 0,
  -- { x, y, width, height } in image pixels, in the rotated image's space with its centre as origin.
  crop jsonb,
  -- { widthCm, heightCm } of the building's outer walls, which the crop frames.
  outline jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, position)
);

alter table public.projects enable row level security;
alter table public.floors enable row level security;

revoke all on public.projects, public.floors from anon;
grant select, insert, update, delete on public.projects, public.floors to authenticated;

create policy "Owners manage their projects" on public.projects
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners manage their projects' floors" on public.floors
  for all to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = floors.project_id and projects.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.projects
      where projects.id = floors.project_id and projects.owner_id = (select auth.uid())
    )
  );

-- Two statements, since the floors policy cannot see a project inserted by the statement it runs in;
-- a function is one transaction, so a project still never exists without its first floor.
create function public.create_project(name text)
returns table (id uuid, floor_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.projects (name) values (create_project.name)
  returning projects.id into id;

  insert into public.floors (project_id, position) values (id, 0)
  returning floors.id into floor_id;

  return next;
end;
$$;

revoke execute on function public.create_project(text) from public, anon;
grant execute on function public.create_project(text) to authenticated;

insert into storage.buckets (id, name, public)
values ('plans', 'plans', false)
on conflict (id) do nothing;

-- A plan's path starts with its owner's id, which is what scopes the bucket to one user.
create policy "Owners read their plans" on storage.objects
  for select to authenticated
  using (bucket_id = 'plans' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners upload their plans" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'plans' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners delete their plans" on storage.objects
  for delete to authenticated
  using (bucket_id = 'plans' and (storage.foldername(name))[1] = (select auth.uid())::text);

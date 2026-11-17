create table public.project_shares (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  -- The owner's email when they invited, which is what the invitee is shown.
  invited_by text not null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index project_shares_user_id_idx on public.project_shares (user_id);

alter table public.project_shares enable row level security;

-- An invitee answers a share and nothing else: a row is only ever inserted by share_project.
revoke all on public.project_shares from anon, authenticated;
grant select, delete on public.project_shares to authenticated;
grant update (status) on public.project_shares to authenticated;

-- Owners get no policy here: one reading public.projects would loop with the projects policy below.
create policy "Invitees see their shares" on public.project_shares
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Invitees answer their shares" on public.project_shares
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Invitees remove their shares" on public.project_shares
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- A pending share shows the project too, so the invitee can see what they are invited to.
create policy "Invitees see projects shared with them" on public.projects
  for select to authenticated
  using (
    exists (
      select 1 from public.project_shares
      where project_shares.project_id = projects.id
        and project_shares.user_id = (select auth.uid())
    )
  );

create policy "Members manage shared projects' floors" on public.floors
  for all to authenticated
  using (
    exists (
      select 1 from public.project_shares
      where project_shares.project_id = floors.project_id
        and project_shares.user_id = (select auth.uid())
        and project_shares.status = 'accepted'
    )
  )
  with check (
    exists (
      select 1 from public.project_shares
      where project_shares.project_id = floors.project_id
        and project_shares.user_id = (select auth.uid())
        and project_shares.status = 'accepted'
    )
  );

-- The floors policies decide which floors the subquery sees, so a plan is readable by whoever
-- reaches its floor, whichever member's folder it was uploaded to.
create policy "Members read plans of floors they reach" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'plans'
    and exists (select 1 from public.floors where floors.plan ->> 'imagePath' = objects.name)
  );

-- Security definer, since finding the invitee means reading auth.users. It answers the same whether
-- or not the email belongs to anyone, so it cannot be used to find out who has an account; false
-- means only that the caller does not own the project.
create function public.share_project(project_id uuid, email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitee uuid;
begin
  if not exists (
    select 1 from public.projects
    where projects.id = share_project.project_id and projects.owner_id = (select auth.uid())
  ) then
    return false;
  end if;

  select users.id into invitee
  from auth.users
  where lower(users.email) = lower(trim(share_project.email))
  limit 1;

  if invitee is not null and invitee <> (select auth.uid()) then
    insert into public.project_shares (project_id, user_id, invited_by)
    values (share_project.project_id, invitee, (select auth.jwt() ->> 'email'))
    on conflict do nothing;
  end if;

  return true;
end;
$$;

revoke execute on function public.share_project(uuid, text) from public, anon;
grant execute on function public.share_project(uuid, text) to authenticated;

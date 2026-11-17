-- Deferrable, so closing the gap a deleted floor leaves is checked once every floor above it has
-- moved down rather than row by row, where one would land on a position its neighbour still holds.
alter table public.floors
  drop constraint floors_project_id_position_key,
  add constraint floors_project_id_position_key
    unique (project_id, position) deferrable initially immediate;

-- One transaction, so the floors above never keep a gap, and the project's floors are locked first,
-- so two members deleting at once cannot take the last two floors between them.
create function public.delete_floor(project_id uuid, floor_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_position integer;
begin
  perform 1 from public.floors where floors.project_id = delete_floor.project_id for update;

  select floors.position into deleted_position
  from public.floors
  where floors.id = delete_floor.floor_id and floors.project_id = delete_floor.project_id;

  if not found then
    return 'missing';
  end if;

  if not exists (
    select 1 from public.floors
    where floors.project_id = delete_floor.project_id and floors.id <> delete_floor.floor_id
  ) then
    return 'last';
  end if;

  delete from public.floors where floors.id = delete_floor.floor_id;

  update public.floors
  set position = floors.position - 1
  where floors.project_id = delete_floor.project_id and floors.position > deleted_position;

  return 'deleted';
end;
$$;

revoke execute on function public.delete_floor(uuid, uuid) from public, anon;
grant execute on function public.delete_floor(uuid, uuid) to authenticated;

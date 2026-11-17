-- Doors, windows and garage doors: [{ id, wallId, kind, widthCm, leafWidthCm, sillCm, anchor,
-- anchorWallId, offsetCm, hinge, opensTo }]. An opening sits offsetCm from a corner of its wall: the face of the wall named
-- by anchorWallId, or the wall's own end when that is null, on the side anchor names.
alter table public.floors add column openings jsonb not null default '[]'::jsonb;

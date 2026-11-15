-- The traced walls, in centimetres from the outline's top-left corner:
-- [{ id, orientation, center, thicknessCm, kind, from, to }], an end being { wallId } or { position }.
alter table public.floors add column walls jsonb not null default '[]'::jsonb;

-- Dimensions the user has verified: [{ a, b, valueCm }], a and b each naming a wall face as
-- "<wall id>:<min|max|from|to>"; the distance from a to b is held at valueCm.
alter table public.floors add column locks jsonb not null default '[]'::jsonb;

-- Names the user gave to rooms: [{ name, x, y }]. Rooms are derived from the walls, so a name
-- belongs to whichever room holds its point.
alter table public.floors add column rooms jsonb not null default '[]'::jsonb;

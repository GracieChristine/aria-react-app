ALTER TABLE listings
  RENAME COLUMN country TO world;

ALTER TABLE listings
  ADD COLUMN region    VARCHAR(100),
  ADD COLUMN world_id  UUID REFERENCES worlds(id),
  ADD COLUMN region_id UUID REFERENCES regions(id),
  ADD COLUMN city_id   UUID REFERENCES cities(id);

ALTER TABLE listings
  DROP COLUMN lat,
  DROP COLUMN lng;

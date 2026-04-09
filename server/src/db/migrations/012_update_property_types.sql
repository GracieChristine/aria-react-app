-- Replace old generic property_type enum with fantasy property types
-- Postgres does not support DROP VALUE, so we recreate the type

-- 1. Drop the default so we can alter the column
ALTER TABLE listings ALTER COLUMN property_type DROP DEFAULT;

-- 2. Change the column to text temporarily
ALTER TABLE listings ALTER COLUMN property_type TYPE TEXT;

-- 3. Drop the old enum
DROP TYPE property_type;

-- 4. Create the new enum
CREATE TYPE property_type AS ENUM (
  'cottage',
  'manor',
  'castle',
  'tower',
  'treehouse',
  'cavern',
  'academy_suite',
  'seaside_cove',
  'floating_isle',
  'hidden_burrow'
);

-- 5. Cast the column back (existing rows will fail if they have old values — acceptable for dev)
ALTER TABLE listings ALTER COLUMN property_type TYPE property_type USING property_type::property_type;

-- 6. Restore default
ALTER TABLE listings ALTER COLUMN property_type SET DEFAULT 'cottage';
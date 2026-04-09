-- Add 'draft' to the listing_status enum
-- Postgres cannot add a value to an enum inside a transaction block,
-- so this uses ALTER TYPE ... ADD VALUE which is safe to run standalone.

ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'draft' BEFORE 'active';

CREATE TABLE IF NOT EXISTS universes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS worlds (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (universe_id, name)
);

CREATE TABLE IF NOT EXISTS regions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id    UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (world_id, name)
);

CREATE TABLE IF NOT EXISTS cities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id   UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (region_id, name)
);

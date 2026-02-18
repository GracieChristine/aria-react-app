CREATE TYPE property_type AS ENUM (
  'apartment', 'house', 'villa', 'cabin',
  'condo', 'townhouse', 'studio', 'other'
);

CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'pending');

CREATE TABLE IF NOT EXISTS listings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  description      TEXT NOT NULL,
  address          VARCHAR(255) NOT NULL,
  city             VARCHAR(100) NOT NULL,
  country          VARCHAR(100) NOT NULL,
  lat              DECIMAL(9,6),
  lng              DECIMAL(9,6),
  price_per_night  DECIMAL(10,2) NOT NULL,
  max_guests       INT NOT NULL DEFAULT 1,
  bedrooms         INT NOT NULL DEFAULT 1,
  bathrooms        INT NOT NULL DEFAULT 1,
  property_type    property_type NOT NULL DEFAULT 'apartment',
  status           listing_status NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amenities (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS listing_amenities (
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);
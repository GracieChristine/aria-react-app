CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'completed'
);

CREATE TABLE IF NOT EXISTS bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  guest_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in      DATE NOT NULL,
  check_out     DATE NOT NULL,
  num_guests    INT NOT NULL DEFAULT 1,
  status        booking_status NOT NULL DEFAULT 'pending',
  total_price   DECIMAL(10,2) NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
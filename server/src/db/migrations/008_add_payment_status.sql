ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
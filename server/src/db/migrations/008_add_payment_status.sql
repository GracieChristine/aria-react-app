ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded'));

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE bookings
ALTER COLUMN payment_status SET DEFAULT 'unpaid',
ADD CONSTRAINT bookings_payment_status_check 
  CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded'));
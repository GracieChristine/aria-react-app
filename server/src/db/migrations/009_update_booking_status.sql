ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'cancellation_requested';

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2) DEFAULT 0;
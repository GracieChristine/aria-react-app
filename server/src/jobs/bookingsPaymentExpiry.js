import { bookingModel } from '../models/bookingModel.js';

export const bookingsPaymentExpiry = async () => {
  try {
    const expired = await bookingModel.expireFailedBookings();
    if (expired.length > 0) {
      console.log(`[expireBookings] Cancelled ${expired.length} booking(s) with failed payment`);
    }
    return expired;
  } catch (err) {
    console.error('[expireBookings] Error expiring bookings:', err);
    return [];
  }
};
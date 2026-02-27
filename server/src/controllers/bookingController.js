import { bookingModel }                   from '../models/bookingModel.js';
import { listingModel }                   from '../models/listingModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

const formatBooking = (b) => ({
  id:            b.id,
  listingId:     b.listing_id,
  guestId:       b.guest_id,
  checkIn:       b.check_in,
  checkOut:      b.check_out,
  numGuests:     b.num_guests,
  status:        b.status,
  paymentStatus: b.payment_status,
  totalPrice:    parseFloat(b.total_price),
  refundAmount:  parseFloat(b.refund_amount ?? 0),
  listing: b.listing_title ? {
    title:   b.listing_title,
    city:    b.listing_city,
    country: b.listing_country,
    image:   b.listing_image,
  } : undefined,
  guest: b.guest_first_name ? {
    firstName: b.guest_first_name,
    lastName:  b.guest_last_name,
    avatarUrl: b.guest_avatar_url,
  } : undefined,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
});

const calculateRefund = (booking, cancelledBy = 'guest') => {
  if (booking.payment_status !== 'paid') return { amount: 0, type: 'none' };

  const totalPrice = parseFloat(booking.total_price);

  if (cancelledBy === 'host') return { amount: totalPrice, type: 'full' };

  const now       = new Date();
  const checkIn   = new Date(booking.check_in);
  const daysUntil = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));

  if (daysUntil > 14) return { amount: totalPrice,                                type: 'full'    };
  if (daysUntil > 7)  return { amount: parseFloat((totalPrice * 0.5).toFixed(2)), type: 'partial' };
  return                     { amount: 0,                                          type: 'none'    };
};

export const bookingController = {

  // ── POST /api/bookings ──
  async create(req, res) {
    try {
      const { listingId, checkIn, checkOut, numGuests } = req.body;

      if (new Date(checkIn) < new Date()) {
        return errorResponse(res, 'Check-in date cannot be in the past', 400);
      }

      const listing = await listingModel.findById(listingId);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      if (listing.host_id === req.user.id) return errorResponse(res, 'Cannot book your own listing', 400);
      if (listing.status !== 'active') return errorResponse(res, 'Listing is not available', 400);
      if (numGuests > listing.max_guests) return errorResponse(res, 'Exceeds max guests', 400);

      const available = await bookingModel.checkAvailability(listingId, checkIn, checkOut);
      if (!available) return errorResponse(res, 'Listing not available for these dates', 409);

      const nights     = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * listing.price_per_night;

      const booking = await bookingModel.create({
        listingId,
        guestId: req.user.id,
        checkIn,
        checkOut,
        numGuests,
        totalPrice,
      });

      return successResponse(res, { booking: formatBooking(booking) }, 201);
    } catch (err) {
      console.error('Create booking error:', err);
      return errorResponse(res, 'Failed to create booking', 500);
    }
  },

  // ── GET /api/bookings/me ──
  async getMyBookings(req, res) {
    try {
      const bookings = await bookingModel.findByGuest(req.user.id);
      return successResponse(res, { bookings: bookings.map(formatBooking) });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch bookings', 500);
    }
  },

  // ── GET /api/bookings/listing/:listingId ──
  async getListingBookings(req, res) {
    try {
      const listing = await listingModel.findById(req.params.listingId);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);

      const bookings = await bookingModel.findByListing(req.params.listingId);
      return successResponse(res, { bookings: bookings.map(formatBooking) });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch bookings', 500);
    }
  },

  // ── PATCH /api/bookings/:id ──
  async update(req, res) {
    try {
      const { checkIn, checkOut, numGuests } = req.body;
      const booking = await bookingModel.findById(req.params.id);

      if (!booking) return errorResponse(res, 'Booking not found', 404);
      if (booking.guest_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);
      if (booking.status !== 'pending' || booking.payment_status !== 'unpaid') {
        return errorResponse(res, 'Can only update pending bookings', 400);
      }

      if (checkIn && new Date(checkIn) < new Date()) {
        return errorResponse(res, 'Check-in date cannot be in the past', 400);
      }

      if (checkIn && checkOut) {
        const available = await bookingModel.checkAvailability(
          booking.listing_id, checkIn, checkOut, req.params.id
        );
        if (!available) return errorResponse(res, 'Listing not available for these dates', 409);
      }

      if (numGuests) {
        const listing = await listingModel.findById(booking.listing_id);
        if (numGuests > listing.max_guests) return errorResponse(res, 'Exceeds max guests', 400);
      }

      const resolvedCheckIn  = checkIn  || booking.check_in;
      const resolvedCheckOut = checkOut || booking.check_out;
      const nights           = Math.ceil((new Date(resolvedCheckOut) - new Date(resolvedCheckIn)) / (1000 * 60 * 60 * 24));
      const listing          = await listingModel.findById(booking.listing_id);
      const totalPrice       = nights * listing.price_per_night;

      const updated = await bookingModel.update(req.params.id, {
        checkIn:   resolvedCheckIn,
        checkOut:  resolvedCheckOut,
        numGuests: numGuests || booking.num_guests,
        totalPrice,
      });

      return successResponse(res, { booking: formatBooking(updated) });
    } catch (err) {
      console.error('Update booking error:', err);
      return errorResponse(res, 'Failed to update booking', 500);
    }
  },

  // ── PATCH /api/bookings/:id/cancel ──
  async cancel(req, res) {
    try {
      const booking = await bookingModel.findById(req.params.id);
      if (!booking) return errorResponse(res, 'Booking not found', 404);

      const listing = await listingModel.findById(booking.listing_id);
      const isGuest = booking.guest_id === req.user.id;
      const isHost  = listing.host_id  === req.user.id;

      if (!isGuest && !isHost) return errorResponse(res, 'Not authorized', 403);

      if (!['pending', 'confirmed'].includes(booking.status)) {
        return errorResponse(res, 'Cannot cancel this booking', 400);
      }

      // guest + paid → request cancellation, host reviews
      if (isGuest && booking.payment_status === 'paid') {
        const updated = await bookingModel.updateStatus(req.params.id, 'cancellation_requested');
        return successResponse(res, { booking: formatBooking(updated) });
      }

      // guest + unpaid, or host → cancel directly
      const updated = await bookingModel.updateStatus(req.params.id, 'cancelled');

      // host cancelling a paid booking → full refund
      if (isHost && booking.payment_status === 'paid') {
        const refund = calculateRefund(booking, 'host');  // add 'host' here
        const refunded = await bookingModel.updateRefund(req.params.id, {
          paymentStatus: 'refunded',
          refundAmount:  refund.amount,
        });
        return successResponse(res, {
          booking: formatBooking(refunded),
          refund,
        });
      }

      return successResponse(res, { booking: formatBooking(updated) });
    } catch (err) {
      console.error('Cancel booking error:', err);
      return errorResponse(res, 'Failed to cancel booking', 500);
    }
  },

  // ── PATCH /api/bookings/:id/cancel/approve ──
  async cancelApprove(req, res) {
    try {
      const booking = await bookingModel.findById(req.params.id);
      if (!booking) return errorResponse(res, 'Booking not found', 404);

      const listing = await listingModel.findById(booking.listing_id);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);

      if (booking.status !== 'cancellation_requested') {
        return errorResponse(res, 'Booking is not awaiting cancellation approval', 400);
      }

      const refund  = calculateRefund(booking);
      const updated = await bookingModel.updateRefund(req.params.id, {
        status:        'cancelled',
        paymentStatus: 'refunded',
        refundAmount:  refund.amount,
      });

      return successResponse(res, { booking: formatBooking(updated), refund });
    } catch (err) {
      console.error('Cancel approve error:', err);
      return errorResponse(res, 'Failed to approve cancellation', 500);
    }
  },

  // ── PATCH /api/bookings/:id/cancel/reject ──
  async cancelReject(req, res) {
    try {
      const booking = await bookingModel.findById(req.params.id);
      if (!booking) return errorResponse(res, 'Booking not found', 404);

      const listing = await listingModel.findById(booking.listing_id);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);

      if (booking.status !== 'cancellation_requested') {
        return errorResponse(res, 'Booking is not awaiting cancellation approval', 400);
      }

      const updated = await bookingModel.updateStatus(req.params.id, 'confirmed');
      return successResponse(res, { booking: formatBooking(updated) });
    } catch (err) {
      console.error('Cancel reject error:', err);
      return errorResponse(res, 'Failed to reject cancellation', 500);
    }
  },

  // ── PATCH /api/bookings/:id/status ──
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const allowed    = ['cancelled', 'completed'];
      if (!allowed.includes(status)) {
        return errorResponse(res, 'Invalid status', 400);
      }

      const booking = await bookingModel.findById(req.params.id);
      if (!booking) return errorResponse(res, 'Booking not found', 404);

      const updated = await bookingModel.updateStatus(req.params.id, status);
      return successResponse(res, { booking: formatBooking(updated) });
    } catch (err) {
      return errorResponse(res, 'Failed to update booking', 500);
    }
  },

  // ── POST /api/bookings/:id/pay ──
  async pay(req, res) {
    try {
      const booking = await bookingModel.findById(req.params.id);
      if (!booking)                              return errorResponse(res, 'Booking not found', 404);
      if (booking.guest_id !== req.user.id)      return errorResponse(res, 'Not authorized', 403);
      if (booking.status === 'cancelled')        return errorResponse(res, 'Cannot pay for a cancelled booking', 400);
      if (booking.payment_status === 'paid')     return errorResponse(res, 'Booking already paid', 400);
      if (booking.payment_status === 'refunded') return errorResponse(res, 'Cannot pay for a refunded booking', 400);

      const paymentSucceeded = req.simulatePayment ? req.simulatePayment() : Math.random() > 0.2;

      const updated = await bookingModel.updatePayment(req.params.id, {
        status:        paymentSucceeded ? 'confirmed' : 'pending',
        paymentStatus: paymentSucceeded ? 'paid'      : 'failed',
      });

      if (!paymentSucceeded) {
        return errorResponse(res, 'Payment failed', 402);
      }

      return successResponse(res, { booking: formatBooking(updated) });
    } catch (err) {
      console.error('Pay booking error:', err);
      return errorResponse(res, 'Failed to process payment', 500);
    }
  },
};
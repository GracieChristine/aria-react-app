import { reviewModel }                    from '../models/reviewModel.js';
import { bookingModel }                   from '../models/bookingModel.js';
import { listingModel }                   from '../models/listingModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

const formatReview = (r) => ({
  id:          r.id,
  bookingId:   r.booking_id,
  listingId:   r.listing_id,
  reviewerId:  r.reviewer_id,
  revieweeId:  r.reviewee_id,
  rating:      r.rating,
  comment:     r.comment,
  status:      r.status,
  flagReason:  r.flag_reason,
  flaggedAt:   r.flagged_at,
  reviewer: r.reviewer_first_name ? {
    firstName: r.reviewer_first_name,
    lastName:  r.reviewer_last_name,
    avatarUrl: r.reviewer_avatar_url,
  } : undefined,
  createdAt: r.created_at,
});

export const reviewController = {

  // ── POST /api/reviews ──
  async create(req, res) {
    try {
      const { bookingId, rating, comment } = req.body;

      const booking = await bookingModel.findById(bookingId);
      if (!booking) return errorResponse(res, 'Booking not found', 404);
      if (booking.guest_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);
      if (booking.status !== 'completed') return errorResponse(res, 'Can only review completed bookings', 400);

      const checkoutDate = new Date(booking.check_out);
      const daysSince    = (new Date() - checkoutDate) / (1000 * 60 * 60 * 24);
      if (daysSince > 14) return errorResponse(res, 'Review window has expired', 400);

      const exists = await reviewModel.existsForBooking(bookingId, req.user.id);
      if (exists) return errorResponse(res, 'Already reviewed this booking', 409);

      const listing = await listingModel.findById(booking.listing_id);

      const review = await reviewModel.create({
        bookingId,
        listingId:  booking.listing_id,
        reviewerId: req.user.id,
        revieweeId: listing.host_id,
        rating,
        comment,
      });

      return successResponse(res, { review: formatReview(review) }, 201);
    } catch (err) {
      console.error('Create review error:', err);
      return errorResponse(res, 'Failed to create review', 500);
    }
  },

  // ── GET /api/reviews/listing/:listingId ──
  async getByListing(req, res) {
    try {
      const listing = await listingModel.findById(req.params.listingId);
      if (!listing) return errorResponse(res, 'Listing not found', 404);

      const reviews = await reviewModel.findByListing(req.params.listingId);
      return successResponse(res, { reviews: reviews.map(formatReview) });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch reviews', 500);
    }
  },

  // ── GET /api/reviews/me ──
  async getMyReviews(req, res) {
    try {
      const reviews = await reviewModel.findByUser(req.user.id);
      return successResponse(res, { reviews: reviews.map(formatReview) });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch reviews', 500);
    }
  },

  // ── PATCH /api/reviews/:id/flag ──
  async flag(req, res) {
    try {
      const { reason } = req.body;
      const review     = await reviewModel.findById(req.params.id);
      if (!review) return errorResponse(res, 'Review not found', 404);

      const listing = await listingModel.findById(review.listing_id);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);
      if (review.status !== 'active') return errorResponse(res, 'Review is not active', 400);

      const updated = await reviewModel.flag(req.params.id, req.user.id, reason);
      return successResponse(res, { review: formatReview(updated) });
    } catch (err) {
      console.error('Flag review error:', err);
      return errorResponse(res, 'Failed to flag review', 500);
    }
  },

  // ── GET /api/reviews/flagged ──
  async getFlagged(req, res) {
    try {
      const reviews = await reviewModel.findFlagged();
      return successResponse(res, { reviews: reviews.map(formatReview) });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch flagged reviews', 500);
    }
  },

  // ── DELETE /api/reviews/:id ──
  async remove(req, res) {
    try {
      const review = await reviewModel.findById(req.params.id);
      if (!review) return errorResponse(res, 'Review not found', 404);
      if (review.status !== 'flagged') return errorResponse(res, 'Review is not flagged', 400);

      await reviewModel.remove(req.params.id);
      return successResponse(res, { message: 'Review removed successfully' });
    } catch (err) {
      console.error('Remove review error:', err);
      return errorResponse(res, 'Failed to remove review', 500);
    }
  },
};
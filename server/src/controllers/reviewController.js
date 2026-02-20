import { reviewModel }                from '../models/reviewModel.js';
import { bookingModel }               from '../models/bookingModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

const formatReview = (r) => ({
  id:          r.id,
  bookingId:   r.booking_id,
  listingId:   r.listing_id,
  reviewerId:  r.reviewer_id,
  revieweeId:  r.reviewee_id,
  rating:      r.rating,
  comment:     r.comment,
  reviewer: r.reviewer_first_name ? {
    firstName: r.reviewer_first_name,
    lastName:  r.reviewer_last_name,
    avatarUrl: r.reviewer_avatar_url,
  } : undefined,
  createdAt: r.created_at,
});

export const reviewController = {
  async create(req, res) {
    try {
      const { bookingId, rating, comment } = req.body;

      const booking = await bookingModel.findById(bookingId);
      if (!booking) return errorResponse(res, 'Booking not found', 404);
      if (booking.guest_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);
      if (booking.status !== 'completed') return errorResponse(res, 'Can only review completed bookings', 400);

      const exists = await reviewModel.existsForBooking(bookingId, req.user.id);
      if (exists) return errorResponse(res, 'Already reviewed this booking', 409);

      const review = await reviewModel.create({
        bookingId,
        listingId:  booking.listing_id,
        reviewerId: req.user.id,
        revieweeId: booking.host_id,
        rating,
        comment,
      });

      return successResponse(res, { review: formatReview(review) }, 201);
    } catch (err) {
      console.error('Create review error:', err);
      return errorResponse(res, 'Failed to create review', 500);
    }
  },

  async getByListing(req, res) {
    try {
      const reviews = await reviewModel.findByListing(req.params.listingId);
      return successResponse(res, { reviews: reviews.map(formatReview) });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch reviews', 500);
    }
  },

  async getMyReviews(req, res) {
    try {
      const reviews = await reviewModel.findByUser(req.user.id);
      return successResponse(res, { reviews: reviews.map(formatReview) });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch reviews', 500);
    }
  },
};
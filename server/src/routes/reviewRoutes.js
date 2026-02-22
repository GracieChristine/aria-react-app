import { Router }            from 'express';
import { body }              from 'express-validator';
import { reviewController }  from '../controllers/reviewController.js';
import { authenticate }      from '../middleware/authenticate.js';
import { authorize }         from '../middleware/authorize.js';
import { validate }          from '../middleware/validate.js';

const router = Router();

const reviewRules = [
  body('bookingId').notEmpty().withMessage('Booking ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
];

router.post(
  '/',
  authenticate,
  authorize('guest'),
  reviewRules,
  validate,
  reviewController.create
);

router.get(
  '/me',
  authenticate,
  reviewController.getMyReviews
);

router.get(
  '/flagged',
  authenticate,
  authorize('admin', 'super_admin'),
  reviewController.getFlagged
);

router.get(
  '/listing/:listingId',
  reviewController.getByListing
);

router.patch(
  '/:id/flag',
  authenticate,
  authorize('host'),
  body('reason').notEmpty().withMessage('Reason is required'),
  validate,
  reviewController.flag
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  reviewController.remove
);

export default router;
import { Router }           from 'express'
import { body }             from 'express-validator'
import { reviewController } from '../controllers/reviewController.js'
import { authenticate }     from '../middleware/authenticate.js'
import { validate }         from '../middleware/validate.js'

const router = Router()

router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('Booking ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
  ],
  validate,
  reviewController.create
)

router.get('/listing/:listingId', reviewController.getByListing)
router.get('/me', authenticate,   reviewController.getMyReviews)

export default router
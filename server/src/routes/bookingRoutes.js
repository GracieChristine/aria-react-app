import { Router }             from 'express';
import { body }               from 'express-validator';
import { bookingController }  from '../controllers/bookingController.js';
import { authenticate }       from '../middleware/authenticate.js';
import { authorize }          from '../middleware/authorize.js';
import { validate }           from '../middleware/validate.js';

const router = Router();

const bookingRules = [
  body('listingId').notEmpty().withMessage('Listing ID required'),
  body('checkIn').isDate().withMessage('Valid check-in date required'),
  body('checkOut').isDate().withMessage('Valid check-out date required'),
  body('numGuests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
];

router.post(
  '/',
  authenticate,
  authorize('guest', 'admin', 'super_admin'),
  bookingRules,
  validate,
  bookingController.create
);

router.get(
  '/me',
  authenticate,
  bookingController.getMyBookings
);

router.get(
  '/listing/:listingId',
  authenticate,
  authorize('host', 'admin', 'super_admin'),
  bookingController.getListingBookings
);

router.patch(
  '/:id/status',
  authenticate,
  body('status').notEmpty().withMessage('Status required'),
  validate,
  bookingController.updateStatus
);

export default router;
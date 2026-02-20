import { Router }            from 'express'
import { body, query }       from 'express-validator'
import { listingController } from '../controllers/listingController.js'
import { authenticate }      from '../middleware/authenticate.js'
import { authorize }         from '../middleware/authorize.js'
import { validate }          from '../middleware/validate.js'

const router = Router()

const updateListingRules = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('description').optional().notEmpty().withMessage('Description cannot be empty').trim(),
  body('address').optional().notEmpty().withMessage('Address cannot be empty').trim(),
  body('city').optional().notEmpty().withMessage('City cannot be empty').trim(),
  body('country').optional().notEmpty().withMessage('Country cannot be empty').trim(),
  body('pricePerNight').optional().isFloat({ min: 1 }).withMessage('Price must be greater than 0'),
  body('maxGuests').optional().isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be 0 or more'),
  body('bathrooms').optional().isInt({ min: 1 }).withMessage('Bathrooms must be at least 1'),
  body('propertyType').optional().isIn([
    'apartment','house','villa','cabin','condo','townhouse','studio','other'
  ]).withMessage('Invalid property type'),
]

const listingRules = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('country').notEmpty().withMessage('Country is required').trim(),
  body('pricePerNight').isFloat({ min: 1 }).withMessage('Price must be greater than 0'),
  body('maxGuests').isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be 0 or more'),
  body('bathrooms').isInt({ min: 1 }).withMessage('Bathrooms must be at least 1'),
  body('propertyType').isIn([
    'apartment','house','villa','cabin','condo','townhouse','studio','other'
  ]).withMessage('Invalid property type'),
]

// ── Public routes ──
router.get('/',     listingController.getAll)
router.get('/:id',  listingController.getOne)

// ── Host routes ──
router.get(
  '/host/me',
  authenticate,
  authorize('host', 'admin', 'super_admin'),
  listingController.getHostListings
)

router.post(
  '/',
  authenticate,
  authorize('host', 'admin', 'super_admin'),
  listingRules,
  validate,
  listingController.create
)

router.put(
  '/:id',
  authenticate,
  authorize('host'),
  updateListingRules,
  validate,
  listingController.update
)

router.patch(
  '/:id/status',
  authenticate,
  authorize('host', 'admin', 'super_admin'),
  body('status').notEmpty().withMessage('Status required'),
  validate,
  listingController.updateStatus
)

router.delete(
  '/:id',
  authenticate,
  authorize('host'),
  listingController.remove
)

router.post(
  '/:id/images',
  authenticate,
  authorize('host', 'admin', 'super_admin'),
  listingController.addImage
)

router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('host', 'admin', 'super_admin'),
  listingController.removeImage
)

export default router
import { Router }            from 'express';
import { body }              from 'express-validator';
import { listingController } from '../controllers/listingController.js';
import { authenticate }      from '../middleware/authenticate.js';
import { authorize }         from '../middleware/authorize.js';
import { validate }          from '../middleware/validate.js';

const router = Router();

// Address must start with a number and end with a recognised street suffix
const ADDRESS_REGEX = /^\d+\s+.+\s+(St|Street|Dr|Drive|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place|Terrace|Ter|Cres|Crescent|Mews|Row|Walk|Close|Alley|Al|Pass|Gate|Hill|Rise|View|Path)\.?$/i;

const listingRules = [
  body('title')
    .notEmpty().withMessage('Title is required').trim()
    .isLength({ max: 50 }).withMessage('Title cannot exceed 50 characters'),
  body('description')
    .notEmpty().withMessage('Description is required').trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('address')
    .notEmpty().withMessage('Address is required').trim()
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
    .matches(ADDRESS_REGEX).withMessage('Address must start with a number and end with a street type (e.g. 4 Privet Drive)'),
  body('cityId')
    .notEmpty().withMessage('City is required')
    .isUUID().withMessage('Invalid city'),
  body('regionId')
    .notEmpty().withMessage('Region is required')
    .isUUID().withMessage('Invalid region'),
  body('worldId')
    .notEmpty().withMessage('World is required')
    .isUUID().withMessage('Invalid world'),
  body('pricePerNight')
    .isFloat({ min: 1 }).withMessage('Price must be greater than 0'),
  body('maxGuests')
    .isInt({ min: 1, max: 20 }).withMessage('Max guests must be between 1 and 20'),
  body('bedrooms')
    .isInt({ min: 0, max: 20 }).withMessage('Bedrooms must be between 0 and 20'),
  body('bathrooms')
    .isInt({ min: 1, max: 20 }).withMessage('Bathrooms must be between 1 and 20'),
  body('propertyType')
    .isIn(['cottage','manor','castle','tower','treehouse','cavern','academy_suite','seaside_cove','floating_isle','hidden_burrow'])
    .withMessage('Invalid property type'),
  body('status')
    .optional()
    .isIn(['draft', 'inactive'])
    .withMessage('Status must be draft or inactive'),
];

const updateListingRules = [
  body('title')
    .optional().notEmpty().withMessage('Title cannot be empty').trim()
    .isLength({ max: 50 }).withMessage('Title cannot exceed 50 characters'),
  body('description')
    .optional().notEmpty().withMessage('Description cannot be empty').trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('address')
    .optional().notEmpty().withMessage('Address cannot be empty').trim()
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
    .matches(ADDRESS_REGEX).withMessage('Address must start with a number and end with a street type (e.g. 4 Privet Drive)'),
  body('cityId')
    .optional().notEmpty().withMessage('City cannot be empty')
    .isUUID().withMessage('Invalid city'),
  body('regionId')
    .optional().notEmpty().withMessage('Region cannot be empty')
    .isUUID().withMessage('Invalid region'),
  body('worldId')
    .optional().notEmpty().withMessage('World cannot be empty')
    .isUUID().withMessage('Invalid world'),
  body('pricePerNight')
    .optional().isFloat({ min: 1 }).withMessage('Price must be greater than 0'),
  body('maxGuests')
    .optional().isInt({ min: 1, max: 20 }).withMessage('Max guests must be between 1 and 20'),
  body('bedrooms')
    .optional().isInt({ min: 0, max: 20 }).withMessage('Bedrooms must be between 0 and 20'),
  body('bathrooms')
    .optional().isInt({ min: 1, max: 20 }).withMessage('Bathrooms must be between 1 and 20'),
  body('propertyType')
    .optional()
    .isIn(['cottage','manor','castle','tower','treehouse','cavern','academy_suite','seaside_cove','floating_isle','hidden_burrow'])
    .withMessage('Invalid property type'),
];

// ── Public routes ──
router.get('/',             listingController.getAll);
router.get('/:id',          listingController.getOne);
router.get('/:id/images',   listingController.getImages);

// ── Host routes ──
router.post(
  '/',
  authenticate,
  authorize('host'),
  listingRules,
  validate,
  listingController.create
);

router.get(
  '/host/me',
  authenticate,
  authorize('host'),
  listingController.getHostListings
);

router.put(
  '/:id',
  authenticate,
  authorize('host'),
  updateListingRules,
  validate,
  listingController.update
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('host', 'admin', 'super_admin'),
  body('status').notEmpty().withMessage('Status required'),
  validate,
  listingController.updateStatus
);

router.delete(
  '/:id',
  authenticate,
  authorize('host'),
  listingController.remove
);

router.post(
  '/:id/images',
  authenticate,
  authorize('host'),
  body('url').notEmpty().withMessage('Image URL is required'),
  validate,
  listingController.addImage
);

router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('host'),
  listingController.removeImage
);

export default router;

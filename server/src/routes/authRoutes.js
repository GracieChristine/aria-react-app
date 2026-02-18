import { Router }         from 'express'
import { body }           from 'express-validator'
import { authController } from '../controllers/authController.js'
import { authenticate }   from '../middleware/authenticate.js'
import { validate }       from '../middleware/validate.js'

const router = Router()

// ── Validation rules ──
const registerRules = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName')
    .notEmpty().withMessage('First name required')
    .trim(),
  body('lastName')
    .notEmpty().withMessage('Last name required')
    .trim(),
]

const loginRules = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password required'),
]

// ── Routes ──
router.post('/register', registerRules, validate, authController.register)
router.post('/login',    loginRules,    validate, authController.login)
router.post('/refresh',                           authController.refresh)
router.post('/logout',   authenticate,            authController.logout)
router.get('/me',        authenticate,            authController.me)

export default router
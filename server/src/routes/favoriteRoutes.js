import { Router }             from 'express'
import { favoriteController } from '../controllers/favoriteController.js'
import { authenticate }       from '../middleware/authenticate.js'

const router = Router()

router.get('/',                   authenticate, favoriteController.getMyFavorites)
router.get('/:listingId/check',   authenticate, favoriteController.checkFavorite)
router.post('/:listingId',        authenticate, favoriteController.add)
router.delete('/:listingId',      authenticate, favoriteController.remove)

export default router
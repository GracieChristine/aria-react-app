import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize }    from '../middleware/authorize.js';
import { devController } from './devController.js';

const router = Router();

router.post('/seed-listings',   authenticate, authorize('host', 'admin', 'super_admin'), devController.seedListings);
router.post('/unseed-listings', authenticate, authorize('host', 'admin', 'super_admin'), devController.unseedListings);

export default router;

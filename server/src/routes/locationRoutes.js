import { Router }             from 'express';
import { locationController } from '../controllers/locationController.js';

const router = Router();

router.get('/universes',                          locationController.getUniverses);
router.get('/universes/:universeId/worlds',       locationController.getWorlds);
router.get('/worlds/:worldId/regions',            locationController.getRegions);
router.get('/regions/:regionId/cities',           locationController.getCities);

export default router;

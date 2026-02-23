import { Router }           from 'express';
import { userController }   from '../controllers/userController.js';
import { authenticate }     from '../middleware/authenticate.js';

const router = Router();

router.patch('/me/become-host', authenticate, userController.becomeHost);

export default router;
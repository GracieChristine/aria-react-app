import { Router }             from 'express'
import { messageController }  from '../controllers/messageController.js'
import { authenticate }       from '../middleware/authenticate.js'

const router = Router()

router.get('/',                                   authenticate, messageController.getConversations)
router.post('/',                                  authenticate, messageController.startConversation)
router.get('/:conversationId',                    authenticate, messageController.getMessages)
router.post('/:conversationId',                   authenticate, messageController.sendMessage)

export default router
import express from 'express';

import { getAllMessages, getUnreadCount, getUserMessages, respondToMessage } from '../controllers/DataController/admin_data.js';
import { isAdmin, verifyToken } from '../middleware/authenticator.js';

const router = express.Router();


router.get('/messages', verifyToken, isAdmin, getAllMessages);
router.get('/messages/unread', verifyToken, isAdmin, getUnreadCount);
router.post('/respond-message', verifyToken, isAdmin, respondToMessage);
router.get('/messages/user', verifyToken, isAdmin, getUserMessages);

export default router;
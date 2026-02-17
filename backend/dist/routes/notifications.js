import express from 'express';
import { getNotifications, markAsRead, clearAllNotifications } from '../controllers/notificationController.js';
const router = express.Router();
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/', clearAllNotifications);
export default router;

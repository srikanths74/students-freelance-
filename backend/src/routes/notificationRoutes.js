import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get Current User Notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const notifications = db.getUserNotifications(req.user.id);
    const unreadCount = notifications.filter(n => !n.is_read).length;
    return res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
});

// Mark All Notifications Read
router.patch('/read-all', authenticateToken, (req, res) => {
  try {
    db.markAllNotificationsRead(req.user.id);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

export default router;

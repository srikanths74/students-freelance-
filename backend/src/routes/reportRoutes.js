import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit a Report (for user, service, review, message, or project)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { target_type, target_id, target_name, reason, details } = req.body;

    if (!target_type || !target_id || !reason) {
      return res.status(400).json({ success: false, message: 'Target type, target ID, and reason are required' });
    }

    const report = db.createReport({
      reporter_id: req.user.id,
      target_type,
      target_id,
      target_name: target_name || '',
      reason,
      details: details || ''
    });

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will review this shortly.',
      report
    });
  } catch (err) {
    console.error('Error submitting report:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
});

export default router;

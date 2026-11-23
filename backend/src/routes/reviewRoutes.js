import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get Reviews for a specific user
router.get('/user/:userId', (req, res) => {
  try {
    const reviews = db.getUserReviews(req.params.userId);
    return res.json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews' });
  }
});

// Submit Multi-Criteria Review for a completed project
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      project_id,
      overall_rating,
      communication_rating,
      quality_rating,
      timeliness_rating,
      comment
    } = req.body;

    if (!project_id || !overall_rating) {
      return res.status(400).json({ success: false, message: 'Project ID and overall rating are required' });
    }

    const project = db.getProjectById(project_id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'You can only review completed projects' });
    }

    // Client reviews freelancer
    const isClient = Number(project.client_id) === Number(req.user.id);
    if (!isClient && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the project client can submit a review' });
    }

    // Check if review already exists
    const existingReviews = db.data.reviews || [];
    const alreadyReviewed = existingReviews.some(r => Number(r.project_id) === Number(project_id));
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this project' });
    }

    const review = db.createReview({
      project_id: project.id,
      reviewer_id: req.user.id,
      reviewee_id: project.freelancer_id,
      overall_rating: Number(overall_rating),
      communication_rating: Number(communication_rating || overall_rating),
      quality_rating: Number(quality_rating || overall_rating),
      timeliness_rating: Number(timeliness_rating || overall_rating),
      comment: comment || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review
    });
  } catch (err) {
    console.error('Review submission error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

export default router;

import express from 'express';
import db from '../db/database.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get Categories
router.get('/categories', (req, res) => {
  const categories = db.getAllCategories();
  return res.json({ success: true, categories });
});

// Upload Service Cover Image from device
router.post('/upload/cover', authenticateToken, upload.single('cover'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }
    const coverUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'Cover image uploaded successfully! 🎨',
      cover_url: coverUrl
    });
  } catch (err) {
    console.error('Service cover upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload cover image' });
  }
});

// Search & Browse Services (with multi-faceted filters)
router.get('/', optionalAuthenticateToken, (req, res) => {
  try {
    const {
      search,
      category_id,
      min_price,
      max_price,
      min_rating,
      max_days,
      sort,
      user_id
    } = req.query;

    const activeOnly = req.query.activeOnly === 'false' || req.query.user_id ? false : true;

    const services = db.getAllServices({
      search,
      category_id,
      min_price,
      max_price,
      min_rating,
      max_days,
      sort,
      user_id,
      activeOnly
    });

    return res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (err) {
    console.error('Error fetching services:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve services' });
  }
});

// Get Service Details by ID
router.get('/:id', optionalAuthenticateToken, (req, res) => {
  try {
    const service = db.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    return res.json({ success: true, service });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving service details' });
  }
});

// Create new Service / Gig
router.post('/', authenticateToken, (req, res) => {
  try {
    const { category_id, title, description, starting_price, delivery_days, skills_csv, cover_image } = req.body;

    if (!title || !category_id || !starting_price) {
      return res.status(400).json({ success: false, message: 'Title, category, and starting price are required' });
    }

    const service = db.createService({
      user_id: req.user.id,
      category_id,
      title,
      description: description || '',
      starting_price,
      delivery_days: delivery_days || 3,
      skills_csv: skills_csv || '',
      cover_image: cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
    });

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.status(201).json({
      success: true,
      message: 'Service gig published successfully!',
      service
    });
  } catch (err) {
    console.error('Error creating service:', err);
    return res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

// Update Service
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.getServiceById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (Number(existing.user_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this service' });
    }

    const updated = db.updateService(req.params.id, req.body);
    if (req.io) {
      req.io.emit('platform_stats_updated');
    }
    return res.json({ success: true, message: 'Service updated', service: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

// Delete Service
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.getServiceById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (Number(existing.user_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this service' });
    }

    db.deleteService(req.params.id);
    if (req.io) {
      req.io.emit('platform_stats_updated');
    }
    return res.json({ success: true, message: 'Service gig removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

export default router;

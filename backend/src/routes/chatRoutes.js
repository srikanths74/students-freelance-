import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Helper to find the designated platform administrator
function getPlatformAdmin() {
  const users = db.getAllUsers();
  return users.find(u => u.role === 'admin' && u.email === 'srikanthstephen2007@gmail.com') ||
         users.find(u => u.role === 'admin') ||
         { id: 7, name: 'Srikanth Stephen (Admin)', email: 'srikanthstephen2007@gmail.com', avatar_url: '/avatars/bitmoji_male_5.jpg' };
}

// ─── Student & Client Direct Chat with Platform Admin ───────────────────────
// Get direct messages with Admin
router.get('/admin', authenticateToken, (req, res) => {
  try {
    const adminUser = getPlatformAdmin();
    const messages = db.getDirectMessages(req.user.id, adminUser.id);
    db.markDirectMessagesAsRead(adminUser.id, req.user.id);
    const { password_hash, two_factor_secret, ...safeAdmin } = adminUser;
    return res.json({ success: true, admin: safeAdmin, messages });
  } catch (err) {
    console.error('Error fetching admin chat:', err);
    return res.status(500).json({ success: false, message: 'Failed to load admin chat' });
  }
});

// Send direct message to Admin from Student or Client
router.post('/admin', authenticateToken, (req, res) => {
  try {
    const { content, attachment_url, attachment_name, attachment_size } = req.body;
    if ((!content || !content.trim()) && !attachment_url) {
      return res.status(400).json({ success: false, message: 'Message content or attachment cannot be empty' });
    }

    const adminUser = getPlatformAdmin();
    const message = db.createMessage({
      project_id: 0,
      sender_id: req.user.id,
      receiver_id: adminUser.id,
      content: content ? content.trim() : 'Sent an attachment',
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      attachment_size: attachment_size || null,
      is_system: 0
    });

    // Notify admin
    db.createNotification({
      user_id: adminUser.id,
      type: 'USER_TO_ADMIN_MESSAGE',
      title: `Message from ${req.user.name} (${req.user.role}) 💬`,
      message: content && content.length > 80 ? content.substring(0, 80) + '...' : content || 'Sent an attachment',
      link_url: '/admin?tab=chat'
    });

    if (req.io) {
      req.io.to(`user_${adminUser.id}`).emit('new_direct_message', message);
      req.io.to(`user_${adminUser.id}`).emit('notification_ping', {
        type: 'USER_TO_ADMIN_MESSAGE',
        title: `Message from ${req.user.name}`,
        message: message.content
      });
    }

    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Error sending message to admin:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message to admin' });
  }
});

// Upload attachment for Admin Chat
router.post('/admin/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const adminUser = getPlatformAdmin();
    const fileUrl = `/uploads/${req.file.filename}`;

    const message = db.createMessage({
      project_id: 0,
      sender_id: req.user.id,
      receiver_id: adminUser.id,
      content: req.body.caption || `Uploaded file: ${req.file.originalname}`,
      attachment_url: fileUrl,
      attachment_name: req.file.originalname,
      attachment_size: req.file.size,
      is_system: 0
    });

    if (req.io) {
      req.io.to(`user_${adminUser.id}`).emit('new_direct_message', message);
    }

    return res.status(201).json({
      success: true,
      message,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (err) {
    console.error('Admin chat upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'File upload failed' });
  }
});

// ─── Project Workspace Chat ─────────────────────────────────────────────────
// Get Messages for a project
router.get('/:projectId', authenticateToken, (req, res) => {
  try {
    const project = db.getProjectById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isClient = Number(project.client_id) === Number(req.user.id);
    const isFreelancer = Number(project.freelancer_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized chat access' });
    }

    const messages = db.getProjectMessages(project.id);
    db.markMessagesAsRead(project.id, req.user.id);

    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving messages' });
  }
});

// Send a Text Message
router.post('/:projectId', authenticateToken, (req, res) => {
  try {
    const { content } = req.body;
    const project = db.getProjectById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isClient = Number(project.client_id) === Number(req.user.id);
    const isFreelancer = Number(project.freelancer_id) === Number(req.user.id);

    if (!isClient && !isFreelancer && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to post messages' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const receiverId = isClient ? project.freelancer_id : project.client_id;

    const message = db.createMessage({
      project_id: project.id,
      sender_id: req.user.id,
      receiver_id: receiverId,
      content: content.trim(),
      is_system: 0
    });

    // Notify receiver
    db.createNotification({
      user_id: receiverId,
      type: 'NEW_MESSAGE',
      title: `Message from ${req.user.name}`,
      message: content.length > 60 ? content.substring(0, 60) + '...' : content,
      link_url: `/projects/${project.id}`
    });

    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Error sending message:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Upload Attachment / Deliverable in Chat
router.post('/:projectId/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const project = db.getProjectById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isClient = Number(project.client_id) === Number(req.user.id);
    const receiverId = isClient ? project.freelancer_id : project.client_id;
    const fileUrl = `/uploads/${req.file.filename}`;

    const message = db.createMessage({
      project_id: project.id,
      sender_id: req.user.id,
      receiver_id: receiverId,
      content: req.body.caption || `Uploaded file: ${req.file.originalname}`,
      attachment_url: fileUrl,
      attachment_name: req.file.originalname,
      attachment_size: req.file.size,
      is_system: 0
    });

    return res.status(201).json({
      success: true,
      message,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'File upload failed' });
  }
});

export default router;

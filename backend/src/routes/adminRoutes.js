import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { authenticateToken, requireAdmin, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth + admin guard to all admin routes
router.use(authenticateToken, requireAdmin);

// ─── Platform Statistics & Dashboard Analytics ──────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const stats = db.getPlatformStats();
    
    const now = new Date();
    const allUsers = db.data.users || [];
    const allProjects = db.data.projects || [];

    // 1. Monthly Timeline (Last 5 calendar months including current month)
    const months = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const yearMonth = `${d.getFullYear()}-${monthNum}`;
      months.push({ label, yearMonth });
    }

    // 2. Daily Timeline (Last 7 days including today)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      days.push({ label, dateKey });
    }

    // Live Monthly User Growth
    const userGrowth = months.map(m => {
      const students = allUsers.filter(u => u.role === 'student' && (u.created_at || '').startsWith(m.yearMonth)).length;
      const clients = allUsers.filter(u => u.role === 'client' && (u.created_at || '').startsWith(m.yearMonth)).length;
      return { month: m.label, students, clients, total: students + clients };
    });

    // Live Daily User Growth
    const dailyUserGrowth = days.map(d => {
      const students = allUsers.filter(u => u.role === 'student' && (u.created_at || '').startsWith(d.dateKey)).length;
      const clients = allUsers.filter(u => u.role === 'client' && (u.created_at || '').startsWith(d.dateKey)).length;
      return { month: d.label, students, clients, total: students + clients };
    });

    // Live Monthly Projects
    const monthlyProjects = months.map(m => {
      const requested = allProjects.filter(p => (p.created_at || '').startsWith(m.yearMonth)).length;
      const completed = allProjects.filter(p => p.status === 'COMPLETED' && (p.created_at || '').startsWith(m.yearMonth)).length;
      const active = allProjects.filter(p => ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION'].includes(p.status) && (p.created_at || '').startsWith(m.yearMonth)).length;
      return { month: m.label, requested, completed, active };
    });

    // Live Daily Projects
    const dailyProjects = days.map(d => {
      const requested = allProjects.filter(p => (p.created_at || '').startsWith(d.dateKey)).length;
      const completed = allProjects.filter(p => p.status === 'COMPLETED' && (p.created_at || '').startsWith(d.dateKey)).length;
      const active = allProjects.filter(p => ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION'].includes(p.status) && (p.created_at || '').startsWith(d.dateKey)).length;
      return { month: d.label, requested, completed, active };
    });

    // Live Monthly Revenue Trajectory (5% Platform Facilitation Fee on Completed Projects)
    const revenueGrowth = months.map(m => {
      const compProjects = allProjects.filter(p => p.status === 'COMPLETED' && (p.created_at || '').startsWith(m.yearMonth));
      const volume = compProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
      const revenue = Math.round(volume * 0.05);
      return { month: m.label, volume, revenue };
    });

    // Live Daily Revenue Trajectory
    const dailyRevenue = days.map(d => {
      const compProjects = allProjects.filter(p => p.status === 'COMPLETED' && (p.created_at || '').startsWith(d.dateKey));
      const volume = compProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
      const revenue = Math.round(volume * 0.05);
      return { month: d.label, volume, revenue };
    });

    const projectStatusBreakdown = {
      REQUESTED: allProjects.filter(p => p.status === 'REQUESTED').length,
      IN_PROGRESS: allProjects.filter(p => ['ACCEPTED', 'IN_PROGRESS', 'REVISION'].includes(p.status)).length,
      SUBMITTED: allProjects.filter(p => p.status === 'SUBMITTED').length,
      COMPLETED: allProjects.filter(p => p.status === 'COMPLETED').length,
      CANCELLED: allProjects.filter(p => ['CANCELLED', 'REJECTED'].includes(p.status)).length
    };

    const pendingVerifications = (db.data.verification_requests || []).filter(v => v.status === 'PENDING').length;

    return res.json({
      success: true,
      stats: {
        ...stats,
        pendingVerifications
      },
      charts: {
        userGrowth,
        dailyUserGrowth,
        monthlyProjects,
        dailyProjects,
        revenueGrowth,
        dailyRevenue,
        popularCategories: stats.categoryStats,
        projectStatusBreakdown,
        syncedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load platform stats' });
  }
});

// ─── Get All Users (with verification status & role) ────────────────────────
router.get('/users', (req, res) => {
  const users = db.getAllUsers().map(u => {
    const { password_hash, two_factor_secret, ...safe } = u;
    const skills = db.getUserSkills(u.id);
    const services = db.getAllServices({ user_id: u.id, activeOnly: false });
    return {
      ...safe,
      skills,
      gigsCount: services.length
    };
  });
  return res.json({ success: true, users });
});

// ─── Get Verification Queue (Students & Clients) ────────────────────────────
router.get('/verifications', (req, res) => {
  try {
    const { status, user_type } = req.query;
    const requests = db.getAllVerificationRequests({ status, user_type });
    return res.json({ success: true, verifications: requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load verification requests' });
  }
});

// ─── Approve or Reject Verification Request ─────────────────────────────────
router.post('/verifications/:id/decision', (req, res) => {
  try {
    const { decision, admin_note } = req.body; // 'APPROVE' or 'REJECT'
    const isApproved = decision === 'APPROVE';

    const verification = db.updateVerificationRequest(req.params.id, {
      status: isApproved ? 'APPROVED' : 'REJECTED',
      reviewed_at: new Date().toISOString(),
      reviewer_id: req.user.id,
      admin_note: admin_note || ''
    });

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    const user = db.findUserById(verification.user_id);
    if (user) {
      if (verification.user_type === 'client') {
        db.updateUser(user.id, {
          is_verified_client: isApproved ? 1 : 0,
          client_verification_status: isApproved ? 'VERIFIED' : 'REJECTED'
        });
      } else {
        db.updateUser(user.id, {
          is_verified_student: isApproved ? 1 : 0,
          student_verification_status: isApproved ? 'VERIFIED' : 'REJECTED'
        });
      }

      // Notify the user of decision
      db.createNotification({
        user_id: user.id,
        type: 'VERIFICATION_UPDATE',
        title: isApproved ? 'Verification Approved! 🎉' : 'Verification Update ⚠️',
        message: isApproved
          ? `Congratulations! Your ${verification.user_type === 'client' ? 'Client Organization' : 'Student'} verification has been approved. You now have the verified badge.`
          : `Your verification request was not approved: ${admin_note || 'Please check your submitted documentation and re-apply.'}`,
        link_url: `/profile/${user.id}`
      });
    }

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.json({
      success: true,
      message: `Verification request ${isApproved ? 'approved' : 'rejected'} successfully`,
      verification
    });
  } catch (err) {
    console.error('Verification decision error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process verification decision' });
  }
});

// ─── Verify Student Account (Quick Toggle) ──────────────────────────────────
router.patch('/users/:id/verify', (req, res) => {
  try {
    const { is_verified_student } = req.body;
    const user = db.updateUser(req.params.id, { is_verified_student: is_verified_student ? 1 : 0 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    db.createNotification({
      user_id: user.id,
      type: 'VERIFICATION_UPDATE',
      title: is_verified_student ? 'Campus Verification Approved! 🎓' : 'Verification Status Updated',
      message: is_verified_student 
        ? 'Your student account has been verified with a campus badge.' 
        : 'Your student verification badge has been revoked.',
      link_url: `/profile/${user.id}`
    });

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.json({ success: true, message: 'User verification status updated', user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Verification update failed' });
  }
});

// ─── Suspend / Unsuspend User ───────────────────────────────────────────────
router.patch('/users/:id/suspend', (req, res) => {
  try {
    const { is_suspended } = req.body;
    const user = db.updateUser(req.params.id, { is_suspended: is_suspended ? 1 : 0 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.json({ success: true, message: `User ${is_suspended ? 'suspended' : 'reinstated'}`, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Suspension update failed' });
  }
});

// ─── Delete / Permanently Remove Freelancer or User ─────────────────────────
router.delete('/users/:id', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own account' });
    }
    const targetUser = db.findUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const isStudent = targetUser.role === 'student';
    const roleLabel = isStudent ? 'Student Freelancer' : 'Client';
    const success = db.deleteUser(targetId);
    if (!success) {
      return res.status(500).json({ success: false, message: 'Failed to remove user' });
    }

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.json({
      success: true,
      message: `${roleLabel} "${targetUser.name}" (${targetUser.email}) was permanently removed.`
    });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return res.status(500).json({ success: false, message: 'Server error while deleting user' });
  }
});

// ─── Admin Two-Way Live Chat with Students & Clients ────────────────────────
// 1. Get All Conversations (Students & Clients)
router.get('/chat/conversations', (req, res) => {
  try {
    const conversations = db.getAdminConversations(req.user.id);
    return res.json({ success: true, conversations });
  } catch (err) {
    console.error('Admin conversations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load conversations' });
  }
});

// 2. Get Messages with a specific Student or Client
router.get('/chat/:userId', (req, res) => {
  try {
    const targetId = Number(req.params.userId);
    const targetUser = db.findUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const messages = db.getDirectMessages(req.user.id, targetId);
    db.markDirectMessagesAsRead(targetId, req.user.id);

    const { password_hash, two_factor_secret, ...safeUser } = targetUser;
    return res.json({ success: true, user: safeUser, messages });
  } catch (err) {
    console.error('Admin get chat error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load chat history' });
  }
});

// 3. Send Message from Admin to Student or Client
router.post('/chat/:userId', (req, res) => {
  try {
    const targetId = Number(req.params.userId);
    const { content, attachment_url, attachment_name, attachment_size } = req.body;

    if ((!content || !content.trim()) && !attachment_url) {
      return res.status(400).json({ success: false, message: 'Message content or attachment cannot be empty' });
    }

    const targetUser = db.findUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const message = db.createMessage({
      project_id: 0,
      sender_id: req.user.id,
      receiver_id: targetId,
      content: content ? content.trim() : 'Sent an attachment',
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      attachment_size: attachment_size || null,
      is_system: 0
    });

    // Notify user
    db.createNotification({
      user_id: targetId,
      type: 'ADMIN_MESSAGE',
      title: 'Message from CampusGig Administrator 🛡️',
      message: content && content.length > 80 ? content.substring(0, 80) + '...' : content || 'Sent an attachment',
      link_url: '/chat/admin'
    });

    // Real-time socket dispatch if available
    if (req.io) {
      req.io.to(`user_${targetId}`).emit('new_direct_message', message);
      req.io.to(`user_${targetId}`).emit('notification_ping', {
        type: 'ADMIN_MESSAGE',
        title: 'New message from Administrator',
        message: message.content
      });
    }

    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Admin send message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// ─── Admin Send Quick Chat Notice / Update to Freelancer or Client ──────────
router.post('/users/:id/message', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { content, title } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const targetUser = db.findUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Send direct chat message
    const msg = db.createMessage({
      project_id: 0,
      sender_id: req.user.id,
      receiver_id: targetId,
      content: content.trim(),
      is_system: 1
    });

    // 2. High-priority notification
    db.createNotification({
      user_id: targetId,
      type: 'ADMIN_MESSAGE',
      title: title || 'Official Platform Notice from Admin 🛡️',
      message: content.trim(),
      link_url: '/chat/admin'
    });

    // 3. If user is in active projects, post alert in workstation chat
    const activeProjects = (db.data.projects || []).filter(
      p => (Number(p.freelancer_id) === targetId || Number(p.client_id) === targetId) &&
           ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION'].includes(p.status)
    );
    for (const proj of activeProjects) {
      db.createMessage({
        project_id: proj.id,
        sender_id: req.user.id,
        receiver_id: targetId,
        content: `🛡️ [ADMIN ANNOUNCEMENT]: ${content.trim()}`,
        is_system: 1
      });
    }

    if (req.io) {
      req.io.to(`user_${targetId}`).emit('new_direct_message', msg);
    }

    return res.json({
      success: true,
      message: `Admin update dispatched to ${targetUser.name} in chat & notifications!`,
      chatMessage: msg
    });
  } catch (err) {
    console.error('Admin message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send admin message' });
  }
});

// ─── Category Management ────────────────────────────────────────────────────
router.post('/categories', (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
    const category = db.createCategory({ name, icon, description });
    if (req.io) {
      req.io.emit('platform_stats_updated');
    }
    return res.status(201).json({ success: true, message: 'Category added', category });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

router.put('/categories/:id', (req, res) => {
  try {
    const category = db.updateCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (req.io) {
      req.io.emit('platform_stats_updated');
    }
    return res.json({ success: true, message: 'Category updated', category });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    db.deleteCategory(req.params.id);
    if (req.io) {
      req.io.emit('platform_stats_updated');
    }
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// ─── Moderation: Reports ────────────────────────────────────────────────────
router.get('/reports', (req, res) => {
  const { status } = req.query;
  const reports = db.getAllReports(status);
  return res.json({ success: true, reports });
});

router.patch('/reports/:id/resolve', (req, res) => {
  try {
    const { status, admin_notes, action_type } = req.body;
    const report = db.resolveReport(req.params.id, status || 'RESOLVED', admin_notes);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    let actionTakenMessage = 'Report resolved successfully';

    if (action_type === 'BAN_USER' && report.target_type === 'user') {
      db.updateUser(report.target_id, { is_suspended: 1 });
      actionTakenMessage = 'User has been banned and suspended from the platform.';
    } else if (action_type === 'UNBAN_USER' && report.target_type === 'user') {
      db.updateUser(report.target_id, { is_suspended: 0 });
      actionTakenMessage = 'User ban has been revoked.';
    } else if (action_type === 'DEACTIVATE_SERVICE' && report.target_type === 'service') {
      db.updateService(report.target_id, { is_active: 0 });
      actionTakenMessage = 'Service gig has been deactivated and hidden from search.';
    } else if (action_type === 'DELETE_REVIEW' && report.target_type === 'review') {
      db.deleteReview(report.target_id);
      actionTakenMessage = 'Inappropriate review has been permanently removed.';
    } else if (action_type === 'DELETE_MESSAGE' && report.target_type === 'message') {
      db.deleteMessage(report.target_id);
      actionTakenMessage = 'Inappropriate chat message has been removed.';
    } else if (action_type === 'CANCEL_PROJECT' && report.target_type === 'project') {
      db.updateProject(report.target_id, { status: 'CANCELLED' });
      actionTakenMessage = 'Project contract has been cancelled by administration.';
    } else if (action_type === 'DISMISS') {
      actionTakenMessage = 'Report dismissed with no action taken.';
    }

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.json({ success: true, message: actionTakenMessage, report });
  } catch (err) {
    console.error('Error resolving report:', err);
    return res.status(500).json({ success: false, message: 'Failed to resolve report' });
  }
});

// ─── Admin System Telemetry & Management ────────────────────────────────────
router.get('/system', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRssMb: (memoryUsage.rss / (1024 * 1024)).toFixed(2),
      memoryHeapUsedMb: (memoryUsage.heapUsed / (1024 * 1024)).toFixed(2),
      memoryHeapTotalMb: (memoryUsage.heapTotal / (1024 * 1024)).toFixed(2),
      environment: process.env.NODE_ENV || 'development',
      database: {
        totalUsers: (db.data.users || []).length,
        totalGigs: (db.data.services || []).length,
        totalProjects: (db.data.projects || []).length,
        totalSkills: (db.data.skills || []).length,
        totalVerifications: (db.data.verification_requests || []).length,
        totalReports: (db.data.reports || []).length
      }
    };
    return res.json({ success: true, system: systemInfo });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch system telemetry' });
  }
});

// ─── Admin Profile Management: Change Name / Email / Info ───────────────────
router.put('/profile', async (req, res) => {
  try {
    const { name, email, college, department, bio } = req.body;
    const adminUser = db.findUserById(req.user.id);
    if (!adminUser) return res.status(404).json({ success: false, message: 'Admin user not found' });

    // If changing email, ensure uniqueness
    if (email && email.toLowerCase().trim() !== adminUser.email.toLowerCase().trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = db.findUserByEmail(cleanEmail);
      if (existing && existing.id !== adminUser.id) {
        return res.status(400).json({ success: false, message: 'This email is already used by another account.' });
      }
    }

    const updated = db.updateUser(adminUser.id, {
      name: name ? name.trim() : adminUser.name,
      email: email ? email.toLowerCase().trim() : adminUser.email,
      college: college ? college.trim() : adminUser.college,
      department: department ? department.trim() : adminUser.department,
      bio: bio !== undefined ? bio.trim() : adminUser.bio
    });

    const { password_hash, ...safeAdmin } = updated;
    const token = generateToken(updated);
    return res.json({
      success: true,
      message: 'Admin profile updated successfully! 🎉',
      admin: safeAdmin,
      token
    });
  } catch (err) {
    console.error('Admin profile update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update admin profile.' });
  }
});

// ─── Admin Password Change ──────────────────────────────────────────────────
const changePasswordHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const adminUser = db.findUserById(req.user.id);
    if (!adminUser) return res.status(404).json({ success: false, message: 'Admin user not found' });

    const isMatch = await bcrypt.compare(currentPassword, adminUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.updateUser(adminUser.id, { password_hash: newHash });

    return res.json({
      success: true,
      message: 'Admin password changed successfully! Please use your new password next time you sign in.'
    });
  } catch (err) {
    console.error('Admin password change error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change admin password.' });
  }
};

router.put('/change-password', changePasswordHandler);
router.put('/password', changePasswordHandler);
router.patch('/password', changePasswordHandler);

// ─── Dynamic Website Customizer & CMS ───────────────────────────────────────
router.get('/site-settings', (req, res) => {
  try {
    const settings = db.getSiteSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load site settings' });
  }
});

router.put('/site-settings', (req, res) => {
  try {
    const updated = db.updateSiteSettings(req.body);
    return res.json({
      success: true,
      message: 'Website customizations saved and published successfully! 🚀',
      settings: updated
    });
  } catch (err) {
    console.error('Error updating site settings:', err);
    return res.status(500).json({ success: false, message: 'Failed to update website customizations' });
  }
});

export default router;

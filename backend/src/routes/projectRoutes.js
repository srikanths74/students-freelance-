import express from 'express';
import db from '../db/database.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// ─── Open Public Project Listings (Job Board) ──────────────────────────────
router.get('/open', optionalAuthenticateToken, (req, res) => {
  try {
    const { category_id, search } = req.query;
    const projects = db.getAllProjects({
      is_open: true,
      category_id,
      search
    });
    return res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Error fetching open projects:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch open jobs' });
  }
});

// ─── Post Public Project / Job by Client ────────────────────────────────────
router.post('/public', authenticateToken, (req, res) => {
  try {
    const { title, description, category_id, budget, deadline_days, skills_required, reference_file_url, reference_file_name } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ success: false, message: 'Title, description, and budget are required.' });
    }

    if (Number(budget) < 100) {
      return res.status(400).json({ success: false, message: 'Minimum budget must be at least ₹100.' });
    }

    const project = db.createProject({
      client_id: req.user.id,
      freelancer_id: null,
      category_id: category_id ? Number(category_id) : null,
      title: title.trim(),
      description: description.trim(),
      skills_required: skills_required || '',
      budget: Number(budget),
      deadline_days: Number(deadline_days) || 3,
      reference_file_url: reference_file_url || null,
      reference_file_name: reference_file_name || null,
      is_public: 1
    });

    if (req.io) {
      req.io.emit('platform_stats_updated');
      req.io.emit('new_open_job', project);
    }

    return res.status(201).json({
      success: true,
      message: 'Public job posted successfully! Student freelancers can now apply.',
      project
    });
  } catch (err) {
    console.error('Error posting public job:', err);
    return res.status(500).json({ success: false, message: 'Failed to post public job' });
  }
});

// ─── Submit Proposal for Open Project (Student Freelancer) ──────────────────
router.post('/:id/proposals', authenticateToken, (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { bid_amount, pitch, delivery_days } = req.body;

    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'This project is no longer accepting proposals.' });
    }

    if (Number(project.client_id) === Number(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own project.' });
    }

    if (!bid_amount || Number(bid_amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid bid amount.' });
    }

    // Check if already applied
    const existingProposals = db.getProjectProposals(projectId);
    const alreadyApplied = existingProposals.some(p => Number(p.freelancer_id) === Number(req.user.id));
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this project.' });
    }

    const proposal = db.createProposal({
      project_id: projectId,
      freelancer_id: req.user.id,
      bid_amount: Number(bid_amount),
      delivery_days: Number(delivery_days) || project.deadline_days || 3,
      pitch: pitch ? pitch.trim() : ''
    });

    if (req.io) {
      req.io.to(`user_${project.client_id}`).emit('notification_ping', {
        type: 'NEW_PROPOSAL',
        title: 'New Student Application! 🎯',
        message: `${req.user.name} submitted a bid (₹${bid_amount}) for "${project.title}".`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully to the client!',
      proposal
    });
  } catch (err) {
    console.error('Error submitting proposal:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit proposal' });
  }
});

// ─── Get Proposals for a Specific Project (Client View) ─────────────────────
router.get('/:id/proposals', authenticateToken, (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only client owner or admin can view all proposals
    if (Number(project.client_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view proposals for this project.' });
    }

    const proposals = db.getProjectProposals(projectId);
    return res.json({ success: true, count: proposals.length, proposals });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load proposals' });
  }
});

// ─── Accept a Proposal & Appoint Student (Client Action) ────────────────────
router.post('/proposals/:proposalId/accept', authenticateToken, (req, res) => {
  try {
    const proposalId = Number(req.params.proposalId);
    const result = db.acceptProposal(proposalId, req.user.id);
    if (!result.success) {
      return res.status(400).json(result);
    }

    if (req.io) {
      req.io.emit('platform_stats_updated');
      if (result.project && result.project.freelancer_id) {
        req.io.to(`user_${result.project.freelancer_id}`).emit('notification_ping', {
          type: 'PROPOSAL_ACCEPTED',
          title: 'You Got Hired! 🎉',
          message: `Your bid for "${result.project.title}" was accepted!`
        });
      }
    }

    return res.json(result);
  } catch (err) {
    console.error('Error accepting proposal:', err);
    return res.status(500).json({ success: false, message: 'Failed to accept proposal' });
  }
});

// ─── Get Current Student's Submitted Proposals ──────────────────────────────
router.get('/my/proposals', authenticateToken, (req, res) => {
  try {
    const proposals = db.getFreelancerProposals(req.user.id);
    return res.json({ success: true, count: proposals.length, proposals });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load my proposals' });
  }
});

// Upload Reference Files / Specification Attachments
router.post('/upload-reference', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No reference file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    file_url: fileUrl,
    file_name: req.file.originalname,
    file_size: req.file.size
  });
});

// Get Projects (as Client, Freelancer, or all if Admin)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { role, status } = req.query;
    let filter = {};

    if (req.user.role === 'admin') {
      if (status) filter.status = status;
    } else {
      if (role === 'client') {
        filter.client_id = req.user.id;
      } else if (role === 'freelancer') {
        filter.freelancer_id = req.user.id;
      } else {
        filter.user_id = req.user.id;
      }
      if (status) filter.status = status;
    }

    const projects = db.getAllProjects(filter);
    return res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Error retrieving projects:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve projects' });
  }
});

// Get Project Details by ID (with strict ownership check)
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Security check: Only client, freelancer, or admin can access
    const isClient = Number(project.client_id) === Number(req.user.id);
    const isFreelancer = Number(project.freelancer_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not have permission to view this project.' });
    }

    const messages = db.getProjectMessages(project.id);

    return res.json({
      success: true,
      project,
      messages,
      currentUserRoleInProject: isClient ? 'client' : isFreelancer ? 'freelancer' : 'admin'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving project' });
  }
});

// Create new Project Request (Hire Freelancer)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { service_id, freelancer_id, title, description, requirements, budget, deadline_days, reference_file_url, reference_file_name } = req.body;

    if (!freelancer_id || !title || !description || !budget) {
      return res.status(400).json({ success: false, message: 'Freelancer ID, title, description, and budget are required.' });
    }

    if (Number(freelancer_id) === Number(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot hire yourself.' });
    }

    const project = db.createProject({
      service_id,
      client_id: req.user.id,
      freelancer_id,
      title,
      description,
      requirements,
      budget: Number(budget),
      deadline_days: Number(deadline_days) || 3,
      reference_file_url: reference_file_url || null,
      reference_file_name: reference_file_name || null
    });

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.status(201).json({
      success: true,
      message: 'Project request sent to student freelancer!',
      project
    });
  } catch (err) {
    console.error('Error creating project request:', err);
    return res.status(500).json({ success: false, message: 'Failed to create project request' });
  }
});

// Update Project Lifecycle Status
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status, submission_notes, submission_file_url, submission_file_name, revision_notes } = req.body;
    const project = db.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isClient = Number(project.client_id) === Number(req.user.id);
    const isFreelancer = Number(project.freelancer_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized project modification.' });
    }

    // Role-specific transition rules
    if (status === 'ACCEPTED' || status === 'REJECTED' || status === 'IN_PROGRESS') {
      if (!isFreelancer && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the assigned freelancer can accept or start the project.' });
      }
    }

    if (status === 'SUBMITTED') {
      if (!isFreelancer && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the freelancer can submit deliverables.' });
      }
      if (!submission_file_url && !submission_notes) {
        return res.status(400).json({ success: false, message: 'Please provide deliverable notes or files.' });
      }
    }

    if (status === 'COMPLETED' || status === 'REVISION') {
      if (!isClient && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the client can approve or request revisions.' });
      }
    }

    const updated = db.updateProjectStatus(req.params.id, status, {
      submission_notes,
      submission_file_url,
      submission_file_name,
      revision_notes
    });

    // Create system message in chat
    let systemMsg = `System: Project status updated to ${status}`;
    if (status === 'ACCEPTED') systemMsg = `🎉 ${project.freelancer.name} accepted the project! Escrow payment of ₹${project.budget} is safely locked.`;
    if (status === 'IN_PROGRESS') systemMsg = `⚡ Project is now IN PROGRESS. Work has started!`;
    if (status === 'SUBMITTED') systemMsg = `📦 Deliverables submitted by freelancer: "${submission_notes || 'Files attached'}". Awaiting client review.`;
    if (status === 'REVISION') systemMsg = `🔄 Revision requested by client: "${revision_notes || 'Please adjust as discussed'}".`;
    if (status === 'COMPLETED') systemMsg = `✅ Project marked as COMPLETED! Escrow ₹${project.budget} released to ${project.freelancer.name}.`;
    if (status === 'REJECTED') systemMsg = `❌ Project request declined by freelancer.`;
    if (status === 'CANCELLED') systemMsg = `⛔ Project cancelled. Escrow refunded to client wallet.`;

    db.createMessage({
      project_id: project.id,
      sender_id: req.user.id,
      receiver_id: isClient ? project.freelancer_id : project.client_id,
      content: systemMsg,
      is_system: 1
    });

    // Notify other party
    const targetUserId = isClient ? project.freelancer_id : project.client_id;
    db.createNotification({
      user_id: targetUserId,
      type: `PROJECT_${status}`,
      title: `Project ${status.replace('_', ' ')}`,
      message: `${req.user.name} updated "${project.title}" to ${status}.`,
      link_url: `/projects/${project.id}`
    });

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.json({
      success: true,
      message: `Project status updated to ${status}`,
      project: updated
    });
  } catch (err) {
    console.error('Error updating project status:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project status' });
  }
});

export default router;

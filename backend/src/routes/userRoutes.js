import express from 'express';
import path from 'path';
import db from '../db/database.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { sendSmsOtp } from '../services/smsService.js';

const router = express.Router();

// ─── 1. Search & List Freelancers ───────────────────────────────────────────
router.get('/', optionalAuthenticateToken, (req, res) => {
  try {
    const { role = 'student', search = '', skill = '' } = req.query;
    let users = db.getAllUsers().filter(u => u.is_suspended !== 1);

    if (role) {
      users = users.filter(u => u.role === role);
    }

    const cleanSearch = search.toLowerCase().trim();
    const cleanSkill = skill.toLowerCase().trim();

    const freelancers = users.map(u => {
      const skills = db.getUserSkills(u.id);
      const skillFiles = db.getUserSkillFiles(u.id);
      const services = db.getAllServices({ user_id: u.id, activeOnly: true });
      const reviews = db.getUserReviews(u.id);
      const avgRating = reviews.length > 0 
        ? parseFloat((reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1))
        : 0;

      const { password_hash, two_factor_secret, ...safeUser } = u;
      const certificatesCount = skillFiles.filter(f => f.category === 'certificate').length;
      return {
        ...safeUser,
        skills,
        skillFilesCount: skillFiles.length,
        certificatesCount,
        services,
        rating: parseFloat(avgRating),
        reviewCount: reviews.length,
        startingPrice: services.length > 0 ? Math.min(...services.map(s => s.starting_price)) : 400
      };
    });

    let filtered = freelancers;
    if (cleanSearch) {
      filtered = filtered.filter(f => 
        (f.name || '').toLowerCase().includes(cleanSearch) ||
        (f.college || '').toLowerCase().includes(cleanSearch) ||
        (f.department || '').toLowerCase().includes(cleanSearch) ||
        (f.bio || '').toLowerCase().includes(cleanSearch) ||
        f.skills.some(s => (s.skill_name || s).toLowerCase().includes(cleanSearch))
      );
    }

    if (cleanSkill) {
      filtered = filtered.filter(f =>
        f.skills.some(s => (s.skill_name || s).toLowerCase().includes(cleanSkill))
      );
    }

    return res.json({ success: true, count: filtered.length, freelancers: filtered });
  } catch (err) {
    console.error('Error fetching freelancers:', err);
    return res.status(500).json({ success: false, message: 'Failed to search freelancers' });
  }
});

// ─── 2. Get Public Profile with Skills, Resume, Skill Files & Reviews ────────
router.get('/:id', optionalAuthenticateToken, (req, res) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const skills = db.getUserSkills(user.id);
    const skillFiles = db.getUserSkillFiles(user.id);
    const portfolio = db.getUserPortfolio(user.id);
    const services = db.getAllServices({ user_id: user.id });
    const reviews = db.getUserReviews(user.id);
    
    // Aggregate ratings
    const avgRating = reviews.length > 0 
      ? parseFloat((reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1))
      : 0;

    const completedProjects = (db.data.projects || []).filter(p => Number(p.freelancer_id) === Number(user.id) && p.status === 'COMPLETED').length;

    // Sanitize user object (exclude password_hash & 2fa secrets)
    const { password_hash, two_factor_secret, ...publicUser } = user;

    return res.json({
      success: true,
      profile: {
        ...publicUser,
        skills,
        skillFiles,
        portfolio,
        services,
        reviews,
        stats: {
          averageRating: parseFloat(avgRating),
          reviewCount: reviews.length,
          completedProjects,
          activeGigsCount: services.filter(s => s.is_active).length
        }
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving profile' });
  }
});

// ─── 2. Update Current User Profile ──────────────────────────────────────────
router.put('/me', authenticateToken, (req, res) => {
  try {
    const {
      name,
      college,
      department,
      year_of_study,
      bio,
      avatar_url,
      response_time,
      skills,
      portfolio_url,
      phone,
      github_url,
      linkedin_url,
      resume_url,
      company_name,
      company_website,
      company_description,
      client_work_description
    } = req.body;
    
    const updated = db.updateUser(req.user.id, {
      name: name || req.user.name,
      college: college !== undefined ? college : req.user.college,
      department: department !== undefined ? department : req.user.department,
      year_of_study: year_of_study !== undefined ? year_of_study : req.user.year_of_study,
      bio: bio !== undefined ? bio : req.user.bio,
      avatar_url: avatar_url || req.user.avatar_url,
      response_time: response_time || req.user.response_time,
      portfolio_url: portfolio_url !== undefined ? portfolio_url : req.user.portfolio_url,
      phone: phone !== undefined ? phone : req.user.phone,
      github_url: github_url !== undefined ? github_url : req.user.github_url,
      linkedin_url: linkedin_url !== undefined ? linkedin_url : req.user.linkedin_url,
      resume_url: resume_url !== undefined ? resume_url : req.user.resume_url,
      company_name: company_name !== undefined ? company_name : req.user.company_name,
      company_website: company_website !== undefined ? company_website : req.user.company_website,
      company_description: company_description !== undefined ? company_description : req.user.company_description,
      client_work_description: client_work_description !== undefined ? client_work_description : req.user.client_work_description
    });

    if (skills && Array.isArray(skills)) {
      db.setUserSkills(req.user.id, skills);
    }

    const updatedSkills = db.getUserSkills(req.user.id);
    const updatedSkillFiles = db.getUserSkillFiles(req.user.id);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...updated,
        skills: updatedSkills,
        skillFiles: updatedSkillFiles
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ─── 2a. Send Mobile Phone OTP via Twilio SMS ────────────────────────────────
router.post('/phone-otp/send', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.body;
    // Strip spaces, dashes, dots, parens
    const cleanPhone = (phone || '').trim().replace(/[\s\-().]/g, '');

    if (!cleanPhone || cleanPhone.replace(/^\+\d{1,3}/, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile phone number.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

    // Store OTP for later verification
    db.savePendingOtp('phone', cleanPhone, {
      userId: req.user.id,
      otp: otpCode,
      expiresAt
    });

    // Send real SMS via Twilio
    const smsResult = await sendSmsOtp(cleanPhone, otpCode);

    if (smsResult.mode === 'twilio') {
      return res.json({
        success: true,
        message: `A 6-digit SMS verification code has been sent to ${cleanPhone}. Please check your messages.`,
        phone: cleanPhone,
        sentViaSms: true,
        mode: 'twilio'
      });
    } else if (smsResult.mode === 'twilio_error') {
      // Twilio configured but failed — surface error to user
      return res.status(502).json({
        success: false,
        message: `SMS delivery failed: ${smsResult.error}. Please check your Twilio configuration or try again.`,
        mode: 'twilio_error'
      });
    } else {
      // Dev / unconfigured mode — OTP printed to server console
      return res.json({
        success: true,
        message: `[Dev Mode] Twilio is not configured. The OTP code has been printed to the server console for testing.`,
        phone: cleanPhone,
        sentViaSms: false,
        mode: 'dev_console'
      });
    }
  } catch (err) {
    console.error('Phone OTP send error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send phone OTP.' });
  }
});

// ─── 2b. Verify Mobile Phone OTP ─────────────────────────────────────────────
router.post('/phone-otp/verify', authenticateToken, (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = (phone || '').trim().replace(/[\s-]/g, '');

    if (!cleanPhone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and 6-digit OTP code are required.' });
    }

    const pending = db.getPendingOtp('phone', cleanPhone);
    if (!pending) {
      return res.status(400).json({ success: false, message: 'No active OTP found. Please click "Send OTP" first.' });
    }

    if (Date.now() > pending.expiresAt) {
      db.deletePendingOtp('phone', cleanPhone);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new verification code.' });
    }

    if (pending.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code. Please check and try again.' });
    }

    db.deletePendingOtp('phone', cleanPhone);
    const updated = db.updateUser(req.user.id, {
      phone: cleanPhone,
      is_phone_verified: 1
    });

    return res.json({
      success: true,
      message: 'Mobile phone number verified successfully! 📱',
      phone: cleanPhone,
      is_phone_verified: 1,
      user: updated
    });
  } catch (err) {
    console.error('Phone OTP verify error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify phone OTP.' });
  }
});

// ─── 2c. Complete Required Student Profile (Onboarding Guard) ────────────────
router.post('/complete-student-profile', authenticateToken, upload.single('resume'), (req, res) => {
  try {
    const {
      name,
      phone,
      is_phone_verified,
      college,
      department,
      year_of_study,
      bio,
      github_url,
      portfolio_url,
      linkedin_url,
      skills,
      avatar_url
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const isVerified = is_phone_verified === '1' || is_phone_verified === 1 || is_phone_verified === true || req.user.is_phone_verified === 1;
    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be verified with OTP before completing your profile.'
      });
    }

    if (!college || !college.trim()) {
      return res.status(400).json({ success: false, message: 'College / University name is required.' });
    }

    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department / Major is required.' });
    }

    if (!year_of_study || !year_of_study.trim()) {
      return res.status(400).json({ success: false, message: 'Year of study is required.' });
    }

    if (!bio || bio.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a short bio (at least 10 characters).' });
    }

    if (!github_url || !github_url.trim()) {
      return res.status(400).json({ success: false, message: 'GitHub profile link is required.' });
    }

    if (!portfolio_url || !portfolio_url.trim()) {
      return res.status(400).json({ success: false, message: 'Portfolio or project link is required.' });
    }

    // Resume / CV validation: file uploaded OR resume_url provided OR existing resume
    const uploadedResumeUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const finalResumeUrl = uploadedResumeUrl || req.body.resume_url || req.user.resume_url;
    const finalResumeFilename = req.file 
      ? req.file.originalname 
      : (req.body.resume_filename || req.user.resume_filename || 'Student_Resume.pdf');

    if (!finalResumeUrl || !finalResumeUrl.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'CV or Resume is required. Please upload your resume document (PDF/DOCX) or provide a link.' 
      });
    }

    // Skills validation
    let parsedSkills = [];
    if (typeof skills === 'string') {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(skills)) {
      parsedSkills = skills;
    }

    if (!parsedSkills || parsedSkills.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least 1 skill to complete your profile.' });
    }

    const formattedSkills = parsedSkills.map(s => {
      if (typeof s === 'string') {
        return { skill_name: s.trim(), proficiency: 'Expert' };
      }
      return { skill_name: s.skill_name || s.name || String(s), proficiency: s.proficiency || 'Expert' };
    }).filter(s => Boolean(s.skill_name));

    if (formattedSkills.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least 1 valid skill name.' });
    }

    // Update user in DB
    const updated = db.updateUser(req.user.id, {
      name: name.trim(),
      phone: phone.trim(),
      college: college.trim(),
      department: department.trim(),
      year_of_study: year_of_study.trim(),
      bio: bio.trim(),
      github_url: github_url.trim(),
      portfolio_url: portfolio_url.trim(),
      linkedin_url: linkedin_url ? linkedin_url.trim() : (req.user.linkedin_url || ''),
      resume_url: finalResumeUrl.trim(),
      resume_filename: finalResumeFilename,
      resume_uploaded_at: new Date().toISOString(),
      avatar_url: avatar_url || req.user.avatar_url,
      is_phone_verified: 1,
      profile_completed: 1
    });

    // Save skills
    db.setUserSkills(req.user.id, formattedSkills);

    const updatedSkills = db.getUserSkills(req.user.id);
    const wallet = db.getWallet(req.user.id);
    const { password_hash, two_factor_secret, ...safeUser } = updated;

    return res.json({
      success: true,
      message: 'Student profile completed successfully! 🎉 Welcome to CampusGig.',
      user: {
        ...safeUser,
        profile_completed: 1,
        skills: updatedSkills,
        wallet
      }
    });
  } catch (err) {
    console.error('Error in complete-student-profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete profile due to server error.' });
  }
});

// ─── 3. Upload Profile Photo from Device ─────────────────────────────────────
router.post('/upload/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = db.updateUser(req.user.id, { avatar_url: avatarUrl });

    return res.json({
      success: true,
      message: 'Profile photo uploaded and updated successfully! 📸',
      avatar_url: avatarUrl,
      user
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload profile photo.' });
  }
});

// ─── 4. Upload Student Resume (PDF/DOCX) ──────────────────────────────────────
router.post('/upload/resume', authenticateToken, upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a resume document to upload.' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const user = db.updateUser(req.user.id, {
      resume_url: resumeUrl,
      resume_filename: req.file.originalname,
      resume_uploaded_at: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Student resume uploaded successfully! 📄',
      resume_url: resumeUrl,
      resume_filename: req.file.originalname,
      user
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload resume document.' });
  }
});

// ─── 5. Upload Skill Deliverable / Work Sample (All file types) ───────────────
router.post('/upload/skill-file', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a work sample file to upload.' });
    }

    const title = req.body.title || req.file.originalname;
    const category = req.body.category || (
      /cert|diploma|degree|course|completion|award|license|badge|credential/i.test(title) ||
      /cert|diploma|degree|course|completion|award|license|badge|credential/i.test(req.file.originalname)
        ? 'certificate'
        : 'sample'
    );
    const fileUrl = `/uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Categorize file type
    let fileType = 'document';
    if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) fileType = 'image';
    else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) fileType = 'video';
    else if (['.zip', '.rar', '.7z', '.tar'].includes(ext)) fileType = 'archive';
    else if (['.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.java', '.cpp', '.c'].includes(ext)) fileType = 'code';
    else if (['.pdf'].includes(ext)) fileType = 'pdf';

    const skillFile = db.createSkillFile({
      user_id: req.user.id,
      title,
      file_url: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
      file_type: fileType,
      category
    });

    return res.status(201).json({
      success: true,
      message: category === 'certificate' 
        ? 'Certificate uploaded and verified on your public profile! 📜' 
        : 'Work sample uploaded and linked to your profile! 📁',
      skillFile
    });
  } catch (err) {
    console.error('Skill file upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload skill work sample.' });
  }
});

// ─── 6. Get User's Skill Files ───────────────────────────────────────────────
router.get('/skill-files/:userId', (req, res) => {
  try {
    const files = db.getUserSkillFiles(req.params.userId);
    return res.json({ success: true, files });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve skill files.' });
  }
});

// ─── 7. Delete User's Skill File ─────────────────────────────────────────────
router.delete('/skill-files/:fileId', authenticateToken, (req, res) => {
  try {
    db.deleteSkillFile(req.params.fileId, req.user.id);
    return res.json({ success: true, message: 'Skill file removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete file.' });
  }
});

// ─── 8. Client Verification Request Submission ──────────────────────────────
router.post('/verification/submit-client', authenticateToken, upload.single('verification_doc'), (req, res) => {
  try {
    const { organization_name, notes } = req.body;
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.document_url;

    if (!documentUrl) {
      return res.status(400).json({ success: false, message: 'Please attach an organization ID or authorization document.' });
    }

    const verification = db.createVerificationRequest({
      user_id: req.user.id,
      user_type: 'client',
      document_url: documentUrl,
      document_name: req.file ? req.file.originalname : 'Organization Document',
      organization_name: organization_name || req.user.college,
      notes: notes || 'Client hiring organization verification request'
    });

    db.updateUser(req.user.id, {
      client_verification_status: 'PENDING',
      client_verification_doc: documentUrl,
      organization_name: organization_name || req.user.college
    });

    return res.status(201).json({
      success: true,
      message: 'Client verification submitted! Our campus admin team will review your credentials within 24 hours.',
      verification
    });
  } catch (err) {
    console.error('Client verification submit error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit client verification.' });
  }
});

// ─── 9. Student ID Verification Request Submission ──────────────────────────
router.post('/verification/submit-student', authenticateToken, upload.single('id_card'), (req, res) => {
  try {
    const { college_name, notes } = req.body;
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.document_url;

    if (!documentUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a photo of your Student ID Card or College Enrollment document.' });
    }

    const verification = db.createVerificationRequest({
      user_id: req.user.id,
      user_type: 'student',
      document_url: documentUrl,
      document_name: req.file ? req.file.originalname : 'Student ID Card',
      college_name: college_name || req.user.college,
      notes: notes || 'Student ID card verification request'
    });

    db.updateUser(req.user.id, {
      student_verification_status: 'PENDING',
      student_id_doc: documentUrl
    });

    return res.status(201).json({
      success: true,
      message: 'Student ID submitted! Admin will verify your campus badge shortly.',
      verification
    });
  } catch (err) {
    console.error('Student verification submit error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit student verification.' });
  }
});

// ─── Portfolio CRUD ──────────────────────────────────────────────────────────
router.post('/portfolio', authenticateToken, (req, res) => {
  try {
    const { title, description, project_url, image_url, technologies } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    const item = db.createPortfolioItem({
      user_id: req.user.id,
      title,
      description,
      project_url,
      image_url,
      technologies
    });

    return res.status(201).json({ success: true, message: 'Portfolio item added', item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create portfolio item' });
  }
});

router.delete('/portfolio/:id', authenticateToken, (req, res) => {
  try {
    const items = db.getUserPortfolio(req.user.id);
    const item = items.find(p => Number(p.id) === Number(req.params.id));
    if (!item && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized or item not found' });
    }

    db.deletePortfolioItem(req.params.id);
    return res.json({ success: true, message: 'Portfolio item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { sendVerificationOtpEmail, sendPasswordResetOtpEmail } from '../services/emailService.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// In-memory OTP caches (15 minutes validity)
const registrationStore = new Map(); // email -> { userData, otp, expiresAt }
const loginOtpStore = new Map();      // email -> { userId, otp, expiresAt }
const twoFactorOtpStore = new Map();  // email -> { userId, otp, expiresAt }

// ─── 1. Registration: Step 1 - Send OTP (Rate Limited) ───────────────────────
router.post('/register-send-otp', otpLimiter, async (req, res) => {
  try {
    const { name, email, password, role, college, department, year_of_study, bio, skills, avatar_url, phone, github_url, linkedin_url, resume_url } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in instead.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const isEduEmail = /@(.*\.)?(edu|ac\.in|edu\.in)$/i.test(cleanEmail) || cleanEmail.includes('college');
    const userRole = role === 'client' ? 'client' : 'student';

    // Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    db.savePendingOtp('registration', cleanEmail, {
      userData: {
        name: name.trim(),
        email: cleanEmail,
        password_hash,
        role: userRole,
        college: college || (userRole === 'client' ? 'Client Organization' : 'University Campus'),
        department: department || (userRole === 'client' ? 'Client / Hiring Club' : 'General Studies'),
        year_of_study: year_of_study || (userRole === 'client' ? 'Client / Employer' : '1st Year'),
        bio: bio || '',
        is_verified_student: isEduEmail ? 1 : 1, // Activated via email OTP verification
        two_factor_enabled: 0,
        skills: skills && Array.isArray(skills) ? skills : [],
        avatar_url: (avatar_url && !avatar_url.includes('dicebear.com/7.x/avataaars')) ? avatar_url : undefined,
        phone: phone || '',
        github_url: github_url || '',
        linkedin_url: linkedin_url || '',
        resume_url: resume_url || ''
      },
      otp: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    const mailResult = await sendVerificationOtpEmail(cleanEmail, name, otpCode);

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent via SMTP to ${cleanEmail}`,
      email: cleanEmail,
      mode: mailResult.mode
    });
  } catch (err) {
    console.error('Register send OTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send registration verification email.' });
  }
});

// ─── 1. Registration: Step 2 - Verify OTP & Create Account ──────────────────
router.post('/register-verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const pending = db.getPendingOtp('registration', cleanEmail);
    if (!pending) {
      return res.status(400).json({ success: false, message: 'No pending registration found or session expired. Please sign up again.' });
    }

    if (Date.now() > pending.expiresAt) {
      db.deletePendingOtp('registration', cleanEmail);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new verification code.' });
    }

    if (pending.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email and try again.' });
    }

    // OTP Valid! Create user in database
    db.deletePendingOtp('registration', cleanEmail);
    const { skills, ...userCore } = pending.userData;
    const user = db.createUser(userCore);

    if (skills && Array.isArray(skills) && skills.length > 0) {
      db.setUserSkills(user.id, skills);
    }

    const token = generateToken(user);
    const userSkills = db.getUserSkills(user.id);
    const wallet = db.getWallet(user.id);
    const profile_completed = db.isStudentProfileCompleted(user) ? 1 : 0;

    if (req.io) {
      req.io.emit('platform_stats_updated');
    }

    return res.status(201).json({
      success: true,
      message: 'Email verified and account activated successfully! Welcome to CampusGig 🎉',
      token,
      user: { ...user, profile_completed, skills: userSkills, wallet }
    });
  } catch (err) {
    console.error('Register verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'Registration OTP verification failed.' });
  }
});

// ─── Direct Login (Fallback & Admin Instant Access) ──────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const skills = db.getUserSkills(user.id);
    const wallet = db.getWallet(user.id);
    const { password_hash, two_factor_secret, ...safeUser } = user;
    const profile_completed = db.isStudentProfileCompleted(user) ? 1 : 0;

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: { ...safeUser, profile_completed, skills, wallet }
    });
  } catch (err) {
    console.error('Direct login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed due to server error.' });
  }
});

// ─── 2. Login: Step 1 - Check Password & Send Login OTP ─────────────────────
router.post('/login-send-otp', otpLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate 6-digit login verification OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    db.savePendingOtp('login', cleanEmail, {
      userId: user.id,
      otp: otpCode,
      expiresAt
    });

    const mailResult = await sendVerificationOtpEmail(cleanEmail, user.name, otpCode);

    return res.json({
      success: true,
      requiresOtp: true,
      email: cleanEmail,
      two_factor_enabled: user.two_factor_enabled === 1,
      message: `Credentials verified. A 6-digit login OTP has been sent via SMTP to ${cleanEmail}`,
      mode: mailResult.mode
    });
  } catch (err) {
    console.error('Login send OTP error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login authentication.' });
  }
});

// ─── 2. Login: Step 2 - Verify Login OTP & Issue Token ──────────────────────
router.post('/login-verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const cached = db.getPendingOtp('login', cleanEmail);
    if (!cached) {
      return res.status(400).json({ success: false, message: 'No active login session found. Please enter your password again.' });
    }

    if (Date.now() > cached.expiresAt) {
      db.deletePendingOtp('login', cleanEmail);
      return res.status(400).json({ success: false, message: 'Login OTP has expired. Please sign in again.' });
    }

    if (cached.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code. Please check and try again.' });
    }

    // Valid OTP! Issue token
    db.deletePendingOtp('login', cleanEmail);
    const user = db.findUserById(cached.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const token = generateToken(user);
    const userSkills = db.getUserSkills(user.id);
    const wallet = db.getWallet(user.id);
    const { password_hash, two_factor_secret, ...safeUser } = user;
    const profile_completed = db.isStudentProfileCompleted(user) ? 1 : 0;

    return res.json({
      success: true,
      message: 'Email OTP verified! Logged in successfully.',
      token,
      user: { ...safeUser, profile_completed, skills: userSkills, wallet }
    });
  } catch (err) {
    console.error('Login verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'Login OTP verification failed.' });
  }
});

// ─── Forgot Password: Step 1 - Send Password Reset OTP ─────────────────────
router.post('/forgot-password', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
    }

    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    db.savePendingOtp('password_reset', cleanEmail, {
      userId: user.id,
      email: cleanEmail,
      otp: otpCode,
      expiresAt
    });

    const mailResult = await sendPasswordResetOtpEmail(cleanEmail, user.name, otpCode);
    const isProd = process.env.NODE_ENV === 'production';

    return res.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}. Please check your inbox.`,
      email: cleanEmail,
      previewOtp: !isProd ? (mailResult.otp || otpCode) : undefined,
      preview_otp: !isProd ? (mailResult.otp || otpCode) : undefined
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
});

// ─── Forgot Password: Step 2 - Verify OTP & Set New Password ────────────────
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const newPassword = req.body.newPassword || req.body.new_password;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, 6-digit OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const pending = db.getPendingOtp('password_reset', cleanEmail);
    if (!pending) {
      return res.status(400).json({ success: false, message: 'No active password reset request found or session expired. Please request a new code.' });
    }

    if (Date.now() > pending.expiresAt) {
      db.deletePendingOtp('password_reset', cleanEmail);
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new code.' });
    }

    if (pending.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email and try again.' });
    }

    // Hash new password and update user
    const password_hash = await bcrypt.hash(newPassword, 10);
    db.updateUser(pending.userId, { password_hash });
    db.deletePendingOtp('password_reset', cleanEmail);

    return res.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// ─── Direct Fallback Login (with rate limiting) ─────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Account is suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const userSkills = db.getUserSkills(user.id);
    const wallet = db.getWallet(user.id);
    const { password_hash, two_factor_secret, ...safeUser } = user;
    const profile_completed = db.isStudentProfileCompleted(user) ? 1 : 0;

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: { ...safeUser, profile_completed, skills: userSkills, wallet }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// ─── 2FA (Two-Factor Authentication) Management ──────────────────────────────
router.get('/2fa/status', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user.id);
  return res.json({
    success: true,
    two_factor_enabled: user?.two_factor_enabled === 1
  });
});

router.post('/2fa/toggle', authenticateToken, async (req, res) => {
  try {
    const { enabled } = req.body;
    const newStatus = enabled ? 1 : 0;
    
    const user = db.updateUser(req.user.id, {
      two_factor_enabled: newStatus
    });

    db.createNotification({
      user_id: user.id,
      type: 'SECURITY_ALERT',
      title: newStatus ? '2FA Enabled 🔒' : '2FA Disabled ⚠️',
      message: newStatus 
        ? 'Two-Factor Authentication is now active on your account.'
        : 'Two-Factor Authentication has been disabled for your account.',
      link_url: '/settings'
    });

    return res.json({
      success: true,
      message: `Two-Factor Authentication has been ${newStatus ? 'enabled' : 'disabled'}.`,
      two_factor_enabled: newStatus === 1
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update 2FA status.' });
  }
});

// ─── Google OAuth Sign-In (Google Cloud Console OAuth 2.0) ───────────────────
router.post('/google', async (req, res) => {
  try {
    let { credential, email, name, avatar_url, role } = req.body;

    if (credential) {
      try {
        const payloadBase64 = credential.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        email = decoded.email || email;
        name = decoded.name || name;
        avatar_url = decoded.picture || avatar_url;
      } catch (err) {
        console.warn('Could not decode Google token payload, using body fields');
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isDesignatedAdmin = cleanEmail === 'srikanthstephen2007@gmail.com';

    let user = db.findUserByEmail(cleanEmail);

    if (!user) {
      const isEduEmail = /@(.*\.)?(edu|ac\.in|edu\.in)$/i.test(cleanEmail) || cleanEmail.includes('college');
      const randomPass = Math.random().toString(36).slice(-10);
      const password_hash = await bcrypt.hash(randomPass, 10);
      const userRole = isDesignatedAdmin ? 'admin' : (role === 'client' ? 'client' : 'student');

      user = db.createUser({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password_hash,
        role: userRole,
        college: 'Campus / College',
        department: isDesignatedAdmin ? 'Head Administration & Governance' : (userRole === 'client' ? 'Client Organization' : 'Computer Science'),
        year_of_study: isDesignatedAdmin ? 'Faculty / Admin' : '3rd Year',
        avatar_url: avatar_url || undefined,
        bio: isDesignatedAdmin ? 'Lead platform administrator' : 'Verified user via Google Sign-In',
        is_verified_student: 1,
        two_factor_enabled: 0
      });
    } else if (isDesignatedAdmin && user.role !== 'admin') {
      user = db.updateUser(user.id, { role: 'admin' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact administration.' });
    }

    const token = generateToken(user);
    const userSkills = db.getUserSkills(user.id);
    const wallet = db.getWallet(user.id);
    const { password_hash, two_factor_secret, ...safeUser } = user;
    const profile_completed = db.isStudentProfileCompleted(user) ? 1 : 0;

    return res.json({
      success: true,
      message: 'Logged in with Google successfully.',
      token,
      user: { ...safeUser, profile_completed, skills: userSkills, wallet }
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ success: false, message: 'Google authentication failed.' });
  }
});

// ─── In-App Profile SMTP Verification OTP ───────────────────────────────────
router.post('/send-verification-otp', authenticateToken, otpLimiter, async (req, res) => {
  try {
    const targetEmail = (req.body.email || req.user.email).toLowerCase().trim();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    db.savePendingOtp('verification', targetEmail, {
      userId: req.user.id,
      otp: otpCode,
      expiresAt
    });

    const result = await sendVerificationOtpEmail(targetEmail, req.user.name, otpCode);

    return res.json({
      success: true,
      message: `Verification code sent via SMTP to ${targetEmail}`,
      email: targetEmail,
      mode: result.mode
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send verification email' });
  }
});

router.post('/verify-otp', authenticateToken, authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const targetEmail = (email || req.user.email).toLowerCase().trim();

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit OTP code' });
    }

    const cached = db.getPendingOtp('verification', targetEmail);
    if (!cached) {
      return res.status(400).json({ success: false, message: 'No active OTP found. Please request a new code.' });
    }

    if (Date.now() > cached.expiresAt) {
      db.deletePendingOtp('verification', targetEmail);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
    }

    if (cached.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    db.deletePendingOtp('verification', targetEmail);
    const updated = db.updateUser(req.user.id, {
      is_verified_student: 1,
      college_email: targetEmail
    });

    const userSkills = db.getUserSkills(req.user.id);
    const wallet = db.getWallet(req.user.id);

    return res.json({
      success: true,
      message: 'Email verified successfully! You have unlocked the Verified Student Badge 🎉',
      user: {
        ...updated,
        skills: userSkills,
        wallet
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});

// ─── Get current logged-in user ─────────────────────────────────────────────
router.get('/me', authenticateToken, (req, res) => {
  const userSkills = db.getUserSkills(req.user.id);
  const wallet = db.getWallet(req.user.id);
  const notifications = db.getUserNotifications(req.user.id);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const isDesignatedAdmin = req.user.email === 'srikanthstephen2007@gmail.com';
  const role = isDesignatedAdmin ? 'admin' : req.user.role;
  const profile_completed = db.isStudentProfileCompleted(req.user) ? 1 : 0;

  return res.json({
    success: true,
    user: {
      ...req.user,
      role,
      profile_completed,
      skills: userSkills,
      wallet,
      unreadNotificationsCount: unreadCount
    }
  });
});

export default router;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import {
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  Loader2,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Camera,
  Phone,
  GitBranch,
  Link2,
  FileText,
  User,
  CheckCircle2,
  Sparkles,
  School,
  BookOpen,
  Check,
  Globe,
  AlignLeft,
  Building2,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PROFESSIONAL_AVATARS } from '../utils/defaultAvatars';
import ChooseProfilePhotoModal from '../components/ChooseProfilePhotoModal';
import { POPULAR_COLLEGES, POPULAR_DEGREE_PROGRAMS } from './StudentProfileSetup';

const STEPS = [
  { label: 'Account', icon: Mail, desc: 'Credentials' },
  { label: 'Profile', icon: User, desc: 'Campus info' },
  { label: 'Verify', icon: KeyRound, desc: 'Email OTP' }
];

export default function Register({ onNavigate }) {
  const { user, requestRegisterOtp, verifyRegisterOtp, loginWithGoogle } = useAuth();

  // Instant redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') onNavigate('admin');
      else if (user.role === 'client') onNavigate('dashboard-client');
      else if (!user.profile_completed || user.profile_completed === 0) onNavigate('complete-profile');
      else onNavigate('home');
    }
  }, [user]);

  // Step 1 — credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 — profile details
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [skills, setSkills] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PROFESSIONAL_AVATARS[0].url);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Client-specific Step 2 fields
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyType, setCompanyType] = useState('Startup');

  // Step 3 — OTP verify
  const [otp, setOtp] = useState('');
  const [previewOtp, setPreviewOtp] = useState('');

  // Flow state
  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isEdu = email.includes('.edu') || email.includes('.ac.in') || email.includes('college');

  // Initialize Google button (Step 1 only)
  useEffect(() => {
    if (!clientId || clientId.includes('your-google-client-id') || step !== 1) return;
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response.credential) {
                setGoogleLoading(true);
                setError('');
                try {
                  const data = await loginWithGoogle({
                    credential: response.credential,
                    role: role === 'client' ? 'client' : 'student'
                  });
                  if (data.user.role === 'client') onNavigate('dashboard-client');
                  else if (!data.user.profile_completed || data.user.profile_completed === 0) onNavigate('complete-profile');
                  else onNavigate('home');
                } catch (err) {
                  setError(err.message || 'Google registration failed');
                } finally {
                  setGoogleLoading(false);
                }
              }
            }
          });
          const btnDiv = document.getElementById('google-signup-btn-container');
          if (btnDiv) {
            btnDiv.innerHTML = '';
            window.google.accounts.id.renderButton(btnDiv, {
              theme: 'outline', size: 'large', width: 380,
              text: 'signup_with', shape: 'rectangular', logo_alignment: 'left'
            });
          }
        } catch (e) { console.warn('Google GSI register init warning:', e); }
      }
    };
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(timer); initGoogle(); }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [role, clientId, step]);

  // Step 1: Validate credentials → go to Step 2
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setStep(2);
    window.scrollTo(0, 0);
  };

  // Step 2: Send OTP → go to Step 3
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    setLoading(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await requestRegisterOtp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        college: role === 'student' ? college : (college || 'Client Organization'),
        department: role === 'student' ? department : companyType,
        year_of_study: role === 'student' ? yearOfStudy : 'Client / Employer',
        avatar_url: selectedAvatar,
        skills: skillsArray,
        phone: phone.trim(),
        github_url: role === 'student' ? githubUrl.trim() : companyWebsite.trim(),
        linkedin_url: role === 'student' ? linkedinUrl.trim() : portfolioUrl.trim(),
        resume_url: role === 'student' ? resumeUrl.trim() : companyDescription.trim()
      });
      if (res.previewOtp) setPreviewOtp(res.previewOtp);
      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Registration request failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyRegisterOtp(email.trim(), otp.trim());
      try { confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
      if (data.user.role === 'client') onNavigate('dashboard-client');
      else if (!data.user.profile_completed || data.user.profile_completed === 0) onNavigate('complete-profile');
      else onNavigate('home');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper with proper aligned icon
  const iconInput = (icon, inputElement) => (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        {icon}
      </div>
      {React.cloneElement(inputElement, {
        style: {
          ...(inputElement.props.style || {}),
          paddingLeft: '2.6rem',
          height: 44,
          borderRadius: 'var(--radius-md)'
        }
      })}
    </div>
  );

  return (
    <div className="page-content" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '2.5rem 1rem 4rem',
      background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, var(--bg-main) 70%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: step === 2 ? 680 : 500,
        transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <BrandLogo size={52} subtitle="MCC - MRF INNOVATION PARK" />
          </div>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-main)'
          }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Join CampusGig — India's verified student freelance marketplace
          </p>
        </div>

        {/* Perfectly Aligned Modern Step Indicator */}
        <div style={{
          position: 'relative',
          maxWidth: 420,
          margin: '0 auto 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Continuous Connecting Line passing through center of circles */}
          <div style={{
            position: 'absolute',
            top: 19,
            left: 28,
            right: 28,
            height: 3,
            background: 'var(--border-color)',
            zIndex: 1
          }}>
            <div style={{
              height: '100%',
              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
              transition: 'width 0.35s ease'
            }} />
          </div>

          {STEPS.map((s, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;

            return (
              <div
                key={s.label}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  minWidth: 70
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: isDone 
                    ? 'var(--accent-emerald)' 
                    : isActive 
                      ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' 
                      : 'var(--bg-surface)',
                  border: `2px solid ${isDone ? 'var(--accent-emerald)' : isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'var(--shadow-xs)',
                  transition: 'all 0.25s ease',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {isDone ? <Check size={18} strokeWidth={3} /> : <s.icon size={16} />}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'block',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: isActive ? 'var(--primary)' : isDone ? 'var(--accent-emerald)' : 'var(--text-muted)'
                  }}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Box Card */}
        <div className="card" style={{
          padding: '2rem 2.25rem',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-color)',
          background: 'var(--bg-surface)',
          boxShadow: '0 16px 40px rgba(15, 41, 30, 0.08), 0 2px 6px rgba(0,0,0,0.03)'
        }}>

          {/* Error Banner */}
          {error && (
            <div style={{
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1.5px solid #ef4444',
              color: '#dc2626',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{error}</span>
            </div>
          )}

          {/* ══════════════════ STEP 1 — Email & Password ══════════════════ */}
          {step === 1 && (
            <>
              {/* Role Selection Box Cards */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Choose Your Account Type
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}>
                  {/* Student Card */}
                  <div
                    onClick={() => setRole('student')}
                    style={{
                      border: role === 'student' ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                      background: role === 'student' ? 'rgba(5, 150, 105, 0.06)' : 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        width: 34, height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background: role === 'student' ? 'var(--primary)' : 'var(--bg-surface)',
                        color: role === 'student' ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <GraduationCap size={18} />
                      </div>
                      {role === 'student' && (
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'var(--primary)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', marginTop: 4 }}>
                      Student Freelancer
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Offer campus gigs, get hired & earn
                    </span>
                  </div>

                  {/* Client Card */}
                  <div
                    onClick={() => setRole('client')}
                    style={{
                      border: role === 'client' ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                      background: role === 'client' ? 'rgba(5, 150, 105, 0.06)' : 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        width: 34, height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background: role === 'client' ? 'var(--primary)' : 'var(--bg-surface)',
                        color: role === 'client' ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Briefcase size={18} />
                      </div>
                      {role === 'client' && (
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'var(--primary)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', marginTop: 4 }}>
                      Client / Recruiter
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Hire verified college talent safely
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Sign-up Button */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div id="google-signup-btn-container" style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
                {googleLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.6rem', color: 'var(--primary)', fontSize: '0.85rem' }}>
                    <Loader2 size={16} className="spin" />
                    <span>Connecting with Google…</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  OR CONTINUE WITH EMAIL
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Email Address
                    {isEdu && email && (
                      <span className="badge badge-verified" style={{ fontSize: '0.63rem', marginLeft: '0.5rem' }}>✓ Campus Edu</span>
                    )}
                  </label>
                  {iconInput(
                    <Mail size={16} />,
                    <input
                      type="email"
                      required
                      placeholder="student@college.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input"
                    />
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label">
                    Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(minimum 6 characters)</span>
                  </label>
                  {iconInput(
                    <Lock size={16} />,
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: 46,
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-md)',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <span>Continue to Profile Setup</span>
                  <ArrowRight size={17} />
                </button>
              </form>
            </>
          )}

          {/* ══════════════════ STEP 2 — Profile Details ══════════════════ */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>
                  {role === 'student' ? 'Student Freelancer Details' : '🏢 Client & Company Profile'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {role === 'student'
                    ? 'Provide your basic campus information to configure your profile'
                    : "Tell us about your company or organization — this helps students understand who they're working with"}
                </p>
              </div>

              {/* Profile Photo Selector Strip */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <img
                  src={selectedAvatar}
                  alt="Selected Avatar"
                  style={{
                    width: 54, height: 54,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2.5px solid var(--primary)',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-xs)'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Select 3D Bitmoji Avatar
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Camera size={13} /> <span>Custom Upload</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: 2 }}>
                    {PROFESSIONAL_AVATARS.slice(0, 8).map(av => (
                      <img
                        key={av.id}
                        src={av.url}
                        alt={av.name}
                        onClick={() => setSelectedAvatar(av.url)}
                        style={{
                          width: 36, height: 36,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          flexShrink: 0,
                          border: selectedAvatar === av.url ? '2.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                          opacity: selectedAvatar === av.url ? 1 : 0.6,
                          transform: selectedAvatar === av.url ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                        title={av.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & Phone in Responsive Grid */}
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{role === 'client' ? 'Client / Club Name' : 'Full Name'} *</label>
                  {iconInput(
                    <User size={16} />,
                    <input
                      type="text"
                      required
                      placeholder={role === 'client' ? 'e.g. Campus Tech Club' : 'e.g. Rahul Kumar'}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input"
                    />
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number *</label>
                  {iconInput(
                    <Phone size={16} />,
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="input"
                    />
                  )}
                </div>
              </div>

              {/* Student Academic Fields */}
              {role === 'student' && (
                <>
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">College / University *</label>
                      {iconInput(
                        <School size={16} />,
                        <input
                          type="text"
                          required
                          list="register-college-list"
                          placeholder="e.g. Madras Christian College, Loyola, IIT…"
                          value={college}
                          onChange={e => setCollege(e.target.value)}
                          className="input"
                        />
                      )}
                      <datalist id="register-college-list">
                        {POPULAR_COLLEGES.map(c => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Department / Major *</label>
                      {iconInput(
                        <BookOpen size={16} />,
                        <input
                          type="text"
                          required
                          list="register-degree-list"
                          placeholder="e.g. B.Sc Computer Science, B.Tech…"
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          className="input"
                        />
                      )}
                      <datalist id="register-degree-list">
                        {POPULAR_DEGREE_PROGRAMS.map(d => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Year of Study</label>
                      <select
                        value={yearOfStudy}
                        onChange={e => setYearOfStudy(e.target.value)}
                        className="select"
                        style={{ height: 44, borderRadius: 'var(--radius-md)' }}
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Postgraduate / Masters</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Freelance Skills (comma-separated)</label>
                      {iconInput(
                        <Sparkles size={16} />,
                        <input
                          type="text"
                          placeholder="React, Python, UI/UX, Video Editing"
                          value={skills}
                          onChange={e => setSkills(e.target.value)}
                          className="input"
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Client Organization Field */}
              {role === 'client' && (
                <>
                  {/* Client Info Note */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    background: 'rgba(5, 150, 105, 0.07)',
                    border: '1.5px solid rgba(5, 150, 105, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem'
                  }}>
                    <ShoppingBag size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: '0.79rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      As a <strong style={{ color: 'var(--text-main)' }}>Client</strong>, please share your <strong style={{ color: 'var(--text-main)' }}>company / organization details</strong> and a <strong style={{ color: 'var(--text-main)' }}>portfolio or website</strong> that showcases your work — this builds trust with student freelancers reviewing your project posts.
                    </p>
                  </div>

                  {/* Company Name & Type */}
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company / Organization Name *</label>
                      {iconInput(
                        <Building2 size={16} />,
                        <input
                          type="text"
                          required
                          placeholder="e.g. TechCorp Pvt. Ltd., IIT Student Club"
                          value={college}
                          onChange={e => setCollege(e.target.value)}
                          className="input"
                        />
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company Type</label>
                      <select
                        value={companyType}
                        onChange={e => setCompanyType(e.target.value)}
                        className="select"
                        style={{ height: 44, borderRadius: 'var(--radius-md)' }}
                      >
                        <option>Startup</option>
                        <option>SME / Small Business</option>
                        <option>Agency</option>
                        <option>College Club / Society</option>
                        <option>NGO / Non-Profit</option>
                        <option>Freelancer / Individual</option>
                        <option>Enterprise</option>
                      </select>
                    </div>
                  </div>

                  {/* Website & Portfolio */}
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company Website</label>
                      {iconInput(
                        <Globe size={16} />,
                        <input
                          type="url"
                          placeholder="https://yourcompany.com"
                          value={companyWebsite}
                          onChange={e => setCompanyWebsite(e.target.value)}
                          className="input"
                        />
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Portfolio / Work Showcase URL *</label>
                      {iconInput(
                        <Link2 size={16} />,
                        <input
                          type="url"
                          required
                          placeholder="https://portfolio.com or linkedin.com/company"
                          value={portfolioUrl}
                          onChange={e => setPortfolioUrl(e.target.value)}
                          className="input"
                        />
                      )}
                    </div>
                  </div>

                  {/* Company Description */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      About Your Company &amp; Work <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(What does your company do?)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <AlignLeft size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <textarea
                        rows={4}
                        required
                        placeholder="Briefly describe your company, the type of projects you post, and what kind of student talent you typically hire (e.g. 'We are a digital marketing startup that hires students for content creation, UI design, and social media campaigns.')."
                        value={companyDescription}
                        onChange={e => setCompanyDescription(e.target.value)}
                        className="input"
                        style={{
                          paddingLeft: '2.4rem',
                          paddingTop: '0.65rem',
                          resize: 'vertical',
                          minHeight: 100,
                          height: 'auto',
                          borderRadius: 'var(--radius-md)',
                          lineHeight: 1.55,
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* GitHub & LinkedIn Links - Student Only */}
              {role === 'student' && (
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">GitHub Profile URL</label>
                    {iconInput(
                      <GitBranch size={16} />,
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={githubUrl}
                        onChange={e => setGithubUrl(e.target.value)}
                        className="input"
                      />
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">LinkedIn Profile URL</label>
                    {iconInput(
                      <Link2 size={16} />,
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={e => setLinkedinUrl(e.target.value)}
                        className="input"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Resume / CV URL - Student Only */}
              {role === 'student' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Online Resume / CV Link <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Drive, Notion, or Website)</span>
                  </label>
                  {iconInput(
                    <FileText size={16} />,
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or portfolio site"
                      value={resumeUrl}
                      onChange={e => setResumeUrl(e.target.value)}
                      className="input"
                    />
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 'var(--radius-md)',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ArrowLeft size={16} /> <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    height: 46,
                    fontWeight: 800,
                    borderRadius: 'var(--radius-md)',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Sending OTP…</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════ STEP 3 — OTP Verify ══════════════════ */}
          {step === 3 && (
            <form onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 58, height: 58,
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
                }}>
                  <KeyRound size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  Verify Your Email Address
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  We've sent a 6-digit confirmation code via SMTP to:
                </p>
                <div style={{
                  display: 'inline-block',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--primary)'
                }}>
                  {email}
                </div>

                {previewOtp && (
                  <div style={{
                    marginTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <button
                      type="button"
                      onClick={() => setOtp(previewOtp)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        background: 'rgba(16,185,129,0.1)',
                        borderRadius: 'var(--radius-full)',
                        border: '1.5px solid rgba(16,185,129,0.3)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--accent-emerald)',
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Dev Preview Code: <strong>{previewOtp}</strong> (Click to autofill)
                    </button>
                  </div>
                )}
              </div>

              {/* 6-Digit OTP Input Box */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.85rem' }}>
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.75rem',
                    letterSpacing: '0.65rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    height: 54,
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--primary)'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => { setStep(2); setOtp(''); setError(''); }}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 'var(--radius-md)',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ArrowLeft size={16} /> <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    height: 46,
                    fontWeight: 800,
                    borderRadius: 'var(--radius-md)',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Activating…</span>
                    </>
                  ) : (
                    <>
                      <span>Activate & Enter</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Navigation Link */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.88rem',
          color: 'var(--text-muted)'
        }}>
          Already have an account?{' '}
          <a
            href="#"
            onClick={e => { e.preventDefault(); onNavigate('login'); }}
            style={{ color: 'var(--primary)', fontWeight: 700 }}
          >
            Sign In
          </a>
        </p>

        {/* Choose Profile Photo Modal */}
        <ChooseProfilePhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          currentAvatar={selectedAvatar}
          userName={name || 'New Member'}
          onSuccess={newUrl => setSelectedAvatar(newUrl)}
        />
      </div>
    </div>
  );
}

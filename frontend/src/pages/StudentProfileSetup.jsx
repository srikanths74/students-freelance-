import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Plus,
  X,
  Loader2,
  Briefcase,
  Layers,
  Globe,
  Camera,
  LogOut,
  ShieldCheck,
  Zap,
  Info,
  School,
  BookOpen,
  Calendar,
  GitBranch,
  Link2,
  Check,
  Award,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SNAPCHAT_BITMOJI_AVATARS } from '../utils/defaultAvatars';

export const POPULAR_COLLEGES = [
  'Madras Christian College (MCC), Chennai',
  'Loyola College, Chennai',
  'Anna University, Chennai',
  'IIT Madras (Indian Institute of Technology Madras)',
  'Presidency College, Chennai',
  'Stella Maris College, Chennai',
  'SRM Institute of Science and Technology, Chennai',
  'VIT (Vellore Institute of Technology), Vellore',
  'PSG College of Technology, Coimbatore',
  'SSN College of Engineering, Chennai',
  'Sathyabama Institute of Science and Technology, Chennai',
  'St. Joseph\'s College of Engineering, Chennai',
  'Hindustan Institute of Technology and Science (HITS)',
  'Ethiraj College for Women, Chennai',
  'Women\'s Christian College (WCC), Chennai',
  'Coimbatore Institute of Technology (CIT)',
  'National Institute of Technology (NIT Trichy)',
  'Delhi University (DU), New Delhi',
  'IIT Delhi (Indian Institute of Technology Delhi)',
  'IIT Bombay (Indian Institute of Technology Bombay)',
  'BITS Pilani (Birla Institute of Technology and Science)',
  'Christ University, Bangalore',
  'St. Xavier\'s College, Mumbai / Kolkata',
  'IIIT Hyderabad (International Institute of Information Technology)',
  'Manipal Academy of Higher Education (MAHE)',
  'Amity University',
  'Mumbai University',
  'Bangalore University'
];

export const POPULAR_DEGREE_PROGRAMS = [
  'B.Sc Computer Science',
  'B.Sc Information Technology (IT)',
  'BCA (Bachelor of Computer Applications)',
  'B.Tech Computer Science & Engineering (CSE)',
  'B.Tech Artificial Intelligence & Data Science (AI & DS)',
  'B.Tech Information Technology (IT)',
  'B.Tech Electronics & Communication Engineering (ECE)',
  'B.Tech Mechanical Engineering',
  'B.Tech Electrical & Electronics Engineering (EEE)',
  'B.Sc Data Science & Analytics',
  'B.Sc Visual Communication (VisCom)',
  'B.Sc Cyber Security',
  'B.Sc Mathematics',
  'B.Sc Physics',
  'B.Com (General)',
  'B.Com (Corporate Secretaryship)',
  'B.Com (Accounting & Finance)',
  'B.Com (Computer Applications)',
  'BBA (Bachelor of Business Administration)',
  'B.Des (Design / UI/UX & Graphics)',
  'BA English Literature & Journalism',
  'M.Sc Computer Science',
  'M.Sc Data Science',
  'MCA (Master of Computer Applications)',
  'M.Tech Computer Science & Engineering',
  'MBA (Master of Business Administration)'
];

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'UI/UX Design', 'Figma',
  'Graphic Design', 'Video Editing', 'Content Writing', 'Flutter',
  'Data Science', 'Machine Learning', 'Poster Design', 'SQL',
  'Next.js', 'Tailwind CSS', 'Canva', 'Copywriting', 'SEO'
];

const BIO_TEMPLATES = [
  {
    label: '💻 Full-Stack Dev',
    text: 'Fullstack student developer passionate about building fast React web apps and Python APIs. Winner of campus hackathons with quick turnaround times.'
  },
  {
    label: '🎨 UI/UX & Graphic',
    text: 'Creative visual designer crafting college fest posters, brand kits, and Figma UI/UX wireframes. High attention to aesthetic details and client deadlines.'
  },
  {
    label: '🎬 Video & Reels',
    text: 'Student motion designer and short-form video editor specializing in YouTube shorts, reels, and college fest aftermovies with 500k+ total views.'
  }
];

const ONBOARDING_STEPS = [
  { id: 1, label: 'Identity & Phone', icon: User, desc: 'Name, Phone & 3D Avatar' },
  { id: 2, label: 'Campus & Degree', icon: GraduationCap, desc: 'College, Dept & Year' },
  { id: 3, label: 'Resume & Links', icon: FileText, desc: 'CV, GitHub & Portfolio' },
  { id: 4, label: 'Skills & Bio', icon: Sparkles, desc: 'Tags & Introduction' }
];

export default function StudentProfileSetup({ onComplete }) {
  const { user, completeStudentProfile, sendPhoneOtp, verifyPhoneOtp, logout } = useAuth();

  // View Mode: 'wizard' (4-step interactive flow) or 'unified' (single continuous master card)
  const [viewMode, setViewMode] = useState('wizard');
  const [activeStep, setActiveStep] = useState(1);

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(user?.is_phone_verified === 1));
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState('');
  const [phoneOtpCountdown, setPhoneOtpCountdown] = useState(0);
  const [phoneOtpMode, setPhoneOtpMode] = useState(''); // 'twilio' | 'dev_console' | 'twilio_error'
  const email = user?.email || '';

  // Academic Details
  const [college, setCollege] = useState(user?.college && user.college !== 'Campus / College' ? user.college : '');
  const [department, setDepartment] = useState(user?.department && user.department !== 'Computer Science' && user.department !== 'Student' ? user.department : '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year_of_study || '3rd Year');
  const [collegeFocused, setCollegeFocused] = useState(false);
  const [departmentFocused, setDepartmentFocused] = useState(false);

  // Dynamic filtered suggestions for smart autocomplete
  const collegeSuggestions = college.trim()
    ? POPULAR_COLLEGES.filter(c => c.toLowerCase().includes(college.toLowerCase().trim()))
    : POPULAR_COLLEGES.slice(0, 8);

  const departmentSuggestions = department.trim()
    ? POPULAR_DEGREE_PROGRAMS.filter(d => d.toLowerCase().includes(department.toLowerCase().trim()))
    : POPULAR_DEGREE_PROGRAMS.slice(0, 8);

  // Resume / CV
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(user?.resume_url || '');
  const [resumeFilename, setResumeFilename] = useState(user?.resume_filename || '');
  const fileInputRef = useRef(null);

  // Social & Developer Links
  const [githubUrl, setGithubUrl] = useState(user?.github_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');

  // Skills
  const initialSkills = Array.isArray(user?.skills) 
    ? user.skills.map(s => typeof s === 'string' ? s : s.skill_name).filter(Boolean)
    : [];
  const [skills, setSkills] = useState(initialSkills.length > 0 ? initialSkills : ['React', 'Python', 'UI/UX Design']);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Bio & Avatar
  const [bio, setBio] = useState(user?.bio && !user.bio.includes('Verified user via') ? user.bio : '');
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (user?.avatar_url && !user.avatar_url.includes('googleusercontent.com')) return user.avatar_url;
    return SNAPCHAT_BITMOJI_AVATARS[0].url;
  });

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (phoneOtpCountdown > 0) {
      timer = setTimeout(() => setPhoneOtpCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [phoneOtpCountdown]);

  // Live Score Calculator
  const calculateProgress = () => {
    let score = 0;
    const total = 7;
    if (name.trim()) score++;
    if (phone.trim() && isPhoneVerified) score++;
    if (college.trim() && department.trim() && yearOfStudy.trim()) score++;
    if (resumeFile || resumeUrl.trim()) score++;
    if (githubUrl.trim()) score++;
    if (portfolioUrl.trim()) score++;
    if (skills.length > 0 && bio.trim().length >= 10) score++;
    return Math.round((score / total) * 100);
  };

  const progressPercent = calculateProgress();

  // Step Status Helpers
  const isStep1Done = Boolean(name.trim() && phone.trim() && isPhoneVerified);
  const isStep2Done = Boolean(college.trim() && department.trim() && yearOfStudy.trim());
  const isStep3Done = Boolean((resumeFile || resumeUrl.trim()) && githubUrl.trim() && portfolioUrl.trim());
  const isStep4Done = Boolean(skills.length > 0 && bio.trim().length >= 10);

  // Handle Resume File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError('Resume file exceeds 25MB limit. Please upload a smaller PDF or DOCX file.');
        return;
      }
      setResumeFile(file);
      setResumeFilename(file.name);
      setError('');
    }
  };

  // Add / Remove Skill
  const handleAddSkill = (skillName) => {
    const clean = skillName.trim();
    if (!clean) return;
    if (skills.some(s => s.toLowerCase() === clean.toLowerCase())) return;
    setSkills(prev => [...prev, clean]);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  // Send Mobile Phone OTP via Twilio SMS
  const handleSendPhoneOtp = async () => {
    setPhoneOtpError('');
    const cleanPhone = phone.trim().replace(/[\s\-().]/g, '');
    if (!cleanPhone || cleanPhone.replace(/^\+\d{1,3}/, '').length < 10) {
      setPhoneOtpError('Please enter a valid 10-digit mobile number before requesting OTP.');
      return;
    }
    setPhoneOtpLoading(true);
    try {
      const result = await sendPhoneOtp(cleanPhone);
      setPhoneOtpSent(true);
      setPhoneOtpCountdown(60);
      // Track delivery mode for UI messaging
      setPhoneOtpMode(result?.mode || 'twilio');
    } catch (err) {
      setPhoneOtpError(err.message || 'Failed to send verification code.');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  // Verify Mobile Phone OTP
  const handleVerifyPhoneOtp = async () => {
    setPhoneOtpError('');
    if (!phoneOtp.trim() || phoneOtp.trim().length !== 6) {
      setPhoneOtpError('Please enter the full 6-digit OTP code.');
      return;
    }
    setPhoneOtpLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/[\s-]/g, '');
      await verifyPhoneOtp(cleanPhone, phoneOtp.trim());
      setIsPhoneVerified(true);
      setPhoneOtpSent(false);
      setPhoneOtp('');
    } catch (err) {
      setPhoneOtpError(err.message || 'Invalid OTP code. Please check and try again.');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  // Quick Demo Auto-Fill helper
  const handleAutoFillDemo = () => {
    setName(user?.name || 'Rahul Kumar');
    setPhone('+91 98765 43210');
    setIsPhoneVerified(true);
    setPhoneOtpSent(false);
    setPhoneOtpError('');
    setCollege('Indian Institute of Information Technology');
    setDepartment('Computer Science & Engineering');
    setYearOfStudy('3rd Year');
    setGithubUrl('https://github.com/rahulkumar-dev');
    setPortfolioUrl('https://rahulkumar-portfolio.vercel.app');
    setLinkedinUrl('https://linkedin.com/in/rahulkumar');
    setResumeUrl('https://drive.google.com/file/d/sample-student-resume/view');
    setResumeFilename('Rahul_Kumar_Resume_2026.pdf');
    setSkills(['React', 'Node.js', 'Python', 'UI/UX Design', 'Tailwind CSS', 'Figma']);
    setBio('Passionate college developer and designer with experience building modern web applications, fast APIs, and responsive interfaces. Always excited to deliver high quality campus projects on time!');
    setError('');
  };

  // Validate Step Before Moving
  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (!name.trim()) return 'Please enter your full name.';
      if (!phone.trim()) return 'Please enter your active mobile phone number.';
      if (!isPhoneVerified) return 'Please verify your mobile number with the SMS code.';
    }
    if (stepNumber === 2) {
      if (!college.trim()) return 'Please enter your college or university name.';
      if (!department.trim()) return 'Please enter your department or degree program.';
    }
    if (stepNumber === 3) {
      if (!resumeFile && !resumeUrl.trim()) return 'Please upload your CV/Resume or provide a link.';
      if (!githubUrl.trim()) return 'Please provide your GitHub profile link.';
      if (!portfolioUrl.trim()) return 'Please provide your portfolio or live work link.';
    }
    return null;
  };

  const handleNextStep = (currentStep) => {
    const stepErr = validateStep(currentStep);
    if (stepErr) {
      setError(stepErr);
      return;
    }
    setError('');
    setActiveStep(currentStep + 1);
  };

  // Submit Profile Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      if (viewMode === 'wizard') setActiveStep(1);
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      if (viewMode === 'wizard') setActiveStep(1);
      setError('Please enter your active mobile phone number.');
      return;
    }
    if (!isPhoneVerified) {
      if (viewMode === 'wizard') setActiveStep(1);
      setError('Please verify your mobile phone number using the 6-digit OTP code before proceeding.');
      return;
    }
    if (!college.trim()) {
      if (viewMode === 'wizard') setActiveStep(2);
      setError('Please provide your college or university name.');
      return;
    }
    if (!department.trim()) {
      if (viewMode === 'wizard') setActiveStep(2);
      setError('Please specify your department or degree program.');
      return;
    }
    if (!yearOfStudy.trim()) {
      if (viewMode === 'wizard') setActiveStep(2);
      setError('Please select your year of study.');
      return;
    }
    if (!resumeFile && !resumeUrl.trim()) {
      if (viewMode === 'wizard') setActiveStep(3);
      setError('CV or Resume is required! Please upload your resume file (PDF/DOCX) or provide a link.');
      return;
    }
    if (!githubUrl.trim()) {
      if (viewMode === 'wizard') setActiveStep(3);
      setError('Please provide your GitHub profile link.');
      return;
    }
    if (!portfolioUrl.trim()) {
      if (viewMode === 'wizard') setActiveStep(3);
      setError('Please provide your portfolio or project sample link.');
      return;
    }
    if (skills.length === 0) {
      if (viewMode === 'wizard') setActiveStep(4);
      setError('Please select or add at least 1 freelance skill.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 10) {
      if (viewMode === 'wizard') setActiveStep(4);
      setError('Please write a brief bio introducing your skills (minimum 10 characters).');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('is_phone_verified', '1');
      formData.append('college', college.trim());
      formData.append('department', department.trim());
      formData.append('year_of_study', yearOfStudy.trim());
      formData.append('bio', bio.trim());
      formData.append('github_url', githubUrl.trim());
      formData.append('portfolio_url', portfolioUrl.trim());
      if (linkedinUrl.trim()) formData.append('linkedin_url', linkedinUrl.trim());
      formData.append('avatar_url', avatarUrl);
      formData.append('skills', JSON.stringify(skills));

      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else if (resumeUrl.trim()) {
        formData.append('resume_url', resumeUrl.trim());
        formData.append('resume_filename', resumeFilename.trim() || 'Student_Resume.pdf');
      }

      await completeStudentProfile(formData);

      setSuccess(true);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          window.location.href = '/';
        }
      }, 1400);

    } catch (err) {
      console.error('Failed to complete profile:', err);
      setError(err.message || 'Failed to complete profile. Please verify all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '94vh',
      background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(16, 185, 129, 0.12) 0%, var(--bg-main) 70%)',
      padding: '2.5rem 1rem 5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: 860 }}>

        {/* ─── Top Header & Badge ─── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: '0.75rem',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)'
          }}>
            <Sparkles size={14} />
            <span>MANDATORY STUDENT ONBOARDING</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            marginBottom: '0.5rem',
            color: 'var(--text-main)'
          }}>
            Complete Your Student Profile
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.94rem',
            maxWidth: 580,
            margin: '0 auto 1.25rem',
            lineHeight: 1.6
          }}>
            Verify your campus identity, contact number, and showcase your skills to start offering freelance gigs and getting hired by campus clients.
          </p>

          {/* Layout Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.25rem'
          }}>
            <div style={{
              display: 'inline-flex',
              background: 'var(--bg-surface-elevated)',
              padding: 3,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: viewMode === 'wizard' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'wizard' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                🪄 Step Wizard
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: viewMode === 'unified' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'unified' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                📋 All-In-One Form
              </button>
            </div>
          </div>
        </div>

        {/* ─── Live Student Card Preview Strip ─── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.15rem 1.4rem',
          border: '1.5px solid rgba(16, 185, 129, 0.25)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          flexWrap: 'wrap',
          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 260 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={avatarUrl}
                alt="Selected Avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = SNAPCHAT_BITMOJI_AVATARS[0].url;
                }}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid var(--primary)',
                  boxShadow: '0 3px 12px rgba(16, 185, 129, 0.25)'
                }}
              />
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 20, height: 20, borderRadius: '50%',
                background: isPhoneVerified ? 'var(--accent-emerald)' : 'var(--primary)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Check size={12} strokeWidth={3} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {name.trim() || 'Your Name'}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--accent-emerald)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)'
                }}>
                  <ShieldCheck size={12} /> Student Freelancer
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {college.trim() ? `${college} • ${department}` : 'College details pending…'}
              </div>
            </div>
          </div>

          {/* Verification Progress Meter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                Profile Completion
              </span>
              <span style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--primary)'
              }}>
                {progressPercent}% Complete
              </span>
            </div>

            <div style={{
              width: 100,
              height: 10,
              borderRadius: 6,
              background: 'var(--border-color)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: 6,
                background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        {/* ─── Unified Main Card Container ─── */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-color)',
          boxShadow: '0 16px 45px rgba(15, 41, 30, 0.08), 0 2px 8px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>

          {/* Wizard Stepper Bar (Visible in Wizard Mode) */}
          {viewMode === 'wizard' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderBottom: '1.5px solid var(--border-color)',
              background: 'var(--bg-surface-elevated)'
            }}>
              {ONBOARDING_STEPS.map((step) => {
                const isActive = activeStep === step.id;
                const isFinished = 
                  (step.id === 1 && isStep1Done) ||
                  (step.id === 2 && isStep2Done) ||
                  (step.id === 3 && isStep3Done) ||
                  (step.id === 4 && isStep4Done);

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => { setActiveStep(step.id); setError(''); }}
                    style={{
                      padding: '1rem 0.5rem',
                      border: 'none',
                      background: isActive ? 'var(--bg-surface)' : 'transparent',
                      borderBottom: isActive ? '3.5px solid var(--primary)' : '3.5px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: isFinished ? 'var(--accent-emerald)' : isActive ? 'var(--primary)' : 'var(--border-color)',
                        color: isFinished || isActive ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 800
                      }}>
                        {isFinished ? <Check size={13} strokeWidth={3} /> : step.id}
                      </div>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: isActive ? 'var(--primary)' : isFinished ? 'var(--text-main)' : 'var(--text-muted)'
                      }}>
                        {step.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Form Content Area */}
          <form onSubmit={handleSubmit} style={{ padding: '2rem 2.25rem' }}>

            {/* Error Banner */}
            {error && (
              <div style={{
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1.5px solid #ef4444',
                color: '#dc2626',
                fontSize: '0.86rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.5rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div style={{
                padding: '1.1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid var(--accent-emerald)',
                color: 'var(--accent-emerald)',
                fontSize: '0.98rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                marginBottom: '1.5rem'
              }}>
                <CheckCircle2 size={22} />
                <span>Profile Verified & Saved! Entering CampusGig Marketplace…</span>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                SECTION 1: PERSONAL & CONTACT (Step 1 in Wizard, always in Unified)
            ════════════════════════════════════════════════════════════════════ */}
            {(viewMode === 'unified' || activeStep === 1) && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                marginBottom: viewMode === 'unified' ? '2.5rem' : 0,
                paddingBottom: viewMode === 'unified' ? '2.25rem' : 0,
                borderBottom: viewMode === 'unified' ? '1.5px solid var(--border-color)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      1. Personal & Contact Details
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Choose your 3D campus avatar and verify your active mobile phone number
                    </p>
                  </div>
                </div>

                {/* 3D Bitmoji Avatar Carousel Row */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.1rem 1.25rem',
                  border: '1.5px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Choose Your 3D Student Character
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 700 }}>
                      ✨ 12 Campus Characters
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    scrollbarWidth: 'thin'
                  }}>
                    {SNAPCHAT_BITMOJI_AVATARS.map((av) => {
                      const isSelected = avatarUrl === av.url;
                      return (
                        <div
                          key={av.id}
                          onClick={() => setAvatarUrl(av.url)}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '50%',
                            padding: 3,
                            border: isSelected ? '3px solid var(--primary)' : '2px solid transparent',
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                            position: 'relative'
                          }}
                          title={`${av.name} (${av.role})`}
                        >
                          <img
                            src={av.url}
                            alt={av.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = SNAPCHAT_BITMOJI_AVATARS[0].url;
                            }}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          {isSelected && (
                            <div style={{
                              position: 'absolute', bottom: 0, right: 0,
                              width: 16, height: 16, borderRadius: '50%',
                              background: 'var(--primary)', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Phone in Responsive Grid */}
                <div className="grid-2">
                  {/* Full Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)'
                      }} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rahul Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ paddingLeft: '2.5rem', height: 46 }}
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Phone Number */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Mobile Phone Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      {isPhoneVerified && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--accent-emerald)',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Phone size={16} style={{
                          position: 'absolute', left: 14, top: '50%',
                          transform: 'translateY(-50%)',
                          color: isPhoneVerified ? 'var(--accent-emerald)' : 'var(--text-muted)'
                        }} />
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="e.g. +91 98765 43210"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (isPhoneVerified) setIsPhoneVerified(false);
                            setPhoneOtpSent(false);
                            setPhoneOtpMode('');
                          }}
                          disabled={isPhoneVerified}
                          style={{
                            paddingLeft: '2.5rem',
                            height: 46,
                            borderColor: isPhoneVerified ? 'var(--accent-emerald)' : undefined,
                            background: isPhoneVerified ? 'rgba(16, 185, 129, 0.04)' : undefined
                          }}
                          required
                        />
                      </div>

                      {!isPhoneVerified ? (
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={phoneOtpLoading || !phone.trim() || phoneOtpCountdown > 0}
                          className="btn btn-primary"
                          style={{ height: 46, padding: '0 1.1rem', fontSize: '0.84rem', gap: '0.35rem', flexShrink: 0 }}
                        >
                          {phoneOtpLoading ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <Phone size={14} />
                          )}
                          <span>{phoneOtpCountdown > 0 ? `${phoneOtpCountdown}s` : phoneOtpSent ? 'Resend SMS' : 'Send SMS OTP'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPhoneVerified(false);
                            setPhoneOtpSent(false);
                            setPhoneOtpMode('');
                          }}
                          className="btn btn-secondary"
                          style={{ height: 46, padding: '0 0.85rem', fontSize: '0.78rem', flexShrink: 0 }}
                        >
                          Change
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone OTP Verification Drawer */}
                {phoneOtpSent && !isPhoneVerified && (
                  <div style={{
                    padding: '1.25rem 1.4rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1.5px solid var(--primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem',
                    animation: 'fadeIn 0.2s ease',
                    boxShadow: '0 4px 20px rgba(5, 150, 105, 0.1)'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)'
                      }}>
                        <Phone size={17} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                          SMS Verification Code Sent
                        </span>
                        {phoneOtpMode === 'dev_console' ? (
                          <span style={{ fontSize: '0.77rem', color: '#d97706', fontWeight: 600 }}>
                            ⚠️ Dev Mode: Twilio not configured — check the server console for the OTP code.
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                            A 6-digit code was sent via SMS to <strong style={{ color: 'var(--text-main)' }}>{phone}</strong>. Check your messages app.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* OTP Input Row */}
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <input
                        id="phone-otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                        className="form-input"
                        autoFocus
                        autoComplete="one-time-code"
                        style={{
                          letterSpacing: '0.5em',
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          textAlign: 'center',
                          height: 50,
                          flex: 1,
                          borderColor: phoneOtpError ? '#ef4444' : undefined
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={phoneOtpLoading || phoneOtp.length !== 6}
                        className="btn btn-primary"
                        style={{ height: 50, padding: '0 1.5rem', fontSize: '0.87rem', gap: '0.4rem', fontWeight: 700 }}
                      >
                        {phoneOtpLoading ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={17} />}
                        <span>Verify</span>
                      </button>
                    </div>

                    {/* Error */}
                    {phoneOtpError && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        fontSize: '0.8rem', color: '#dc2626', fontWeight: 600,
                        background: 'rgba(239, 68, 68, 0.08)',
                        padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)'
                      }}>
                        <AlertCircle size={14} />
                        {phoneOtpError}
                      </div>
                    )}

                    {/* Resend Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <span>💬 Check your SMS messages app</span>
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={phoneOtpLoading || phoneOtpCountdown > 0}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: phoneOtpCountdown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                          fontWeight: 700,
                          cursor: phoneOtpCountdown > 0 ? 'not-allowed' : 'pointer',
                          fontSize: '0.76rem',
                          padding: 0
                        }}
                      >
                        {phoneOtpCountdown > 0 ? `⏱ Resend in ${phoneOtpCountdown}s` : '↺ Resend SMS'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Address (Pre-verified) */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Email Address (Account ID) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)'
                    }} />
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      disabled
                      style={{
                        paddingLeft: '2.5rem',
                        height: 46,
                        opacity: 0.85,
                        cursor: 'not-allowed',
                        background: 'var(--bg-surface-elevated)'
                      }}
                    />
                    <span style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)'
                    }}>
                      <CheckCircle2 size={14} /> Verified Account
                    </span>
                  </div>
                </div>

                {/* Step 1 Next Button (Wizard Mode) */}
                {viewMode === 'wizard' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleNextStep(1)}
                      className="btn btn-primary"
                      style={{ height: 46, padding: '0 1.5rem', fontWeight: 700, gap: '0.45rem' }}
                    >
                      <span>Next: Campus Details</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                SECTION 2: CAMPUS & ACADEMIC (Step 2 in Wizard, always in Unified)
            ════════════════════════════════════════════════════════════════════ */}
            {(viewMode === 'unified' || activeStep === 2) && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                marginBottom: viewMode === 'unified' ? '2.5rem' : 0,
                paddingBottom: viewMode === 'unified' ? '2.25rem' : 0,
                borderBottom: viewMode === 'unified' ? '1.5px solid var(--border-color)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      2. College & Academic Information
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Provide your active university information to unlock student projects
                    </p>
                  </div>
                </div>

                <div className="grid-2">
                  {/* College / University Name */}
                  <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        College / University Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                        Auto-suggest enabled
                      </span>
                    </div>

                    <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                      <School size={16} style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)',
                        zIndex: 2
                      }} />
                      <input
                        type="text"
                        list="college-suggestions"
                        autoComplete="off"
                        className="form-input"
                        placeholder="e.g. Madras Christian College, Loyola, IIT…"
                        value={college}
                        onChange={(e) => {
                          setCollege(e.target.value);
                          setCollegeFocused(true);
                        }}
                        onFocus={() => setCollegeFocused(true)}
                        onBlur={() => setTimeout(() => setCollegeFocused(false), 220)}
                        style={{ paddingLeft: '2.5rem', height: 46 }}
                        required
                      />

                      {/* Native datalist for browser autocomplete */}
                      <datalist id="college-suggestions">
                        {POPULAR_COLLEGES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>

                      {/* Interactive Custom Floating Dropdown Menu */}
                      {collegeFocused && collegeSuggestions.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          right: 0,
                          background: 'var(--bg-surface)',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06)',
                          zIndex: 60,
                          maxHeight: 220,
                          overflowY: 'auto',
                          padding: '4px'
                        }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Matching Campuses ({collegeSuggestions.length})
                          </div>
                          {collegeSuggestions.map((col) => (
                            <div
                              key={col}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setCollege(col);
                                setCollegeFocused(false);
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.84rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.55rem',
                                color: 'var(--text-main)',
                                transition: 'background 0.12s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <School size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                              <span>{col}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Pick Campus Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center', marginRight: '2px' }}>
                        Popular:
                      </span>
                      {['Madras Christian College (MCC)', 'Loyola College', 'Anna University', 'IIT Madras', 'SRM University', 'VIT'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCollege(chip);
                          }}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface-elevated)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.color = 'var(--primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }}
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year of Study */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Year of Study <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)'
                      }} />
                      <select
                        className="form-select"
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        style={{ paddingLeft: '2.5rem', height: 46 }}
                        required
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Department / Major */}
                <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Department / Degree Program <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Auto-suggest enabled
                    </span>
                  </div>

                  <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                    <BookOpen size={16} style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)',
                      zIndex: 2
                    }} />
                    <input
                      type="text"
                      list="degree-suggestions"
                      autoComplete="off"
                      className="form-input"
                      placeholder="e.g. B.Sc Computer Science, B.Tech CSE, BCA, B.Com…"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        setDepartmentFocused(true);
                      }}
                      onFocus={() => setDepartmentFocused(true)}
                      onBlur={() => setTimeout(() => setDepartmentFocused(false), 220)}
                      style={{ paddingLeft: '2.5rem', height: 46 }}
                      required
                    />

                    {/* Native datalist for browser autocomplete */}
                    <datalist id="degree-suggestions">
                      {POPULAR_DEGREE_PROGRAMS.map((deg) => (
                        <option key={deg} value={deg} />
                      ))}
                    </datalist>

                    {/* Interactive Custom Floating Dropdown Menu */}
                    {departmentFocused && departmentSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-surface)',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06)',
                        zIndex: 60,
                        maxHeight: 220,
                        overflowY: 'auto',
                        padding: '4px'
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Matching Degree Programs ({departmentSuggestions.length})
                        </div>
                        {departmentSuggestions.map((deg) => (
                          <div
                            key={deg}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setDepartment(deg);
                              setDepartmentFocused(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontSize: '0.84rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.55rem',
                              color: 'var(--text-main)',
                              transition: 'background 0.12s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <BookOpen size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <span>{deg}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Pick Degree Program Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center', marginRight: '2px' }}>
                      Popular:
                    </span>
                    {['B.Sc Computer Science', 'B.Tech CSE', 'BCA', 'B.Sc IT', 'VisCom', 'B.Com', 'MBA'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setDepartment(chip);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface-elevated)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 Buttons (Wizard Mode) */}
                {viewMode === 'wizard' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => { setError(''); setActiveStep(1); }}
                      className="btn btn-secondary"
                      style={{ height: 46, padding: '0 1.25rem', gap: '0.4rem' }}
                    >
                      <ArrowLeft size={16} /> <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNextStep(2)}
                      className="btn btn-primary"
                      style={{ height: 46, padding: '0 1.5rem', fontWeight: 700, gap: '0.45rem' }}
                    >
                      <span>Next: Resume & Links</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                SECTION 3: RESUME & LINKS (Step 3 in Wizard, always in Unified)
            ════════════════════════════════════════════════════════════════════ */}
            {(viewMode === 'unified' || activeStep === 3) && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                marginBottom: viewMode === 'unified' ? '2.5rem' : 0,
                paddingBottom: viewMode === 'unified' ? '2.25rem' : 0,
                borderBottom: viewMode === 'unified' ? '1.5px solid var(--border-color)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      3. CV / Resume & Proof of Work
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Upload your student CV and link your past projects and code
                    </p>
                  </div>
                </div>

                {/* CV / Resume Drag & Drop Zone */}
                <div>
                  <label className="form-label" style={{ marginBottom: '0.45rem', display: 'block' }}>
                    Student CV / Resume Document <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.75rem 1.25rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: resumeFile ? 'rgba(5, 150, 105, 0.05)' : 'var(--bg-surface-elevated)',
                      borderColor: resumeFile ? 'var(--primary)' : 'var(--border-color)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />

                    <div style={{
                      width: 48, height: 48,
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.75rem'
                    }}>
                      <Upload size={22} />
                    </div>

                    {resumeFile ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700 }}>
                          <CheckCircle2 size={17} />
                          <span>{resumeFile.name}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                          {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                        </div>
                      </div>
                    ) : resumeFilename ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700 }}>
                          <CheckCircle2 size={17} />
                          <span>Attached: {resumeFilename}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                          Click to upload new PDF/DOCX resume file
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', display: 'block' }}>
                          Click to browse or drop your Resume / CV here
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                          Supports PDF, DOC, DOCX files (up to 25MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Online Resume Link Fallback */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Or Provide Cloud Resume Link (Google Drive / Notion / Dropbox)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={16} style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)'
                    }} />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://drive.google.com/file/d/your-resume-link"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      style={{ paddingLeft: '2.5rem', height: 46 }}
                    />
                  </div>
                </div>

                {/* GitHub & Portfolio in Grid */}
                <div className="grid-2">
                  {/* GitHub Profile */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      GitHub Profile Link <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <GitBranch size={16} style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)'
                      }} />
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://github.com/username"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        style={{ paddingLeft: '2.5rem', height: 46 }}
                        required
                      />
                    </div>
                  </div>

                  {/* Portfolio Link */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Portfolio / Live Work Link <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)'
                      }} />
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://myportfolio.com or Behance"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        style={{ paddingLeft: '2.5rem', height: 46 }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* LinkedIn Profile */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    LinkedIn Profile Link <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Link2 size={16} style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)'
                    }} />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      style={{ paddingLeft: '2.5rem', height: 46 }}
                    />
                  </div>
                </div>

                {/* Step 3 Buttons (Wizard Mode) */}
                {viewMode === 'wizard' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => { setError(''); setActiveStep(2); }}
                      className="btn btn-secondary"
                      style={{ height: 46, padding: '0 1.25rem', gap: '0.4rem' }}
                    >
                      <ArrowLeft size={16} /> <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNextStep(3)}
                      className="btn btn-primary"
                      style={{ height: 46, padding: '0 1.5rem', fontWeight: 700, gap: '0.45rem' }}
                    >
                      <span>Next: Skills & Bio</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                SECTION 4: SKILLS & BIO (Step 4 in Wizard, always in Unified)
            ════════════════════════════════════════════════════════════════════ */}
            {(viewMode === 'unified' || activeStep === 4) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      4. Skills & Introduction
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Select the gigs you want to be hired for and introduce yourself
                    </p>
                  </div>
                </div>

                {/* Selected Skills Badges Box */}
                <div>
                  <label className="form-label" style={{ marginBottom: '0.45rem', display: 'block' }}>
                    Your Selected Skills <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    minHeight: 52,
                    border: skills.length === 0 ? '1.5px dashed #ef4444' : '1.5px solid var(--border-color)'
                  }}>
                    {skills.length === 0 ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        No skills selected yet. Click the suggestions below or type custom skills.
                      </span>
                    ) : (
                      skills.map((s) => (
                        <span
                          key={s}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            padding: '0.35rem 0.8rem',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                          }}
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0
                            }}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Custom Skill Input */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type a custom skill (e.g. Next.js, Canva, Java, SQL)…"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                    style={{ height: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    className="btn btn-secondary"
                    style={{ height: 44, padding: '0 1.25rem', flexShrink: 0, gap: '0.35rem' }}
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                    Quick Click Suggestions:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {POPULAR_SKILLS.map((sk) => {
                      const isSelected = skills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => isSelected ? handleRemoveSkill(sk) : handleAddSkill(sk)}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '0.28rem 0.7rem',
                            borderRadius: 'var(--radius-full)',
                            border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '} {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Student Bio & Starters */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Student Bio & Introduction <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.76rem', color: bio.trim().length >= 10 ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {bio.trim().length} chars (min 10)
                    </span>
                  </div>

                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Introduce yourself, highlight what you love creating, and tell campus clients why they should hire you…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    style={{ resize: 'vertical', minHeight: 96 }}
                  />

                  {/* Sample Bio Starter Pills */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Click to use sample bio template:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {BIO_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.label}
                          type="button"
                          onClick={() => setBio(tmpl.text)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface-elevated)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Submit Bar */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  {viewMode === 'wizard' && (
                    <button
                      type="button"
                      onClick={() => { setError(''); setActiveStep(3); }}
                      className="btn btn-secondary"
                      style={{ height: 50, padding: '0 1.35rem', gap: '0.4rem' }}
                    >
                      <ArrowLeft size={16} /> <span>Back</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      height: 50,
                      fontSize: '1rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        <span>Verifying & Saving Profile…</span>
                      </>
                    ) : (
                      <>
                        <span>Save Profile & Enter CampusGig</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>

        {/* ─── Footer Trust & Signout Bar ─── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1.75rem',
          padding: '0 0.5rem'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            Safe Campus Escrow Platform & Verified Student Identity
          </span>

          <button
            type="button"
            onClick={() => logout()}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.78rem', color: 'var(--text-muted)', gap: '0.35rem' }}
          >
            <LogOut size={13} />
            <span>Switch / Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}

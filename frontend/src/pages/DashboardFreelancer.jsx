import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  DollarSign,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  ArrowRight,
  Layers,
  Edit,
  Trash2,
  Sparkles,
  ExternalLink,
  Loader2,
  MessageSquare,
  AlertCircle,
  Code2,
  X,
  ShieldCheck,
  FileText,
  Upload,
  Download,
  Paperclip,
  Camera,
  KeyRound,
  FileCode,
  FileSpreadsheet,
  FileVideo,
  FileImage,
  FileArchive,
  Award,
  Megaphone,
  Search,
  Send,
  Check,
  Edit3,
  Users
} from 'lucide-react';
import EmailVerificationModal from '../components/EmailVerificationModal';
import ChooseProfilePhotoModal from '../components/ChooseProfilePhotoModal';
import SubmitProposalModal from '../components/SubmitProposalModal';
import EditProfileModal from '../components/EditProfileModal';
import { getProfessionalAvatar } from '../utils/defaultAvatars';
import { designationPhotoMap } from '../utils/designationImages';

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Figma', 'UI/UX Design', 'Python', 'Video Editing',
  'Graphic Design', 'Content Writing', 'Tutoring', 'Data Science', 'Tailwind CSS',
  'Next.js', 'Flutter', 'Machine Learning', 'SEO', 'PowerPoint'
];

export default function DashboardFreelancer({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skillFiles, setSkillFiles] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [selectedJobForProposal, setSelectedJobForProposal] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Skill Management State
  const [newSkillInput, setNewSkillInput] = useState('');
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillSuccessMsg, setSkillSuccessMsg] = useState('');

  // Upload & Portfolio States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState('');
  const [portfolioLinkInput, setPortfolioLinkInput] = useState('');
  const [savingPortfolioLink, setSavingPortfolioLink] = useState(false);
  const [portfolioLinkMsg, setPortfolioLinkMsg] = useState('');
  const [skillFileTitle, setSkillFileTitle] = useState('');
  const [skillFileCategory, setSkillFileCategory] = useState('certificate'); // 'certificate' or 'sample'
  const [uploadingSkillFile, setUploadingSkillFile] = useState(false);
  const [skillFileSuccessMsg, setSkillFileSuccessMsg] = useState('');

  // Student ID Verification Modal
  const [showStudentIdModal, setShowStudentIdModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [studentIdNotes, setStudentIdNotes] = useState('');
  const [submittingStudentId, setSubmittingStudentId] = useState(false);
  const [studentIdSuccessMsg, setStudentIdSuccessMsg] = useState('');

  // 2FA State
  const [toggling2FA, setToggling2FA] = useState(false);
  const [twoFASuccessMsg, setTwoFASuccessMsg] = useState('');

  // New Gig Modal State
  const [showNewGigModal, setShowNewGigModal] = useState(false);
  const [gigTitle, setGigTitle] = useState('');
  const [gigCategory, setGigCategory] = useState('1');
  const [gigPrice, setGigPrice] = useState(800);
  const [gigDays, setGigDays] = useState(2);
  const [gigSkills, setGigSkills] = useState('React, Web Development');
  const [gigDesc, setGigDesc] = useState('');
  const [gigImage, setGigImage] = useState(designationPhotoMap['web-development']?.photo || '');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [creatingGig, setCreatingGig] = useState(false);
  const [generatingAIGig, setGeneratingAIGig] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Edit Gig State
  const [editingGig, setEditingGig] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadFreelancerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFreelancerData = async () => {
    try {
      const token = localStorage.getItem('campusgig_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch projects
      const pRes = await fetch(`/api/projects?role=freelancer`, { headers });
      const pData = await pRes.json();
      if (pData.success) setProjects(pData.projects || []);

      // Fetch user's services
      const sRes = await fetch(`/api/services?user_id=${user.id}&activeOnly=false`);
      const sData = await sRes.json();
      if (sData.success) setServices(sData.services || []);

      // Fetch categories
      const cRes = await fetch('/api/services/categories');
      const cData = await cRes.json();
      if (cData.success) setCategories(cData.categories || []);

      // Fetch skill files
      const fRes = await fetch(`/api/users/skill-files/${user.id}`);
      const fData = await fRes.json();
      if (fData.success) setSkillFiles(fData.files || []);

      // Fetch live reviews
      const rRes = await fetch(`/api/reviews/user/${user.id}`);
      const rData = await rRes.json();
      if (rData.success) setReviews(rData.reviews || []);

      // Fetch open public jobs available for applications
      const oRes = await fetch('/api/projects/open');
      const oData = await oRes.json();
      if (oData.success) setOpenJobs(oData.projects || []);

      // Fetch student's submitted proposals
      const propRes = await fetch('/api/projects/my/proposals', { headers });
      const propData = await propRes.json();
      if (propData.success) setMyProposals(propData.proposals || []);
    } catch (err) {
      console.error('Error loading freelancer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get clean list of skill names from user profile
  const userSkillNames = (user?.skills || []).map(s => typeof s === 'string' ? s : (s?.skill_name || '')).filter(Boolean);

  // Add Skill
  const handleAddSkill = async (skillToAdd) => {
    const targetSkill = (skillToAdd || newSkillInput).trim();
    if (!targetSkill) return;

    if (userSkillNames.some(s => s.toLowerCase() === targetSkill.toLowerCase())) {
      setNewSkillInput('');
      return;
    }

    const updatedSkills = [...userSkillNames, targetSkill];
    await saveSkills(updatedSkills);
    setNewSkillInput('');
  };

  // Remove Skill
  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = userSkillNames.filter(s => s.toLowerCase() !== (skillToRemove || '').toLowerCase());
    await saveSkills(updatedSkills);
  };

  // Save Skills to Backend
  const saveSkills = async (skillsArray) => {
    setSavingSkills(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ skills: skillsArray })
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setSkillSuccessMsg('Skills updated!');
        setTimeout(() => setSkillSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error saving skills:', err);
    } finally {
      setSavingSkills(false);
    }
  };

  // 1. Upload Local Avatar Image
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      const res = await fetch('/api/users/upload/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
      } else {
        alert(data.message || 'Avatar upload failed');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 2. Upload Student Resume (PDF/DOCX)
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploadingResume(true);
    try {
      const res = await fetch('/api/users/upload/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setResumeSuccessMsg('Resume uploaded successfully! 📄');
        setTimeout(() => setResumeSuccessMsg(''), 4000);
      } else {
        alert(data.message || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
    } finally {
      setUploadingResume(false);
    }
  };

  useEffect(() => {
    if (user?.portfolio_url !== undefined) {
      setPortfolioLinkInput(user.portfolio_url || '');
    }
  }, [user?.portfolio_url]);

  // 3. Save Portfolio / Website Link (Optional)
  const handleSavePortfolioLink = async () => {
    setSavingPortfolioLink(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ portfolio_url: portfolioLinkInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setPortfolioLinkMsg('Portfolio link saved! 🔗');
        setTimeout(() => setPortfolioLinkMsg(''), 4000);
      } else {
        alert(data.message || 'Failed to update portfolio link');
      }
    } catch (err) {
      console.error('Portfolio link error:', err);
    } finally {
      setSavingPortfolioLink(false);
    }
  };

  // 4. Upload Skill Work Sample (All file types)
  const handleSkillFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', skillFileTitle.trim() || file.originalname);
    formData.append('category', skillFileCategory);
    setUploadingSkillFile(true);
    try {
      const res = await fetch('/api/users/upload/skill-file', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSkillFileTitle('');
        setSkillFileSuccessMsg(skillFileCategory === 'certificate' ? 'Certificate uploaded & verified for clients! 📜' : 'Work sample uploaded! 📁');
        setTimeout(() => setSkillFileSuccessMsg(''), 4000);
        loadFreelancerData();
      } else {
        alert(data.message || 'File upload failed');
      }
    } catch (err) {
      console.error('Skill file upload error:', err);
    } finally {
      setUploadingSkillFile(false);
    }
  };

  // Delete Skill File
  const handleDeleteSkillFile = async (fileId) => {
    if (!window.confirm('Delete this work sample?')) return;
    try {
      const res = await fetch(`/api/users/skill-files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      if (res.ok) {
        setSkillFiles(prev => prev.filter(f => f.id !== fileId));
      }
    } catch (err) {
      console.error('Delete skill file error:', err);
    }
  };

  // Accept Project Offer
  const handleAcceptProject = async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ status: 'ACCEPTED' })
      });
      const data = await res.json();
      if (data.success) {
        onNavigate('project-detail', { projectId });
      }
    } catch (err) {
      console.error('Accept project error:', err);
    }
  };

  // Reject Project Offer
  const handleRejectProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to decline this project offer?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (res.ok) loadFreelancerData();
    } catch (err) {
      console.error('Reject project error:', err);
    }
  };

  // 4. Submit Student ID Verification
  const handleStudentIdSubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('student-id-file-input');
    const file = fileInput?.files?.[0];
    if (!file) {
      alert('Please select a photo or PDF of your Student ID.');
      return;
    }
    const formData = new FormData();
    formData.append('id_card', file);
    formData.append('notes', studentIdNotes);
    formData.append('college_name', user?.college || '');
    setSubmittingStudentId(true);
    try {
      const res = await fetch('/api/users/verification/submit-student', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setShowStudentIdModal(false);
        setStudentIdSuccessMsg('Student ID submitted for review! 🎓');
        setTimeout(() => setStudentIdSuccessMsg(''), 5000);
      } else {
        alert(data.message || 'Verification submission failed');
      }
    } catch (err) {
      console.error('Student ID submit error:', err);
    } finally {
      setSubmittingStudentId(false);
    }
  };

  // 5. Toggle 2FA
  const handleToggle2FA = async () => {
    const nextStatus = user?.two_factor_enabled !== 1;
    setToggling2FA(true);
    try {
      const res = await fetch('/api/auth/2fa/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ enabled: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setTwoFASuccessMsg(data.message);
        setTimeout(() => setTwoFASuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('2FA toggle error:', err);
    } finally {
      setToggling2FA(false);
    }
  };

  // AI Gig Copywriter generator
  const handleGenerateAIGig = async () => {
    setGeneratingAIGig(true);
    try {
      const userSkill = userSkillNames[0] || 'Web Development';
      const res = await fetch('/api/ai/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${userSkill} student freelance service for campus clients`,
          budget: gigPrice
        })
      });
      const data = await res.json();
      if (data.success && data.brief) {
        setGigTitle(data.brief.title || `I will create professional ${userSkill} solutions for your campus project`);
        setGigDesc(data.brief.description || `High-quality ${userSkill} service tailored for student projects and clubs.`);
        if (data.brief.suggestedBudget) setGigPrice(data.brief.suggestedBudget);
        if (data.brief.skillsRequired) setGigSkills(data.brief.skillsRequired.join(', '));
      }
    } catch (err) {
      console.error('AI Gig generation error:', err);
    } finally {
      setGeneratingAIGig(false);
    }
  };

  // Create Gig Handler
  const handleCreateGig = async (e) => {
    e.preventDefault();
    if (!gigTitle.trim() || !gigDesc.trim()) {
      alert('Please fill in both Gig Title and Description.');
      return;
    }
    setCreatingGig(true);
    try {
      const catId = Number(gigCategory) || (categories[0]?.id ? Number(categories[0].id) : 1);
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          category_id: catId,
          title: gigTitle.trim(),
          description: gigDesc.trim(),
          starting_price: Number(gigPrice) || 500,
          delivery_days: Number(gigDays) || 2,
          skills_csv: gigSkills.trim(),
          cover_image: gigImage.trim() || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewGigModal(false);
        setGigTitle('');
        setGigDesc('');
        loadFreelancerData();
      } else {
        alert(data.message || 'Failed to create gig');
      }
    } catch (err) {
      alert('Error creating gig: ' + err.message);
    } finally {
      setCreatingGig(false);
    }
  };

  // Delete Gig
  const handleDeleteGig = async (id) => {
    if (!window.confirm('Are you sure you want to remove this gig?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      if (res.ok) loadFreelancerData();
    } catch (err) {
      console.error('Delete gig error:', err);
    }
  };

  const pendingRequests = projects.filter(p => p.status === 'REQUESTED');
  const activeOrders = projects.filter(p => ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION'].includes(p.status));
  const completedOrders = projects.filter(p => p.status === 'COMPLETED');
  const totalEarned = user?.wallet?.total_earned || 0;

  // Helper for file type icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <FileImage size={18} className="text-primary" />;
      case 'video': return <FileVideo size={18} style={{ color: 'var(--accent-rose)' }} />;
      case 'code': return <FileCode size={18} style={{ color: 'var(--accent-amber)' }} />;
      case 'archive': return <FileArchive size={18} style={{ color: 'var(--accent-purple)' }} />;
      default: return <FileText size={18} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Header Profile Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Avatar with Professional Selector & Upload */}
            <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
              <img
                src={getProfessionalAvatar(user)}
                alt={user?.name}
                onClick={() => setShowPhotoModal(true)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/avatars/bitmoji_male_1.jpg';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  border: '3px solid var(--primary)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px var(--primary-glow)'
                }}
                title="Click to change profile photo"
              />
              <button
                onClick={() => setShowPhotoModal(true)}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid var(--bg-surface)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="Choose Profile Photo"
              >
                <Camera size={13} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{user?.name || 'Student'}</h1>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.74rem', padding: '0.15rem 0.55rem', gap: '0.35rem' }}
                >
                  <Camera size={13} />
                  <span>Change Photo</span>
                </button>

                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '0.74rem', padding: '0.15rem 0.65rem', gap: '0.35rem' }}
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
                
                {user?.is_verified_student === 1 && (
                  <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                    ✓ Verified Student
                  </span>
                )}

                {user?.two_factor_enabled === 1 && (
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem', gap: '0.25rem' }}>
                    <KeyRound size={11} /> 2FA Active
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {user?.college || 'College of Engineering'} • {user?.department || 'Student'} • {user?.year_of_study || '3rd Year'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const el = document.getElementById('open-jobs-bidding-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-primary btn-md"
              style={{
                gap: '0.45rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Megaphone size={16} />
              <span>Browse Client Jobs ({openJobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-admin-support'))}
              className="btn btn-secondary btn-md"
              style={{ gap: '0.4rem' }}
              title="Chat directly with CampusGig Platform Administrator"
            >
              <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
              <span>Admin Chat</span>
            </button>
            <button onClick={() => setShowNewGigModal(true)} className="btn btn-secondary btn-md" style={{ gap: '0.4rem' }}>
              <Plus size={16} />
              <span>Create New Gig</span>
            </button>
            <button onClick={() => onNavigate('profile', { userId: user?.id })} className="btn btn-secondary btn-md">
              View Public Profile
            </button>
          </div>
        </div>

        {/* Global Success / Alert Banner */}
        {(studentIdSuccessMsg || twoFASuccessMsg || resumeSuccessMsg || portfolioLinkMsg) && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-emerald-light)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: 'var(--accent-emerald)',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{studentIdSuccessMsg || twoFASuccessMsg || resumeSuccessMsg || portfolioLinkMsg}</span>
          </div>
        )}

        {/* 1. Summary Statistics Cards (6 Key Metrics) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          {/* Total Projects */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Projects</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>{projects.length}</div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Projects</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>{activeOrders.length}</div>
            </div>
          </div>

          {/* Completed Projects */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Completed</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{completedOrders.length}</div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Requests</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{pendingRequests.length}</div>
            </div>
          </div>

          {/* Total Earnings (Original & Live Analysis) */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DollarSign size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Earnings</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ₹{completedOrders.reduce((sum, p) => sum + (Number(p.budget) || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Average Rating (Original & Live Analysis) */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={22} fill="currentColor" />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Rating</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {reviews.length > 0 ? (
                  <>
                    <span>{(reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 5.0</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({reviews.length} reviews)</span>
                  </>
                ) : (
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600 }}>New (0 reviews)</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* 2. Grid: Resume & Documents + 2FA Security */}
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          
          {/* Resume & Portfolio Card (Optional - Not Required) */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Resume / CV & Portfolio</h3>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  Optional • Not Required
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Upload your resume (PDF/DOCX) or link your portfolio/GitHub. Neither is required to receive project appointments.
              </p>

              {user?.resume_url ? (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1.5px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <FileText size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {user.resume_filename || 'Student_Resume.pdf'}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Attached to profile
                      </span>
                    </div>
                  </div>

                  <a
                    href={user.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-secondary"
                    style={{ gap: '0.3rem', flexShrink: 0 }}
                  >
                    <Download size={13} />
                    <span>View CV</span>
                  </a>
                </div>
              ) : (
                <div style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-main)',
                  border: '1.5px dashed var(--border-color)',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    No resume uploaded (Optional)
                  </p>
                </div>
              )}

              {/* Optional Portfolio Link field */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Portfolio / GitHub / Website Link <span style={{ fontWeight: 400 }}>(Optional - Not Required)</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    className="input"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    placeholder="https://github.com/username or portfolio link..."
                    value={portfolioLinkInput}
                    onChange={(e) => setPortfolioLinkInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSavePortfolioLink}
                    disabled={savingPortfolioLink}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0, fontSize: '0.78rem' }}
                  >
                    {savingPortfolioLink ? <Loader2 size={13} className="spin" /> : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="resume-upload-input"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}
              >
                {uploadingResume ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                <span>{user?.resume_url ? 'Replace Resume (PDF/DOCX)' : 'Upload Resume Document (Optional)'}</span>
              </label>
              <input
                id="resume-upload-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* 2FA & Account Security Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Two-Factor Authentication (2FA)</h3>
                </div>
                <span className={`badge ${user?.two_factor_enabled === 1 ? 'badge-verified' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                  {user?.two_factor_enabled === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Require an email OTP code every time you sign in to protect your wallet balance and freelance account from unauthorized access.
              </p>

              <div style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: user?.two_factor_enabled === 1 ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface-elevated)',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>Email Security Code Verification</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {user?.two_factor_enabled === 1 ? 'Active on every login attempt' : 'Currently inactive'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  disabled={toggling2FA}
                  className={`btn btn-sm ${user?.two_factor_enabled === 1 ? 'btn-danger' : 'btn-primary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  {toggling2FA ? <Loader2 size={13} className="spin" /> : user?.two_factor_enabled === 1 ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span>Password secured with salted bcrypt hashing</span>
            </div>
          </div>

        </div>

        {/* 3. Uploaded Work Samples / Skill Files (All File Types) */}
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paperclip size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Skill Work Samples & Certificates</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Upload work files, code ZIPs, design mockups, certificates, or video samples (All file types supported)
                </p>
              </div>
            </div>

            {skillFileSuccessMsg && (
              <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
                ✓ {skillFileSuccessMsg}
              </span>
            )}
          </div>

          {/* Upload Work Sample / Certificate Form */}
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-color)',
            marginBottom: '1.25rem'
          }}>
            {/* Type selector: Certificate vs Sample */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Document Type:</span>
              <button
                type="button"
                onClick={() => setSkillFileCategory('certificate')}
                className={`btn btn-sm ${skillFileCategory === 'certificate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', gap: '0.35rem' }}
              >
                <Award size={13} />
                <span>📜 Certificate / Course Credential</span>
              </button>
              <button
                type="button"
                onClick={() => setSkillFileCategory('sample')}
                className={`btn btn-sm ${skillFileCategory === 'sample' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', gap: '0.35rem' }}
              >
                <Paperclip size={13} />
                <span>📁 Work Sample / Deliverable</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={skillFileCategory === 'certificate' ? 'Certificate Name (e.g. AWS Cloud Certified, Google UX Design, Fullstack Master)...' : 'Work Sample Title (e.g. React Ecommerce Code, Fest Logo PSD, Python Script)...'}
                value={skillFileTitle}
                onChange={(e) => setSkillFileTitle(e.target.value)}
                className="input"
                style={{ flex: 1, minWidth: 260, height: 38, fontSize: '0.85rem' }}
              />
              <label
                htmlFor="skill-file-upload-input"
                className="btn btn-primary btn-sm"
                style={{ height: 38, padding: '0 1.25rem', gap: '0.4rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {uploadingSkillFile ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                <span>Upload {skillFileCategory === 'certificate' ? 'Certificate' : 'File'}</span>
              </label>
              <input
                id="skill-file-upload-input"
                type="file"
                onChange={handleSkillFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Supported: PDF, DOCX, ZIP, Code (.py, .js, .cpp), Images, Video (.mp4), Figma (Max 50MB)
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} />
                <span>Directly visible to clients on your public profile & hire cards</span>
              </span>
            </div>
          </div>

          {/* List of uploaded skill files */}
          {skillFiles.length > 0 ? (
            <div className="grid-3">
              {skillFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    border: '1.5px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: (file.category === 'certificate' || /cert|diploma|degree|course|completion|award/i.test(file.title || file.file_name)) ? 'rgba(13, 148, 136, 0.15)' : 'rgba(10, 95, 214, 0.1)',
                      color: (file.category === 'certificate' || /cert|diploma|degree|course|completion|award/i.test(file.title || file.file_name)) ? 'var(--accent-amber)' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {(file.category === 'certificate' || /cert|diploma|degree|course|completion|award/i.test(file.title || file.file_name)) ? <Award size={16} /> : getFileIcon(file.file_type)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {file.title || file.file_name}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {(file.category === 'certificate' || /cert|diploma|degree|course|completion|award/i.test(file.title || file.file_name)) ? '📜 Certificate • ' : '📁 Work Sample • '}
                        {(file.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '0.2rem 0.45rem' }}
                      title="Download file"
                    >
                      <Download size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkillFile(file.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '0.2rem 0.45rem', color: 'var(--accent-rose)' }}
                      title="Delete file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
              No work samples uploaded yet. Add sample code, design files, or certificates to boost client trust!
            </p>
          )}
        </div>

        {/* 4. Freelance Skills Management Card */}
        <div className="card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 70%)', borderColor: 'var(--border-strong)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>My Freelance Skills</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Add technical and creative skills so clients and the AI Matcher can find and hire you
                </p>
              </div>
            </div>

            {skillSuccessMsg && (
              <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
                ✓ {skillSuccessMsg}
              </span>
            )}
          </div>

          {/* Active Skills List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', minHeight: 36 }}>
            {userSkillNames.length > 0 ? (
              userSkillNames.map((skillName, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--primary)',
                    color: 'var(--primary)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <span>{skillName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skillName)}
                    disabled={savingSkills}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-rose)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: 1
                    }}
                    title={`Remove ${skillName}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No skills added yet. Add your skills below to boost your client matching score!
              </span>
            )}
          </div>

          {/* Add Skill Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAddSkill(); }}
            style={{ display: 'flex', gap: '0.5rem', maxWidth: 480, marginBottom: '1rem' }}
          >
            <input
              type="text"
              placeholder="Type a skill (e.g. React, UI/UX, Python, Video Editing)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              className="input"
              style={{ height: 38, fontSize: '0.85rem', minWidth: 0, flex: 1 }}
            />
            <button
              type="submit"
              disabled={savingSkills || !newSkillInput.trim()}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.3rem', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {savingSkills ? <Loader2 size={14} className="spin" /> : <Plus size={15} />}
              <span>Add Skill</span>
            </button>
          </form>

          {/* Quick-add chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Popular on Campus:</span>
            {SUGGESTED_SKILLS.filter(s => !userSkillNames.some(us => us.toLowerCase() === s.toLowerCase())).slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAddSkill(s)}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)' }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* ─── SECTION: OPEN CLIENT JOBS & PROJECT BIDDING BOARD ─────────────── */}
        <div id="open-jobs-bidding-section" className="card" style={{
          marginBottom: '3rem',
          border: '1.5px solid rgba(37, 99, 235, 0.25)',
          background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.03) 0%, var(--bg-surface) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    Open Client Jobs &amp; Project Board ({openJobs.length})
                  </h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Live Bidding</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Clients have posted these open projects for student freelancers. Review scope, submit bids, and get hired!
                </p>
              </div>
            </div>

            {myProposals.length > 0 && (
              <span className="badge badge-verified" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                You have {myProposals.length} active proposal{myProposals.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Search & Category Filter for Jobs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search open client projects (e.g. logo, react, python, video)..."
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.4rem', height: 38, fontSize: '0.84rem' }}
              />
            </div>

            <select
              value={jobCategoryFilter}
              onChange={(e) => setJobCategoryFilter(e.target.value)}
              className="select"
              style={{ width: 'auto', minWidth: 170, height: 38, fontSize: '0.84rem' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Jobs Listing Grid */}
          {(() => {
            const filteredJobs = openJobs.filter(job => {
              const matchesSearch = !jobSearchQuery.trim() ||
                (job.title || '').toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
                (job.description || '').toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
                (job.skills_required || '').toLowerCase().includes(jobSearchQuery.toLowerCase());
              const matchesCategory = !jobCategoryFilter || Number(job.category_id) === Number(jobCategoryFilter);
              return matchesSearch && matchesCategory;
            });

            if (filteredJobs.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                  <Megaphone size={30} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem', opacity: 0.7 }} />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.25rem' }}>No open client jobs found</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    {jobSearchQuery || jobCategoryFilter ? 'Try clearing your search query or category filter.' : 'Check back shortly as clients post new project needs!'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid-2">
                {filteredJobs.map(job => {
                  const existingProposal = myProposals.find(p => Number(p.project_id) === Number(job.id));
                  const isAccepted = existingProposal?.status === 'ACCEPTED';

                  return (
                    <div
                      key={job.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {job.category?.name || 'Open Requirement'}
                          </span>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--accent-emerald)' }}>
                            ₹{job.budget}
                          </strong>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem', lineHeight: 1.35 }}>
                          {job.title}
                        </h4>

                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
                          {(job.description || job.requirements || '').substring(0, 130)}...
                        </p>

                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {job.deadline_days || 3} Days Turnaround
                          </span>
                          {job.client?.college && (
                            <span>🏫 {job.client.college}</span>
                          )}
                          {job.skills_required && (
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              🎯 {job.skills_required}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          👥 {job.proposals_count || 0} applicant{(job.proposals_count || 0) === 1 ? '' : 's'}
                        </div>

                        {existingProposal ? (
                          isAccepted ? (
                            <button
                              type="button"
                              onClick={() => onNavigate('project-detail', { projectId: job.id })}
                              className="btn btn-primary btn-sm"
                              style={{ gap: '0.3rem', fontSize: '0.76rem' }}
                            >
                              <Check size={13} />
                              <span>Hired! Open Chat</span>
                            </button>
                          ) : (
                            <span className="badge badge-verified" style={{ gap: '0.25rem', fontSize: '0.74rem' }}>
                              <Check size={12} /> Proposal Sent (₹{existingProposal.bid_amount})
                            </span>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedJobForProposal(job)}
                            className="btn btn-primary btn-sm"
                            style={{ gap: '0.35rem', fontWeight: 700, fontSize: '0.78rem' }}
                          >
                            <Send size={13} />
                            <span>Apply / Bid</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Sub-Card: Student's Submitted Proposals */}
          {myProposals.length > 0 && (
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>My Submitted Job Proposals ({myProposals.length})</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {myProposals.map(prop => (
                  <div
                    key={prop.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.65rem'
                    }}
                  >
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 750, margin: '0 0 0.15rem' }}>
                        {prop.project?.title || 'Client Project'}
                      </h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Bid: <strong style={{ color: 'var(--primary)' }}>₹{prop.bid_amount}</strong> • Delivery: {prop.delivery_days} days • Client: {prop.project?.client?.name || 'Campus Client'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={`badge ${
                        prop.status === 'ACCEPTED' ? 'badge-verified' :
                        prop.status === 'REJECTED' ? 'badge-danger' : 'badge-neutral'
                      }`} style={{ fontSize: '0.72rem' }}>
                        {prop.status === 'ACCEPTED' ? '🎉 Proposal Accepted!' :
                         prop.status === 'REJECTED' ? 'Declined' : 'Pending Client Review'}
                      </span>

                      {prop.status === 'ACCEPTED' && (
                        <button
                          type="button"
                          onClick={() => onNavigate('project-detail', { projectId: prop.project_id })}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.74rem', padding: '0.2rem 0.6rem' }}
                        >
                          Workstation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Incoming Client Appoint Offers & Active Workstations */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Incoming Client Orders & Active Projects ({projects.length})</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Client work offers, time limits, direct live chat, and deliverable submissions
              </p>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="grid-2">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderColor: proj.status === 'REQUESTED' ? 'var(--accent-amber)' : 'var(--border-color)',
                    background: proj.status === 'REQUESTED' ? 'rgba(13, 148, 136, 0.03)' : 'var(--bg-surface)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className={`badge ${
                        proj.status === 'REQUESTED' ? 'badge-danger' :
                        proj.status === 'COMPLETED' ? 'badge-verified' :
                        proj.status === 'SUBMITTED' ? 'badge-primary' : 'badge-primary'
                      }`} style={{ fontSize: '0.75rem' }}>
                        {proj.status === 'REQUESTED' ? '⚡ New Appoint Offer' : proj.status}
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--accent-emerald)' }}>₹{proj.budget}</strong>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                      {proj.title}
                    </h4>

                    {/* Client Explanation */}
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      marginBottom: '0.85rem'
                    }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 2, textTransform: 'uppercase' }}>
                        Client Scope & Task Explanation:
                      </span>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                        {proj.requirements || proj.description}
                      </p>
                    </div>

                    {/* Time limit & Client detail */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img
                          src={getProfessionalAvatar(proj.client)}
                          alt="Client"
                          style={{ width: 22, height: 22, borderRadius: '50%' }}
                        />
                        <span>Client: <strong>{proj.client?.name || 'Campus Client'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                        <Clock size={14} />
                        <span>{proj.deadline_days || 3} Days Time Limit</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions based on Status */}
                  {proj.status === 'REQUESTED' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleAcceptProject(proj.id)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 2, justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept Work & Open Chat</span>
                      </button>
                      <button
                        onClick={() => handleRejectProject(proj.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, justifyContent: 'center', color: 'var(--accent-rose)' }}
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate('project-detail', { projectId: proj.id })}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem' }}
                    >
                      <MessageSquare size={15} />
                      <span>Open Live Chat & Workstation</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
                No incoming client project requests at this time. Keep your skills updated to be found in search!
              </p>
            </div>
          )}
        </div>

        {/* 6. Published Gigs Management */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>My Published Gigs ({services.length})</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Active services visible to student clients across campus
              </p>
            </div>
            <button onClick={() => setShowNewGigModal(true)} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
              <Plus size={14} />
              <span>Create New Gig</span>
            </button>
          </div>

          {services.length > 0 ? (
            <div className="grid-3">
              {services.map((service) => (
                <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  
                  {/* Gig Cover Image */}
                  <div style={{ position: 'relative', height: 140, margin: '-1.5rem -1.5rem 1rem', overflow: 'hidden' }}>
                    <img
                      src={service.cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'}
                      alt={service.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '0.4rem' }}>
                      <span className={`badge ${service.is_active ? 'badge-verified' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                        {service.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    {service.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1rem', lineHeight: 1.45 }}>
                    {service.description.substring(0, 95)}...
                  </p>

                  {/* Price & Delivery */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Starting At</span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>₹{service.starting_price}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Delivery</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{service.delivery_days} days</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onNavigate('service-detail', { serviceId: service.id })}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Preview Gig
                    </button>
                    <button
                      onClick={() => handleDeleteGig(service.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ color: 'var(--accent-rose)', padding: '0 0.6rem' }}
                      title="Delete Gig"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>No Gigs Published Yet</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 1.5rem' }}>
                Publish your first student service gig to start receiving orders and earning from campus clients!
              </p>
              <button onClick={() => setShowNewGigModal(true)} className="btn btn-primary btn-md" style={{ gap: '0.4rem' }}>
                <Plus size={16} />
                <span>Create Your First Gig</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ─── Modal 1: Student ID Verification ──────────────────────────────── */}
      {showStudentIdModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '2rem', boxShadow: 'var(--shadow-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Student ID Verification</h3>
              </div>
              <button onClick={() => setShowStudentIdModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Upload your College ID card photo or Enrollment PDF. Our campus admin team will verify and grant your Official Verified Student Badge.
            </p>

            <form onSubmit={handleStudentIdSubmit}>
              <div className="form-group">
                <label className="form-label">College / University</label>
                <input
                  type="text"
                  disabled
                  value={user?.college || 'College of Engineering'}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student ID Card (Image or PDF)</label>
                <input
                  id="student-id-file-input"
                  type="file"
                  required
                  accept="image/*,.pdf"
                  className="input"
                  style={{ padding: '0.4rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Additional Details / Roll Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Roll No: CS-2023-889"
                  value={studentIdNotes}
                  onChange={(e) => setStudentIdNotes(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowStudentIdModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStudentId}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {submittingStudentId ? <Loader2 size={16} className="spin" /> : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Create New Gig ────────────────────────────────────────── */}
      {showNewGigModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: 'var(--shadow-2xl)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Publish a New Service Gig</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fill in details or use AI to generate gig copy</p>
              </div>
              <button onClick={() => setShowNewGigModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* AI Copywriter Helper */}
            <div style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(10,95,214,0.08) 0%, rgba(26,127,232,0.08) 100%)',
              border: '1.5px solid var(--primary-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              gap: '0.5rem'
            }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                  AI Gig Copywriter
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Auto-write title, scope description, tags & pricing
                </span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAIGig}
                disabled={generatingAIGig}
                className="btn btn-ai btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {generatingAIGig ? <Loader2 size={13} className="spin" /> : 'Auto-Draft with AI'}
              </button>
            </div>

            <form onSubmit={handleCreateGig}>
              
              <div className="form-group">
                <label className="form-label">Gig Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. I will build an AI-powered React web application"
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={gigCategory}
                    onChange={(e) => setGigCategory(e.target.value)}
                    className="select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Starting Price (₹)</label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={gigPrice}
                    onChange={(e) => setGigPrice(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Delivery Timeline (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={gigDays}
                    onChange={(e) => setGigDays(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, CSS, Vite, JavaScript"
                    value={gigSkills}
                    onChange={(e) => setGigSkills(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Scope & Deliverables Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what you will deliver, technologies used, and what files are included..."
                  value={gigDesc}
                  onChange={(e) => setGigDesc(e.target.value)}
                  className="textarea"
                />
              </div>

              {/* Cover Photo: Upload from Device OR Pick Related Work Photo */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Cover Work Photo</label>
                  <button
                    type="button"
                    onClick={() => {
                      const cat = categories.find(c => String(c.id) === String(gigCategory));
                      const slug = cat?.slug || 'web-development';
                      const match = designationPhotoMap[slug] || designationPhotoMap['web-development'];
                      setGigImage(match.photo);
                    }}
                    style={{
                      background: 'none',
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
                    <Sparkles size={13} />
                    <span>Auto-Pick Category Cover</span>
                  </button>
                </div>

                {/* Preview Banner */}
                {gigImage && (
                  <div style={{ position: 'relative', width: '100%', height: 120, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <img
                      src={gigImage}
                      alt="Gig Cover Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      ✓ Selected Cover
                    </span>
                  </div>
                )}

                {/* Device Upload Button */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <label
                    htmlFor="gig-cover-file-upload"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', minWidth: '160px' }}
                  >
                    {uploadingCover ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                    <span>Upload Image from Device</span>
                  </label>
                  <input
                    id="gig-cover-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('cover', file);
                      setUploadingCover(true);
                      try {
                        const res = await fetch('/api/services/upload/cover', {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
                          body: formData
                        });
                        const data = await res.json();
                        if (data.success) {
                          setGigImage(data.cover_url);
                        } else {
                          alert(data.message || 'Cover upload failed');
                        }
                      } catch (err) {
                        console.error('Cover upload error:', err);
                      } finally {
                        setUploadingCover(false);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Quick Curated Presets Carousel */}
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Or choose from related work presets:
                  </span>
                  <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '4px' }}>
                    {Object.entries(designationPhotoMap).slice(0, 7).map(([slug, item]) => (
                      <div
                        key={slug}
                        onClick={() => setGigImage(item.photo)}
                        style={{
                          position: 'relative',
                          width: 80,
                          height: 52,
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          flexShrink: 0,
                          border: gigImage === item.photo ? '2.5px solid var(--primary)' : '1px solid var(--border-color)',
                          opacity: gigImage === item.photo ? 1 : 0.65,
                          transition: 'all 0.15s ease'
                        }}
                        title={item.title}
                      >
                        <img
                          src={item.photo}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          insetInline: 0,
                          background: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          fontSize: '0.55rem',
                          textAlign: 'center',
                          padding: '1px 2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewGigModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGig}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {creatingGig ? <Loader2 size={16} className="spin" /> : 'Publish Gig to Marketplace'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ─── Modal 3: SMTP Email Verification ──────────────────────────────── */}
      {showVerifyModal && (
        <EmailVerificationModal
          userEmail={user?.email}
          userName={user?.name}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={async () => {
            await refreshUser();
            setShowVerifyModal(false);
          }}
        />
      )}

      {/* ─── Modal 4: Choose Profile Photo ──────────────────────────────────── */}
      <ChooseProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentAvatar={user?.avatar_url}
        userName={user?.name}
        onSuccess={async () => {
          await refreshUser();
        }}
      />

      {/* ─── Modal 5: Submit Proposal / Apply for Open Job ──────────────────── */}
      {selectedJobForProposal && (
        <SubmitProposalModal
          project={selectedJobForProposal}
          onClose={() => setSelectedJobForProposal(null)}
          onProposalSubmitted={async () => {
            await loadFreelancerData();
          }}
        />
      )}

      {/* ─── Modal 6: Edit Profile ─────────────────────────────────────────── */}
      {showEditProfileModal && (
        <EditProfileModal
          onClose={() => setShowEditProfileModal(false)}
        />
      )}

    </div>
  );
}

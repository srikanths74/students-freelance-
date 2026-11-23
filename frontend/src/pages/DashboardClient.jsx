import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Star,
  ShieldCheck,
  Camera,
  Loader2,
  KeyRound,
  FileText,
  Upload,
  X,
  Building,
  Search,
  UserCheck,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Award,
  Briefcase,
  Edit3,
  Megaphone,
  Users
} from 'lucide-react';
import AIRecommenderModal from '../components/AIRecommenderModal';
import { getDesignationInfo } from '../utils/designationImages';
import ChooseProfilePhotoModal from '../components/ChooseProfilePhotoModal';
import PostJobModal from '../components/PostJobModal';
import ViewApplicantsModal from '../components/ViewApplicantsModal';
import EditProfileModal from '../components/EditProfileModal';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function DashboardClient({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [freelancersLoading, setFreelancersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [viewApplicantsProject, setViewApplicantsProject] = useState(null);

  // Search State for Freelancers
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');

  // Appoint Freelancer / Give Work Modal State
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [appointedFreelancer, setAppointedFreelancer] = useState(null);
  const [workTitle, setWorkTitle] = useState('');
  const [workExplanation, setWorkExplanation] = useState('');
  const [workTimeLimitDays, setWorkTimeLimitDays] = useState(3);
  const [workBudget, setWorkBudget] = useState(1000);
  const [workReferenceFile, setWorkReferenceFile] = useState(null);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [appointSuccessMsg, setAppointSuccessMsg] = useState('');

  // Client Verification Modal State
  const [showClientVerifyModal, setShowClientVerifyModal] = useState(false);
  const [orgName, setOrgName] = useState(user?.college || '');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submittingClientVerify, setSubmittingClientVerify] = useState(false);
  const [clientVerifySuccessMsg, setClientVerifySuccessMsg] = useState('');

  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 2FA State
  const [toggling2FA, setToggling2FA] = useState(false);
  const [twoFASuccessMsg, setTwoFASuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      loadClientData();
      searchFreelancers('');
    }
  }, [user]);

  const loadClientData = async () => {
    try {
      const pRes = await fetch(`/api/projects?role=client`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const pData = await pRes.json();
      if (pData.success) setProjects(pData.projects || []);
    } catch (err) {
      console.error('Error loading client projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search Freelancers
  const searchFreelancers = async (query = '', skill = '') => {
    setFreelancersLoading(true);
    try {
      const res = await fetch(`/api/users?role=student&search=${encodeURIComponent(query)}&skill=${encodeURIComponent(skill)}`);
      const data = await res.json();
      if (data.success) {
        setFreelancers(data.freelancers || []);
      }
    } catch (err) {
      console.error('Error searching freelancers:', err);
    } finally {
      setFreelancersLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchFreelancers(searchQuery, selectedSkillFilter);
  };

  // Chat directly with freelancer (navigate to existing workstation or open appoint order)
  const handleChatWithFreelancer = (fl) => {
    const existing = projects.find(p => Number(p.freelancer_id) === Number(fl.id));
    if (existing) {
      onNavigate('project-detail', { projectId: existing.id });
    } else {
      handleOpenAppoint(fl);
    }
  };

  // Open Appoint Modal with specific freelancer
  const handleOpenAppoint = (fl) => {
    setAppointedFreelancer(fl);
    setWorkTitle('');
    setWorkExplanation('');
    setWorkBudget(fl.startingPrice || 1000);
    setWorkTimeLimitDays(3);
    setWorkReferenceFile(null);
    setShowAppointModal(true);
  };

  // Submit Appoint / Give Work Order
  const handleAppointSubmit = async (e) => {
    e.preventDefault();
    if (!appointedFreelancer?.id) {
      alert('Please select a student freelancer to appoint.');
      return;
    }
    if (!workTitle.trim() || !workExplanation.trim()) {
      alert('Please provide a project title and explanation of the work.');
      return;
    }

    setSubmittingWork(true);
    try {
      let referenceFileUrl = null;
      let referenceFileName = null;

      if (workReferenceFile) {
        const formData = new FormData();
        formData.append('file', workReferenceFile);
        const upRes = await fetch('/api/projects/upload-reference', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
          body: formData
        });
        const upData = await upRes.json();
        if (upData.success) {
          referenceFileUrl = upData.file_url;
          referenceFileName = upData.file_name;
        }
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          freelancer_id: appointedFreelancer.id,
          title: workTitle.trim(),
          description: workExplanation.trim(),
          requirements: workExplanation.trim(),
          budget: Number(workBudget) || 500,
          deadline_days: Number(workTimeLimitDays) || 3,
          reference_file_url: referenceFileUrl,
          reference_file_name: referenceFileName
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAppointModal(false);
        setWorkReferenceFile(null);
        setAppointSuccessMsg(`Successfully appointed ${appointedFreelancer.name}! Workstation opened.`);
        setTimeout(() => setAppointSuccessMsg(''), 5000);
        await loadClientData();
        // Option to navigate directly to the created project workstation
        if (data.project?.id) {
          onNavigate('project-detail', { projectId: data.project.id });
        }
      } else {
        alert(data.message || 'Failed to appoint freelancer');
      }
    } catch (err) {
      console.error('Appoint error:', err);
      alert('Error creating work order: ' + err.message);
    } finally {
      setSubmittingWork(false);
    }
  };

  // Upload Local Avatar
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

  // Submit Client Organization Verification
  const handleClientVerifySubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('client-verify-doc-input');
    const file = fileInput?.files?.[0];
    if (!file) {
      alert('Please upload an authorization document, club letter, or registration proof.');
      return;
    }
    const formData = new FormData();
    formData.append('verification_doc', file);
    formData.append('organization_name', orgName);
    formData.append('notes', verificationNotes);
    setSubmittingClientVerify(true);
    try {
      const res = await fetch('/api/users/verification/submit-client', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setShowClientVerifyModal(false);
        setClientVerifySuccessMsg('Client verification submitted for admin review! 🏢');
        setTimeout(() => setClientVerifySuccessMsg(''), 5000);
      } else {
        alert(data.message || 'Verification submission failed');
      }
    } catch (err) {
      console.error('Client verify submit error:', err);
    } finally {
      setSubmittingClientVerify(false);
    }
  };

  // Toggle 2FA
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

  const openProjects = projects.filter(p => p.status === 'OPEN' || (!p.freelancer_id && p.is_public));
  const activeOrders = projects.filter(p => ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION'].includes(p.status));
  const pendingRequests = projects.filter(p => p.status === 'REQUESTED');
  const completedOrders = projects.filter(p => p.status === 'COMPLETED');
  const totalSpent = user?.wallet?.total_spent || 0;

  const popularSkills = ['React', 'Figma', 'Python', 'Video Editing', 'Graphic Design', 'Content Writing'];

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Header Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Avatar with Choose Photo Modal & Upload */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Welcome, {user?.name}!</h1>
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
                
                {user?.is_verified_client === 1 && (
                  <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                    ✓ Verified Client
                  </span>
                )}

                {user?.two_factor_enabled === 1 && (
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem', gap: '0.25rem' }}>
                    <KeyRound size={11} /> 2FA Active
                  </span>
                )}
              </div>

              {/* Client Role Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(5, 150, 105, 0.12)',
                  border: '1.5px solid rgba(5, 150, 105, 0.3)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em'
                }}>
                  <Briefcase size={12} />
                  Client Account
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  You are logged in as a <strong style={{ color: 'var(--text-main)' }}>Client</strong> — post public projects &amp; appoint student talent
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {user?.company_name || user?.college || 'Client Organization'} • Post open project needs or appoint students directly
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowPostJobModal(true)}
              className="btn btn-primary btn-md"
              style={{
                gap: '0.45rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Megaphone size={16} />
              <span>Post a Public Job</span>
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
            <button
              onClick={() => {
                setAppointedFreelancer(freelancers[0] || null);
                setShowAppointModal(true);
              }}
              className="btn btn-secondary btn-md"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Appoint Freelancer</span>
            </button>
            <button onClick={() => setShowAIModal(true)} className="btn btn-ai btn-md" style={{ gap: '0.4rem' }}>
              <Sparkles size={16} />
              <span>AI Matcher</span>
            </button>
          </div>
        </div>

        {/* Global Banner */}
        {(clientVerifySuccessMsg || twoFASuccessMsg || appointSuccessMsg) && (
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
            <span>{clientVerifySuccessMsg || twoFASuccessMsg || appointSuccessMsg}</span>
          </div>
        )}

        {/* 1. Summary Statistics Cards (5 Key Metrics) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          {/* Projects Posted */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Projects Posted</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>{projects.length}</div>
            </div>
          </div>

          {/* Open Public Jobs */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Megaphone size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Open Job Posts</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb' }}>{openProjects.length}</div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Projects</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{activeOrders.length}</div>
            </div>
          </div>

          {/* Completed Projects */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Completed Projects</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--secondary)' }}>{completedOrders.length}</div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DollarSign size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Spent</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

        </div>

        {/* ─── SECTION: MY PUBLIC JOB POSTINGS & APPLICANTS ─────────────────── */}
        <div className="card" style={{ marginBottom: '2.5rem', border: '1.5px solid rgba(37, 99, 235, 0.25)', background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.03) 0%, var(--bg-surface) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>My Public Job Postings ({openProjects.length})</h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Open for Bids</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Open requirements where student freelancers can view project scope and apply with proposals
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPostJobModal(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.35rem', fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>Post New Project</span>
            </button>
          </div>

          {openProjects.length > 0 ? (
            <div className="grid-2">
              {openProjects.map(proj => (
                <div
                  key={proj.id}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {proj.category?.name || 'Open Requirement'}
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>₹{proj.budget}</strong>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', lineHeight: 1.35 }}>
                      {proj.title}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
                      {(proj.description || proj.requirements || '').substring(0, 120)}...
                    </p>

                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {proj.deadline_days || 3} Days Turnaround
                      </span>
                      {proj.skills_required && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 600 }}>
                          🎯 {proj.skills_required}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: (proj.proposals_count || 0) > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      <Users size={14} />
                      <span>{proj.proposals_count || 0} Student Proposal{(proj.proposals_count || 0) === 1 ? '' : 's'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewApplicantsProject(proj)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', fontWeight: 750, fontSize: '0.78rem' }}
                    >
                      <Users size={13} />
                      <span>View Applicants ({proj.proposals_count || 0})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-color)'
            }}>
              <Megaphone size={32} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 750, marginBottom: '0.25rem' }}>No Active Public Projects</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto 1rem' }}>
                Need a logo designer, full-stack website, or video editor? Post your project requirement publicly so students across campus can submit proposals!
              </p>
              <button
                onClick={() => setShowPostJobModal(true)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <Plus size={14} />
                <span>Post Your First Job</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. SECTION: SEARCH & APPOINT STUDENT FREELANCERS */}
        <div className="card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 60%)', borderColor: 'var(--border-strong)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800 }}>Search & Appoint Student Freelancers</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Find student experts, specify task requirements, set time limits, and chat directly
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by student name, skill (React, Figma, Python), or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.4rem', height: 40, fontSize: '0.85rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-md" style={{ height: 40 }}>
              {freelancersLoading ? <Loader2 size={16} className="spin" /> : 'Search Talent'}
            </button>
          </form>

          {/* Skill Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Skill:</span>
            <button
              type="button"
              onClick={() => { setSelectedSkillFilter(''); searchFreelancers(searchQuery, ''); }}
              className={`btn btn-sm ${selectedSkillFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)' }}
            >
              All Skills
            </button>
            {popularSkills.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSelectedSkillFilter(s); searchFreelancers(searchQuery, s); }}
                className={`btn btn-sm ${selectedSkillFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)' }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Freelancer Results Grid */}
          {freelancersLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Searching verified student freelancers...</p>
            </div>
          ) : freelancers.length > 0 ? (
            <div className="grid-3">
              {freelancers.slice(0, 6).map((fl) => {
                const primarySkill = (fl.skills || [])[0]?.skill_name || (fl.skills || [])[0] || '';
                const info = getDesignationInfo(fl.department, primarySkill);
                return (
                  <div
                    key={fl.id}
                    className="card card-hoverable"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    {/* Designation Cover Photo Banner */}
                    <div style={{ position: 'relative', width: '100%', height: 105, overflow: 'hidden', backgroundColor: 'var(--bg-surface-elevated)' }}>
                      <img
                        src={info.photo}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(12, 10, 9, 0.8) 0%, rgba(12, 10, 9, 0.15) 60%, transparent 100%)'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(12, 10, 9, 0.75)',
                        backdropFilter: 'blur(6px)',
                        color: '#fff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span>{info.icon}</span>
                        <span>{info.tag}</span>
                      </div>
                    </div>

                    {/* Card Content with perfectly positioned avatar - floats cleanly over banner */}
                    <div style={{ padding: '0 1.15rem 1.15rem', position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                        <div style={{
                          width: 58,
                          height: 58,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '3.5px solid var(--bg-surface)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                          marginTop: -30,
                          position: 'relative',
                          zIndex: 10,
                          flexShrink: 0
                        }}>
                          <img
                            src={getProfessionalAvatar(fl)}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/avatars/bitmoji_male_1.jpg';
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              objectPosition: 'center 15%',
                              display: 'block'
                            }}
                          />
                        </div>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          background: 'var(--primary-light)',
                          border: '1px solid var(--primary-medium)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          maxWidth: '65%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '0.15rem'
                        }}>
                          {info.title}
                        </span>
                      </div>

                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <strong style={{ fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fl.name}</strong>
                          {fl.is_verified_student === 1 && (
                            <UserCheck size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                          )}
                        </div>
                        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {fl.department} • {fl.college}
                        </span>
                      </div>

                      {/* Genuine Live Rating & Live Starting Price */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                          <Star size={13} fill="var(--accent-amber)" />
                          <span>{fl.reviewCount > 0 ? `${fl.rating} (${fl.reviewCount})` : 'New Student'}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Starts ₹{fl.startingPrice}</span>
                      </div>

                      {/* Skills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: (fl.resume_url || fl.portfolio_url || fl.skillFilesCount > 0) ? '0.5rem' : '1.15rem' }}>
                        {(fl.skills || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                            {s.skill_name || s}
                          </span>
                        ))}
                      </div>

                      {/* Verified Attachments & Proofs for Clients */}
                      {(fl.resume_url || fl.portfolio_url || fl.skillFilesCount > 0) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.9rem' }}>
                          {fl.resume_url && (
                            <a
                              href={fl.resume_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="badge"
                              style={{ textDecoration: 'none', fontSize: '0.66rem', padding: '0.15rem 0.45rem', background: 'rgba(10, 95, 214, 0.08)', color: 'var(--primary)', border: '1px solid rgba(10, 95, 214, 0.25)', gap: '0.2rem' }}
                              title="Click to view/download verified student resume"
                            >
                              <FileText size={10} />
                              <span>Resume CV</span>
                            </a>
                          )}
                          {fl.portfolio_url && (
                            <a
                              href={fl.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="badge"
                              style={{ textDecoration: 'none', fontSize: '0.66rem', padding: '0.15rem 0.45rem', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.25)', gap: '0.2rem' }}
                              title="Click to open portfolio link"
                            >
                              <ExternalLink size={10} />
                              <span>Portfolio</span>
                            </a>
                          )}
                          {fl.skillFilesCount > 0 && (
                            <span
                              onClick={() => onNavigate('profile', { userId: fl.id })}
                              className="badge"
                              style={{ cursor: 'pointer', fontSize: '0.66rem', padding: '0.15rem 0.45rem', background: 'rgba(13, 148, 136, 0.08)', color: 'var(--accent-amber)', border: '1px solid rgba(13, 148, 136, 0.25)', gap: '0.2rem' }}
                              title="Click to view certificates on profile"
                            >
                              <Award size={10} />
                              <span>{fl.certificatesCount || fl.skillFilesCount} Certs</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenAppoint(fl)}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', gap: '0.25rem', padding: '0.45rem 0.5rem' }}
                        >
                          <Plus size={13} />
                          <span>Appoint Work</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChatWithFreelancer(fl)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', gap: '0.25rem', padding: '0.45rem 0.55rem' }}
                          title="Open live chat with this freelancer"
                        >
                          <MessageSquare size={13} />
                          <span>Chat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('profile', { userId: fl.id })}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', padding: '0.45rem 0.55rem' }}
                        >
                          Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
              No student freelancers matched your search query. Try searching for a different skill or name.
            </p>
          )}
        </div>

        {/* 3. SECTION: ACTIVE HIRED PROJECTS & WORKSTATIONS */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>My Hired Projects & Active Workstations ({projects.length})</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Collaborate in real-time chat, review submitted deliverables, and release escrow milestones
              </p>
            </div>
            <button
              onClick={() => {
                setAppointedFreelancer(freelancers[0] || null);
                setShowAppointModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <Plus size={14} />
              <span>Give New Work</span>
            </button>
          </div>

          {projects.length > 0 ? (
            <div className="grid-2">
              {projects.map((proj) => (
                <div key={proj.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className={`badge ${
                        proj.status === 'COMPLETED' ? 'badge-verified' :
                        proj.status === 'SUBMITTED' ? 'badge-primary' :
                        proj.status === 'IN_PROGRESS' ? 'badge-primary' :
                        proj.status === 'REQUESTED' ? 'badge-neutral' : 'badge-neutral'
                      }`} style={{ fontSize: '0.75rem' }}>
                        {proj.status === 'REQUESTED' ? 'Pending Acceptance' : proj.status}
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>₹{proj.budget}</strong>
                    </div>

                    <h4 style={{ fontSize: '1.08rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.35 }}>
                      {proj.title}
                    </h4>
                    
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: 1.45 }}>
                      {proj.requirements?.substring(0, 115)}...
                    </p>

                    {/* Freelancer & Time Limit info */}
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img
                          src={getProfessionalAvatar(proj.freelancer)}
                          alt="Freelancer"
                          style={{ width: 22, height: 22, borderRadius: '50%' }}
                        />
                        <span><strong>{proj.freelancer?.name || 'Student Freelancer'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                        <Clock size={13} />
                        <span>{proj.deadline_days || 3} Days Limit</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Live Chat & Workstation Button */}
                  <button
                    onClick={() => onNavigate('project-detail', { projectId: proj.id })}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem' }}
                  >
                    <MessageSquare size={15} />
                    <span>Open Live Chat & Workstation</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShoppingBag size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>No Hired Projects Yet</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 1.5rem' }}>
                Appoint your first student freelancer above to start collaborating, chatting in real-time, and getting work done!
              </p>
              <button
                onClick={() => {
                  setAppointedFreelancer(freelancers[0] || null);
                  setShowAppointModal(true);
                }}
                className="btn btn-primary btn-md"
                style={{ gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Appoint Student Freelancer</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Client Security & 2FA Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Client Two-Factor Authentication (2FA)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Require email OTP security code on login to safeguard hiring funds and escrow transactions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggle2FA}
              disabled={toggling2FA}
              className={`btn btn-sm ${user?.two_factor_enabled === 1 ? 'btn-danger' : 'btn-primary'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              {toggling2FA ? <Loader2 size={14} className="spin" /> : user?.two_factor_enabled === 1 ? 'Disable 2FA' : 'Enable 2FA Protection'}
            </button>
          </div>
        </div>

      </div>

      {/* ─── MODAL 1: APPOINT FREELANCER / GIVE WORK ───────────────────────── */}
      {showAppointModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: 'var(--shadow-2xl)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Appoint Freelancer & Give Work</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Explain project requirements, set deadline days, and open 1-on-1 chat
                </p>
              </div>
              <button onClick={() => setShowAppointModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAppointSubmit}>
              
              {/* Select Freelancer */}
              <div className="form-group">
                <label className="form-label">Select Student Freelancer</label>
                <select
                  value={appointedFreelancer?.id || ''}
                  onChange={(e) => {
                    const fl = freelancers.find(f => Number(f.id) === Number(e.target.value));
                    setAppointedFreelancer(fl || null);
                    if (fl?.startingPrice) setWorkBudget(fl.startingPrice);
                  }}
                  className="select"
                  required
                >
                  <option value="" disabled>Choose a student freelancer...</option>
                  {freelancers.map((fl) => (
                    <option key={fl.id} value={fl.id}>
                      {fl.name} • {fl.department} ({fl.college})
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Title */}
              <div className="form-group">
                <label className="form-label">Task / Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build College Fest Registration Website in React"
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  className="input"
                />
              </div>

              {/* Time Limit & Budget */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Time Limit / Deadline (Days)</label>
                  <select
                    value={workTimeLimitDays}
                    onChange={(e) => setWorkTimeLimitDays(Number(e.target.value))}
                    className="select"
                  >
                    <option value={1}>1 Day (Urgent / Express)</option>
                    <option value={2}>2 Days</option>
                    <option value={3}>3 Days (Standard)</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Budget (₹)</label>
                  <input
                    type="number"
                    min={200}
                    required
                    value={workBudget}
                    onChange={(e) => setWorkBudget(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Scope & Task Explanation */}
              <div className="form-group">
                <label className="form-label">Explain Work & Scope Requirements</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain exactly what you need the student to build or design, format requirements, technologies to use, and delivery expectations..."
                  value={workExplanation}
                  onChange={(e) => setWorkExplanation(e.target.value)}
                  className="textarea"
                />
              </div>

              {/* Reference Files Attachment */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Reference Files & Attachments (e.g. symposium-details.pdf, docs)</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Optional</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt"
                  onChange={(e) => setWorkReferenceFile(e.target.files[0] || null)}
                  className="input"
                  style={{ padding: '0.4rem' }}
                />
                {workReferenceFile && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
                    ✓ Attached: {workReferenceFile.name} ({(workReferenceFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAppointModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork || !appointedFreelancer}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center', gap: '0.4rem' }}
                >
                  {submittingWork ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
                  <span>Send Offer & Open Chat</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ─── MODAL 2: CLIENT VERIFICATION ──────────────────────────────────── */}
      {showClientVerifyModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 500, width: '100%', padding: '2rem', boxShadow: 'var(--shadow-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Client Organization Verification</h3>
              </div>
              <button onClick={() => setShowClientVerifyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Verify your College Club, Department, or Startup to receive the Official Verified Client Badge and priority matching with top students.
            </p>

            <form onSubmit={handleClientVerifySubmit}>
              <div className="form-group">
                <label className="form-label">Organization / Club / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics Club / Tech Fest Team / Startup"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Verification Proof Document (PDF, Image, Letter)</label>
                <input
                  id="client-verify-doc-input"
                  type="file"
                  required
                  accept="image/*,.pdf,.doc,.docx"
                  className="input"
                  style={{ padding: '0.4rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Additional Description / Website URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Official campus club website or registration ID"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowClientVerifyModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClientVerify}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {submittingClientVerify ? <Loader2 size={16} className="spin" /> : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Recommender Modal */}
      {showAIModal && (
        <AIRecommenderModal
          onClose={() => setShowAIModal(false)}
          onSelectFreelancer={(id) => {
            setShowAIModal(false);
            const fl = freelancers.find(f => Number(f.id) === Number(id));
            if (fl) {
              handleOpenAppoint(fl);
            } else {
              onNavigate('profile', { userId: id });
            }
          }}
        />
      )}

      {/* Choose / Change Profile Photo Modal */}
      <ChooseProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentAvatar={user?.avatar_url}
        userName={user?.name}
        onSuccess={async () => {
          await refreshUser();
        }}
      />

      {/* Post Public Job Modal */}
      {showPostJobModal && (
        <PostJobModal
          onClose={() => setShowPostJobModal(false)}
          onJobCreated={async (newProj) => {
            await loadClientData();
          }}
        />
      )}

      {/* View Project Applicants Modal */}
      {viewApplicantsProject && (
        <ViewApplicantsModal
          project={viewApplicantsProject}
          onClose={() => setViewApplicantsProject(null)}
          onNavigate={onNavigate}
          onProposalAccepted={async (res) => {
            await loadClientData();
            if (res.project?.id) {
              onNavigate('workstation', { projectId: res.project.id });
            }
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          onClose={() => setShowEditProfileModal(false)}
        />
      )}

    </div>
  );
}

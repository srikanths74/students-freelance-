import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  Award,
  BookOpen,
  UserCheck,
  Flag,
  X,
  FileText,
  Download,
  Paperclip,
  FileCode,
  FileSpreadsheet,
  FileVideo,
  FileImage,
  FileArchive,
  Camera,
  Plus,
  Send,
  Loader2,
  Trash2
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import ChooseProfilePhotoModal from '../components/ChooseProfilePhotoModal';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function FreelancerProfile({ userId, onNavigate }) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // 'services', 'skill-files', 'portfolio', 'reviews'
  const [skillFileFilter, setSkillFileFilter] = useState('all'); // 'all', 'certificate', 'sample'
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [reportReason, setReportReason] = useState('UNPROFESSIONAL_BEHAVIOR');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Appoint Freelancer & Direct Work Order Modal State
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const [workExplanation, setWorkExplanation] = useState('');
  const [workBudget, setWorkBudget] = useState(1000);
  const [workDays, setWorkDays] = useState(3);
  const [workRefFile, setWorkRefFile] = useState(null);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [clientProjects, setClientProjects] = useState([]);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId]);

  const loadProfile = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }

      // If viewing user is client, fetch active projects to link directly to chat
      const token = localStorage.getItem('campusgig_token');
      if (token && currentUser?.role === 'client') {
        const cpRes = await fetch('/api/projects?role=client', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cpData = await cpRes.json();
        if (cpData.success) setClientProjects(cpData.projects || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Direct Chat: Navigate to existing project workstation or open appoint order
  const handleChatWithFreelancer = () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    const existing = clientProjects.find(p => Number(p.freelancer_id) === Number(profile?.id));
    if (existing) {
      onNavigate('project-detail', { projectId: existing.id });
    } else {
      setWorkTitle(`Collaboration with ${profile?.name || 'Freelancer'}`);
      setWorkExplanation('Hi, I would like to discuss a project requirement with you.');
      setWorkBudget(1000);
      setWorkDays(3);
      setShowAppointModal(true);
    }
  };

  // Submit Appoint / Give Work Order
  const handleAppointSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to appoint a freelancer.');
      return;
    }
    if (!workTitle.trim() || !workExplanation.trim()) {
      alert('Please provide a project title and explanation.');
      return;
    }

    setSubmittingWork(true);
    try {
      let referenceFileUrl = null;
      let referenceFileName = null;
      if (workRefFile) {
        const formData = new FormData();
        formData.append('file', workRefFile);
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
          freelancer_id: profile.id,
          title: workTitle.trim(),
          description: workExplanation.trim(),
          requirements: workExplanation.trim(),
          budget: Number(workBudget) || 1000,
          deadline_days: Number(workDays) || 3,
          reference_file_url: referenceFileUrl,
          reference_file_name: referenceFileName
        })
      });
      const data = await res.json();
      if (data.success && data.project?.id) {
        setShowAppointModal(false);
        onNavigate('project-detail', { projectId: data.project.id });
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

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          target_type: 'user',
          target_id: profile.id,
          reason: reportReason,
          description: reportDesc
        })
      });
      if (res.ok) {
        setReportSubmitted(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSubmitted(false);
          setReportDesc('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error reporting:', err);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <FileImage size={20} className="text-primary" />;
      case 'video': return <FileVideo size={20} style={{ color: 'var(--accent-rose)' }} />;
      case 'code': return <FileCode size={20} style={{ color: 'var(--accent-amber)' }} />;
      case 'archive': return <FileArchive size={20} style={{ color: 'var(--accent-purple)' }} />;
      default: return <FileText size={20} style={{ color: 'var(--primary)' }} />;
    }
  };

  if (loading) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading student profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Student Profile Not Found</h2>
        <button onClick={() => onNavigate('explore')} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Back to Explore
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser && Number(currentUser.id) === Number(profile.id);

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Back button */}
        <button
          onClick={() => onNavigate('explore')}
          className="btn btn-sm btn-secondary"
          style={{ marginBottom: '1.5rem', gap: '0.4rem', border: 'none', background: 'transparent' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </button>

        {/* 1. Profile Header Card */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            
            {/* Avatar & Core Info */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 92, height: 92 }}>
                <img
                  src={getProfessionalAvatar(profile)}
                  alt={profile.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/avatars/bitmoji_male_1.jpg';
                  }}
                  style={{ width: 92, height: 92, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '3px solid var(--primary)', boxShadow: '0 4px 12px var(--primary-glow)' }}
                />
                {currentUser && (Number(currentUser.id) === Number(profile.id) || currentUser.email === profile.email) && (
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 30,
                      height: 30,
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
                    title="Change Profile Photo"
                  >
                    <Camera size={14} />
                  </button>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{profile.name}</h1>
                  {profile.is_verified_student === 1 && (
                    <span className="badge badge-verified" style={{ gap: '0.3rem', fontSize: '0.75rem' }}>
                      <UserCheck size={14} />
                      <span>Verified Student</span>
                    </span>
                  )}
                  {profile.is_verified_client === 1 && (
                    <span className="badge badge-verified" style={{ gap: '0.3rem', fontSize: '0.75rem' }}>
                      <UserCheck size={14} />
                      <span>Verified Client</span>
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {profile.year_of_study} • {profile.department}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>🏛️ {profile.college}</span>
                  {currentUser && (Number(currentUser.id) === Number(profile.id) || currentUser.email === profile.email) && (
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.15rem 0.55rem', gap: '0.35rem' }}
                    >
                      <Camera size={13} />
                      <span>Change Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '1.25rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--accent-amber)', fontWeight: 800, fontSize: '1.25rem' }}>
                    <Star size={18} fill="var(--accent-amber)" />
                    <span>{(profile.stats?.reviewCount || 0) > 0 ? profile.stats.averageRating : 'New'}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {(profile.stats?.reviewCount || 0) > 0 ? `Rating (${profile.stats.reviewCount})` : '0 Reviews'}
                  </span>
                </div>
                <div style={{ width: 1, background: 'var(--border-color)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
                    {profile.stats?.completedProjects || 0}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completed</span>
                </div>
                <div style={{ width: 1, background: 'var(--border-color)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent-emerald)' }}>
                    {profile.response_time || 'Within 1h'}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Response</span>
                </div>
              </div>

              {/* Resume Download Action */}
              {profile.resume_url && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-md"
                  style={{ gap: '0.4rem' }}
                >
                  <FileText size={16} />
                  <span>Download Resume (CV)</span>
                </a>
              )}

              {/* Optional Portfolio Link Action */}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-md"
                  style={{ gap: '0.4rem' }}
                >
                  <ExternalLink size={15} />
                  <span>Portfolio Link</span>
                </a>
              )}

              {/* Primary Client Actions: Appoint & Chat */}
              {!isOwnProfile && (
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        onNavigate('login');
                        return;
                      }
                      setWorkTitle(`Project Appointment for ${profile.name}`);
                      setWorkExplanation('');
                      setWorkBudget(1000);
                      setWorkDays(3);
                      setShowAppointModal(true);
                    }}
                    className="btn btn-primary btn-md"
                    style={{ gap: '0.45rem', fontWeight: 700 }}
                  >
                    <Plus size={16} />
                    <span>{currentUser ? 'Appoint / Give Work' : 'Sign In to Hire'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleChatWithFreelancer}
                    className="btn btn-secondary btn-md"
                    style={{ gap: '0.45rem', fontWeight: 600 }}
                    title="Open live workstation chat with this freelancer"
                  >
                    <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                    <span>{currentUser ? 'Chat / Message' : 'Sign In to Chat'}</span>
                  </button>
                </div>
              )}

              {/* Admin Actions: Delete Student & Admin Chat */}
              {currentUser?.role === 'admin' && !isOwnProfile && (
                <div style={{
                  display: 'flex',
                  gap: '0.45rem',
                  flexWrap: 'wrap',
                  marginTop: '0.75rem',
                  padding: '0.55rem 0.85rem',
                  background: 'rgba(239, 68, 68, 0.07)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                    🛡️ Admin Actions:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('campusgig_admin_tab', 'chat');
                      onNavigate('admin', { tab: 'chat', targetUserId: profile.id });
                    }}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.76rem', gap: '0.35rem', padding: '0.25rem 0.65rem' }}
                  >
                    <MessageSquare size={13} style={{ color: 'var(--primary)' }} />
                    <span>Chat with Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const conf = window.confirm(
                        `Are you sure you want to permanently DELETE student "${profile.name}" (${profile.email})?\n\nThis will remove their account profile, all published gigs, skills, and files from the platform.`
                      );
                      if (!conf) return;
                      try {
                        const token = localStorage.getItem('campusgig_token');
                        const res = await fetch(`/api/admin/users/${profile.id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(data.message || `Student ${profile.name} was successfully removed.`);
                          onNavigate('explore');
                        } else {
                          alert(data.message || 'Failed to delete student');
                        }
                      } catch (err) {
                        alert('Error: ' + err.message);
                      }
                    }}
                    className="btn btn-sm btn-danger"
                    style={{ fontSize: '0.76rem', gap: '0.35rem', padding: '0.25rem 0.65rem', fontWeight: 700 }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Student Account</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Bio */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6, maxWidth: 850 }}>
              {profile.bio || 'Passionate student freelancer offering creative and technical services on campus.'}
            </p>
          </div>

          {/* Skills Badges */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              Skills:
            </span>
            {profile.skills && profile.skills.map((s, idx) => (
              <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                {s.skill_name || s}
              </span>
            ))}
          </div>

          {/* Verified Credentials & Proof of Work Bar (Directly Visible for Clients) */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Client Trust & Credentials:</span>
              </div>

              {profile.resume_url ? (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="badge badge-primary"
                  style={{ textDecoration: 'none', padding: '0.35rem 0.75rem', gap: '0.35rem', fontSize: '0.78rem' }}
                  title="Click to download verified resume"
                >
                  <FileText size={13} />
                  <span>Verified Resume (CV)</span>
                </a>
              ) : (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Resume: Not uploaded</span>
              )}

              {profile.portfolio_url ? (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="badge badge-secondary"
                  style={{ textDecoration: 'none', padding: '0.35rem 0.75rem', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--primary)' }}
                  title="Click to visit external portfolio"
                >
                  <ExternalLink size={13} />
                  <span>Portfolio Link</span>
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => setActiveTab('skill-files')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>{profile.skillFiles?.length || 0} Certificates & Proof Files</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {profile.resume_url && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '0.78rem', gap: '0.35rem' }}
                >
                  <Download size={13} />
                  <span>Download CV</span>
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.78rem', gap: '0.35rem' }}
                >
                  <ExternalLink size={13} />
                  <span>Visit Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* Report Button */}
          {!isOwnProfile && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.72rem', color: 'var(--text-muted)', border: 'none', background: 'transparent', gap: '0.3rem' }}
              >
                <Flag size={12} />
                <span>Report Student Profile</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('services')}
            className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <span>Active Gigs ({profile.services?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('skill-files')}
            className={`btn btn-sm ${activeTab === 'skill-files' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <span>Certificates & Proof of Work ({profile.skillFiles?.length || 0})</span>
          </button>

          {((profile.portfolio && profile.portfolio.length > 0) || profile.portfolio_url) && (
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`btn btn-sm ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <span>Portfolio ({profile.portfolio?.length || (profile.portfolio_url ? 1 : 0)})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('reviews')}
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <span>Client Reviews ({profile.reviews?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE SERVICES / GIGS */}
        {activeTab === 'services' && (
          <div>
            {profile.services && profile.services.length > 0 ? (
              <div className="grid-3">
                {profile.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => onNavigate('service-detail', { serviceId: service.id })}
                  />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No active service gigs published yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPLOADED CERTIFICATES & WORK SAMPLES */}
        {activeTab === 'skill-files' && (
          <div>
            {/* Header info note for clients */}
            <div style={{
              marginBottom: '1.25rem',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  Client Verification: All documents and credentials below are uploaded directly by {profile.name} to verify their qualifications.
                </span>
              </div>

              {/* Filter Chips */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setSkillFileFilter('all')}
                  className={`btn btn-sm ${skillFileFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                >
                  All ({profile.skillFiles?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setSkillFileFilter('certificate')}
                  className={`btn btn-sm ${skillFileFilter === 'certificate' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', gap: '0.25rem' }}
                >
                  <Award size={11} />
                  <span>Certificates ({
                    (profile.skillFiles || []).filter(f => f.category === 'certificate' || /cert|diploma|degree|course|completion|award|license|badge/i.test(f.title || f.file_name)).length
                  })</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillFileFilter('sample')}
                  className={`btn btn-sm ${skillFileFilter === 'sample' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', gap: '0.25rem' }}
                >
                  <Paperclip size={11} />
                  <span>Samples ({
                    (profile.skillFiles || []).filter(f => !(f.category === 'certificate' || /cert|diploma|degree|course|completion|award|license|badge/i.test(f.title || f.file_name))).length
                  })</span>
                </button>
              </div>
            </div>

            {profile.skillFiles && profile.skillFiles.length > 0 ? (
              <div className="grid-2">
                {profile.skillFiles
                  .filter((file) => {
                    const isCert = file.category === 'certificate' || /cert|diploma|degree|course|completion|award|license|badge/i.test(file.title || file.file_name);
                    if (skillFileFilter === 'certificate') return isCert;
                    if (skillFileFilter === 'sample') return !isCert;
                    return true;
                  })
                  .map((file) => {
                    const isCert = file.category === 'certificate' || /cert|diploma|degree|course|completion|award|license|badge/i.test(file.title || file.file_name);
                    return (
                      <div
                        key={file.id}
                        className="card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.85rem',
                          border: isCert ? '1.5px solid rgba(13, 148, 136, 0.4)' : '1px solid var(--border-color)',
                          background: isCert ? 'rgba(13, 148, 136, 0.02)' : 'var(--bg-surface)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                            <div style={{
                              width: 42,
                              height: 42,
                              borderRadius: 'var(--radius-md)',
                              background: isCert ? 'rgba(13, 148, 136, 0.15)' : 'rgba(10, 95, 214, 0.1)',
                              color: isCert ? 'var(--accent-amber)' : 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {isCert ? <Award size={22} /> : getFileIcon(file.file_type)}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                {file.title || file.file_name}
                              </h4>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {(file.file_size / 1024).toFixed(1)} KB • {file.file_name}
                              </span>
                            </div>
                          </div>

                          <span className={`badge ${isCert ? 'badge-ai' : 'badge-neutral'}`} style={{ fontSize: '0.7rem', flexShrink: 0, gap: '0.2rem' }}>
                            {isCert ? <Award size={10} /> : <Paperclip size={10} />}
                            <span>{isCert ? 'Certificate' : 'Work Sample'}</span>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                            ✓ Verified Attachment
                          </span>

                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-primary"
                            style={{ gap: '0.35rem', fontSize: '0.78rem' }}
                            title="Download or View Credential"
                          >
                            <Download size={13} />
                            <span>Download / View</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Award size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No certificates or work samples attached yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PORTFOLIO PROJECTS */}
        {activeTab === 'portfolio' && (
          <div>
            {profile.portfolio_url && (
              <div className="card" style={{
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: 'var(--bg-surface-elevated)',
                border: '1.5px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <ExternalLink size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Freelancer Portfolio & Work Hub</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      {profile.portfolio_url}
                    </p>
                  </div>
                </div>
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <span>Visit Portfolio</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {profile.portfolio && profile.portfolio.length > 0 ? (
              <div className="grid-2">
                {profile.portfolio.map((item) => (
                  <div key={item.id} className="card">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                      />
                    )}
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                    {item.project_url && (
                      <a href={item.project_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ gap: '0.3rem' }}>
                        <span>View Project</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !profile.portfolio_url && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No portfolio items uploaded yet (Optional).</p>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 4: CLIENT REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="card">
            {profile.reviews && profile.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {profile.reviews.map((rev) => (
                  <div key={rev.id} style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{rev.client_name || 'Student Client'}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-amber)' }}>
                        <Star size={14} fill="var(--accent-amber)" />
                        <strong style={{ fontSize: '0.9rem' }}>{rev.overall_rating}.0</strong>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                      "{rev.review_text}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No reviews received yet. Deliver great work to earn 5-star ratings!</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 460, width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Report Freelancer</h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {reportSubmitted ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 700 }}>Report submitted to campus moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div className="form-group">
                  <label className="form-label">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="select"
                  >
                    <option value="UNPROFESSIONAL_BEHAVIOR">Unprofessional Behavior</option>
                    <option value="MISLEADING_SKILLS">Misleading Skills or Fake Work</option>
                    <option value="PLAGIARISM">Plagiarized Deliverables</option>
                    <option value="HARASSMENT">Harassment or Abuse</option>
                    <option value="OTHER">Other Issue</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Details / Evidence</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what occurred with this student..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="textarea"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger" style={{ flex: 2, justifyContent: 'center' }}>
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Choose / Change Profile Photo Modal */}
      {profile && (
        <ChooseProfilePhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          currentAvatar={profile.avatar_url}
          userName={profile.name}
          onSuccess={(newAvatarUrl) => {
            setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
          }}
        />
      )}

      {/* Appoint Freelancer & Direct Work Order Modal */}
      {showAppointModal && profile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 580, width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-2xl)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Appoint {profile.name} & Give Work</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Define project specifications, set your budget & time limits, and open direct live chat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAppointModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAppointSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build React Landing Page or Redesign Logo"
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Project Details & Requirements *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain exactly what you need the student freelancer to create, deadlines, format requirements, etc."
                  value={workExplanation}
                  onChange={(e) => setWorkExplanation(e.target.value)}
                  className="input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Budget (₹ INR) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={workBudget}
                    onChange={(e) => setWorkBudget(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time Limit (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={workDays}
                    onChange={(e) => setWorkDays(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Reference Material / Document (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setWorkRefFile(e.target.files[0])}
                  className="input"
                  style={{ padding: '0.4rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                  Attach wireframes, PDFs, project briefs, or screenshots.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAppointModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  {submittingWork ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                  <span>Appoint Work & Open Live Chat</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

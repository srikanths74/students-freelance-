import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Send,
  Paperclip,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  RotateCcw,
  Star,
  Award,
  ArrowLeft,
  Loader2,
  FileCode,
  PackageCheck,
  XCircle,
  Lock,
  Flag,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import StatusStepper from '../components/StatusStepper';
import ReviewModal from '../components/ReviewModal';
import ReportModal from '../components/ReportModal';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function ProjectDetail({ projectId, onNavigate }) {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  // Modals & Action States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Submission Form
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);

  const handleRequestClarification = () => {
    const clarificationText = "Hi! Could you please clarify a few requirements regarding this project so I can deliver the best results?";
    setNewMessage(clarificationText);
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Real-Time Socket.io Chat Listener with Deduplication
  useEffect(() => {
    if (socket && projectId) {
      socket.emit('join_project', projectId);

      const handleNewMessage = (msg) => {
        if (Number(msg.project_id) === Number(projectId)) {
          setMessages((prev) => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, projectId]);

  // Reliable Polling Fallback (syncs any missed messages every 4s)
  useEffect(() => {
    if (!projectId) return;
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('campusgig_token');
        if (!token) return;
        const res = await fetch(`/api/chat/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (data.messages.length !== prev.length) {
              return data.messages;
            }
            return prev;
          });
        }
      } catch (err) {
        // silent background poll
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [projectId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setMessages(data.messages || []);
        scrollToBottom();
      } else {
        alert(data.message || 'Unable to access project');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send Text Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      const res = await fetch(`/api/chat/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        // 1. Immediately append message locally so user sees it right away
        setMessages((prev) => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();

        // 2. Broadcast via socket to notify receiver
        if (socket && socket.connected) {
          socket.emit('send_message', data.message);
        }
      } else {
        setNewMessage(content);
        alert(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setNewMessage(content);
      console.error('Send message error:', err);
      alert('Network error sending message: ' + err.message);
    } finally {
      setSendingMessage(false);
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  };

  // Upload Chat Attachment
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', `Shared file: ${file.name}`);

    try {
      const res = await fetch(`/api/chat/${projectId}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();
        if (socket && socket.connected) {
          socket.emit('send_message', data.message);
        }
      } else {
        alert(data.message || 'File upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Status Action Handler
  const handleStatusTransition = async (newStatus, extra = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ status: newStatus, ...extra })
      });
      const data = await res.json();
      if (data.success) {
        refreshUser();
        fetchProject();
        if (newStatus === 'COMPLETED') {
          setShowReviewModal(true);
        }
      } else {
        alert(data.message || 'Status transition failed');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
      setShowSubmitModal(false);
      setShowRevisionModal(false);
    }
  };

  // Handle Deliverables Submission Form
  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!submissionNotes.trim() && !submissionFile) {
      alert('Please provide deliverable notes or attach your project files.');
      return;
    }

    setActionLoading(true);
    let fileUrl = null;
    let fileName = null;

    if (submissionFile) {
      const formData = new FormData();
      formData.append('file', submissionFile);
      formData.append('caption', `Final Deliverable Submission: ${submissionFile.name}`);

      try {
        const uploadRes = await fetch(`/api/chat/${projectId}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          fileUrl = uploadData.file.url;
          fileName = uploadData.file.name;
        }
      } catch (err) {
        console.error('Deliverable upload error:', err);
      }
    }

    handleStatusTransition('SUBMITTED', {
      submission_notes: submissionNotes,
      submission_file_url: fileUrl,
      submission_file_name: fileName
    });
  };

  if (loading) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading project workstation...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Project Not Found or Access Denied</h2>
        <button onClick={() => onNavigate('dashboard-client')} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isClient = user && Number(project.client_id) === Number(user.id);
  const isFreelancer = user && Number(project.freelancer_id) === Number(user.id);
  const otherParty = isClient ? project.freelancer : project.client;

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => onNavigate(isFreelancer ? 'dashboard-freelancer' : 'dashboard-client')}
          className="btn btn-sm btn-secondary"
          style={{ marginBottom: '1rem', gap: '0.4rem', border: 'none', background: 'transparent' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {/* Project Header Card */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>PROJECT #{project.id}</span>
                <span className="badge badge-verified" style={{ fontSize: '0.72rem', gap: '0.3rem' }}>
                  <ShieldCheck size={12} />
                  <span>Direct Campus Order</span>
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{project.title}</h1>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Collaborating with: <strong style={{ color: 'var(--text-main)' }}>{otherParty?.name}</strong> ({isClient ? 'Freelancer' : 'Client'})
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECT BUDGET</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>₹{project.budget}</div>
              </div>
              <button
                type="button"
                onClick={() => setReportTarget({ targetType: 'project', targetId: project.id, targetName: project.title })}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.72rem', gap: '0.3rem', color: 'var(--accent-rose)', border: 'none', background: 'transparent', padding: '0.2rem 0.5rem' }}
              >
                <Flag size={12} />
                <span>Report Project</span>
              </button>
            </div>
          </div>

          {/* Workflow Status Stepper */}
          <StatusStepper status={project.status} />

          {/* ACTION BUTTONS TOOLBAR BASED ON ROLE & STATUS */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <strong>Next Action:</strong>
              {project.status === 'REQUESTED' && (
                <span style={{ color: 'var(--accent-amber)' }}>
                  {isFreelancer ? 'Review project request details and accept to start.' : 'Waiting for student freelancer to accept your request.'}
                </span>
              )}
              {project.status === 'ACCEPTED' && (
                <span style={{ color: 'var(--primary)' }}>
                  {isFreelancer ? 'Project accepted! Ready to begin development.' : 'Freelancer accepted! Project in progress.'}
                </span>
              )}
              {project.status === 'IN_PROGRESS' && (
                <span style={{ color: 'var(--primary)' }}>
                  {isFreelancer ? 'Project is in progress. Submit deliverables when ready.' : 'Student freelancer is working on your project.'}
                </span>
              )}
              {project.status === 'SUBMITTED' && (
                <span style={{ color: 'var(--accent-emerald)' }}>
                  {isClient ? 'Deliverables submitted! Review files below to approve or request revision.' : 'Deliverables sent! Awaiting client review.'}
                </span>
              )}
              {project.status === 'REVISION' && (
                <span style={{ color: 'var(--accent-rose)' }}>
                  {isFreelancer ? 'Client requested revisions. Check revision notes and resubmit.' : 'Revision requested. Awaiting updated submission.'}
                </span>
              )}
              {project.status === 'COMPLETED' && (
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  🎉 Project successfully completed!
                </span>
              )}
            </div>

            {/* Role-Specific Action Triggers */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              
              {/* FREELANCER: Accept / Reject on REQUESTED */}
              {isFreelancer && project.status === 'REQUESTED' && (
                <>
                  <button
                    onClick={() => handleStatusTransition('REJECTED')}
                    disabled={actionLoading}
                    className="btn btn-sm btn-danger"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleStatusTransition('ACCEPTED')}
                    disabled={actionLoading}
                    className="btn btn-sm btn-success"
                    style={{ gap: '0.35rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Accept Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestClarification}
                    className="btn btn-sm btn-secondary"
                    style={{ gap: '0.35rem' }}
                    title="Ask client for more details in workstation chat"
                  >
                    <HelpCircle size={14} />
                    <span>Request Clarification</span>
                  </button>
                </>
              )}

              {/* FREELANCER: Start work on ACCEPTED */}
              {isFreelancer && project.status === 'ACCEPTED' && (
                <>
                  <button
                    onClick={() => handleStatusTransition('IN_PROGRESS')}
                    disabled={actionLoading}
                    className="btn btn-sm btn-primary"
                    style={{ gap: '0.35rem' }}
                  >
                    <Clock size={15} />
                    <span>Start Project (Set IN PROGRESS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestClarification}
                    className="btn btn-sm btn-secondary"
                    style={{ gap: '0.35rem' }}
                  >
                    <HelpCircle size={14} />
                    <span>Request Clarification</span>
                  </button>
                </>
              )}

              {/* FREELANCER: Submit Deliverables on IN_PROGRESS or REVISION */}
              {isFreelancer && (project.status === 'IN_PROGRESS' || project.status === 'REVISION') && (
                <>
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    disabled={actionLoading}
                    className="btn btn-sm btn-primary"
                    style={{ gap: '0.35rem' }}
                  >
                    <PackageCheck size={15} />
                    <span>Submit Work Deliverables</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestClarification}
                    className="btn btn-sm btn-secondary"
                    style={{ gap: '0.35rem' }}
                  >
                    <HelpCircle size={14} />
                    <span>Request Clarification</span>
                  </button>
                </>
              )}

              {/* CLIENT: Approve or Request Revision on SUBMITTED */}
              {isClient && project.status === 'SUBMITTED' && (
                <>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    disabled={actionLoading}
                    className="btn btn-sm btn-secondary"
                    style={{ gap: '0.35rem' }}
                  >
                    <RotateCcw size={14} />
                    <span>Request Revision</span>
                  </button>
                  <button
                    onClick={() => handleStatusTransition('COMPLETED')}
                    disabled={actionLoading}
                    className="btn btn-sm btn-success"
                    style={{ gap: '0.35rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve & Complete Project</span>
                  </button>
                </>
              )}

              {/* CLIENT: Mark Completed on active project */}
              {isClient && (project.status === 'IN_PROGRESS' || project.status === 'REVISION') && (
                <button
                  onClick={() => handleStatusTransition('COMPLETED')}
                  disabled={actionLoading}
                  className="btn btn-sm btn-success"
                  style={{ gap: '0.35rem' }}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark Completed</span>
                </button>
              )}

              {/* CLIENT: Leave Review on COMPLETED */}
              {isClient && project.status === 'COMPLETED' && !project.review && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-sm btn-primary"
                  style={{ gap: '0.35rem' }}
                >
                  <Star size={15} fill="currentColor" />
                  <span>Leave Review & Rating</span>
                </button>
              )}

            </div>
          </div>
        </div>

        {/* 2-Column Workstation Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Requirements, Scope, Submission Deliverables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Project Scope & Requirements Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Project Specifications</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '1rem' }}>
                {project.description}
              </div>

              {project.requirements && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    KEY REQUIREMENTS
                  </strong>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                    {project.requirements}
                  </div>
                </div>
              )}

              {project.reference_file_url && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.85rem' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Reference Files & Attachments
                  </strong>
                  <a
                    href={project.reference_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-secondary"
                    style={{ gap: '0.45rem', fontSize: '0.82rem', display: 'inline-flex' }}
                  >
                    <Download size={14} />
                    <span>Download {project.reference_file_name || 'Attached Specification File'}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Deliverable Submission Box (If submitted) */}
            {project.submission_notes && (
              <div className="card" style={{ borderColor: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  <PackageCheck size={18} />
                  <span>Final Deliverables</span>
                </div>

                <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {project.submission_notes}
                </p>

                {project.submission_file_url && (
                  <a
                    href={project.submission_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-secondary"
                    style={{ width: '100%', gap: '0.4rem', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                    <span>Download {project.submission_file_name || 'Deliverable Files'}</span>
                  </a>
                )}
              </div>
            )}

            {/* Revision Notes Box (If in revision) */}
            {project.revision_notes && project.status === 'REVISION' && (
              <div className="card" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--accent-rose)', fontWeight: 700 }}>
                  <RotateCcw size={18} />
                  <span>Revision Requested</span>
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {project.revision_notes}
                </p>
              </div>
            )}

            {/* Escrow Details */}
            <div className="card" style={{ fontSize: '0.825rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Escrow Protection</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Contract Budget:</span>
                  <strong style={{ color: 'var(--text-main)' }}>₹{project.budget}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status:</span>
                  <span style={{ color: project.escrow_funded ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 600 }}>
                    {project.status === 'COMPLETED' ? 'RELEASED TO FREELANCER' : project.escrow_funded ? 'LOCKED IN ESCROW' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Real-Time Project Live Chat */}
          <div className="card" style={{ minHeight: 500, height: 'calc(100vh - 220px)', maxHeight: 680, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            
            {/* Chat Top Bar */}
            <div style={{
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={getProfessionalAvatar(otherParty)}
                  alt={otherParty?.name}
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)' }}
                />
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block' }}>{otherParty?.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>● Online in Project Workstation</span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                End-to-End Real-Time Chat
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map((m) => {
                if (m.is_system) {
                  return (
                    <div key={m.id} style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.3rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        {m.content}
                      </span>
                    </div>
                  );
                }

                const isMe = Number(m.sender_id) === Number(user?.id);

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      padding: '0.65rem 0.95rem',
                      borderRadius: 'var(--radius-lg)',
                      background: isMe ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                      color: isMe ? '#ffffff' : 'var(--text-main)',
                      border: isMe ? 'none' : '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div>{m.content}</div>

                      {/* File Attachment Card if attached */}
                      {m.attachment_url && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          background: isMe ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-surface)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          fontSize: '0.78rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                            <FileText size={14} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {m.attachment_name || 'Attached File'}
                            </span>
                          </div>
                          <a
                            href={m.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: isMe ? '#fff' : 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}
                          >
                            <Download size={13} />
                          </a>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 2, padding: '0 4px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isMe && (
                        <button
                          type="button"
                          title="Report Message"
                          onClick={() => setReportTarget({ targetType: 'message', targetId: m.id, targetName: `Message: "${(m.content || '').slice(0, 30)}..."` })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                        >
                          <Flag size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '0.85rem 1rem',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                flexShrink: 0
              }}
            >
              {/* File Attachment Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx,.png,.jpg,.jpeg,.fig"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="btn btn-sm btn-secondary"
                style={{ width: 40, height: 40, padding: 0, borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                title="Attach project file / reference"
              >
                {uploadingFile ? <Loader2 size={16} className="spin" /> : <Paperclip size={16} />}
              </button>

              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type a message or project update... (Press Enter to send)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sendingMessage}
                className="input"
                style={{ flex: 1, height: 40, fontSize: '0.875rem' }}
              />

              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="btn btn-primary"
                style={{
                  height: 40,
                  padding: '0 1.25rem',
                  gap: '0.4rem',
                  borderRadius: 'var(--radius-md)',
                  flexShrink: 0,
                  fontWeight: 700
                }}
              >
                {sendingMessage ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                <span>Send</span>
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* SUBMIT DELIVERABLE MODAL */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Submit Completed Deliverables</h3>
              <button onClick={() => setShowSubmitModal(false)} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>✕</button>
            </div>
            <form onSubmit={handleSubmitDeliverable}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Submission Notes & Demo Summary</label>
                  <textarea
                    required
                    placeholder="Describe the completed work, demo links, preview instructions, or credentials..."
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    className="textarea"
                    style={{ minHeight: 100 }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Attach Project Deliverable Files (ZIP, PDF, DOCX, etc.)</label>
                  <input
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files[0])}
                    className="input"
                    style={{ padding: '0.45rem' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-success btn-sm">
                  {actionLoading ? <Loader2 size={16} className="spin" /> : 'Submit for Client Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST REVISION MODAL */}
      {showRevisionModal && (
        <div className="modal-overlay" onClick={() => setShowRevisionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Request Revision</h3>
              <button onClick={() => setShowRevisionModal(false)} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleStatusTransition('REVISION', { revision_notes: revisionNotes }); }}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Explain What Needs Adjustment</label>
                  <textarea
                    required
                    placeholder="e.g. Please change the headline font, update the color palette to match our brand, or fix the registration form validation..."
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    className="textarea"
                    style={{ minHeight: 110 }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRevisionModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">Send Revision Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & RATING MODAL */}
      {showReviewModal && (
        <ReviewModal
          project={project}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => fetchProject()}
        />
      )}

      {/* REPORT MODAL */}
      {reportTarget && (
        <ReportModal
          targetType={reportTarget.targetType}
          targetId={reportTarget.targetId}
          targetName={reportTarget.targetName}
          onClose={() => setReportTarget(null)}
        />
      )}

    </div>
  );
}

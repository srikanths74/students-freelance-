import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Send,
  Lock,
  RotateCcw,
  Flag,
  ArrowLeft,
  Loader2,
  MessageSquare,
  FileText,
  ExternalLink,
  Award,
  Download
} from 'lucide-react';
import AIDescriptionModal from '../components/AIDescriptionModal';
import ReportModal from '../components/ReportModal';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function ServiceDetail({ serviceId, onNavigate }) {
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [showHireModal, setShowHireModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectRequirements, setProjectRequirements] = useState('');
  const [projectBudget, setProjectBudget] = useState(1500);
  const [deadlineDays, setDeadlineDays] = useState(3);
  const [referenceFile, setReferenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services/${serviceId}`);
      const data = await res.json();
      if (data.success) {
        setService(data.service);
        setProjectBudget(data.service.starting_price);
        setDeadlineDays(data.service.delivery_days || 3);
        setProjectTitle(`Custom Request for: ${data.service.title.substring(0, 40)}...`);
      }
    } catch (err) {
      console.error('Failed to load service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAIGeneration = (generated) => {
    if (generated.title) setProjectTitle(generated.title);
    if (generated.description) setProjectDescription(generated.description);
    if (generated.requirements) setProjectRequirements(generated.requirements);
    if (generated.suggestedBudget) setProjectBudget(generated.suggestedBudget);
    if (generated.suggestedDays) setDeadlineDays(generated.suggestedDays);
  };

  const handleSendProjectRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!projectTitle || !projectBudget) {
      alert('Please provide a project title and budget.');
      return;
    }

    setSubmitting(true);
    try {
      let referenceFileUrl = null;
      let referenceFileName = null;

      // If user selected a reference attachment, upload first
      if (referenceFile) {
        const formData = new FormData();
        formData.append('file', referenceFile);
        const upRes = await fetch('/api/projects/upload-reference', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
          },
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
          service_id: service.id,
          freelancer_id: service.freelancer.id,
          title: projectTitle,
          description: projectDescription || service.title,
          requirements: projectRequirements,
          budget: Number(projectBudget),
          deadline_days: Number(deadlineDays),
          reference_file_url: referenceFileUrl,
          reference_file_name: referenceFileName
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowHireModal(false);
        setReferenceFile(null);
        onNavigate('project-detail', { projectId: data.project.id });
      } else {
        alert(data.message || 'Failed to send project request');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading gig details...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Service not found</h2>
        <button onClick={() => onNavigate('explore')} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Back to Explore
        </button>
      </div>
    );
  }

  const skills = (service.skills_csv || '').split(',').map(s => s.trim()).filter(Boolean);
  const freelancer = service.freelancer;

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Back navigation */}
        <button
          onClick={() => onNavigate('explore')}
          className="btn btn-sm btn-secondary"
          style={{ marginBottom: '1.5rem', gap: '0.4rem', border: 'none', background: 'transparent' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Gigs</span>
        </button>

        {/* 2-Column Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Service Showcase, Description, Reviews */}
          <div>
            
            {/* Category Tag & Title */}
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.65rem' }}>
                {service.category?.name || 'General'}
              </span>
              <h1 style={{ fontSize: '2rem', lineHeight: 1.3, fontWeight: 800 }}>
                {service.title}
              </h1>
            </div>

            {/* Freelancer Header Snippet */}
            {freelancer && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  onClick={() => onNavigate('profile', { userId: freelancer.id })}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                >
                  <img
                    src={getProfessionalAvatar(freelancer)}
                    alt={freelancer.name}
                    style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.98rem' }}>
                      <span>{freelancer.name}</span>
                      {freelancer.is_verified_student === 1 && (
                        <UserCheck size={16} color="var(--accent-emerald)" title="Campus Verified Student" />
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {freelancer.year_of_study} • {freelancer.department} ({freelancer.college})
                    </div>
                  </div>
                </div>

                {/* Freelancer Verified Credentials & Proofs for Client */}
                {(freelancer.resume_url || freelancer.portfolio_url) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                    {freelancer.resume_url && (
                      <a
                        href={freelancer.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', gap: '0.3rem' }}
                      >
                        <FileText size={12} />
                        <span>Download Student CV</span>
                      </a>
                    )}
                    {freelancer.portfolio_url && (
                      <a
                        href={freelancer.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', gap: '0.3rem' }}
                      >
                        <ExternalLink size={12} />
                        <span>Visit Portfolio</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate('profile', { userId: freelancer.id })}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', color: 'var(--primary)' }}
                    >
                      <span>View Verified Credentials</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cover Image */}
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: 380, marginBottom: '2rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-elevated)' }}>
              <img
                src={service.cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'}
                alt=""
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Gig Description */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>About this Service Gig</h3>
              <div style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {service.description}
              </div>

              {/* Skills Tags */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  TECHNOLOGIES & SKILLS
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {skills.map((sk, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Freelancer Portfolio Highlights */}
            {freelancer && freelancer.portfolio && freelancer.portfolio.length > 0 && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Previous Portfolio Work</h3>
                <div className="grid-2">
                  {freelancer.portfolio.map((p) => (
                    <div key={p.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 130, objectFit: 'cover' }} />
                      <div style={{ padding: '0.75rem' }}>
                        <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.2rem' }}>{p.title}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Criteria Reviews Section */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Student Client Reviews</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {service.rating_avg > 0 ? (
                      <>
                        <Star size={16} color="var(--accent-amber)" fill="var(--accent-amber)" />
                        <strong style={{ fontSize: '1.05rem' }}>{service.rating_avg.toFixed(1)}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({freelancer?.reviews?.length || 0} reviews)</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>New Gig (No reviews yet)</span>
                    )}
                  </div>
                </div>
              </div>

              {freelancer && freelancer.reviews && freelancer.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {freelancer.reviews.map((r) => (
                    <div key={r.id} style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img
                            src={getProfessionalAvatar(r.reviewer_avatar || r.reviewer_name)}
                            alt={r.reviewer_name}
                            style={{ width: 28, height: 28, borderRadius: '50%' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{r.reviewer_name}</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.reviewer_college}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 700 }}>
                            <Star size={14} fill="var(--accent-amber)" />
                            <span>{r.overall_rating}.0</span>
                          </div>
                          <button
                            type="button"
                            title="Report this Review"
                            onClick={() => setReportTarget({ targetType: 'review', targetId: r.id, targetName: `Review by ${r.reviewer_name}` })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                          >
                            <Flag size={12} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        "{r.comment || 'Great experience working with this student!'}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No reviews yet for this student gig. Be the first to hire!
                </div>
              )}
            </div>

            {/* Report Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setReportTarget({ targetType: 'service', targetId: service.id, targetName: service.title })}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', gap: '0.35rem', color: 'var(--accent-rose)', border: 'none', background: 'transparent' }}
              >
                <Flag size={13} />
                <span>Report this Gig</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Order & Hire Pricing Box */}
          <div style={{ position: 'sticky', top: 90 }}>
            
            <div className="card" style={{ boxShadow: 'var(--shadow-xl)', borderColor: 'var(--primary-glow)' }}>
              
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>STARTING PRICE</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{service.starting_price}
                </span>
              </div>

              {/* Service Meta Specs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Clock size={16} color="var(--primary)" />
                  <span><strong>{service.delivery_days} Days</strong> Delivery</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <RotateCcw size={16} color="var(--secondary)" />
                  <span><strong>2 Free Revisions</strong> Included</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                  <ShieldCheck size={16} />
                  <span><strong>Simulated Escrow</strong> Protected</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => {
                  if (!user) {
                    onNavigate('login');
                    return;
                  }
                  setShowHireModal(true);
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '0.75rem', gap: '0.5rem' }}
              >
                <Send size={16} />
                <span>{user ? 'Hire Student / Request' : 'Sign In to Hire'}</span>
              </button>

              <button
                onClick={() => {
                  if (freelancer) onNavigate('profile', { userId: freelancer.id });
                }}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                View Full Profile & Reviews
              </button>

              {/* Escrow Guarantee Notice */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Lock size={14} color="var(--accent-emerald)" />
                <span>Payment is held safely in escrow and only released when you approve the final submission.</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* HIRE / PROJECT REQUEST MODAL */}
      {showHireModal && (
        <div className="modal-overlay" onClick={() => setShowHireModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Send Project Request</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Hiring: {freelancer?.name} • Service: {service.title.substring(0, 32)}...
                </p>
              </div>
              <button onClick={() => setShowHireModal(false)} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendProjectRequest}>
              <div className="modal-body">
                
                {/* AI Assistant Shortcut Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px dashed rgba(168, 85, 247, 0.4)'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Need help drafting requirements?</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI can generate milestones, scope & tech stack</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAIModal(true)}
                    className="btn btn-sm btn-ai"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Sparkles size={13} />
                    <span>AI Generator</span>
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. College Symposium Responsive Website"
                    className="input"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Budget (₹ INR)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={projectBudget}
                      onChange={(e) => setProjectBudget(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Deadline (Days)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Description & Scope</label>
                  <textarea
                    required
                    placeholder="Describe what you need built, required features, pages, or visual styles..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="textarea"
                    style={{ minHeight: 90 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specific Requirements / Deliverable Notes</label>
                  <textarea
                    placeholder="e.g. Must include source Figma/code files, mobile responsive, deliver before Friday..."
                    value={projectRequirements}
                    onChange={(e) => setProjectRequirements(e.target.value)}
                    className="textarea"
                    style={{ minHeight: 70 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Reference Files & Attachments (PDF, Doc, Images, Specifications)</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Optional</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt"
                    onChange={(e) => setReferenceFile(e.target.files[0] || null)}
                    className="input"
                    style={{ padding: '0.4rem' }}
                  />
                  {referenceFile && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
                      ✓ Attached: {referenceFile.name} ({(referenceFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="button" onClick={() => setShowHireModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm" style={{ minWidth: 140 }}>
                  {submitting ? <Loader2 size={16} className="spin" /> : 'Send Request'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* AI Description Generator Modal */}
      {showAIModal && (
        <AIDescriptionModal
          initialPrompt={service.title}
          onClose={() => setShowAIModal(false)}
          onApply={handleApplyAIGeneration}
        />
      )}

      {/* Report Modal */}
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

import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  Award,
  Check,
  MessageSquare
} from 'lucide-react';
import { getProfessionalAvatar } from '../utils/defaultAvatars';
import confetti from 'canvas-confetti';

export default function ViewApplicantsModal({ project, onClose, onProposalAccepted, onNavigate }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (project?.id) {
      loadProposals();
    }
  }, [project]);

  const loadProposals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${project.id}/proposals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals || []);
      } else {
        setError(data.message || 'Failed to fetch applicants.');
      }
    } catch (err) {
      setError(err.message || 'Error loading applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    setAcceptingId(proposalId);
    setError('');
    try {
      const res = await fetch(`/api/projects/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Proposal accepted! The student has been hired and escrow funded. 🎉');
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        if (onProposalAccepted) onProposalAccepted(data);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setError(data.message || 'Failed to accept proposal.');
      }
    } catch (err) {
      setError(err.message || 'Error accepting proposal.');
    } finally {
      setAcceptingId(null);
    }
  };

  if (!project) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: 720,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: 'var(--shadow-2xl)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(10, 95, 214, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Users size={12} />
              <span>Applicant Review</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
              Candidates for: {project.title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              Budget: ₹{project.budget} • Required Time: {project.deadline_days || 3} Days
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-rose-light)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--accent-rose)',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-emerald-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--accent-emerald)',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="spin" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.88rem' }}>Loading candidate proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)'
          }}>
            <Users size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem', opacity: 0.6 }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              No Proposals Submitted Yet
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto' }}>
              Your project is live on the public job board! As student freelancers discover and apply, their proposals, pricing, and turnaround times will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {proposals.map((prop) => {
              const fl = prop.freelancer || {};
              const isAccepted = prop.status === 'ACCEPTED';
              return (
                <div
                  key={prop.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: isAccepted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-elevated)',
                    border: isAccepted ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={getProfessionalAvatar(fl)}
                        alt={fl.name}
                        style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                            {fl.name || 'Student Candidate'}
                          </h4>
                          {isAccepted && (
                            <span className="badge badge-verified" style={{ fontSize: '0.68rem', gap: '0.2rem' }}>
                              <Check size={10} /> Hired
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                          {fl.college || 'Engineering College'} • {fl.department || 'Student'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{prop.bid_amount}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ⏱️ {prop.delivery_days} Days Delivery
                        </div>
                      </div>

                      {project.status === 'OPEN' && !isAccepted && (
                        <button
                          type="button"
                          disabled={acceptingId !== null}
                          onClick={() => handleAcceptProposal(prop.id)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '0.35rem', fontWeight: 700 }}
                        >
                          {acceptingId === prop.id ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          <span>Hire &amp; Accept</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Proposal Pitch Note */}
                  <div style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    color: 'var(--text-main)'
                  }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                      Candidate's Proposal Pitch:
                    </strong>
                    {prop.pitch || 'No proposal note provided.'}
                  </div>

                  {/* Links / Portfolio Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      {fl.portfolio_url && (
                        <a
                          href={fl.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-emerald)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                        >
                          <ExternalLink size={12} />
                          <span>View Portfolio</span>
                        </a>
                      )}
                      {onNavigate && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate('profile', { userId: fl.id });
                          }}
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
                        >
                          View Full Profile
                        </button>
                      )}
                    </div>

                    <span>Applied: {new Date(prop.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

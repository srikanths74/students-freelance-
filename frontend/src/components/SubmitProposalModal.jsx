import React, { useState } from 'react';
import {
  Send,
  DollarSign,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SubmitProposalModal({ project, onClose, onProposalSubmitted }) {
  const [bidAmount, setBidAmount] = useState(project?.budget || 800);
  const [deliveryDays, setDeliveryDays] = useState(project?.deadline_days || 3);
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount || Number(bidAmount) <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }
    if (!pitch.trim() || pitch.trim().length < 20) {
      setError('Please write at least 20 characters explaining how you can help with this project.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/projects/${project.id}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          bid_amount: Number(bidAmount),
          delivery_days: Number(deliveryDays) || 3,
          pitch: pitch.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Proposal submitted successfully! The client has been notified. 🎯');
        try {
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
        } catch (e) {}
        if (onProposalSubmitted) onProposalSubmitted(data.proposal);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to submit proposal.');
      }
    } catch (err) {
      setError(err.message || 'Network error submitting proposal.');
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: 580,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: 'var(--shadow-2xl)',
        position: 'relative',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(10, 95, 214, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Briefcase size={12} />
              <span>Project Application</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
              Apply for Project
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Project Target Summary Card */}
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            {project.title}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
            {project.description || project.requirements}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: 700 }}>
              <DollarSign size={13} />
              <span>Client Budget: ₹{project.budget}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Clock size={13} />
              <span>Target: {project.deadline_days || 3} Days</span>
            </div>
            {project.client?.college && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                <span>🏫 {project.client.college}</span>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-rose-light)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--accent-rose)',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
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
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Bid Amount & Days */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <DollarSign size={14} style={{ color: 'var(--primary)' }} />
                <span>Your Bid Amount (₹)</span>
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="input"
                placeholder="e.g. 800"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Match client's ₹{project.budget} or adjust
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} style={{ color: 'var(--accent-amber)' }} />
                <span>Delivery Time (Days)</span>
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="input"
                placeholder="e.g. 3"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Estimated turnaround time
              </span>
            </div>
          </div>

          {/* Proposal / Pitch */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={14} style={{ color: 'var(--primary)' }} />
                <span>Your Pitch & Proposal Note</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {pitch.length} chars (min 20)
              </span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain why you're a great fit for this project! Mention relevant course projects, tools you use (e.g. Figma, React, Python), and your approach to finishing on time..."
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="textarea"
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ gap: '0.45rem', minWidth: 160 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, X, Check, Loader2, Sparkles } from 'lucide-react';

export default function ReviewModal({ project, onClose, onReviewSubmitted }) {
  const [overall, setOverall] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [quality, setQuality] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          project_id: project.id,
          overall_rating: overall,
          communication_rating: communication,
          quality_rating: quality,
          timeliness_rating: timeliness,
          comment
        })
      });

      const data = await res.json();
      if (data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        if (onReviewSubmitted) onReviewSubmitted(data.review);
        onClose();
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('Error submitting review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentVal, setter) => {
    return (
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setter(star)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Star
              size={24}
              color="var(--accent-amber)"
              fill={star <= currentVal ? 'var(--accent-amber)' : 'transparent'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550 }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(13, 148, 136, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)'
            }}>
              <Star size={20} fill="var(--accent-amber)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Rate Student Freelancer</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Leave feedback for {project.freelancer?.name || 'the freelancer'} on "{project.title}"
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Overall Rating */}
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>Overall Experience</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>How satisfied were you with the final result?</span>
              </div>
              {renderStars(overall, setOverall)}
            </div>

            {/* Criteria Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              
              {/* Communication */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Communication & Responsiveness:</span>
                {renderStars(communication, setCommunication)}
              </div>

              {/* Quality */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Quality of Work & Accuracy:</span>
                {renderStars(quality, setQuality)}
              </div>

              {/* Timeliness */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Timeliness & Delivery:</span>
                {renderStars(timeliness, setTimeliness)}
              </div>

            </div>

            {/* Written Comment */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Review Commentary (Optional)</label>
              <textarea
                placeholder="Describe your experience working with this student (e.g. delivered ahead of deadline, clean code, great poster design)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="textarea"
                style={{ minHeight: 90 }}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm" style={{ minWidth: 140, gap: '0.4rem' }}>
              {submitting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
              <span>{submitting ? 'Publishing...' : 'Publish Review'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

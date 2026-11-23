import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function ReportModal({ targetType, targetId, targetName, onClose }) {
  const [reason, setReason] = useState('Spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    'Spam',
    'Fraud',
    'Inappropriate Content',
    'Fake Profile',
    'Abusive Behaviour',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          target_name: targetName,
          reason,
          details
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || 'Report submission failed');
      }
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-rose)'
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>Report Content or User</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {targetName || targetType}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={42} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Report Received</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Thank you for keeping CampusGig safe. Our admin moderation team will investigate this promptly.
              </p>
              <button onClick={onClose} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="select"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Details / Evidence</label>
                <textarea
                  placeholder="Provide context or explanation for this report..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="textarea"
                  style={{ minHeight: 90 }}
                />
              </div>

              <div className="modal-footer" style={{ padding: '0.75rem 0 0', borderTop: 'none' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-danger btn-sm">
                  {submitting ? <Loader2 size={16} className="spin" /> : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

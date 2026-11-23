import React, { useState } from 'react';
import { Sparkles, X, Loader2, Check, ArrowRight } from 'lucide-react';

export default function AIDescriptionModal({ onClose, onApply, initialPrompt = '' }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.success) {
        setGenerated(data.generated);
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePlan = () => {
    if (generated && onApply) {
      onApply(generated);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
        
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'var(--ai-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>AI Project Specification Generator</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Turn a short idea into a complete, professional project scope & deliverables plan
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Brief Project Idea / Request</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="e.g. Need responsive website for college symposium"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="btn btn-ai"
                style={{ minWidth: 120 }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                <span>Generate</span>
              </button>
            </div>
          </div>

          {generated && (
            <div className="card" style={{ background: 'var(--bg-surface-elevated)', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                  Generated Project Scope
                </span>
                <span className="badge badge-ai" style={{ fontSize: '0.72rem' }}>
                  Suggested Budget: ₹{generated.suggestedBudget} ({generated.suggestedDays} Days)
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'pre-line', lineHeight: 1.6, maxHeight: 220, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {generated.description}
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recommended Skills:</span>
                {generated.skillsRecommended.map((sk, idx) => (
                  <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          {generated && (
            <button onClick={handleUsePlan} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
              <Check size={16} />
              <span>Apply to Project Form</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

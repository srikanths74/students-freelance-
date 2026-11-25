import React, { useState } from 'react';
import { Sparkles, X, Search, Loader2, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import FreelancerCard from './FreelancerCard';

export default function AIRecommenderModal({ onClose, onSelectFreelancer }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const samplePrompts = [
    'I need someone to build a React website for our college symposium with schedule & registration.',
    'Need a modern Instagram poster & reel editor for our college cultural fest.',
    'Looking for a Python tutor to explain Binary Trees and Dynamic Programming.',
    'Need Figma mobile app UI/UX mockups and prototyping for our student startup.'
  ];

  const handleRecommend = async (queryText) => {
    const q = queryText || prompt;
    if (!q.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.recommendations);
      }
    } catch (err) {
      console.error('AI match error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 750, maxHeight: '85vh' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--ai-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px var(--ai-glow)'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>AI Freelancer Recommender</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Describe your project in natural language and find the best-matched student talent
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {/* Input Box */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="e.g. Need a React developer to build an event symposium portal with forms..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
                className="input"
                style={{ height: 48, fontSize: '0.95rem', paddingRight: '1rem' }}
              />
              <button
                onClick={() => handleRecommend()}
                disabled={loading || !prompt.trim()}
                className="btn btn-ai"
                style={{ height: 48, minWidth: 120 }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
                <span>{loading ? 'Matching...' : 'Find Match'}</span>
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                TRY EXAMPLES:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setPrompt(sp); handleRecommend(sp); }}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', textAlign: 'left', borderRadius: 'var(--radius-full)' }}
                  >
                    ✨ {sp.length > 40 ? sp.substring(0, 40) + '...' : sp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Container */}
          {results && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                  Top Recommended Students ({results.length})
                </span>
                <span className="badge badge-ai" style={{ fontSize: '0.72rem' }}>
                  Ranked by AI Compatibility Score
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map((rec) => (
                  <FreelancerCard
                    key={rec.user.id}
                    freelancer={rec}
                    aiScore={rec.aiScore}
                    relevanceReason={rec.relevanceReason}
                    matchedSkills={rec.matchedSkills}
                    onClick={() => onSelectFreelancer(rec.user.id)}
                    onHireClick={() => onSelectFreelancer(rec.user.id)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

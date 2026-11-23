import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Layers,
  DollarSign,
  Clock,
  FileText,
  Upload,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PostJobModal({ onClose, onJobCreated }) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [budget, setBudget] = useState('800');
  const [deadlineDays, setDeadlineDays] = useState('3');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/services/categories');
        const data = await res.json();
        if (data.success && data.categories?.length > 0) {
          setCategories(data.categories);
          setCategoryId(data.categories[0].id);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !budget) {
      setError('Please provide a project title, budget, and description.');
      return;
    }

    if (Number(budget) < 100) {
      setError('Minimum project budget must be at least ₹100.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId ? Number(categoryId) : null,
          budget: Number(budget),
          deadline_days: Number(deadlineDays) || 3,
          skills_required: skillsRequired.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Job posted successfully! Student freelancers can now submit proposals. 🚀');
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
        if (onJobCreated) onJobCreated(data.project);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to post public job.');
      }
    } catch (err) {
      setError(err.message || 'Network error creating job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div className="card" style={{
        maxWidth: 620,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem 2.25rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-2xl)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 4
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              Post a Public Project / Job
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Broadcast requirements to all verified campus student freelancers to receive competitive proposals
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-rose-light)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: 'var(--accent-rose)',
            fontSize: '0.84rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-emerald-light)',
            color: 'var(--accent-emerald)',
            fontSize: '0.84rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Project Title */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Project Headline / Title *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Need Logo Design for Campus Tech Fest & AI Club"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>

          {/* Category & Budget Grid */}
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input"
                disabled={categoriesLoading}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Budget (₹ INR) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--accent-emerald)' }}>₹</span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  placeholder="800"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.2rem' }}
                />
              </div>
            </div>
          </div>

          {/* Delivery Timeline & Required Skills Grid */}
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Required Delivery Timeline</label>
              <div style={{ position: 'relative' }}>
                <Clock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.4rem' }}
                >
                  <option value={1}>⚡ 1 Day (Urgent)</option>
                  <option value={2}>⏱️ 2 Days</option>
                  <option value={3}>📅 3 Days (Standard)</option>
                  <option value={5}>🗓️ 5 Days</option>
                  <option value={7}>📆 1 Week</option>
                  <option value={14}>🗓️ 2 Weeks</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Logo Design, Illustrator, Vector Art"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Project Description &amp; Deliverables *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe what you need built or designed, reference examples, specific formats needed (e.g. SVG, MP4, React components), and any constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
            />
          </div>

          {/* Escrow Guarantee Note */}
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <Sparkles size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Safe Escrow Protection:</strong> You only fund escrow when you review applicants and choose who to hire. No upfront deduction until you accept a student's proposal.
            </span>
          </div>

          {/* Buttons */}
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
              disabled={loading || !title.trim() || !description.trim()}
              className="btn btn-primary"
              style={{
                gap: '0.45rem',
                padding: '0.65rem 1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                borderColor: '#059669'
              }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
              <span>{loading ? 'Publishing…' : 'Publish Job Posting'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Briefcase,
  Layers,
  GraduationCap,
  CheckCircle2,
  Lock,
  MessageSquare
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import FreelancerCard from '../components/FreelancerCard';
import { getDesignationInfo } from '../utils/designationImages';
import AIRecommenderModal from '../components/AIRecommenderModal';

export default function Home({ onNavigate }) {
  const { user } = useAuth();
  const { siteSettings } = useSiteSettings();
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const catRes = await fetch('/api/services/categories');
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.categories);

      // Fetch featured services — deduplicate by freelancer so no name appears twice
      const sRes = await fetch('/api/services?sort=popular');
      const sData = await sRes.json();
      if (sData.success) {
        const seen = new Set();
        const unique = sData.services.filter(s => {
          const fid = s.freelancer?.id ?? s.freelancer_id;
          if (fid == null || seen.has(fid)) return false;
          seen.add(fid);
          return true;
        });
        setFeaturedServices(unique.slice(0, 6));
      }

      // Fetch top freelancers
      const aiRes = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'React developer and Figma designer for college fest' })
      });
      const aiData = await aiRes.json();
      if (aiData.success) setTopFreelancers(aiData.recommendations.slice(0, 3));
    } catch (err) {
      console.error('Home data load error:', err);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchPrompt.trim()) {
      onNavigate('explore', { search: searchPrompt.trim() });
    }
  };

  return (
    <div className="page-content" style={{ padding: '0 0 4rem', overflowX: 'hidden' }}>
      
      {/* 1. Hero Section */}
      <section style={{
        padding: '4.5rem 0 3.5rem',
        background: `
          radial-gradient(ellipse 80% 50% at 50% -12%, rgba(16, 185, 129, 0.18) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 85% 60%, rgba(52, 211, 153, 0.12) 0%, transparent 55%),
          linear-gradient(to right, rgba(16, 185, 129, 0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(16, 185, 129, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: 880 }}>

          {/* Dynamic Headline */}
          <h1 style={{
            fontSize: 'clamp(2.1rem, 5.2vw, 3.4rem)',
            lineHeight: 1.15,
            fontWeight: 900,
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
            wordBreak: 'break-word'
          }}>
            {siteSettings?.hero_headline ? (
              <>
                {siteSettings.hero_headline.split(' ').slice(0, -3).join(' ')}{' '}
                <span className="text-ai-gradient" style={{ display: 'inline-block' }}>
                  {siteSettings.hero_headline.split(' ').slice(-3).join(' ')}
                </span>
              </>
            ) : (
              <>
                Find Verified Student Help or{' '}
                <span className="text-ai-gradient" style={{ display: 'inline-block' }}>
                  Earn With Your Skills
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.08rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: 640,
            margin: '0 auto 2rem'
          }}>
            Instant neural skill matching, automated escrow protection, and top-tier college freelancers for software, design, editing, and academic projects.
          </p>

          {/* AI Search Box */}
          <form
            onSubmit={handleHeroSearch}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.45rem',
              gap: '0.45rem',
              maxWidth: 660,
              margin: '0 auto 1.5rem',
              boxShadow: '0 12px 36px var(--primary-glow)',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <Search size={18} style={{ marginLeft: 12, color: 'var(--primary)' }} />
            <input
              type="text"
              placeholder={siteSettings?.hero_search_placeholder || "Search: 'Web Design', 'Poster', 'Python', 'Video Editing'…"}
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                outline: 'none',
                padding: '0.5rem 0.65rem'
              }}
            />
            <button type="submit" className="btn btn-primary btn-md" style={{ padding: '0.6rem 1.35rem' }}>
              Search Gigs
            </button>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="btn btn-ai btn-md"
              title="Find best match with AI"
              style={{ padding: '0.6rem 1.25rem' }}
            >
              <Sparkles size={16} />
              <span>AI Match</span>
            </button>
          </form>

          {/* Quick Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.45rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Popular AI Searches:</span>
            {['Web Development', 'UI/UX Design', 'Python & AI', 'Video Editing', 'Poster Design', 'Tutoring'].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate('explore', { search: tag })}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.76rem', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.75rem', border: '1px solid var(--border-strong)' }}
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. High-Tech AI Stats Bar */}
      <section style={{ padding: '1.75rem 0', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900 }} className="text-ai-gradient">500+</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Verified Campus Talent</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>100%</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quantum Escrow Shield</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>₹1.2L+</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student Direct Earnings</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-amber)' }}>⚡ &lt; 2s</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Neural Match Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Gigs */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>Featured Gigs</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top-rated services ready to order</p>
            </div>
            <button onClick={() => onNavigate('explore')} className="btn btn-primary btn-sm">
              <span>View All Gigs</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid-3">
            {featuredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => onNavigate('service-detail', { serviceId: service.id })}
                onProfileClick={(userId) => onNavigate('profile', { userId })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Top Student Freelancers */}
      <section style={{ padding: '2.5rem 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>Top Student Freelancers</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Work with verified campus talent</p>
            </div>
            <button onClick={() => setShowAIModal(true)} className="btn btn-ai btn-sm">
              <Sparkles size={14} />
              <span>AI Match</span>
            </button>
          </div>

          <div className="grid-3">
            {topFreelancers.map((rec) => (
              <FreelancerCard
                key={rec.user.id}
                freelancer={rec}
                aiScore={rec.aiScore}
                relevanceReason={rec.relevanceReason}
                matchedSkills={rec.matchedSkills}
                onClick={() => onNavigate('profile', { userId: rec.user.id })}
                onHireClick={() => onNavigate('profile', { userId: rec.user.id })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works (4 Simple Steps) */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: 960, textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.4rem', fontSize: '0.75rem' }}>Simple Steps</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>How It Works</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.3rem auto 0' }}>
              4 simple steps to get your project done safely
            </p>
          </div>

          <div className="grid-4" style={{ textAlign: 'left' }}>
            
            {/* Step 1 */}
            <div className="card">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '0.85rem'
              }}>
                1
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                {siteSettings?.card_1_title || '1. Browse & Appoint'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {siteSettings?.card_1_desc || 'Explore student services, compare portfolios, or hire directly with custom requirements.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="card">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--secondary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '0.85rem'
              }}>
                2
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                {siteSettings?.card_2_title || '2. Safe Escrow'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {siteSettings?.card_2_desc || 'Your payment is held safely in escrow until you inspect and approve the work.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="card">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-amber)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '0.85rem'
              }}>
                3
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                {siteSettings?.card_3_title || '3. Chat & Work'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {siteSettings?.card_3_desc || 'Message your freelancer, share files, and review project drafts in real time.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="card">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '0.85rem'
              }}>
                4
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                {siteSettings?.card_4_title || '4. Approve & Pay'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {siteSettings?.card_4_desc || "Release payment to the student's wallet and leave a quality review."}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Call to Action Banner */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{
            background: 'var(--ai-gradient-subtle)',
            border: '1.5px solid var(--border-strong)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {siteSettings?.cta_banner_title || 'Want to Earn Money on Campus?'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 1.5rem' }}>
              {siteSettings?.cta_banner_desc || 'Offer your skills, get hired by fellow students, and build your portfolio.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  if (!user) {
                    onNavigate('login');
                    return;
                  }
                  onNavigate('dashboard-freelancer');
                }}
                className="btn btn-primary btn-lg"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                <span>{user ? 'Publish a Gig' : 'Sign In to Publish'}</span>
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className="btn btn-secondary btn-lg"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                Browse Gigs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Modal */}
      {showAIModal && (
        <AIRecommenderModal
          onClose={() => setShowAIModal(false)}
          onSelectFreelancer={(id) => {
            setShowAIModal(false);
            onNavigate('profile', { userId: id });
          }}
        />
      )}

    </div>
  );
}

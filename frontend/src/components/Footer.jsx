import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Footer({ onNavigate }) {
  const { siteSettings } = useSiteSettings();

  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      padding: '2.5rem 0 1.75rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.65rem' }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0A5FD6 0%, #1A7FE8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <GraduationCap size={16} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {siteSettings?.header_brand_title || 'CampusGig'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              {siteSettings?.footer_about_text || 'The student marketplace to find campus freelance help, build skills, and earn money.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              <ShieldCheck size={15} />
              <span>Safe Escrow Payments Active</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem' }}>Popular Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 1 }); }}>Web & App Development</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 2 }); }}>Posters & Graphic Design</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 3 }); }}>UI/UX Design</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 5 }); }}>Video Editing & Reels</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 7 }); }}>Peer Tutoring</a>
            </div>
          </div>

          {/* Col 3: Student Tools */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem' }}>Features</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 600 }}>
                <Sparkles size={13} />
                <span>AI Freelancer Match</span>
              </div>
              <span>Safe Escrow Wallet</span>
              <span>Project Chat & Files</span>
              <span>Verified Student Badges</span>
              <span>Reviews & Ratings</span>
            </div>
          </div>

          {/* Col 4: Trust & Safety */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem' }}>Trust & Safety</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Your money is safe in escrow until you inspect and approve the project.
            </p>
            <div className="badge badge-neutral" style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}>
              {siteSettings?.footer_trust_badge || '🎓 Safe Student Platform'}
            </div>
          </div>

        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>{siteSettings?.footer_copyright_text || `© ${new Date().getFullYear()} CampusGig • Student Freelance Marketplace`}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>{siteSettings?.footer_love_text || 'Made with ❤️ for college students'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { ShieldCheck, Sparkles, MapPin, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import BrandLogo from './BrandLogo';

export default function Footer({ onNavigate }) {
  const { siteSettings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 0 1.75rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          
          {/* Col 1: Brand & Overview */}
          <div>
            <div style={{ marginBottom: '0.85rem' }}>
              <BrandLogo size={32} subtitle="MCC - MRF INNOVATION PARK" onClick={() => onNavigate('home')} />
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              {siteSettings?.footer_about_text || 'The premier student freelance marketplace connecting verified university talent with campus and client projects.'}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-light)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
              <ShieldCheck size={15} />
              <span>{siteSettings?.footer_trust_badge || 'Verified Student Platform'}</span>
            </div>
          </div>

          {/* Col 2: Popular Services */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Popular Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 1 }); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-underline">Web & App Development</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 2 }); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-underline">Graphic & Brand Design</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 3 }); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-underline">UI/UX Design & Prototyping</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 5 }); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-underline">Video Editing & Media</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('explore', { category: 7 }); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-underline">Academic & Technical Tutoring</a>
            </div>
          </div>

          {/* Col 3: Platform Standards */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform Standards
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 600 }}>
                <Sparkles size={14} />
                <span>AI Skill Matching</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                <span>Escrow Payment Protection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                <span>Verified Student Credentials</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                <span>Real-Time Project Workspace</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                <span>Transparent Ratings & Reviews</span>
              </div>
            </div>
          </div>

          {/* Col 4: Innovation Park & Location */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Building2 size={16} style={{ color: 'var(--primary)' }} />
              <span>MCC - MRF Innovation Park</span>
            </h4>
            <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '0.85rem' }}>
              <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Madras Christian College (MCC)</strong><br />
                Velachery Main Road, East Tambaram,<br />
                Chennai - 600 059, Tamil Nadu, India
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <Mail size={14} style={{ color: 'var(--primary)' }} />
              <a
                href={`mailto:${siteSettings?.support_email || 'srikanthstephen2007@gmail.com'}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {siteSettings?.support_email || 'srikanthstephen2007@gmail.com'}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Professional Copyright Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            {siteSettings?.footer_copyright_text || `© ${currentYear} CampusGig. All rights reserved.`}
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-body)' }}>
            {siteSettings?.footer_love_text || 'Incubated at MCC - MRF Innovation Park • Madras Christian College'}
          </div>
        </div>
      </div>
    </footer>
  );
}

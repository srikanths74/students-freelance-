import React from 'react';
import { UserCheck, CheckCircle, Sparkles, ArrowRight, ShieldCheck, FileText, ExternalLink, Award } from 'lucide-react';
import { getDesignationInfo } from '../utils/designationImages';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function FreelancerCard({ freelancer, aiScore, relevanceReason, matchedSkills, onClick, onHireClick }) {
  const user = freelancer.user || freelancer;
  const skills = user.skills || [];
  const primarySkill = skills[0]?.skill_name || skills[0] || '';
  const designation = getDesignationInfo(user.department, primarySkill);

  return (
    <div
      onClick={onClick}
      className="card card-hoverable"
      style={{
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      {/* ── Designation Card Cover Photo ── */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: 115, overflow: 'hidden', backgroundColor: 'var(--bg-surface-elevated)' }}>
        <img
          src={designation.photo}
          alt=""
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80';
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Ambient Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(12, 10, 9, 0.75) 0%, rgba(12, 10, 9, 0.15) 60%, transparent 100%)'
        }} />

        {/* Designation Tag Badge */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '0.22rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(12, 10, 9, 0.75)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <span>{designation.icon}</span>
          <span>{designation.tag}</span>
        </div>

        {/* AI Score Badge if present */}
        {aiScore && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.22rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 800,
            boxShadow: '0 2px 8px var(--primary-glow)'
          }}>
            <Sparkles size={12} />
            <span>{aiScore}% Match</span>
          </div>
        )}
      </div>

      <div style={{ padding: '0 1.25rem 1.25rem', position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Profile Header with overlapping avatar - floats cleanly over banner with no hidden image */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3.5px solid var(--bg-surface)',
              backgroundColor: 'var(--bg-surface-elevated)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.22)',
              marginTop: -30,
              position: 'relative',
              zIndex: 10,
              flexShrink: 0
            }}>
              <img
                src={getProfessionalAvatar(user)}
                alt=""
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/avatars/bitmoji_male_1.jpg';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block'
                }}
              />
            </div>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--primary)',
              background: 'var(--primary-light)',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--primary-medium)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              maxWidth: '180px',
              marginBottom: '0.15rem'
            }}>
              {designation.title}
            </span>
          </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{user.name}</h4>
            {user.is_verified_student === 1 && (
              <UserCheck size={16} color="var(--accent-emerald)" title="Campus Verified Student" />
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {user.year_of_study} • {user.department}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            {user.college}
          </div>
        </div>

        {/* Bio */}
        <p style={{
          fontSize: '0.835rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '0.85rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {user.bio || 'Talented student freelancer open for campus projects.'}
        </p>

        {/* AI Rationale if provided */}
        {relevanceReason && (
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'rgba(99, 102, 241, 0.08)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            color: 'var(--primary)',
            marginBottom: '0.85rem',
            border: '1px dashed rgba(99, 102, 241, 0.3)'
          }}>
            {relevanceReason}
          </div>
        )}

        {/* Skills Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: (user.resume_url || user.portfolio_url || user.skillFilesCount > 0 || user.certificatesCount > 0) ? '0.6rem' : '1rem' }}>
          {skills.slice(0, 5).map((sk, idx) => {
            const skillName = typeof sk === 'string' ? sk : sk.skill_name;
            const isMatched = matchedSkills && matchedSkills.some(m => m.toLowerCase() === skillName.toLowerCase());
            return (
              <span
                key={idx}
                className={`badge ${isMatched ? 'badge-ai' : 'badge-neutral'}`}
                style={{ fontSize: '0.72rem' }}
              >
                {isMatched && '✓ '}
                {skillName}
              </span>
            );
          })}
        </div>

        {/* Verified Credentials Tags for Clients */}
        {(user.resume_url || user.portfolio_url || (user.skillFilesCount > 0 || user.certificatesCount > 0)) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
            {user.resume_url && (
              <span className="badge" style={{ fontSize: '0.67rem', padding: '0.15rem 0.45rem', background: 'rgba(10, 95, 214, 0.08)', color: 'var(--primary)', border: '1px solid rgba(10, 95, 214, 0.25)' }}>
                <span>Resume CV</span>
              </span>
            )}
            {user.portfolio_url && (
              <span className="badge" style={{ fontSize: '0.67rem', padding: '0.15rem 0.45rem', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span>Portfolio</span>
              </span>
            )}
            {(user.certificatesCount > 0 || user.skillFilesCount > 0) && (
              <span className="badge" style={{ fontSize: '0.67rem', padding: '0.15rem 0.45rem', background: 'rgba(13, 148, 136, 0.08)', color: 'var(--accent-amber)', border: '1px solid rgba(13, 148, 136, 0.25)' }}>
                <span>{user.certificatesCount || user.skillFilesCount} Certs/Proof</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta & Action */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
          {user.rating_avg > 0 ? (
            <>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.rating_avg.toFixed(1)} / 5.0</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({user.review_count || 0} reviews)
              </span>
            </>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>New Freelancer</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onHireClick) onHireClick(user.id);
            else if (onClick) onClick();
          }}
          className="btn btn-sm btn-primary"
          style={{ gap: '0.35rem', fontSize: '0.8rem' }}
        >
          <span>View Profile</span>
          <ArrowRight size={13} />
        </button>
      </div>

    </div>
  );
}

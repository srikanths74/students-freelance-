import React from 'react';
import { Clock, UserCheck, CheckCircle2 } from 'lucide-react';
import { getDesignationInfo } from '../utils/designationImages';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function ServiceCard({ service, onClick, onProfileClick }) {
  const skills = (service.skills_csv || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  const designation = getDesignationInfo(service.category_name, service.title);

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
        height: '100%'
      }}
    >
      {/* Cover Image with Category Overlay */}
      <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', backgroundColor: 'var(--bg-surface-elevated)' }}>
        <img
          src={service.cover_image || designation.photo}
          alt=""
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = designation.photo || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', display: 'block' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <span>{designation.icon}</span>
          <span>{service.category_name || designation.tag}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        
        {/* Freelancer Header */}
        <div
          onClick={(e) => {
            if (onProfileClick) {
              e.stopPropagation();
              onProfileClick(service.user_id);
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', cursor: 'pointer' }}
        >
          <img
            src={getProfessionalAvatar(service.freelancer_avatar || service.freelancer_name)}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/avatars/bitmoji_male_1.jpg';
            }}
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', fontWeight: 700 }}>
              <span>{service.freelancer_name}</span>
              {service.freelancer_verified === 1 && (
                <UserCheck size={13} color="var(--accent-emerald)" title="Campus Verified" />
              )}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {service.freelancer_department || service.freelancer_college}
            </div>
          </div>
        </div>

        {/* Gig Title */}
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          lineHeight: 1.4,
          marginBottom: '0.75rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {service.title}
        </h4>

        {/* Skill Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {skills.map((sk, idx) => (
            <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
              {sk}
            </span>
          ))}
        </div>

        {/* Footer Meta: Rating & Starting Price */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
            {service.rating_avg > 0 ? (
              <>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{service.rating_avg.toFixed(1)} / 5.0</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  ({service.review_count || 0} reviews)
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>New Gig</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={13} />
            <span>{service.delivery_days}d delivery</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>STARTING AT</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{service.starting_price}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function DemoSwitcherModal({ onClose }) {
  const { user, demoAccounts, switchDemoUser } = useAuth();

  const handleSwitch = async (id) => {
    try {
      await switchDemoUser(id);
      onClose();
    } catch (err) {
      alert('Failed to switch demo account: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0A5FD6 0%, #1A7FE8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Instant Demo Account Switcher</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Test different student roles and admin capabilities with 1 click
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {demoAccounts.map((acc) => {
              const isCurrent = user && Number(user.id) === Number(acc.id);
              const isAdmin = acc.role === 'admin';

              return (
                <div
                  key={acc.id}
                  onClick={() => handleSwitch(acc.id)}
                  className="card card-hoverable"
                  style={{
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderColor: isCurrent ? 'var(--primary)' : 'var(--border-color)',
                    background: isCurrent ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={getProfessionalAvatar(acc)}
                      alt={acc.name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: isAdmin ? '2px solid #ef4444' : '2px solid var(--primary)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{acc.name}</span>
                        {isAdmin ? (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Admin</span>
                        ) : (
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Student</span>
                        )}
                        {acc.is_verified_student === 1 && (
                          <UserCheck size={14} color="var(--accent-emerald)" title="Campus Verified" />
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {acc.department} • {acc.college}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isCurrent ? (
                      <span className="badge badge-verified" style={{ gap: '0.3rem' }}>
                        <CheckCircle size={13} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <button className="btn btn-sm btn-secondary" style={{ pointerEvents: 'none' }}>
                        <span>Switch</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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

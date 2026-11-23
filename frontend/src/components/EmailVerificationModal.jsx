import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, ShieldCheck, Loader2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmailVerificationModal({ onClose }) {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [step, setStep] = useState(1); // 1: Enter email/request OTP, 2: Enter OTP code
  const [otp, setOtp] = useState('');
  const [previewOtp, setPreviewOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-verification-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        if (data.previewOtp) {
          setPreviewOtp(data.previewOtp);
        }
      } else {
        setError(data.message || 'Failed to send verification email');
      }
    } catch (err) {
      setError(err.message || 'Network error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
        await refreshUser();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>College Email Verification</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SMTP Verified Student Badge</span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ width: 30, height: 30, padding: 0 }}>✕</button>
        </div>

        <div className="modal-body">

          {error && (
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-rose-light)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.82rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.35rem' }}>
                Verified Successfully!
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Your student profile is now verified. The Verified Student badge will display on all your gigs and profile!
              </p>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-medium)',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                color: 'var(--primary)',
                lineHeight: 1.5
              }}>
                <strong>🎓 Why verify your college email?</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem' }}>
                  <li>Unlocks the <strong>Verified Student Badge</strong></li>
                  <li>Higher ranking in AI recommendations</li>
                  <li>Greater peer hiring trust & instant escrow guarantee</li>
                </ul>
              </div>

              <div className="form-group">
                <label className="form-label">Student / College Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu or name@univ.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  We will send a 6-digit SMTP verification code to this address.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : 'Send 6-Digit OTP via SMTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  We sent a 6-digit verification code to your email inbox:
                </p>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{email}</strong>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Check your Gmail / College inbox and spam folder.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.5rem',
                    fontWeight: 800,
                    color: 'var(--primary)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Change Email
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {loading ? <Loader2 size={16} className="spin" /> : 'Verify Code'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

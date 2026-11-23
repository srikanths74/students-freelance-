import React, { useState } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ForgotPasswordModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [previewOtp, setPreviewOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request Password Reset Code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        if (data.previewOtp) {
          setPreviewOtp(data.previewOtp);
        }
      } else {
        setError(data.message || 'No account found with this email address.');
      }
    } catch (err) {
      setError(err.message || 'Network error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setStep(3);
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while resetting password.');
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
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: 460,
        width: '100%',
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

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-lg)',
            background: step === 3 ? 'var(--accent-emerald-light)' : 'rgba(234, 88, 12, 0.12)',
            color: step === 3 ? 'var(--accent-emerald)' : '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.15)'
          }}>
            {step === 3 ? <CheckCircle2 size={28} /> : <KeyRound size={26} />}
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.3rem' }}>
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Choose New Password'}
            {step === 3 && 'Password Reset Complete!'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            {step === 1 && 'Enter your account email to receive a secure 6-digit reset code.'}
            {step === 2 && `Enter the 6-digit code sent to ${email} and set your new password.`}
            {step === 3 && 'Your account password has been updated. You can now log in.'}
          </p>
        </div>

        {/* Error Feedback */}
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
            gap: '0.5rem',
            fontWeight: 500
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Dev OTP Helper */}
        {previewOtp && step === 2 && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1px dashed #ea580c',
            color: '#c2410c',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>⚡ Dev Mode Preview Code: <strong>{previewOtp}</strong></span>
            <button
              type="button"
              onClick={() => setOtp(previewOtp)}
              style={{
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Autofill
            </button>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="reset-email">Your Account Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoFocus
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                borderColor: '#ea580c'
              }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
              <span>{loading ? 'Sending Code…' : 'Send 6-Digit Reset Code'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            {/* 6-Digit Code */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input"
                style={{
                  textAlign: 'center',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  letterSpacing: '0.4rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">New Password (min 6 characters)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || !newPassword}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  borderColor: '#ea580c'
                }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
                <span>{loading ? 'Updating…' : 'Set New Password'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald)',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} />
              <span>{successMsg || 'Password updated successfully!'}</span>
            </div>

            <button
              onClick={() => {
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontWeight: 700 }}
            >
              Sign In with New Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

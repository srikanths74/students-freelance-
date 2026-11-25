import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Briefcase,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function Login({ onNavigate, defaultAdminTab = false }) {
  const { user, login, requestLoginOtp, verifyLoginOtp, loginWithGoogle } = useAuth();
  // isAdminMode: only true when user navigated via /controller
  const isAdminMode = defaultAdminTab === true;
  const [activeTab, setActiveTab] = useState(isAdminMode ? 'admin' : 'student'); // 'student', 'client', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Password, 2: OTP Verification
  const [otp, setOtp] = useState('');
  const [previewOtp, setPreviewOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Instant redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') onNavigate('admin');
      else if (user.role === 'client') onNavigate('dashboard-client');
      else if (!user.profile_completed || user.profile_completed === 0) onNavigate('complete-profile');
      else onNavigate('home');
    }
  }, [user]);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize official Google Identity Services button
  useEffect(() => {
    if (!clientId || clientId.includes('your-google-client-id') || step !== 1 || activeTab === 'admin') return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response.credential) {
                setGoogleLoading(true);
                setError('');
                try {
                  const data = await loginWithGoogle({
                    credential: response.credential,
                    role: activeTab === 'client' ? 'client' : 'student'
                  });
                  if (data.user.role === 'admin') onNavigate('admin');
                  else if (data.user.role === 'client') onNavigate('dashboard-client');
                  else if (!data.user.profile_completed || data.user.profile_completed === 0) onNavigate('complete-profile');
                  else onNavigate('home');
                } catch (err) {
                  setError(err.message || 'Google Sign-In failed');
                } finally {
                  setGoogleLoading(false);
                }
              }
            }
          });

          const btnDiv = document.getElementById('google-signin-btn-container');
          if (btnDiv) {
            btnDiv.innerHTML = '';
            window.google.accounts.id.renderButton(btnDiv, {
              theme: 'outline',
              size: 'large',
              width: 380,
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.warn('Google GSI init warning:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGoogle();
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [activeTab, clientId, step]);

  // Step 1: Instant Direct Authentication (< 50ms) with OTP Fallback
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      if (data.user.role === 'admin') {
        onNavigate('admin');
      } else if (data.user.role === 'client') {
        onNavigate('dashboard-client');
      } else if (!data.user.profile_completed || data.user.profile_completed === 0) {
        onNavigate('complete-profile');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('otp') || errMsg.toLowerCase().includes('two-factor') || errMsg.toLowerCase().includes('2fa')) {
        try {
          const res = await requestLoginOtp(email.trim(), password);
          setStep(2);
          if (res.previewOtp) setPreviewOtp(res.previewOtp);
        } catch (otpErr) {
          setError(otpErr.message || 'OTP verification request failed.');
        }
      } else {
        setError(errMsg || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 6-Digit Email OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyLoginOtp(email.trim(), otp.trim());
      if (data.user.role === 'admin') {
        onNavigate('admin');
      } else if (data.user.role === 'client') {
        onNavigate('dashboard-client');
      } else if (!data.user.profile_completed || data.user.profile_completed === 0) {
        onNavigate('complete-profile');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Autofill for convenience
  const handleQuickFill = (roleType) => {
    setStep(1);
    setOtp('');
    setPreviewOtp('');
    if (roleType === 'student') {
      setEmail('rahul@college.edu');
      setPassword('password123');
      setActiveTab('student');
    } else if (roleType === 'client') {
      setEmail('priya@college.edu');
      setPassword('password123');
      setActiveTab('client');
    } else if (roleType === 'admin') {
      setEmail('srikanthstephen2007@gmail.com');
      setPassword('stephen@123');
      setActiveTab('admin');
    }
  };

  return (
    <div className="page-content" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '2.5rem 1rem 4rem',
      background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, var(--bg-main) 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '0 1rem' }}>

        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <BrandLogo size={52} subtitle="MCC - MRF INNOVATION PARK" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
            {step === 1 ? 'CampusGig Sign In' : 'Verify Email OTP'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {step === 1
              ? 'Enter your credentials to access your account instantly'
              : `Enter the 6-digit code sent via SMTP to ${email}`}
          </p>
        </div>

        {/* Role Mode Tabs (Step 1 only) */}
        {step === 1 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isAdminMode ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '0.4rem',
            background: 'var(--bg-surface-elevated)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            border: '1.5px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setError(''); }}
              className={`btn btn-sm ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.2rem' }}
            >
              <span>Freelancer</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('client'); setError(''); }}
              className={`btn btn-sm ${activeTab === 'client' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.2rem' }}
            >
              <span>Client</span>
            </button>
            {/* Admin tab: only visible when accessed via /controller */}
            {isAdminMode && (
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setError(''); }}
                className={`btn btn-sm ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.2rem' }}
              >
                <span>Admin</span>
              </button>
            )}
          </div>
        )}

        {/* Client Info Banner */}
        {step === 1 && activeTab === 'client' && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            background: 'rgba(5, 150, 105, 0.07)',
            border: '1.5px solid rgba(5, 150, 105, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem'
          }}>
            <ShoppingBag size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                Client Portal — Post Projects &amp; Hire Student Talent
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                As a <strong>Client</strong>, you can post freelance projects, review student proposals, hire verified campus talent, and manage your hired work — all in one place.
              </p>
            </div>
          </div>
        )}

        <div className="card" style={{
          padding: '2rem 2.25rem',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-color)',
          background: 'var(--bg-surface)',
          boxShadow: '0 16px 40px rgba(15, 41, 30, 0.08), 0 2px 6px rgba(0,0,0,0.03)'
        }}>

          {/* Error Banner */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-rose-light)',
              border: '1.5px solid rgba(225,29,72,0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              {/* Google Console OAuth Button Container */}
              {activeTab !== 'admin' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div
                    id="google-signin-btn-container"
                    style={{ display: 'flex', justifyContent: 'center', minHeight: 44, width: '100%' }}
                  />

                  {googleLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.6rem', color: 'var(--primary)', fontSize: '0.85rem' }}>
                      <Loader2 size={16} className="spin" />
                      <span>Signing in with Google…</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>OR WITH EMAIL & PASSWORD</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                  </div>
                </div>
              )}

              <form onSubmit={handleCredentialSubmit} noValidate>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">
                    {activeTab === 'admin' ? 'Admin Email' : activeTab === 'client' ? 'Client Email' : 'Student / College Email'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={activeTab === 'admin' ? 'admin@marketplace.edu' : activeTab === 'client' ? 'priya@college.edu' : 'rahul@college.edu'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2.4rem' }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2.4rem', paddingRight: '2.6rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', justifyContent: 'center' }}
                >
                  {loading ? <Loader2 size={18} className="spin" /> : 'Sign In'}
                </button>
              </form>


            </>
          ) : (
            /* Step 2: 6-Digit Email OTP Verification */
            <form onSubmit={handleOtpSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <KeyRound size={22} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  A 6-digit login security code was sent to your email:
                </p>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{email}</strong>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Check your Gmail / College inbox and spam folder.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                  Enter 6-Digit Code
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

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); }}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', gap: '0.3rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {loading ? <Loader2 size={16} className="spin" /> : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Switch to Register */}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <a
            href="#"
            id="goto-register-link"
            onClick={(e) => { e.preventDefault(); onNavigate('register'); }}
            style={{ color: 'var(--primary)', fontWeight: 700 }}
          >
            Create Profile (Freelancer or Client)
          </a>
        </p>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <ForgotPasswordModal
            onClose={() => setShowForgotModal(false)}
            onSuccess={() => setShowForgotModal(false)}
          />
        )}

      </div>
    </div>
  );
}

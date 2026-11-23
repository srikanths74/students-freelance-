import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusgig_token') || null);
  const [loading, setLoading] = useState(true);

  // On mount: verify token
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 1. Login with OTP: Step 1 - Check password & request OTP
  const requestLoginOtp = async (email, password) => {
    const res = await fetch('/api/auth/login-send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }
    return data;
  };

  // 1. Login with OTP: Step 2 - Verify OTP & complete login
  const verifyLoginOtp = async (email, otp) => {
    const res = await fetch('/api/auth/login-verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'OTP verification failed.');
    }
    localStorage.setItem('campusgig_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // 2. Register with OTP: Step 1 - Send registration OTP
  const requestRegisterOtp = async (formData) => {
    const res = await fetch('/api/auth/register-send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }
    return data;
  };

  // 2. Register with OTP: Step 2 - Verify OTP & activate account
  const verifyRegisterOtp = async (email, otp) => {
    const res = await fetch('/api/auth/register-verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'OTP verification failed.');
    }
    localStorage.setItem('campusgig_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Direct login fallback
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed.');
    }
    localStorage.setItem('campusgig_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Google OAuth Login
  const loginWithGoogle = async (googlePayload) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googlePayload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Google authentication failed.');
    }
    localStorage.setItem('campusgig_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  };

  // Complete student required onboarding profile
  const completeStudentProfile = async (formDataOrObject) => {
    if (!token) throw new Error('Not authenticated.');
    let res;
    if (formDataOrObject instanceof FormData) {
      res = await fetch('/api/users/complete-student-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataOrObject
      });
    } else {
      res = await fetch('/api/users/complete-student-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataOrObject)
      });
    }
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to complete profile.');
    }
    setUser(data.user);
    return data;
  };

  // Mobile Phone OTP verification
  const sendPhoneOtp = async (phone) => {
    if (!token) throw new Error('Authentication required.');
    const res = await fetch('/api/users/phone-otp/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to send phone OTP.');
    }
    return data;
  };

  const verifyPhoneOtp = async (phone, otp) => {
    if (!token) throw new Error('Authentication required.');
    const res = await fetch('/api/users/phone-otp/verify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to verify phone OTP.');
    }
    if (data.user) {
      setUser(prev => ({ ...prev, ...data.user, is_phone_verified: 1, phone: data.phone }));
    }
    return data;
  };

  // Sign out
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campusgig_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        requestLoginOtp,
        verifyLoginOtp,
        requestRegisterOtp,
        verifyRegisterOtp,
        login,
        loginWithGoogle,
        completeStudentProfile,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

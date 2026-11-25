import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import ExploreServices from './pages/ExploreServices';
import ServiceDetail from './pages/ServiceDetail';
import FreelancerProfile from './pages/FreelancerProfile';
import ProjectDetail from './pages/ProjectDetail';
import DashboardFreelancer from './pages/DashboardFreelancer';
import DashboardClient from './pages/DashboardClient';
import AdminDashboard from './pages/AdminDashboard';
import WalletPage from './pages/WalletPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentProfileSetup from './pages/StudentProfileSetup';
import BrandLogo from './components/BrandLogo';

import { Bell, X, Loader2, Sparkles } from 'lucide-react';

// Pages that require the user to be logged in (Admin is handled directly inside AdminDashboard)
const PROTECTED_PAGES = [
  'dashboard-freelancer', 'dashboard-client', 'wallet', 'project-detail'
];

// Helper to parse current page & params from URL query or hash
const parseUrlRoute = () => {
  try {
    // 0. Check if URL path is /controller → open admin login page
    const pathname = window.location.pathname;
    if (pathname === '/controller' || pathname === '/controller/') {
      return { page: 'login', params: { adminTab: 'true' }, isControllerMode: true };
    }

    // 1. Check URL query parameters (e.g. ?page=explore&search=ui or ?page=project-detail&projectId=9)
    const searchParams = new URLSearchParams(window.location.search);
    const urlPage = searchParams.get('page');
    if (urlPage) {
      const params = {};
      for (const [k, v] of searchParams.entries()) {
        if (k !== 'page') params[k] = v;
      }
      return { page: urlPage, params };
    }

    // 2. Check URL hash (e.g. #explore?search=ui)
    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [hashPage, hashQuery] = hash.split('?');
      if (hashPage) {
        const params = {};
        if (hashQuery) {
          const hParams = new URLSearchParams(hashQuery);
          for (const [k, v] of hParams.entries()) params[k] = v;
        }
        return { page: hashPage, params };
      }
    }
  } catch (e) {
    console.warn('Error reading route:', e);
  }
  // Default to home page whenever visiting the root URL /
  return { page: 'home', params: {}, isControllerMode: false };
};

// Helper to persist page & params into URL
const syncUrlWithRoute = (page, params = {}, replace = false) => {
  try {
    if (page === 'home' || !page) {
      // Visiting or navigating to Home clears search params to clean root /
      if (window.location.search || window.location.hash) {
        if (replace) {
          window.history.replaceState({ page: 'home', params: {} }, '', window.location.pathname);
        } else {
          window.history.pushState({ page: 'home', params: {} }, '', window.location.pathname);
        }
      }
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set('page', page);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.set(k, v);
      }
    });

    const newUrl = `?${searchParams.toString()}`;
    if (replace) {
      window.history.replaceState({ page, params }, '', newUrl);
    } else {
      window.history.pushState({ page, params }, '', newUrl);
    }
  } catch (e) {
    console.warn('Could not sync URL:', e);
  }
};

function MainApp() {
  const { user, loading } = useAuth();
  const { siteSettings } = useSiteSettings();
  
  // Initialize from URL or sessionStorage so reload NEVER loses place
  const [routeState, setRouteState] = useState(() => parseUrlRoute());
  const currentPage = routeState.page;
  const pageParams = routeState.params;
  // isControllerMode: true only when the session started via /controller path
  const [isControllerMode] = useState(() => {
    const pathname = window.location.pathname;
    return pathname === '/controller' || pathname === '/controller/';
  });
  const { liveNotification, clearLiveNotification } = useSocket();

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseUrlRoute();
      setRouteState(route);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ensure initial URL reflects current page & params
  useEffect(() => {
    syncUrlWithRoute(currentPage, pageParams, true);
  }, []);

  // Profile completion requirement for students: strictly gate access until complete
  const isStudentIncomplete = Boolean(
    user && 
    user.role === 'student' && 
    (user.profile_completed === 0 || user.profile_completed === false || user.profile_completed === undefined)
  );

  // Redirect to complete-profile when a student with incomplete profile tries to access the site
  useEffect(() => {
    if (!loading && isStudentIncomplete && currentPage !== 'complete-profile') {
      setRouteState({ page: 'complete-profile', params: {} });
      syncUrlWithRoute('complete-profile', {}, true);
    }
  }, [user, loading, isStudentIncomplete, currentPage]);

  // Redirect to login when accessing protected pages without auth
  useEffect(() => {
    if (!loading && !user && PROTECTED_PAGES.includes(currentPage)) {
      setRouteState({ page: 'login', params: {} });
      syncUrlWithRoute('login', {}, true);
    }
  }, [user, loading, currentPage]);

  // Redirect authenticated users away from login/register to dashboard or home
  useEffect(() => {
    if (!loading && user && (currentPage === 'login' || currentPage === 'register')) {
      const destination = user.role === 'admin'
        ? 'admin'
        : user.role === 'client'
          ? 'dashboard-client'
          : isStudentIncomplete
            ? 'complete-profile'
            : 'home';
      setRouteState({ page: destination, params: {} });
      syncUrlWithRoute(destination, {}, true);
    }
  }, [user, loading, currentPage, isStudentIncomplete]);

  // When an admin logs out while on the admin page, automatically redirect to normal website (home)
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current && !user && (currentPage === 'admin' || currentPage === 'complete-profile')) {
      handleNavigate('home', {}, true);
    }
    prevUserRef.current = user;
  }, [user, currentPage]);

  const handleNavigate = (page, params = {}, replace = false) => {
    // Guard: if student profile is incomplete, force them to complete-profile first
    if (isStudentIncomplete && page !== 'complete-profile') {
      setRouteState({ page: 'complete-profile', params: {} });
      syncUrlWithRoute('complete-profile', {}, replace);
      window.scrollTo(0, 0);
      return;
    }

    // Guard: redirect to login if not authenticated
    if (!user && PROTECTED_PAGES.includes(page)) {
      setRouteState({ page: 'login', params: { redirectPage: page, redirectParams: params } });
      syncUrlWithRoute('login', {}, replace);
      window.scrollTo(0, 0);
      return;
    }
    setRouteState({ page, params });
    syncUrlWithRoute(page, params, replace);
    window.scrollTo(0, 0);
  };

  // Show a full-screen loader while session is restoring
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
        background: 'var(--bg-main)', color: 'var(--text-muted)'
      }}>
        <BrandLogo size={52} subtitle="MCC - MRF INNOVATION PARK" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.86rem', fontWeight: 600 }}>
          <Loader2 size={18} className="spin" />
          <span>Restoring secure session…</span>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'explore':
        return <ExploreServices onNavigate={handleNavigate} initialFilters={pageParams} />;
      case 'service-detail':
        return <ServiceDetail serviceId={pageParams.serviceId} onNavigate={handleNavigate} />;
      case 'profile':
        return <FreelancerProfile userId={pageParams.userId} onNavigate={handleNavigate} />;
      case 'project-detail':
        return <ProjectDetail projectId={pageParams.projectId} onNavigate={handleNavigate} />;
      case 'dashboard-freelancer':
        return <DashboardFreelancer onNavigate={handleNavigate} />;
      case 'dashboard-client':
        return <DashboardClient onNavigate={handleNavigate} />;
      case 'admin':
        // Admin page only accessible when session started via /controller
        if (!isControllerMode) return <Home onNavigate={handleNavigate} />;
        return <AdminDashboard onNavigate={handleNavigate} targetUserId={pageParams?.targetUserId || pageParams?.userId} />;
      case 'wallet':
        return <WalletPage onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} defaultAdminTab={pageParams?.adminTab === 'true'} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'complete-profile':
        return (
          <StudentProfileSetup
            onComplete={() => {
              handleNavigate('dashboard-freelancer');
            }}
          />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Announcement Banner (Dynamic from Admin CMS) */}
      {Number(siteSettings?.announcement_banner_enabled) === 1 && siteSettings?.announcement_banner_text && (
        <div style={{
          background: 'linear-gradient(90deg, #0A5FD6 0%, #1A7FE8 50%, #0A5FD6 100%)',
          color: '#ffffff',
          fontSize: '0.8rem',
          fontWeight: 600,
          textAlign: 'center',
          padding: '0.45rem 1rem',
          letterSpacing: '0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          zIndex: 1050
        }}>
          <Sparkles size={14} />
          <span>{siteSettings.announcement_banner_text}</span>
        </div>
      )}

      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Live Notification Toast */}
      {liveNotification && (
        <div
          onClick={() => {
            if (liveNotification.project_id) {
              handleNavigate('project-detail', { projectId: liveNotification.project_id });
            }
            clearLiveNotification();
          }}
          style={{
            position: 'fixed', bottom: 24, right: 24,
            padding: '1rem 1.25rem',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1100, display: 'flex', alignItems: 'center', gap: '0.75rem',
            cursor: 'pointer', animation: 'slideUp 0.3s ease-out',
            maxWidth: 340
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Bell size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: '0.875rem', display: 'block' }}>
              {liveNotification.title || 'New Notification'}
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {liveNotification.message}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); clearLiveNotification(); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider>
            <MainApp />
          </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  );
}

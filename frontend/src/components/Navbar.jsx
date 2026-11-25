import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import BrandLogo from './BrandLogo';
import {
  Sparkles,
  Search,
  Bell,
  Wallet,
  User,
  UserCheck,
  ShieldAlert,
  Layers,
  ChevronDown,
  LogOut,
  Briefcase,
  ShoppingBag,
  GraduationCap,
  MessageSquare,
  LifeBuoy,
  Edit3
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import AIRecommenderModal from './AIRecommenderModal';
import AdminSupportChatModal from './AdminSupportChatModal';
import EditProfileModal from './EditProfileModal';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout } = useAuth();
  const { liveNotification } = useSocket();
  const { siteSettings } = useSiteSettings();

  const [showAIModal, setShowAIModal] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminSupport, setShowAdminSupport] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('search') ||
        sessionStorage.getItem('campusgig_last_search') || '';
    } catch (e) {
      return '';
    }
  });

  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const q = new URLSearchParams(window.location.search).get('search') || '';
        setSearchQuery(q);
      } catch (e) {}
    };
    const handleOpenSupport = () => setShowAdminSupport(true);

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('open-admin-support', handleOpenSupport);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('open-admin-support', handleOpenSupport);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) onNavigate('explore', { search: searchQuery.trim() });
  };

  // Only the designated admin (srikanthstephen2007@gmail.com) can see the Admin Control Center
  const isAdmin = user?.role === 'admin' && user?.email === 'srikanthstephen2007@gmail.com';

  return (
    <>
      <style>{`
        .nav-search  { width: 200px; }
        .nav-label   { display: inline; }
        @media (max-width: 1080px) {
          .nav-search { display: none !important; }
          .nav-label  { display: none !important; }
        }
      `}</style>

      <header className="navbar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'var(--bg-glass)',
        borderBottom: '1.5px solid var(--border-color)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '0.55rem 0',
        width: '100%',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          minWidth: 0
        }}>

          {/* ── Logo ── */}
          <BrandLogo
            size={36}
            subtitle={siteSettings?.header_tagline || 'MCC - MRF INNOVATION PARK'}
            onClick={() => onNavigate('home')}
          />

          {/* ── Search ── */}
          <form
            onSubmit={handleSearchSubmit}
            className="nav-search"
            style={{ position: 'relative', flexShrink: 1 }}
          >
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search gigs, skills…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '2rem', height: 34, fontSize: '0.82rem' }}
            />
          </form>

          {/* ── Navigation ── */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            <button
              onClick={() => onNavigate('explore')}
              className={`btn btn-sm ${currentPage === 'explore' ? 'btn-primary' : 'btn-secondary'}`}
              title="Explore Gigs"
            >
              <Layers size={15} />
              <span className="nav-label">Explore</span>
            </button>

            <button
              onClick={() => setShowAIModal(true)}
              className="btn btn-sm btn-ai"
              title="AI Freelancer Matcher"
            >
              <Sparkles size={15} />
              <span className="nav-label">AI Match</span>
            </button>

            {user && (
              <>
                {user.role !== 'client' && (
                  <button
                    onClick={() => onNavigate('dashboard-freelancer')}
                    className={`btn btn-sm ${currentPage === 'dashboard-freelancer' ? 'btn-primary' : 'btn-secondary'}`}
                    title="Freelancer Dashboard"
                  >
                    <Briefcase size={15} />
                    <span className="nav-label">My Gigs</span>
                  </button>
                )}

                {user.role === 'client' && (
                  <button
                    onClick={() => onNavigate('dashboard-client')}
                    className={`btn btn-sm ${currentPage === 'dashboard-client' ? 'btn-primary' : 'btn-secondary'}`}
                    title="Client Orders"
                  >
                    <ShoppingBag size={15} />
                    <span className="nav-label">My Orders</span>
                  </button>
                )}
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="btn btn-sm"
                title="Open Admin Control Center"
                style={{
                  background: currentPage === 'admin' ? 'var(--accent-rose)' : 'rgba(225, 29, 72, 0.12)',
                  color: currentPage === 'admin' ? '#fff' : 'var(--accent-rose)',
                  border: '1.5px solid var(--accent-rose)',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <ShieldAlert size={15} />
                <span className="nav-label">Admin Control Center</span>
              </button>
            )}
          </nav>

          {/* ── Right Tools ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>

            {/* Student & Client Direct Chat with Admin */}
            {user && !isAdmin && (
              <button
                type="button"
                onClick={() => setShowAdminSupport(true)}
                className="btn btn-sm btn-secondary"
                style={{ gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                title="Chat directly with Platform Admin"
              >
                <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
                <span className="nav-label">Admin Chat</span>
              </button>
            )}

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="btn btn-sm btn-secondary"
                style={{ width: 34, height: 34, padding: 0, borderRadius: '50%', position: 'relative' }}
                aria-label="Notifications"
              >
                <Bell size={15} />
                {(user?.unreadNotificationsCount > 0 || liveNotification) && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--accent-rose)', border: '2px solid #fff'
                  }} />
                )}
              </button>
              {showNotifs && (
                <NotificationDropdown onClose={() => setShowNotifs(false)} onNavigate={onNavigate} />
              )}
            </div>

            {/* User Avatar or Auth Buttons */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    cursor: 'pointer', padding: '0.2rem 0.3rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <img
                    src={getProfessionalAvatar(user)}
                    alt={user.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/avatars/bitmoji_male_1.jpg';
                    }}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '2px solid var(--primary)' }}
                  />
                  <ChevronDown size={13} color="var(--text-muted)" />
                </div>

                {showUserMenu && (
                  <div className="card" style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 230, padding: '0.75rem', zIndex: 950,
                    boxShadow: 'var(--shadow-xl)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-surface)'
                  }}>
                    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</span>
                        {user.is_verified_student === 1 && (
                          <UserCheck size={14} color="var(--accent-emerald)" title="Verified Campus Student" />
                        )}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 500 }}>{user.college}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('profile', { userId: user.id }); }}
                        className="btn btn-sm btn-secondary"
                        style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', fontSize: '0.82rem', gap: '0.45rem' }}
                      >
                        <User size={14} style={{ color: 'var(--primary)' }} />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => { setShowUserMenu(false); setShowEditProfileModal(true); }}
                        className="btn btn-sm btn-secondary"
                        style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', fontSize: '0.82rem', gap: '0.45rem' }}
                      >
                        <Edit3 size={13} style={{ color: 'var(--primary)' }} />
                        <span>Edit Profile</span>
                      </button>
                      {!isAdmin && (
                        <button
                          onClick={() => { setShowUserMenu(false); setShowAdminSupport(true); }}
                          className="btn btn-sm btn-secondary"
                          style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', fontSize: '0.82rem', gap: '0.45rem' }}
                        >
                          <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
                          <span>Chat with Admin Support</span>
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => { setShowUserMenu(false); onNavigate('admin'); }}
                          className="btn btn-sm btn-danger"
                          style={{ justifyContent: 'flex-start', fontSize: '0.82rem', marginBottom: '0.2rem', gap: '0.45rem' }}
                        >
                          <ShieldAlert size={14} />
                          <span>Admin Control Center</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          onNavigate('home');
                        }}
                        className="btn btn-sm btn-danger"
                        style={{ justifyContent: 'flex-start', marginTop: '0.4rem', fontSize: '0.82rem', gap: '0.45rem' }}
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => onNavigate('login')}
                  className="btn btn-sm btn-secondary"
                  style={{ padding: '0.35rem 0.8rem' }}
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="btn btn-sm btn-primary"
                  style={{ padding: '0.35rem 0.8rem' }}
                >
                  Sign Up
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {showAIModal && (
        <AIRecommenderModal
          onClose={() => setShowAIModal(false)}
          onSelectFreelancer={(id) => { setShowAIModal(false); onNavigate('profile', { userId: id }); }}
        />
      )}

      {showAdminSupport && (
        <AdminSupportChatModal
          isOpen={showAdminSupport}
          onClose={() => setShowAdminSupport(false)}
        />
      )}

      {showEditProfileModal && (
        <EditProfileModal
          onClose={() => setShowEditProfileModal(false)}
        />
      )}
    </>
  );
}

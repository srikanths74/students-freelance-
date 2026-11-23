import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, ArrowRight } from 'lucide-react';

export default function NotificationDropdown({ onClose, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleItemClick = (notif) => {
    onClose();
    if (notif.link_url && notif.link_url.startsWith('/projects/')) {
      const pId = notif.link_url.replace('/projects/', '');
      onNavigate('project-detail', { projectId: pId });
    } else if (notif.link_url && notif.link_url.startsWith('/profile/')) {
      const uId = notif.link_url.replace('/profile/', '');
      onNavigate('profile', { userId: uId });
    } else if (notif.link_url === '/wallet') {
      onNavigate('wallet');
    }
  };

  return (
    <div
      className="card"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        right: 0,
        top: 44,
        width: 320,
        maxHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        padding: '0.75rem',
        zIndex: 950,
        boxShadow: 'var(--shadow-xl)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.875rem' }}>
          <Bell size={15} color="var(--primary)" />
          <span>Notifications</span>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="btn btn-sm btn-secondary"
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: 'none', background: 'transparent' }}
          title="Mark all as read"
        >
          <CheckCheck size={14} />
          <span>Read all</span>
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {loading ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Loading alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No notifications yet!
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              style={{
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                background: !n.is_read ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.background = !n.is_read ? 'rgba(99, 102, 241, 0.08)' : 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <strong style={{ fontSize: '0.8rem' }}>{n.title}</strong>
                {!n.is_read && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3, marginBottom: 4 }}>
                {n.message}
              </p>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={11} />
                <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

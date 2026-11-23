import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  X,
  Send,
  ShieldCheck,
  Paperclip,
  Loader2,
  FileText,
  Download
} from 'lucide-react';

export default function AdminSupportChatModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [adminUser, setAdminUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat with admin
  const loadAdminChat = async () => {
    try {
      const token = localStorage.getItem('campusgig_token');
      if (!token) return;
      const res = await fetch('/api/chat/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminUser(data.admin);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error loading admin chat:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      loadAdminChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listener for new incoming messages
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMsg) => {
      // If message is direct message (project_id 0 or null)
      if (Number(newMsg.project_id) === 0 || !newMsg.project_id) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    socket.on('new_direct_message', handleNewMessage);
    return () => {
      socket.off('new_direct_message', handleNewMessage);
    };
  }, [socket]);

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const token = localStorage.getItem('campusgig_token');
      const res = await fetch('/api/chat/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  // Upload file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('campusgig_token');
      const res = await fetch('/api/chat/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 20, 15, 0.65)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: 620,
        width: '100%',
        height: '82vh',
        maxHeight: 700,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1.5px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={adminUser?.avatar_url || '/avatars/bitmoji_male_5.jpg'}
                alt="Admin"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--primary)'
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                border: '2px solid var(--bg-surface)'
              }} title="Admin Active" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  {adminUser?.name || 'Platform Administrator'}
                </h3>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  <ShieldCheck size={11} /> Admin
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Official CampusGig Support • Direct Student & Client Help
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-secondary"
            style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Support Topics / Quick Prompt Chips */}
        <div style={{
          padding: '0.65rem 1rem',
          background: 'var(--bg-main)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.45rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          fontSize: '0.76rem'
        }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center', fontSize: '0.72rem' }}>
            Quick Prompts:
          </span>
          {[
            '🎓 How do I get student verification badge?',
            '💼 Need help with a workstation project',
            '💳 Escrow payment inquiry',
            '⚠️ Report an issue or bug'
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(prompt.replace(/^[^\w]+/, ''))}
              className="btn btn-sm btn-secondary"
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                flexShrink: 0
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          background: 'var(--bg-surface)'
        }}>
          {loading ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary)' }} />
              <p style={{ fontSize: '0.85rem' }}>Connecting to Administrator...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: 360,
              padding: '2rem 1rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <ShieldCheck size={26} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Chat with Platform Admin
              </h4>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                Have questions about student verification, gigs, escrow payments, or account disputes? Type below to chat directly with Srikanth Stephen (CampusGig Admin).
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = Number(msg.sender_id) === Number(user?.id);
              return (
                <div
                  key={msg.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    alignSelf: isMine ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.2rem',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>{isMine ? 'You' : (adminUser?.name || 'Administrator 🛡️')}</span>
                    <span>•</span>
                    <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                  </div>

                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    background: isMine
                      ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
                      : 'var(--bg-surface-elevated)',
                    color: isMine ? '#FFFFFF' : 'var(--text-main)',
                    border: isMine ? 'none' : '1px solid var(--border-color)',
                    boxShadow: isMine ? '0 3px 12px var(--primary-glow)' : 'var(--shadow-xs)',
                    borderTopRightRadius: isMine ? 2 : 'var(--radius-lg)',
                    borderTopLeftRadius: !isMine ? 2 : 'var(--radius-lg)'
                  }}>
                    {msg.content}

                    {/* Attachment preview */}
                    {msg.attachment_url && (
                      <div style={{ marginTop: '0.6rem' }}>
                        {msg.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <img
                            src={msg.attachment_url}
                            alt="Attachment"
                            style={{
                              maxWidth: '100%',
                              maxHeight: 180,
                              borderRadius: 'var(--radius-md)',
                              objectFit: 'cover',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                        ) : (
                          <a
                            href={msg.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              color: isMine ? '#fff' : 'var(--primary)',
                              textDecoration: 'underline',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <FileText size={14} />
                            <span>{msg.attachment_name || 'Download Attached File'}</span>
                            <Download size={13} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '0.85rem 1.1rem',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-sm btn-secondary"
            style={{ width: 38, height: 38, padding: 0, borderRadius: 'var(--radius-md)', flexShrink: 0 }}
            title="Attach screenshot or document"
          >
            {uploading ? <Loader2 size={16} className="spin" /> : <Paperclip size={16} />}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <input
            type="text"
            placeholder="Type your message to CampusGig Admin..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending || uploading}
            className="input"
            style={{ flex: 1, height: 38, fontSize: '0.88rem' }}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="btn btn-primary"
            style={{ height: 38, padding: '0 1.1rem', fontWeight: 700, flexShrink: 0 }}
          >
            {sending ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  Check,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Smile,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SNAPCHAT_BITMOJI_AVATARS, getProfessionalAvatar, isUnwantedOrOldAvatar } from '../utils/defaultAvatars';
import { useAuth } from '../context/AuthContext';

export default function ChooseProfilePhotoModal({ isOpen, onClose, currentAvatar, userName, onSuccess }) {
  const { refreshUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'male' | 'female' | 'tech' | 'creative' | 'campus'
  
  // Selected avatar state (defaults to Snapchat Bitmoji if current avatar is empty or old stock photo)
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(() => {
    return currentAvatar && !isUnwantedOrOldAvatar(currentAvatar)
      ? currentAvatar
      : getProfessionalAvatar(userName || 'Student');
  });

  // Local file upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Filter 3D Snapchat avatars
  const filteredAvatars = SNAPCHAT_BITMOJI_AVATARS.filter(a => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'male') return a.gender === 'male';
    if (categoryFilter === 'female') return a.gender === 'female';
    if (categoryFilter === 'tech') return a.category === 'tech';
    if (categoryFilter === 'creative') return a.category === 'creative';
    if (categoryFilter === 'campus') return a.category === 'campus';
    return true;
  });

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size should be under 10MB.');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setSelectedAvatarUrl(objectUrl);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Save selected photo
  const handleSave = async () => {
    setErrorMsg('');
    setSaving(true);
    const authToken = token || localStorage.getItem('campusgig_token');

    try {
      if (activeTab === 'upload' && selectedFile) {
        // 1. Upload local file from device to server
        const formData = new FormData();
        formData.append('avatar', selectedFile);

        const res = await fetch('/api/users/upload/avatar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to upload photo from device.');
        }

        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        await refreshUser();
        if (onSuccess) onSuccess(data.avatar_url);
        onClose();
      } else {
        // 2. Select 3D Snapchat Bitmoji avatar
        const res = await fetch('/api/users/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ avatar_url: selectedAvatarUrl })
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to update avatar.');
        }

        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        await refreshUser();
        if (onSuccess) onSuccess(selectedAvatarUrl);
        onClose();
      }
    } catch (err) {
      console.error('Photo save error:', err);
      setErrorMsg(err.message || 'Failed to save profile avatar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Smile size={24} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Choose 3D Bitmoji Avatar</h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    background: 'var(--primary)',
                    color: '#fff'
                  }}
                >
                  Snapchat Style
                </span>
              </div>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Express yourself with colorful 3D Bitmoji characters or upload a personal photo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon btn-sm"
            style={{ borderRadius: '50%', border: 'none', background: 'transparent' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-body)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}
        >
          <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
            <img
              src={selectedAvatarUrl}
              alt="Avatar Preview"
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: '0 6px 18px var(--primary-glow)',
                backgroundColor: 'var(--bg-surface-elevated)'
              }}
              onError={(e) => {
                e.currentTarget.src = '/avatars/bitmoji_male_1.jpg';
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10B981',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
              }}
              title="Active Preview"
            >
              <Check size={14} strokeWidth={3} />
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{userName || 'Your Profile'}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Sparkles size={12} />
                {selectedFile ? 'Custom Photo' : '3D Snapchat Bitmoji'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {selectedFile
                ? 'Custom photo selected from your device.'
                : 'Click any 3D Bitmoji below to instantly customize your look!'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            padding: '0 1.5rem',
            background: 'var(--bg-surface)'
          }}
        >
          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'gallery' ? 700 : 500,
              color: activeTab === 'gallery' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'gallery' ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Smile size={16} />
            <span>Snapchat 3D Bitmojis</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'upload' ? 700 : 500,
              color: activeTab === 'upload' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'upload' ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <UploadCloud size={16} />
            <span>Upload From Device</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--accent-red)',
                color: 'var(--accent-red)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'gallery' ? (
            <div>
              {/* Category Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1.15rem',
                  flexWrap: 'wrap'
                }}
              >
                {[
                  { key: 'all', label: `All (${SNAPCHAT_BITMOJI_AVATARS.length})` },
                  { key: 'male', label: 'Boys' },
                  { key: 'female', label: 'Girls' },
                  { key: 'tech', label: 'Tech & Coder' },
                  { key: 'creative', label: 'Design & Creative' },
                  { key: 'campus', label: 'Campus Casual' }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setCategoryFilter(f.key)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: categoryFilter === f.key ? 700 : 500,
                      border: categoryFilter === f.key ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: categoryFilter === f.key ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                      color: categoryFilter === f.key ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Snapchat 3D Bitmoji Avatar Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.9rem'
                }}
              >
                {filteredAvatars.map(av => {
                  const isSelected = selectedAvatarUrl === av.url;
                  return (
                    <div
                      key={av.id}
                      onClick={() => {
                        setSelectedAvatarUrl(av.url);
                        setSelectedFile(null);
                        setLocalPreviewUrl('');
                      }}
                      style={{
                        position: 'relative',
                        padding: '0.75rem 0.5rem',
                        borderRadius: 'var(--radius-lg)',
                        background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                        boxShadow: isSelected ? '0 4px 14px var(--primary-glow)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ position: 'relative', width: 84, height: 84, margin: '0 auto 0.5rem' }}>
                        <img
                          src={av.url}
                          alt={av.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}
                          loading="lazy"
                        />
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: -2,
                              right: -2,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
                            }}
                          >
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '0.15rem'
                        }}
                      >
                        {av.name.split('(')[0].trim()}
                      </div>

                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {av.tag || av.role}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              {/* Local File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                  backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '1rem'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}
                >
                  <UploadCloud size={28} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Click or drag photo here to upload
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1rem' }}>
                  Upload a photo from your laptop or phone. Supports JPG, PNG, WEBP (Max 10MB).
                </p>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ pointerEvents: 'none' }}
                >
                  <ImageIcon size={15} />
                  <span>Browse Device Files</span>
                </button>
              </div>

              {selectedFile && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={localPreviewUrl}
                      alt="Selected file"
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to set
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setLocalPreviewUrl('');
                      setSelectedAvatarUrl(getProfessionalAvatar(userName || 'Student'));
                    }}
                    className="btn btn-icon btn-sm"
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            background: 'var(--bg-surface-elevated)'
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={saving}
            style={{ border: 'none' }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ minWidth: '150px' }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Saving Avatar...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Avatar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

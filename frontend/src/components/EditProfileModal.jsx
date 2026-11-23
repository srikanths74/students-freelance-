import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Building,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Globe,
  GitBranch,
  ExternalLink,
  FileText,
  Save,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera
} from 'lucide-react';
import ChooseProfilePhotoModal from './ChooseProfilePhotoModal';

export default function EditProfileModal({ onClose }) {
  const { user, refreshUser } = useAuth();
  const isStudent = user?.role === 'student';
  const isClient = user?.role === 'client';

  // Common fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Student specific fields
  const [college, setCollege] = useState(user?.college || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year_of_study || 3);
  const [skills, setSkills] = useState(() => {
    if (Array.isArray(user?.skills)) {
      return user.skills.map(s => typeof s === 'string' ? s : s.skill_name);
    }
    return [];
  });
  const [skillInput, setSkillInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || '');
  const [githubUrl, setGithubUrl] = useState(user?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');

  // Client specific fields
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [companyWebsite, setCompanyWebsite] = useState(user?.company_website || '');
  const [companyDescription, setCompanyDescription] = useState(user?.company_description || user?.client_work_description || '');

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add skill tag
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      setSkills(prev => [...prev, clean]);
      setSkillInput('');
    }
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  // Save profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl
      };

      if (isStudent) {
        payload.college = college.trim();
        payload.department = department.trim();
        payload.year_of_study = Number(yearOfStudy);
        payload.skills = skills;
        payload.portfolio_url = portfolioUrl.trim();
        payload.github_url = githubUrl.trim();
        payload.linkedin_url = linkedinUrl.trim();
      }

      if (isClient) {
        payload.college = college.trim();
        payload.company_name = companyName.trim();
        payload.company_website = companyWebsite.trim();
        payload.company_description = companyDescription.trim();
        payload.client_work_description = companyDescription.trim();
      }

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Profile updated successfully! ✨');
        if (refreshUser) await refreshUser();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Network error updating profile.');
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
      zIndex: 1050,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div className="card" style={{
        maxWidth: 640,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-lg)',
            background: isStudent ? 'rgba(10, 95, 214, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: isStudent ? 'var(--primary)' : 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isStudent ? <GraduationCap size={24} /> : <Briefcase size={22} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Edit {isStudent ? 'Freelancer' : 'Client'} Profile
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              {isStudent ? 'Update your student bio, skills, and portfolio links' : 'Manage your company details and project hiring info'}
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
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
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-emerald-light)',
            color: 'var(--accent-emerald)',
            fontSize: '0.84rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Preview & Change */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={avatarUrl || '/avatars/bitmoji_male_1.jpg'}
                alt={name}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid var(--primary)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Change Avatar"
              >
                <Camera size={13} />
              </button>
            </div>

            <div>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>Profile Avatar</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose from curated 3D student Bitmojis</span>
              <div style={{ marginTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', gap: '0.35rem' }}
                >
                  <Camera size={13} />
                  <span>Choose Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Student Fields */}
          {isStudent && (
            <>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">College / University</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="input"
                    placeholder="e.g. IIT Bombay / Anna University"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input"
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Year of Study</label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="input"
                >
                  <option value={1}>1st Year (Freshman)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior)</option>
                  <option value={5}>Postgraduate / Masters</option>
                </select>
              </div>

              {/* Skills Tags Adder */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Skills &amp; Expertise</label>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill and press Add (e.g. React, Figma, Python)"
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.3rem', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Skill Chips */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(10, 95, 214, 0.1)',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, display: 'flex' }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* External Links */}
              <div className="grid-3" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Portfolio Link</label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2.1rem', fontSize: '0.8rem' }}
                      placeholder="https://mywork.dev"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>GitHub URL</label>
                  <div style={{ position: 'relative' }}>
                    <GitBranch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2.1rem', fontSize: '0.8rem' }}
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>LinkedIn URL</label>
                  <div style={{ position: 'relative' }}>
                    <ExternalLink size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2.1rem', fontSize: '0.8rem' }}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Client Fields */}
          {isClient && (
            <>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Company / Club / Organization Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2.4rem' }}
                      placeholder="e.g. Campus Tech Club / Student Startup"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Campus / College</label>
                  <div style={{ position: 'relative' }}>
                    <GraduationCap size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2.4rem' }}
                      placeholder="e.g. National Institute of Technology"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Company Website / Social Page</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="https://mycompany.com or Instagram handle"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Company &amp; Work Description</label>
                <textarea
                  rows={2}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="textarea"
                  placeholder="Describe your organization, types of freelance projects you post, and student hiring goals..."
                />
              </div>
            </>
          )}

          {/* Bio for Both */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">About / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="textarea"
              placeholder={isStudent ? "Write a short summary of what you do, your background, and why clients should work with you..." : "Brief overview of yourself as a campus client and hiring representative..."}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                gap: '0.45rem',
                padding: '0.65rem 1.75rem',
                fontWeight: 700
              }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              <span>{loading ? 'Saving Changes…' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Change Photo Modal Integration */}
        {showPhotoModal && (
          <ChooseProfilePhotoModal
            currentAvatar={avatarUrl}
            onSelect={(newAvatar) => {
              setAvatarUrl(newAvatar);
              setShowPhotoModal(false);
            }}
            onClose={() => setShowPhotoModal(false)}
          />
        )}
      </div>
    </div>
  );
}

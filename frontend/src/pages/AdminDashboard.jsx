import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  ShieldCheck,
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  UserCheck,
  Lock,
  Unlock,
  TrendingUp,
  Layers,
  Layers3,
  BarChart3,
  FileText,
  Download,
  ExternalLink,
  GraduationCap,
  Loader2,
  Sliders,
  Settings,
  KeyRound,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  Save,
  ShieldAlert,
  Eye,
  EyeOff,
  MessageSquare,
  Star,
  Flag,
  Check,
  Building,
  Palette,
  Globe,
  Type,
  Percent,
  Sparkles,
  Clock,
  LogOut,
  Layout,
  Search,
  Send,
  X,
  Paperclip
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getProfessionalAvatar } from '../utils/defaultAvatars';

export default function AdminDashboard({ onNavigate, targetUserId }) {
  const { user, refreshUser, login, logout } = useAuth();
  const { socket } = useSocket();
  const { siteSettings, saveSettings } = useSiteSettings();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return targetUserId ? 'chat' : (new URLSearchParams(window.location.search).get('tab') ||
        sessionStorage.getItem('campusgig_admin_tab') || 'overview');
    } catch (e) {
      return 'overview';
    }
  });

  // Live Two-Way Admin Chat State
  const [adminConversations, setAdminConversations] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [adminChatMessages, setAdminChatMessages] = useState([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [sendingAdminMsg, setSendingAdminMsg] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatRoleFilter, setChatRoleFilter] = useState('ALL'); // 'ALL' | 'student' | 'client'
  const adminChatEndRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('campusgig_admin_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'admin');
      url.searchParams.set('tab', activeTab);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  }, [activeTab]);
  const [verifFilter, setVerifFilter] = useState('ALL'); // 'ALL', 'PENDING', 'student', 'client'
  const [reportFilter, setReportFilter] = useState('ALL'); // 'ALL', 'PENDING', 'user', 'service', 'review', 'message', 'project'
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // 'ALL' | 'student' | 'client'
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDeletingId, setUserDeletingId] = useState(null);
  const [userActionMsg, setUserActionMsg] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatModalUser, setChatModalUser] = useState(null);
  const [chatNoticeTitle, setChatNoticeTitle] = useState('');
  const [chatNoticeContent, setChatNoticeContent] = useState('');
  const [sendingChatNotice, setSendingChatNotice] = useState(false);
  const [chatNoticeMsg, setChatNoticeMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [customPassInput, setCustomPassInput] = useState('');
  const [showCustomPassInput, setShowCustomPassInput] = useState(false);

  // Live Chart & Synchronization State
  const [chartTimeframe, setChartTimeframe] = useState('monthly'); // 'monthly' | 'daily'
  const [lastSyncedTime, setLastSyncedTime] = useState(() => new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic Website CMS & Customizer State
  const [cmsForm, setCmsForm] = useState({
    header_brand_title: 'CampusGig',
    header_tagline: 'STUDENT MARKETPLACE',
    announcement_banner_enabled: 0,
    announcement_banner_text: '',
    hero_badge: '🎓 Official Campus Student Marketplace',
    hero_headline: 'Find Student Help or Earn With Your Skills',
    hero_subheadline: 'Hire verified classmates for coding, design, video editing, and tutoring with safe escrow payments.',
    hero_search_placeholder: "Search: 'Web Design', 'Poster', 'Python', 'Tutoring'…",
    card_1_title: '1. Browse & Appoint',
    card_1_desc: 'Explore student services, compare portfolios, or hire directly with custom requirements.',
    card_2_title: '2. Safe Escrow',
    card_2_desc: 'Your payment is held safely in escrow until you inspect and approve the work.',
    card_3_title: '3. Chat & Work',
    card_3_desc: 'Message your freelancer, share files, and review project drafts in real time.',
    card_4_title: '4. Approve & Pay',
    card_4_desc: "Release payment to the student's wallet and leave a quality review.",
    cta_banner_title: 'Want to Earn Money on Campus?',
    cta_banner_desc: 'Offer your skills, get hired by fellow students, and build your portfolio.',
    footer_about_text: 'The student marketplace to find campus freelance help, build skills, and earn money.',
    footer_trust_badge: '🎓 Safe Student Platform',
    footer_copyright_text: '© 2026 CampusGig • Student Freelance Marketplace',
    footer_love_text: 'Made with ❤️ for college students',
    platform_commission_percent: 5,
    minimum_budget_inr: 200,
    support_email: 'srikanthstephen2007@gmail.com'
  });
  const [cmsSaving, setCmsSaving] = useState(false);
  const [cmsSuccess, setCmsSuccess] = useState('');
  const [cmsError, setCmsError] = useState('');

  // Admin Profile Edit State
  const [adminName, setAdminName] = useState(user?.name || 'Srikanth Stephen');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'srikanthstephen2007@gmail.com');
  const [adminCollege, setAdminCollege] = useState(user?.college || 'Platform Administration');
  const [adminBio, setAdminBio] = useState(user?.bio || '');
  const [adminProfileLoading, setAdminProfileLoading] = useState(false);
  const [adminProfileMsg, setAdminProfileMsg] = useState('');
  const [adminProfileError, setAdminProfileError] = useState('');

  // Admin Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [adminPassLoading, setAdminPassLoading] = useState(false);
  const [adminPassMsg, setAdminPassMsg] = useState('');
  const [adminPassError, setAdminPassError] = useState('');

  // New Category State
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Layers');

  const isSuperAdmin = user?.role === 'admin' && user?.email === 'srikanthstephen2007@gmail.com';

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdminData();
      setAdminName(user?.name || 'Srikanth Stephen');
      setAdminEmail(user?.email || 'srikanthstephen2007@gmail.com');
      setAdminCollege(user?.college || 'Platform Administration');
      setAdminBio(user?.bio || '');
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (siteSettings) {
      setCmsForm(prev => ({
        ...prev,
        ...siteSettings
      }));
    }
  }, [siteSettings]);

  const handleSaveCmsSettings = async (e) => {
    if (e) e.preventDefault();
    setCmsSaving(true);
    setCmsSuccess('');
    setCmsError('');
    try {
      await saveSettings(cmsForm);
      setCmsSuccess('All website sections (Header, Hero, Cards, Footer, Commission) updated and published live across the site! 🚀');
      setTimeout(() => setCmsSuccess(''), 5000);
    } catch (err) {
      setCmsError(err.message || 'Failed to save website customizations.');
    } finally {
      setCmsSaving(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setAdminLoginLoading(true);
    setAdminLoginError('');
    try {
      if (login) {
        await login('srikanthstephen2007@gmail.com', 'stephen@123');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'srikanthstephen2007@gmail.com', password: 'stephen@123' })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Login failed');
        localStorage.setItem('campusgig_token', data.token);
        if (refreshUser) refreshUser();
      }
      await loadAdminData();
    } catch (err) {
      setAdminLoginError(err.message || 'Failed to authenticate as Administrator.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleCustomAdminLogin = async (e) => {
    if (e) e.preventDefault();
    if (!customPassInput) {
      setAdminLoginError('Please enter your administrator password.');
      return;
    }
    setAdminLoginLoading(true);
    setAdminLoginError('');
    try {
      if (login) {
        await login('srikanthstephen2007@gmail.com', customPassInput);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'srikanthstephen2007@gmail.com', password: customPassInput })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Login failed');
        localStorage.setItem('campusgig_token', data.token);
        if (refreshUser) refreshUser();
      }
      await loadAdminData();
    } catch (err) {
      setAdminLoginError(err.message || 'Invalid administrator password.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const loadAdminData = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` };

      // Stats
      const sRes = await fetch('/api/admin/stats', { headers });
      const sData = await sRes.json();
      if (sData.success) {
        setStats(sData.stats);
        setCharts(sData.charts);
        setLastSyncedTime(new Date().toLocaleTimeString());
      }

      // Users
      const uRes = await fetch('/api/admin/users', { headers });
      const uData = await uRes.json();
      if (uData.success) setUsers(uData.users);

      // Verifications Queue
      const vRes = await fetch('/api/admin/verifications', { headers });
      const vData = await vRes.json();
      if (vData.success) setVerifications(vData.verifications || []);

      // Categories
      const cRes = await fetch('/api/services/categories');
      const cData = await cRes.json();
      if (cData.success) setCategories(cData.categories);

      // Reports
      const rRes = await fetch('/api/admin/reports', { headers });
      const rData = await rRes.json();
      if (rData.success) setReports(rData.reports);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // Load Admin Conversations & Messages
  const loadAdminConversations = async (autoSelectId = null) => {
    setLoadingConversations(true);
    try {
      const res = await fetch('/api/admin/chat/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        const convs = data.conversations || [];
        setAdminConversations(convs);
        const toSelect = autoSelectId || targetUserId || (selectedChatUser ? selectedChatUser.id : (convs.length > 0 ? convs[0].id : null));
        if (toSelect) {
          const target = convs.find(c => Number(c.id) === Number(toSelect)) || convs[0];
          if (target) {
            setSelectedChatUser(target);
            loadAdminChatMessages(target.id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadAdminChatMessages = async (userId) => {
    setLoadingChatMessages(true);
    try {
      const res = await fetch(`/api/admin/chat/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminChatMessages(data.messages || []);
        setAdminConversations(prev => prev.map(c => Number(c.id) === Number(userId) ? { ...c, unreadCount: 0 } : c));
      }
    } catch (err) {
      console.error('Error loading chat messages:', err);
    } finally {
      setLoadingChatMessages(false);
    }
  };

  const handleSendAdminChatMessage = async (e) => {
    e?.preventDefault();
    if (!selectedChatUser || !adminChatInput.trim() || sendingAdminMsg) return;

    const content = adminChatInput.trim();
    setAdminChatInput('');
    setSendingAdminMsg(true);

    try {
      const res = await fetch(`/api/admin/chat/${selectedChatUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        setAdminChatMessages(prev => [...prev, data.message]);
        setAdminConversations(prev => prev.map(c => Number(c.id) === Number(selectedChatUser.id) ? { ...c, lastMessage: data.message } : c));
        setTimeout(() => adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Admin send message error:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSendingAdminMsg(false);
    }
  };

  // Live Auto-Synchronization: Background sync every 5s across entire Admin Panel
  useEffect(() => {
    if (isSuperAdmin) {
      const liveSyncInterval = setInterval(() => {
        loadAdminData(true);
      }, 5000);
      return () => clearInterval(liveSyncInterval);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin && activeTab === 'chat') {
      loadAdminConversations();
    }
  }, [isSuperAdmin, activeTab]);

  // Socket listener for real-time platform updates and incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleStatsUpdate = () => {
      loadAdminData(true);
    };

    const handleDirectMessage = (msg) => {
      if (selectedChatUser && (Number(msg.sender_id) === Number(selectedChatUser.id) || Number(msg.receiver_id) === Number(selectedChatUser.id))) {
        setAdminChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      loadAdminConversations();
    };

    socket.on('platform_stats_updated', handleStatsUpdate);
    socket.on('admin_refresh', handleStatsUpdate);
    socket.on('new_direct_message', handleDirectMessage);

    return () => {
      socket.off('platform_stats_updated', handleStatsUpdate);
      socket.off('admin_refresh', handleStatsUpdate);
      socket.off('new_direct_message', handleDirectMessage);
    };
  }, [socket, selectedChatUser]);

  // Process Verification Request Decision
  const handleVerificationDecision = async (id, decision) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/verifications/${id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ decision })
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Verification decision error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Verification
  const handleToggleVerification = async (uId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/users/${uId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ is_verified_student: currentStatus ? 0 : 1 })
      });
      if (res.ok) loadAdminData();
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  // Toggle Suspension
  const handleToggleSuspension = async (uId, currentSuspension) => {
    try {
      const res = await fetch(`/api/admin/users/${uId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ is_suspended: currentSuspension ? 0 : 1 })
      });
      if (res.ok) loadAdminData();
    } catch (err) {
      console.error('Suspension error:', err);
    }
  };

  // Permanently Remove / Delete Freelancer or User
  const handleDeleteUser = async (targetUser) => {
    const isFreelancer = targetUser.role === 'student';
    const roleLabel = isFreelancer ? 'freelancer' : 'user';
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove ${roleLabel} "${targetUser.name}" (${targetUser.email})?\n\nThis action will delete their account profile, published service gigs, and marketplace data.`
    );
    if (!confirmed) return;

    setUserDeletingId(targetUser.id);
    setUserActionMsg('');
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setUserActionMsg(data.message || `Successfully removed ${targetUser.name}.`);
        setTimeout(() => setUserActionMsg(''), 5000);
        await loadAdminData(true);
      } else {
        alert(data.message || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Error deleting user: ' + err.message);
    } finally {
      setUserDeletingId(null);
    }
  };

  // Open Chat Notice Modal for target user
  const handleOpenChatNotice = (targetUser) => {
    setChatModalUser(targetUser);
    setChatNoticeTitle(`Official CampusGig Notice from Administrator 🛡️`);
    setChatNoticeContent(`Hello ${targetUser.name}, this is an official update regarding your marketplace account.`);
    setChatNoticeMsg('');
    setShowChatModal(true);
  };

  // Send Chat Notice to user
  const handleSendChatNotice = async (e) => {
    e.preventDefault();
    if (!chatModalUser || !chatNoticeContent.trim()) return;

    setSendingChatNotice(true);
    setChatNoticeMsg('');
    try {
      const res = await fetch(`/api/admin/users/${chatModalUser.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          title: chatNoticeTitle.trim(),
          content: chatNoticeContent.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatNoticeMsg(`Message delivered to ${chatModalUser.name} via real-time chat & notifications! 📨`);
        setUserActionMsg(`Update successfully dispatched to ${chatModalUser.name} in chat.`);
        setTimeout(() => {
          setShowChatModal(false);
          setChatNoticeMsg('');
        }, 1800);
      } else {
        alert(data.message || 'Failed to dispatch chat notice');
      }
    } catch (err) {
      console.error('Admin chat notice error:', err);
      alert('Error: ' + err.message);
    } finally {
      setSendingChatNotice(false);
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ name: catName, description: catDesc, icon: catIcon })
      });
      if (res.ok) {
        setShowAddCat(false);
        setCatName('');
        setCatDesc('');
        loadAdminData();
      }
    } catch (err) {
      console.error('Category error:', err);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      if (res.ok) loadAdminData();
    } catch (err) {
      console.error('Category delete error:', err);
    }
  };

  // Resolve Report
  const [reportActionMsg, setReportActionMsg] = useState('');
  const handleResolveReport = async (reportId, actionType = 'DISMISS', adminNotes = '') => {
    setActionLoading(reportId);
    setReportActionMsg('');
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          status: actionType === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
          action_type: actionType,
          admin_notes: adminNotes || `Action executed by Administrator: ${actionType}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setReportActionMsg(data.message || 'Action executed successfully!');
        loadAdminData();
      }
    } catch (err) {
      console.error('Report resolution error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Load System Telemetry
  const loadSystemTelemetry = async () => {
    try {
      const res = await fetch('/api/admin/system', {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) setSystemInfo(data.system);
    } catch (err) {
      console.error('System telemetry load error:', err);
    }
  };

  // Update Admin Profile (Name / Email / College / Bio)
  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    setAdminProfileMsg('');
    setAdminProfileError('');
    setAdminProfileLoading(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          college: adminCollege,
          bio: adminBio
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.token) {
          localStorage.setItem('campusgig_token', data.token);
        }
        setAdminProfileMsg(data.message || 'Admin profile updated successfully!');
        if (refreshUser) refreshUser();
      } else {
        setAdminProfileError(data.message || 'Failed to update admin profile.');
      }
    } catch (err) {
      setAdminProfileError('Error: ' + err.message);
    } finally {
      setAdminProfileLoading(false);
    }
  };

  // Change Admin Password
  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    setAdminPassMsg('');
    setAdminPassError('');
    if (!currentPassword || !newPassword) {
      setAdminPassError('Please fill in both current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      setAdminPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setAdminPassError('New password confirmation does not match.');
      return;
    }
    setAdminPassLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setAdminPassMsg(data.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setAdminPassError(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setAdminPassError('Error: ' + err.message);
    } finally {
      setAdminPassLoading(false);
    }
  };

  // Download Database JSON Backup
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemInfo || {}, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campusgig_database_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredVerifications = verifications.filter(v => {
    if (verifFilter === 'PENDING') return v.status === 'PENDING';
    if (verifFilter === 'student') return v.user_type === 'student';
    if (verifFilter === 'client') return v.user_type === 'client';
    return true;
  });

  const pendingVerifCount = verifications.filter(v => v.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading campus administration telemetry...
      </div>
    );
  }

  // Guard: If user is not authenticated as Administrator
  if (!user || !isSuperAdmin) {
    return (
      <div className="page-content container" style={{ maxWidth: 540, margin: '4rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{
            width: 62, height: 62, borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)', color: 'var(--accent-rose)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem' }}>Administrator Access Required</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {user ? (
              <>You are currently signed in as <strong>{user.name}</strong> (<span style={{ textTransform: 'capitalize' }}>{user.role}</span>). System management and platform operations require verified Administrator privileges for <strong style={{ color: 'var(--primary)' }}>srikanthstephen2007@gmail.com</strong>.</>
            ) : (
              <>You must be signed in with the verified Administrator account (<strong>srikanthstephen2007@gmail.com</strong>) to access the operations control section.</>
            )}
          </p>

          {adminLoginError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
              {adminLoginError}
            </div>
          )}

          <div style={{
            background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', padding: '1.1rem', marginBottom: '1.5rem', textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Designated Administrator Credentials:
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.7 }}>
              <div>Email: <strong style={{ color: 'var(--primary)' }}>srikanthstephen2007@gmail.com</strong></div>
              <div>Password: <strong>stephen@123</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button
              onClick={handleQuickAdminLogin}
              disabled={adminLoginLoading}
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', fontSize: '0.92rem', gap: '0.45rem', fontWeight: 700 }}
            >
              {adminLoginLoading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
              <span>⚡ One-Click Sign In as Head Administrator</span>
            </button>
          </div>

          {/* Alternative: Enter Custom Password if Changed */}
          <form onSubmit={handleCustomAdminLogin} style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Or Enter Password if Changed:
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={showCustomPassInput ? 'text' : 'password'}
                  placeholder="Enter administrator password"
                  value={customPassInput}
                  onChange={(e) => setCustomPassInput(e.target.value)}
                  className="input"
                  style={{ height: 38, fontSize: '0.85rem', paddingRight: '2.2rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCustomPassInput(!showCustomPassInput)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showCustomPassInput ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={adminLoginLoading || !customPassInput.trim()}
                className="btn btn-primary btn-sm"
                style={{ whiteSpace: 'nowrap', height: 38 }}
              >
                Sign In
              </button>
            </div>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Operations Panel</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Verify student & client credentials, resolve moderation reports, and monitor transactions
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => loadAdminData()} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
              <RefreshCw size={13} />
              <span>Refresh Data</span>
            </button>
            <button onClick={() => onNavigate('home')} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
              <span>Exit to Marketplace</span>
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="btn btn-danger btn-sm"
              style={{ gap: '0.35rem', fontWeight: 600 }}
              title="Sign out of Administrator and return to normal website"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Live Auto-Synchronization Status Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          padding: '0.65rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                boxShadow: '0 0 8px var(--accent-emerald)'
              }} />
              LIVE DATABASE METRICS
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Auto-syncs every 5s & on live activity • Last updated: <strong style={{ color: 'var(--text-main)' }}>{lastSyncedTime}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => loadAdminData(false)}
            disabled={isSyncing}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', gap: '0.35rem' }}
            title="Force instant sync with database"
          >
            <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>

        {/* 1. Global KPI Metrics (8 Key Metrics) */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            
            {/* Total Students */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Students</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalStudents ?? 0}</div>
              </div>
            </div>

            {/* Active Users */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserCheck size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Users</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{stats.activeUsers ?? 0}</div>
              </div>
            </div>

            {/* Total Services */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Layers size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Services</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>{stats.totalServices ?? 0}</div>
              </div>
            </div>

            {/* Total Projects */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Projects</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalProjects ?? 0}</div>
              </div>
            </div>

            {/* Completed Projects */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Completed</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{stats.completedProjects ?? 0}</div>
              </div>
            </div>

            {/* Active Projects */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Projects</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{stats.activeProjects ?? 0}</div>
              </div>
            </div>

            {/* Reported Users */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reported Users</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{stats.reportedUsers ?? 0}</div>
              </div>
            </div>

            {/* Platform Revenue */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DollarSign size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Platform Revenue</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  ₹{(stats.platformRevenue ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. Admin Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <BarChart3 size={15} />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`btn btn-sm ${activeTab === 'cms' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              gap: '0.4rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'cms' ? 'var(--primary)' : 'rgba(10, 95, 214, 0.08)',
              borderColor: 'var(--primary)',
              color: activeTab === 'cms' ? '#fff' : 'var(--primary)',
              fontWeight: 700
            }}
          >
            <Palette size={15} />
            <span>🎨 Website CMS & Customizer</span>
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`btn btn-sm ${activeTab === 'verifications' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <ShieldCheck size={15} />
            <span>Verification Center ({pendingVerifCount} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <Users size={15} />
            <span>User Directory ({users.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('chat'); loadAdminConversations(); }}
            className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              gap: '0.4rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'chat' ? 'var(--primary)' : 'var(--primary-light)',
              color: activeTab === 'chat' ? '#fff' : 'var(--primary)',
              borderColor: 'var(--primary)',
              fontWeight: 700
            }}
          >
            <MessageSquare size={15} />
            <span>💬 Live Chat (Students & Clients) {adminConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 ? `(${adminConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} new)` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <Layers size={15} />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`btn btn-sm ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <AlertTriangle size={15} />
            <span>Moderation Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('system'); loadSystemTelemetry(); }}
            className={`btn btn-sm ${activeTab === 'system' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <Sliders size={15} />
            <span>System & Admin Profile</span>
          </button>
        </div>

        {/* ─── TAB: WEBSITE CMS & DYNAMIC CUSTOMIZER ─────────────────────────── */}
        {activeTab === 'cms' && (
          <div>
            {/* CMS Action Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Sparkles size={16} />
                  <span>DYNAMIC CONTENT MANAGEMENT SYSTEM (CMS)</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0' }}>
                  Website Customizer & Live Site Manager
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Customize header brand, top announcement, hero section, benefits cards, footer, and economics with instant live publish.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveCmsSettings}
                disabled={cmsSaving}
                className="btn btn-primary"
                style={{ gap: '0.45rem', padding: '0.65rem 1.5rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(10, 95, 214, 0.3)' }}
              >
                {cmsSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                <span>{cmsSaving ? 'Publishing Changes…' : 'Save & Publish Live'}</span>
              </button>
            </div>

            {/* Notification Feedback */}
            {cmsSuccess && (
              <div style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald)',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                border: '1.5px solid rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle2 size={18} />
                <span>{cmsSuccess}</span>
              </div>
            )}

            {cmsError && (
              <div style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-rose-light)',
                color: 'var(--accent-rose)',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                border: '1.5px solid rgba(225, 29, 72, 0.3)'
              }}>
                <AlertTriangle size={18} />
                <span>{cmsError}</span>
              </div>
            )}

            {/* Grid of Box-Shaped Customizer Tiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* ── Box 1: Header Branding & Announcement Banner ── */}
              <div className="card" style={{ padding: '1.5rem', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layout size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>1. Header Branding & Announcement Banner</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure site name, subtitle tagline, and the top promotional banner</span>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Brand Display Name (Header)</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.header_brand_title || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, header_brand_title: e.target.value })}
                      placeholder="e.g. CampusGig"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Header Subtitle / Tagline</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.header_tagline || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, header_tagline: e.target.value })}
                      placeholder="e.g. STUDENT MARKETPLACE"
                    />
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Number(cmsForm.announcement_banner_enabled) === 1}
                        onChange={(e) => setCmsForm({ ...cmsForm, announcement_banner_enabled: e.target.checked ? 1 : 0 })}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Enable Top Site Announcement Banner</span>
                    </label>
                    <span className={`badge ${Number(cmsForm.announcement_banner_enabled) === 1 ? 'badge-verified' : 'badge-neutral'}`} style={{ fontSize: '0.72rem' }}>
                      {Number(cmsForm.announcement_banner_enabled) === 1 ? 'Live on Site' : 'Hidden'}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Banner Announcement Message</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.announcement_banner_text || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, announcement_banner_text: e.target.value })}
                      placeholder="e.g. 🚀 Welcome to Campus Student Marketplace • 100% Escrow Protection"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Live Header Preview
                </div>
                <div style={{
                  border: '1px dashed var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--bg-surface)'
                }}>
                  {Number(cmsForm.announcement_banner_enabled) === 1 && (
                    <div style={{
                      background: 'linear-gradient(90deg, #0A5FD6 0%, #1A7FE8 100%)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      padding: '0.35rem 1rem'
                    }}>
                      {cmsForm.announcement_banner_text || 'Announcement banner preview'}
                    </div>
                  )}
                  <div style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={15} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{cmsForm.header_brand_title || 'CampusGig'}</strong>
                        <span style={{ fontSize: '0.55rem', display: 'block', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {cmsForm.header_tagline || 'STUDENT MARKETPLACE'}
                        </span>
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Navbar Live Preview</span>
                  </div>
                </div>
              </div>

              {/* ── Box 2: Homepage Hero Section Customizer ── */}
              <div className="card" style={{ padding: '1.5rem', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Type size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>2. Homepage Hero Section Customizer</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Update the main headline, subtitle description, and search input placeholder</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Search Input Box Placeholder</label>
                  <input
                    type="text"
                    className="input"
                    value={cmsForm.hero_search_placeholder || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, hero_search_placeholder: e.target.value })}
                    placeholder="Search: 'Web Design', 'Poster', 'Python'…"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Main Hero Headline (H1)</label>
                  <input
                    type="text"
                    className="input"
                    value={cmsForm.hero_headline || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, hero_headline: e.target.value })}
                    placeholder="Find Student Help or Earn With Your Skills"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Hero Subheadline Description</label>
                  <textarea
                    rows={2}
                    className="textarea"
                    value={cmsForm.hero_subheadline || ''}
                    onChange={(e) => setCmsForm({ ...cmsForm, hero_subheadline: e.target.value })}
                    placeholder="Hire verified classmates for coding, design, video editing, and tutoring with safe escrow payments."
                  />
                </div>

                {/* Hero Live Preview */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Hero Live Preview
                </div>
                <div style={{
                  padding: '1.5rem 1rem',
                  border: '1px dashed var(--accent-amber)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {cmsForm.hero_headline || 'Hero Headline'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
                    {cmsForm.hero_subheadline || 'Hero subheadline description text...'}
                  </p>
                </div>
              </div>

              {/* ── Box 3: Homepage Feature Cards Section (Box Shape Design) ── */}
              <div className="card" style={{ padding: '1.5rem', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>3. Homepage Feature Cards (4 Modular Steps / Benefits)</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customize the 4 box cards that explain how CampusGig works to students and clients</span>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.25rem' }}>

                  {/* Card 1 */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-primary" style={{ width: 22, height: 22, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>1</span>
                      <strong style={{ fontSize: '0.88rem' }}>Feature Card 1</strong>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Title</label>
                      <input
                        type="text"
                        className="input"
                        value={cmsForm.card_1_title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_1_title: e.target.value })}
                        placeholder="1. Browse & Appoint"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Description</label>
                      <textarea
                        rows={2}
                        className="textarea"
                        value={cmsForm.card_1_desc || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_1_desc: e.target.value })}
                        placeholder="Explore student services, compare portfolios..."
                      />
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-verified" style={{ width: 22, height: 22, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>2</span>
                      <strong style={{ fontSize: '0.88rem' }}>Feature Card 2</strong>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Title</label>
                      <input
                        type="text"
                        className="input"
                        value={cmsForm.card_2_title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_2_title: e.target.value })}
                        placeholder="2. Safe Escrow"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Description</label>
                      <textarea
                        rows={2}
                        className="textarea"
                        value={cmsForm.card_2_desc || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_2_desc: e.target.value })}
                        placeholder="Your payment is held safely in escrow..."
                      />
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-warning" style={{ width: 22, height: 22, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>3</span>
                      <strong style={{ fontSize: '0.88rem' }}>Feature Card 3</strong>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Title</label>
                      <input
                        type="text"
                        className="input"
                        value={cmsForm.card_3_title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_3_title: e.target.value })}
                        placeholder="3. Chat & Work"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Description</label>
                      <textarea
                        rows={2}
                        className="textarea"
                        value={cmsForm.card_3_desc || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_3_desc: e.target.value })}
                        placeholder="Message your freelancer, share files..."
                      />
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-verified" style={{ width: 22, height: 22, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>4</span>
                      <strong style={{ fontSize: '0.88rem' }}>Feature Card 4</strong>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Title</label>
                      <input
                        type="text"
                        className="input"
                        value={cmsForm.card_4_title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_4_title: e.target.value })}
                        placeholder="4. Approve & Pay"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Description</label>
                      <textarea
                        rows={2}
                        className="textarea"
                        value={cmsForm.card_4_desc || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, card_4_desc: e.target.value })}
                        placeholder="Release payment to the student's wallet..."
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Box 4: Call to Action (CTA) Banner & Footer Section ── */}
              <div className="card" style={{ padding: '1.5rem', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>4. Call-to-Action Banner & Footer Settings</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customize homepage CTA banner, footer about note, copyright, and trust badges</span>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>CTA Banner Headline</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.cta_banner_title || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, cta_banner_title: e.target.value })}
                      placeholder="Want to Earn Money on Campus?"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>CTA Banner Description</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.cta_banner_desc || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, cta_banner_desc: e.target.value })}
                      placeholder="Offer your skills, get hired by fellow students..."
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Footer About Description</label>
                    <textarea
                      rows={2}
                      className="textarea"
                      value={cmsForm.footer_about_text || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, footer_about_text: e.target.value })}
                      placeholder="The student marketplace to find campus freelance help..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Trust & Safety Badge Text</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.footer_trust_badge || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, footer_trust_badge: e.target.value })}
                      placeholder="🎓 Safe Student Platform"
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Footer Copyright Notice</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.footer_copyright_text || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, footer_copyright_text: e.target.value })}
                      placeholder="© 2026 CampusGig • Student Freelance Marketplace"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Footer Tagline / Love Note</label>
                    <input
                      type="text"
                      className="input"
                      value={cmsForm.footer_love_text || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, footer_love_text: e.target.value })}
                      placeholder="Made with ❤️ for college students"
                    />
                  </div>
                </div>
              </div>

              {/* ── Box 5: Platform Economics & Commission Controls ── */}
              <div className="card" style={{ padding: '1.5rem', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Percent size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>5. Platform Economics & Facilitation Fees</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure marketplace commission fee and minimum project budget</span>
                  </div>
                </div>

                <div className="grid-3" style={{ gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Platform Commission Fee (%)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="0.5"
                        className="input"
                        value={cmsForm.platform_commission_percent || 0}
                        onChange={(e) => setCmsForm({ ...cmsForm, platform_commission_percent: Number(e.target.value) })}
                      />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>%</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Charged on project completion</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Minimum Project Budget (₹ INR)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        className="input"
                        value={cmsForm.minimum_budget_inr || 200}
                        onChange={(e) => setCmsForm({ ...cmsForm, minimum_budget_inr: Number(e.target.value) })}
                      />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>₹</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Minimum allowable gig price</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Administrator Support Email</label>
                    <input
                      type="email"
                      className="input"
                      value={cmsForm.support_email || 'srikanthstephen2007@gmail.com'}
                      onChange={(e) => setCmsForm({ ...cmsForm, support_email: e.target.value })}
                      placeholder="srikanthstephen2007@gmail.com"
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Shown to users for support</span>
                  </div>
                </div>
              </div>

              {/* ── Save Action Footer ── */}
              <div className="glass-card" style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                border: '1.5px solid var(--primary)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Ready to Publish All Website Changes?</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Saved customizations will immediately reflect on Header, Hero, Benefits Cards, and Footer.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCmsSettings}
                  disabled={cmsSaving}
                  className="btn btn-primary btn-lg"
                  style={{ gap: '0.5rem', padding: '0.75rem 2rem', fontWeight: 800 }}
                >
                  {cmsSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                  <span>{cmsSaving ? 'Publishing Live…' : 'Save & Publish Live Across Site'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ─── TAB: VERIFICATION CENTER (STUDENT IDs & CLIENT ORGS) ─────────── */}
        {activeTab === 'verifications' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ID & Organization Verification Queue</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Inspect submitted documents and approve verified badges for students and clients
                </p>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setVerifFilter('ALL')}
                  className={`btn btn-sm ${verifFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  All ({verifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVerifFilter('PENDING')}
                  className={`btn btn-sm ${verifFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  Pending ({pendingVerifCount})
                </button>
                <button
                  type="button"
                  onClick={() => setVerifFilter('student')}
                  className={`btn btn-sm ${verifFilter === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => setVerifFilter('client')}
                  className={`btn btn-sm ${verifFilter === 'client' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  Clients
                </button>
              </div>
            </div>

            {filteredVerifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredVerifications.map((verif) => (
                  <div
                    key={verif.id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      background: verif.status === 'PENDING' ? 'var(--bg-surface)' : 'var(--bg-main)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 280 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: verif.user_type === 'client' ? 'rgba(16,185,129,0.15)' : 'rgba(10,95,214,0.15)',
                        color: verif.user_type === 'client' ? 'var(--accent-emerald)' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {verif.user_type === 'client' ? <Building size={22} /> : <GraduationCap size={22} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <strong style={{ fontSize: '0.98rem' }}>{verif.user?.name || 'Applicant'}</strong>
                          <span className={`badge ${verif.user_type === 'client' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                            {verif.user_type}
                          </span>
                          <span className={`badge ${verif.status === 'APPROVED' ? 'badge-verified' : verif.status === 'PENDING' ? 'badge-primary' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                            {verif.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {verif.organization_name || verif.college_name || verif.user?.college} • {verif.user?.email}
                        </div>

                        {verif.notes && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-main)', margin: 0, fontStyle: 'italic' }}>
                            "{verif.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Document Preview & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {verif.document_url && (
                        <a
                          href={verif.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-secondary"
                          style={{ gap: '0.35rem', fontSize: '0.8rem' }}
                        >
                          <FileText size={14} />
                          <span>View Document</span>
                          <ExternalLink size={11} />
                        </a>
                      )}

                      {verif.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleVerificationDecision(verif.id, 'APPROVE')}
                            disabled={actionLoading === verif.id}
                            className="btn btn-sm btn-primary"
                            style={{ gap: '0.3rem', fontSize: '0.8rem' }}
                          >
                            {actionLoading === verif.id ? <Loader2 size={13} className="spin" /> : <CheckCircle2 size={14} />}
                            <span>Approve & Grant Badge</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVerificationDecision(verif.id, 'REJECT')}
                            disabled={actionLoading === verif.id}
                            className="btn btn-sm btn-secondary"
                            style={{ gap: '0.3rem', fontSize: '0.8rem', color: 'var(--accent-rose)' }}
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Reviewed on {verif.reviewed_at ? new Date(verif.reviewed_at).toLocaleDateString() : 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <ShieldCheck size={36} style={{ color: 'var(--accent-emerald)', margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Verification Requests</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  All student ID and client organization verification submissions have been processed!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: OVERVIEW & 4 CHARTS (LIVE & SYNCHRONIZED) ──────────────── */}
        {activeTab === 'overview' && charts && (
          <div>
            {/* Live Telemetry Synchronization Control Bar */}
            <div className="card" style={{
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--accent-emerald)',
                  fontWeight: 700,
                  fontSize: '0.78rem'
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent-emerald)',
                    boxShadow: '0 0 8px var(--accent-emerald)'
                  }} />
                  LIVE DATABASE SYNCHRONIZED
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Auto-syncing every 10s • Last updated: <strong style={{ color: 'var(--text-main)' }}>{lastSyncedTime}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* Timeframe selector: Monthly vs 7-Day Live */}
                <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: 3, border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setChartTimeframe('monthly')}
                    className="btn btn-sm"
                    style={{
                      border: 'none',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: chartTimeframe === 'monthly' ? 'var(--primary)' : 'transparent',
                      color: chartTimeframe === 'monthly' ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700
                    }}
                  >
                    📅 By Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartTimeframe('daily')}
                    className="btn btn-sm"
                    style={{
                      border: 'none',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: chartTimeframe === 'daily' ? 'var(--primary)' : 'transparent',
                      color: chartTimeframe === 'daily' ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700
                    }}
                  >
                    ⚡ Last 7 Days (Live)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => loadAdminData(false)}
                  disabled={isSyncing}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem', fontSize: '0.78rem' }}
                >
                  <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              
              {/* 1. CHART: USER GROWTH */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>User Growth Trend</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                      {chartTimeframe === 'daily' ? 'Live daily student & client onboarding' : 'Monthly student & client registrations'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} /> Students
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} /> Clients
                    </span>
                  </div>
                </div>

                {(() => {
                  const data = chartTimeframe === 'daily' ? (charts.dailyUserGrowth || []) : (charts.userGrowth || []);
                  const maxVal = Math.max(...data.map(u => Math.max(u.students || 0, u.clients || 0)), 1);
                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', gap: '0.5rem' }}>
                      {data.map((u, idx) => {
                        const studentHeight = u.students > 0 ? Math.max(16, Math.round((u.students / maxVal) * 110)) : 6;
                        const clientHeight = u.clients > 0 ? Math.max(16, Math.round((u.clients / maxVal) * 110)) : 6;
                        return (
                          <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: 130 }}>
                              {/* Student Bar */}
                              <div
                                title={`${u.month}: ${u.students} Students`}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  width: '42%',
                                  minWidth: 10
                                }}
                              >
                                {u.students > 0 && (
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 2 }}>
                                    {u.students}
                                  </span>
                                )}
                                <div style={{
                                  height: `${studentHeight}px`,
                                  background: u.students > 0 ? 'linear-gradient(180deg, var(--primary) 0%, #0284c7 100%)' : 'rgba(10, 95, 214, 0.15)',
                                  borderRadius: '3px 3px 0 0',
                                  width: '100%'
                                }} />
                              </div>

                              {/* Client Bar */}
                              <div
                                title={`${u.month}: ${u.clients} Clients`}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  width: '42%',
                                  minWidth: 10
                                }}
                              >
                                {u.clients > 0 && (
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: 2 }}>
                                    {u.clients}
                                  </span>
                                )}
                                <div style={{
                                  height: `${clientHeight}px`,
                                  background: u.clients > 0 ? 'linear-gradient(180deg, var(--accent-emerald) 0%, #059669 100%)' : 'rgba(16, 185, 129, 0.15)',
                                  borderRadius: '3px 3px 0 0',
                                  width: '100%'
                                }} />
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 6, fontWeight: 600 }}>
                              {u.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* 2. CHART: PROJECTS ACTIVITY */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Projects Activity</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                      {chartTimeframe === 'daily' ? 'Live daily requested vs completed delivery' : 'Requested vs Completed project delivery'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)' }} /> Requested
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} /> Completed
                    </span>
                  </div>
                </div>

                {(() => {
                  const data = chartTimeframe === 'daily' ? (charts.dailyProjects || []) : (charts.monthlyProjects || []);
                  const maxVal = Math.max(...data.map(m => Math.max(m.requested || 0, m.completed || 0)), 1);
                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', gap: '0.5rem' }}>
                      {data.map((m, idx) => {
                        const reqHeight = m.requested > 0 ? Math.max(16, Math.round((m.requested / maxVal) * 110)) : 6;
                        const compHeight = m.completed > 0 ? Math.max(16, Math.round((m.completed / maxVal) * 110)) : 6;
                        return (
                          <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: 130 }}>
                              {/* Requested Bar */}
                              <div
                                title={`${m.month}: ${m.requested} Requested`}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  width: '42%',
                                  minWidth: 10
                                }}
                              >
                                {m.requested > 0 && (
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: 2 }}>
                                    {m.requested}
                                  </span>
                                )}
                                <div style={{
                                  height: `${reqHeight}px`,
                                  background: m.requested > 0 ? 'linear-gradient(180deg, var(--secondary) 0%, #7c3aed 100%)' : 'rgba(139, 92, 246, 0.15)',
                                  borderRadius: '3px 3px 0 0',
                                  width: '100%'
                                }} />
                              </div>

                              {/* Completed Bar */}
                              <div
                                title={`${m.month}: ${m.completed} Completed`}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  width: '42%',
                                  minWidth: 10
                                }}
                              >
                                {m.completed > 0 && (
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: 2 }}>
                                    {m.completed}
                                  </span>
                                )}
                                <div style={{
                                  height: `${compHeight}px`,
                                  background: m.completed > 0 ? 'linear-gradient(180deg, var(--accent-emerald) 0%, #059669 100%)' : 'rgba(16, 185, 129, 0.15)',
                                  borderRadius: '3px 3px 0 0',
                                  width: '100%'
                                }} />
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 6, fontWeight: 600 }}>
                              {m.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* 3. CHART: REVENUE & TRANSACTION VOLUME */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Platform Revenue Trajectory</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                      Gross volume & 5% facilitation fee ({chartTimeframe === 'daily' ? 'Last 7 Days' : 'Monthly'})
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700 }}>
                    <TrendingUp size={18} />
                    <span>₹{(stats?.platformRevenue || 0).toLocaleString()} Total Earned</span>
                  </div>
                </div>

                {(() => {
                  const data = chartTimeframe === 'daily' ? (charts.dailyRevenue || []) : (charts.revenueGrowth || []);
                  const maxVal = Math.max(...data.map(r => r.volume || 0), 1);
                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', gap: '0.5rem' }}>
                      {data.map((r, idx) => {
                        const vol = r.volume || 0;
                        const fee = r.revenue || Math.round(vol * 0.05);
                        const barHeight = vol > 0 ? Math.max(18, Math.round((vol / maxVal) * 110)) : 6;
                        return (
                          <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: 130 }}>
                              {vol > 0 && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: 2 }}>
                                  ₹{vol >= 1000 ? `${(vol / 1000).toFixed(vol % 1000 === 0 ? 0 : 1)}k` : vol}
                                </span>
                              )}
                              <div
                                title={`${r.month}: Gross Volume ₹${vol.toLocaleString()} • Platform Fee (5%): ₹${fee.toLocaleString()}`}
                                style={{
                                  height: `${barHeight}px`,
                                  background: vol > 0 ? 'linear-gradient(180deg, var(--accent-emerald) 0%, #0d9488 100%)' : 'rgba(16, 185, 129, 0.15)',
                                  borderRadius: '4px 4px 0 0',
                                  width: '55%',
                                  minWidth: 12
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 6, fontWeight: 600 }}>
                              {r.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* 4. CHART: POPULAR CATEGORIES */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Popular Categories</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Real-time student gigs distribution</p>
                  </div>
                  <Layers size={18} style={{ color: 'var(--primary)' }} />
                </div>

                {(() => {
                  const categoriesList = charts.popularCategories || charts.categories || [];
                  const activeCats = categoriesList.filter(c => (c.service_count || 0) > 0);
                  const displayCats = activeCats.length > 0 ? activeCats : categoriesList.slice(0, 6);
                  const totalGigs = displayCats.reduce((acc, c) => acc + (c.service_count || 0), 0) || 1;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 180, overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {displayCats.map((cat, idx) => {
                        const count = cat.service_count || 0;
                        const pct = Math.round((count / totalGigs) * 100);
                        const colors = ['var(--primary)', 'var(--accent-emerald)', 'var(--secondary)', 'var(--accent-amber)', '#06b6d4', '#ec4899'];
                        const barColor = colors[idx % colors.length];

                        return (
                          <div key={cat.id || idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{cat.name}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                <strong style={{ color: 'var(--text-main)' }}>{count}</strong> {count === 1 ? 'gig' : 'gigs'} ({pct}%)
                              </span>
                            </div>
                            <div style={{ width: '100%', height: 7, borderRadius: 'var(--radius-full)', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.max(6, pct)}%`,
                                  height: '100%',
                                  borderRadius: 'var(--radius-full)',
                                  background: barColor,
                                  transition: 'width 0.5s ease'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}

        {/* ─── TAB: USERS DIRECTORY & FREELANCER GOVERNANCE ─────────────────── */}
        {activeTab === 'users' && (
          <div>
            {/* Header & Controls Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>User Directory & Freelancer Governance</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Manage student freelancers and clients, dispatch real-time chat notices, or permanently remove accounts
                </p>
              </div>

              {/* Role Filters */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('ALL')}
                  className={`btn btn-sm ${userRoleFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
                >
                  All Users ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('student')}
                  className={`btn btn-sm ${userRoleFilter === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
                >
                  Student Freelancers ({users.filter(u => u.role === 'student').length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('client')}
                  className={`btn btn-sm ${userRoleFilter === 'client' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
                >
                  Clients ({users.filter(u => u.role === 'client').length})
                </button>
              </div>
            </div>

            {/* Live Action Feedback Alert */}
            {userActionMsg && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-emerald)',
                fontSize: '0.88rem',
                marginBottom: '1.25rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{userActionMsg}</span>
              </div>
            )}

            {/* Search Input Box */}
            <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search freelancers or clients by name, email, department, college, or skills..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)'
                }}
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Users Table */}
            {(() => {
              const filteredUsers = users.filter(u => {
                if (userRoleFilter === 'student' && u.role !== 'student') return false;
                if (userRoleFilter === 'client' && u.role !== 'client') return false;
                if (userSearchQuery.trim()) {
                  const q = userSearchQuery.toLowerCase();
                  const matchName = (u.name || '').toLowerCase().includes(q);
                  const matchEmail = (u.email || '').toLowerCase().includes(q);
                  const matchCollege = (u.college || '').toLowerCase().includes(q);
                  const matchDept = (u.department || '').toLowerCase().includes(q);
                  return matchName || matchEmail || matchCollege || matchDept;
                }
                return true;
              });

              return (
                <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', background: 'var(--bg-surface-elevated)' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>User Profile</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                        <th style={{ padding: '0.85rem 1rem' }}>College / Department</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Badges</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Admin Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <img
                                  src={getProfessionalAvatar(u)}
                                  alt={u.name}
                                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-color)' }}
                                />
                                <div>
                                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>{u.name}</strong>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className={`badge ${u.role === 'student' ? 'badge-primary' : 'badge-neutral'}`} style={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>
                                {u.role === 'student' ? 'Student Freelancer' : u.role}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ fontWeight: 600 }}>{u.college || 'Campus Member'}</span>
                              {u.department && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                                  {u.department}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                {u.is_verified_student === 1 && (
                                  <span className="badge badge-verified" style={{ fontSize: '0.68rem' }}>Student ✓</span>
                                )}
                                {u.is_verified_client === 1 && (
                                  <span className="badge badge-verified" style={{ fontSize: '0.68rem' }}>Client ✓</span>
                                )}
                                {!u.is_verified_student && !u.is_verified_client && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Standard</span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className={`badge ${u.is_suspended ? 'badge-danger' : 'badge-verified'}`} style={{ fontSize: '0.72rem' }}>
                                {u.is_suspended ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                                
                                {/* 1. Open Two-Way Live Chat with Student or Client */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('chat');
                                    setSelectedChatUser(u);
                                    loadAdminChatMessages(u.id);
                                    loadAdminConversations(u.id);
                                  }}
                                  className="btn btn-sm btn-secondary"
                                  style={{ gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.75rem', fontWeight: 600 }}
                                  title={`Open real-time chat with ${u.name}`}
                                >
                                  <MessageSquare size={13} style={{ color: 'var(--primary)' }} />
                                  <span>Chat with {u.role === 'student' ? 'Student' : 'Client'}</span>
                                </button>

                                {/* 2. Toggle Verification Badge */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleVerification(u.id, u.is_verified_student)}
                                  className="btn btn-sm btn-secondary"
                                  style={{ padding: '0.35rem 0.55rem' }}
                                  title="Toggle Verification Badge"
                                >
                                  <UserCheck size={14} />
                                </button>

                                {/* 3. Toggle Suspension */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuspension(u.id, u.is_suspended)}
                                  className={`btn btn-sm ${u.is_suspended ? 'btn-primary' : 'btn-secondary'}`}
                                  style={{ padding: '0.35rem 0.55rem', color: u.is_suspended ? '#fff' : 'var(--accent-rose)' }}
                                  title={u.is_suspended ? 'Unsuspend' : 'Suspend User'}
                                >
                                  {u.is_suspended ? <Unlock size={14} /> : <Lock size={14} />}
                                </button>

                                {/* 4. Permanently Remove / Delete Student or User */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={userDeletingId === u.id}
                                  className="btn btn-sm btn-danger"
                                  style={{
                                    padding: '0.35rem 0.75rem',
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    color: 'var(--accent-rose)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    fontWeight: 700,
                                    gap: '0.35rem',
                                    fontSize: '0.78rem'
                                  }}
                                  title={`Permanently delete ${u.role === 'student' ? 'student freelancer' : 'client'} account`}
                                >
                                  {userDeletingId === u.id ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />}
                                  <span>Delete {u.role === 'student' ? 'Student' : 'User'}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No users found matching your search and filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* ─── MODAL: DISPATCH ADMIN CHAT NOTICE / UPDATE ────────────────── */}
            {showChatModal && chatModalUser && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}>
                <div className="card" style={{ maxWidth: 540, width: '100%', padding: '2rem', boxShadow: 'var(--shadow-2xl)' }}>
                  
                  {/* Modal Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Dispatch Admin Chat Notice</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Delivers directly to {chatModalUser.name}'s chat & notifications
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChatModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Target User Info */}
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={getProfessionalAvatar(chatModalUser)}
                        alt={chatModalUser.name}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.88rem', display: 'block' }}>{chatModalUser.name}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{chatModalUser.email}</span>
                      </div>
                    </div>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                      {chatModalUser.role}
                    </span>
                  </div>

                  {/* Preset Templates */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Quick Templates:
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setChatNoticeTitle('Workstation & Milestone Check-In 💼');
                          setChatNoticeContent(`Hello ${chatModalUser.name}, please ensure that all work deliverables, time limits, and project files are updated inside your CampusGig workstation.`);
                        }}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                      >
                        💼 Workstation Check-In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChatNoticeTitle('Account Verification & Document Review 🎓');
                          setChatNoticeContent(`Hello ${chatModalUser.name}, your account documentation has been reviewed by campus administration. Please visit your profile settings to view your verification status.`);
                        }}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                      >
                        🎓 Verification Update
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChatNoticeTitle('Marketplace Policy & Safety Notice ⚠️');
                          setChatNoticeContent(`Hello ${chatModalUser.name}, please remember that all project communications and escrow transactions must remain inside CampusGig to guarantee student buyer protection.`);
                        }}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                      >
                        ⚠️ Policy Warning
                      </button>
                    </div>
                  </div>

                  {chatNoticeMsg && (
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-emerald-light)',
                      color: 'var(--accent-emerald)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <CheckCircle2 size={15} />
                      <span>{chatNoticeMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendChatNotice}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Notice Title</label>
                      <input
                        type="text"
                        required
                        value={chatNoticeTitle}
                        onChange={(e) => setChatNoticeTitle(e.target.value)}
                        className="input"
                        placeholder="e.g. Official Platform Update"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">Message Content (Delivered to Chat)</label>
                      <textarea
                        rows={4}
                        required
                        value={chatNoticeContent}
                        onChange={(e) => setChatNoticeContent(e.target.value)}
                        className="input"
                        placeholder="Write official administrative notice or message..."
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowChatModal(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sendingChatNotice || !chatNoticeContent.trim()}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '0.35rem' }}
                      >
                        {sendingChatNotice ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
                        <span>Send to Chat</span>
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: TWO-WAY LIVE CHAT WITH STUDENTS & CLIENTS ──────────────── */}
        {activeTab === 'chat' && (() => {
          const filteredConversations = adminConversations.filter(c => {
            if (chatRoleFilter !== 'ALL' && c.role !== chatRoleFilter) return false;
            if (chatSearchQuery.trim()) {
              const q = chatSearchQuery.toLowerCase();
              const matchName = (c.name || '').toLowerCase().includes(q);
              const matchEmail = (c.email || '').toLowerCase().includes(q);
              const matchCollege = (c.college || '').toLowerCase().includes(q);
              return matchName || matchEmail || matchCollege;
            }
            return true;
          });

          return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '330px 1fr',
              gap: '1.25rem',
              minHeight: '75vh',
              alignItems: 'stretch'
            }}>
              {/* Left Column: Conversations Directory */}
              <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '78vh' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                      <span>Direct User Chats</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => loadAdminConversations()}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '0.2rem 0.4rem', height: 26 }}
                      title="Refresh conversations"
                    >
                      <RefreshCw size={12} className={loadingConversations ? 'spin' : ''} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0 0 0.65rem' }}>
                    Real-time two-way messaging with students & clients
                  </p>

                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search student or client..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '2rem', height: 34, fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Filter Chips */}
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {['ALL', 'student', 'client'].map(rf => (
                      <button
                        key={rf}
                        type="button"
                        onClick={() => setChatRoleFilter(rf)}
                        className={`btn btn-sm ${chatRoleFilter === rf ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
                      >
                        {rf === 'ALL' ? 'All' : rf === 'student' ? 'Students 🎓' : 'Clients 💼'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversations List */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {loadingConversations && adminConversations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      <Loader2 size={20} className="spin" style={{ margin: '0 auto 0.4rem', color: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.8rem' }}>Loading conversations...</span>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No users found.
                    </div>
                  ) : (
                    filteredConversations.map(conv => {
                      const isSelected = selectedChatUser && Number(selectedChatUser.id) === Number(conv.id);
                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setSelectedChatUser(conv);
                            loadAdminChatMessages(conv.id);
                          }}
                          style={{
                            padding: '0.65rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                            border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <img
                                src={getProfessionalAvatar(conv)}
                                alt={conv.name}
                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                              />
                              {conv.unreadCount > 0 && (
                                <span style={{
                                  position: 'absolute',
                                  top: -3,
                                  right: -3,
                                  background: 'var(--accent-emerald)',
                                  color: '#fff',
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  minWidth: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1.5px solid var(--bg-surface)',
                                  padding: '0 2px'
                                }}>
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
                                <strong style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {conv.name}
                                </strong>
                                <span className="badge" style={{
                                  fontSize: '0.62rem',
                                  padding: '0.1rem 0.35rem',
                                  background: conv.role === 'student' ? 'var(--primary-light)' : 'var(--bg-surface)',
                                  color: conv.role === 'student' ? 'var(--primary)' : 'var(--text-body)'
                                }}>
                                  {conv.role === 'student' ? 'Student' : 'Client'}
                                </span>
                              </div>

                              <p style={{
                                margin: '0.15rem 0 0',
                                fontSize: '0.74rem',
                                color: conv.unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                                fontWeight: conv.unreadCount > 0 ? 700 : 400,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {conv.lastMessage?.content || 'Click to open chat thread'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Active Chat Thread */}
              <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '78vh', overflow: 'hidden' }}>
                {selectedChatUser ? (
                  <>
                    {/* Chat Header */}
                    <div style={{
                      padding: '0.85rem 1.25rem',
                      background: 'var(--bg-surface-elevated)',
                      borderBottom: '1.5px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={getProfessionalAvatar(selectedChatUser)}
                          alt={selectedChatUser.name}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                              {selectedChatUser.name}
                            </h3>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                              {selectedChatUser.role === 'student' ? 'Student Freelancer' : 'Client'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {selectedChatUser.email} • {selectedChatUser.college || 'Campus Member'}
                          </span>
                        </div>
                      </div>

                      {/* Chat Header Action Controls */}
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => onNavigate('profile', { userId: selectedChatUser.id })}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '0.75rem', gap: '0.3rem', padding: '0.3rem 0.65rem' }}
                        >
                          <ExternalLink size={13} />
                          <span>View Profile</span>
                        </button>

                        {/* Prominent Delete Student / User Button right in Chat Header */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(selectedChatUser)}
                          className="btn btn-sm btn-danger"
                          style={{
                            fontSize: '0.75rem',
                            gap: '0.3rem',
                            padding: '0.3rem 0.75rem',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: 'var(--accent-rose)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            fontWeight: 700
                          }}
                          title={`Permanently delete ${selectedChatUser.name}`}
                        >
                          <Trash2 size={13} />
                          <span>Delete {selectedChatUser.role === 'student' ? 'Student' : 'User'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Preset Quick Admin Templates */}
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--bg-main)',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      gap: '0.4rem',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap'
                    }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center' }}>
                        Quick Templates:
                      </span>
                      {[
                        { label: '💼 Workstation Check-In', text: `Hello ${selectedChatUser.name}, this is an official check-in regarding your active CampusGig projects and milestones.` },
                        { label: '🎓 ID Verification Review', text: `Hello ${selectedChatUser.name}, your account documentation has been reviewed by administration. Please visit your profile to check your badge status.` },
                        { label: '💰 Escrow Assistance', text: `Hello ${selectedChatUser.name}, our administration team is monitoring your payment and escrow status.` },
                        { label: '⚠️ Guidelines Warning', text: `Notice: Please adhere strictly to CampusGig community safety guidelines.` }
                      ].map((tpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAdminChatInput(tpl.text)}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)' }}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>

                    {/* Messages Stream */}
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      background: 'var(--bg-surface)'
                    }}>
                      {loadingChatMessages ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary)' }} />
                          <span>Loading messages...</span>
                        </div>
                      ) : adminChatMessages.length === 0 ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: 300 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No messages yet with {selectedChatUser.name}.</p>
                          <p style={{ fontSize: '0.78rem' }}>Send a message below to initiate direct administrator chat.</p>
                        </div>
                      ) : (
                        adminChatMessages.map((msg, idx) => {
                          const isAdminMsg = Number(msg.sender_id) === Number(user?.id);
                          return (
                            <div
                              key={msg.id || idx}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isAdminMsg ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                alignSelf: isAdminMsg ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                marginBottom: '0.2rem',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)'
                              }}>
                                <span>{isAdminMsg ? 'Admin (You) 🛡️' : selectedChatUser.name}</span>
                                <span>•</span>
                                <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                              </div>

                              <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '0.88rem',
                                lineHeight: 1.5,
                                wordBreak: 'break-word',
                                background: isAdminMsg
                                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
                                  : 'var(--bg-surface-elevated)',
                                color: isAdminMsg ? '#FFFFFF' : 'var(--text-main)',
                                border: isAdminMsg ? 'none' : '1px solid var(--border-color)',
                                boxShadow: isAdminMsg ? '0 3px 12px var(--primary-glow)' : 'var(--shadow-xs)',
                                borderTopRightRadius: isAdminMsg ? 2 : 'var(--radius-lg)',
                                borderTopLeftRadius: !isAdminMsg ? 2 : 'var(--radius-lg)'
                              }}>
                                {msg.content}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={adminChatEndRef} />
                    </div>

                    {/* Input Form */}
                    <form
                      onSubmit={handleSendAdminChatMessage}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-surface-elevated)',
                        borderTop: '1.5px solid var(--border-color)',
                        display: 'flex',
                        gap: '0.6rem'
                      }}
                    >
                      <input
                        type="text"
                        placeholder={`Send official message to ${selectedChatUser.name}...`}
                        value={adminChatInput}
                        onChange={(e) => setAdminChatInput(e.target.value)}
                        disabled={sendingAdminMsg}
                        className="input"
                        style={{ flex: 1, height: 38, fontSize: '0.88rem' }}
                      />
                      <button
                        type="submit"
                        disabled={!adminChatInput.trim() || sendingAdminMsg}
                        className="btn btn-primary"
                        style={{ height: 38, padding: '0 1.25rem', fontWeight: 700 }}
                      >
                        {sendingAdminMsg ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
                        <span>Send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    <MessageSquare size={36} style={{ color: 'var(--primary)', margin: '0 auto 0.75rem', opacity: 0.6 }} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Two-Way Admin Messenger
                    </h4>
                    <p style={{ fontSize: '0.82rem', maxWidth: 360, lineHeight: 1.5 }}>
                      Select any student freelancer or client from the left directory to view full message history, send real-time updates, or resolve support inquiries.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ─── TAB: CATEGORIES MANAGEMENT ───────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Service Marketplace Categories</h3>
              <button onClick={() => setShowAddCat(!showAddCat)} className="btn btn-primary btn-sm" style={{ gap: '0.3rem' }}>
                <Plus size={14} />
                <span>Add Category</span>
              </button>
            </div>

            {showAddCat && (
              <form onSubmit={handleAddCategory} className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-surface-elevated)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Create New Category</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mobile App Development"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      placeholder="Short description..."
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowAddCat(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Category</button>
                </div>
              </form>
            )}

            <div className="grid-3">
              {categories.map((cat) => (
                <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{cat.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.description || 'General category'}</p>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="btn btn-sm btn-secondary" style={{ color: 'var(--accent-rose)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: MODERATION REPORTS ───────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Community Safety & Moderation Reports</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Review flagged users, gigs, reviews, chat messages, and project contracts
                </p>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: `All (${reports.length})` },
                  { id: 'PENDING', label: `Pending (${reports.filter(r => r.status === 'PENDING').length})` },
                  { id: 'user', label: `Users (${reports.filter(r => r.target_type === 'user').length})` },
                  { id: 'service', label: `Services (${reports.filter(r => r.target_type === 'service').length})` },
                  { id: 'review', label: `Reviews (${reports.filter(r => r.target_type === 'review').length})` },
                  { id: 'message', label: `Messages (${reports.filter(r => r.target_type === 'message').length})` },
                  { id: 'project', label: `Projects (${reports.filter(r => r.target_type === 'project').length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReportFilter(tab.id)}
                    className={`btn btn-sm ${reportFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {reportActionMsg && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-emerald)',
                fontSize: '0.88rem',
                marginBottom: '1.25rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{reportActionMsg}</span>
              </div>
            )}

            {reports.filter(r => {
              if (reportFilter === 'PENDING') return r.status === 'PENDING';
              if (['user', 'service', 'review', 'message', 'project'].includes(reportFilter)) return r.target_type === reportFilter;
              return true;
            }).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.filter(r => {
                  if (reportFilter === 'PENDING') return r.status === 'PENDING';
                  if (['user', 'service', 'review', 'message', 'project'].includes(reportFilter)) return r.target_type === reportFilter;
                  return true;
                }).map((rep) => (
                  <div
                    key={rep.id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      background: rep.status === 'PENDING' ? 'var(--bg-surface)' : 'var(--bg-main)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: 280 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: 'var(--accent-rose)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <AlertTriangle size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-danger" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            {rep.reason}
                          </span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                            Target: {rep.target_type} #{rep.target_id}
                          </span>
                          <span className={`badge ${rep.status === 'PENDING' ? 'badge-primary' : rep.status === 'RESOLVED' ? 'badge-verified' : 'badge-neutral'}`} style={{ fontSize: '0.68rem' }}>
                            {rep.status}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.2rem 0' }}>
                          {rep.target_name || `${rep.target_type} #${rep.target_id}`}
                        </h4>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                          Reported by: <strong style={{ color: 'var(--text-main)' }}>{rep.reporter_name || `User #${rep.reporter_id}`}</strong> ({rep.reporter_email || 'Verified User'}) • {new Date(rep.created_at).toLocaleDateString()}
                        </div>

                        {rep.details && (
                          <div style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--bg-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.82rem',
                            color: 'var(--text-main)',
                            lineHeight: 1.4
                          }}>
                            <strong>Details / Evidence:</strong> "{rep.details}"
                          </div>
                        )}

                        {rep.admin_notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                            Admin Note: {rep.admin_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {rep.status === 'PENDING' ? (
                        <>
                          {rep.target_type === 'user' && (
                            <button
                              type="button"
                              onClick={() => handleResolveReport(rep.id, 'BAN_USER')}
                              disabled={actionLoading === rep.id}
                              className="btn btn-sm btn-danger"
                              style={{ gap: '0.3rem', fontSize: '0.78rem' }}
                            >
                              <ShieldAlert size={14} />
                              <span>Ban & Suspend User</span>
                            </button>
                          )}

                          {rep.target_type === 'service' && (
                            <button
                              type="button"
                              onClick={() => handleResolveReport(rep.id, 'DEACTIVATE_SERVICE')}
                              disabled={actionLoading === rep.id}
                              className="btn btn-sm btn-danger"
                              style={{ gap: '0.3rem', fontSize: '0.78rem' }}
                            >
                              <EyeOff size={14} />
                              <span>Deactivate Gig</span>
                            </button>
                          )}

                          {rep.target_type === 'review' && (
                            <button
                              type="button"
                              onClick={() => handleResolveReport(rep.id, 'DELETE_REVIEW')}
                              disabled={actionLoading === rep.id}
                              className="btn btn-sm btn-danger"
                              style={{ gap: '0.3rem', fontSize: '0.78rem' }}
                            >
                              <Trash2 size={14} />
                              <span>Delete Review</span>
                            </button>
                          )}

                          {rep.target_type === 'message' && (
                            <button
                              type="button"
                              onClick={() => handleResolveReport(rep.id, 'DELETE_MESSAGE')}
                              disabled={actionLoading === rep.id}
                              className="btn btn-sm btn-danger"
                              style={{ gap: '0.3rem', fontSize: '0.78rem' }}
                            >
                              <Trash2 size={14} />
                              <span>Remove Message</span>
                            </button>
                          )}

                          {rep.target_type === 'project' && (
                            <button
                              type="button"
                              onClick={() => handleResolveReport(rep.id, 'CANCEL_PROJECT')}
                              disabled={actionLoading === rep.id}
                              className="btn btn-sm btn-danger"
                              style={{ gap: '0.3rem', fontSize: '0.78rem' }}
                            >
                              <XCircle size={14} />
                              <span>Cancel Project</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleResolveReport(rep.id, 'DISMISS')}
                            disabled={actionLoading === rep.id}
                            className="btn btn-sm btn-secondary"
                            style={{ gap: '0.3rem', fontSize: '0.78rem' }}
                          >
                            <Check size={14} />
                            <span>Dismiss (No Violation)</span>
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Resolved on {new Date().toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--accent-emerald)', margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Reports in this View</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  All safety flags and moderation tickets have been handled!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: SYSTEM & ADMIN PROFILE MANAGEMENT ───────────────────────── */}
        {activeTab === 'system' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>System Management & Admin Settings</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage administrator credentials, change admin password, and monitor platform server diagnostics
              </p>
            </div>

            {/* Admin Profile & Password Management Grid */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              
              {/* 1. Admin Profile Info (Name & Email) */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(10, 95, 214, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Admin Profile Credentials</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Update admin username and contact email</span>
                  </div>
                </div>

                {adminProfileMsg && (
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} />
                    <span>{adminProfileMsg}</span>
                  </div>
                )}

                {adminProfileError && (
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={15} />
                    <span>{adminProfileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateAdminProfile}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Administrator Display Name</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="input"
                      placeholder="e.g. Srikanth Stephen"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Admin Email Address</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="input"
                      placeholder="srikanthstephen2007@gmail.com"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Administrative Department / Campus</label>
                    <input
                      type="text"
                      value={adminCollege}
                      onChange={(e) => setAdminCollege(e.target.value)}
                      className="input"
                      placeholder="Platform Administration"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Administrative Bio / Role Scope</label>
                    <textarea
                      value={adminBio}
                      onChange={(e) => setAdminBio(e.target.value)}
                      className="textarea"
                      rows={3}
                      placeholder="Marketplace operations, verification auditor, safety moderator"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminProfileLoading}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    {adminProfileLoading ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                    <span>Save Admin Profile Changes</span>
                  </button>
                </form>
              </div>

              {/* 2. Change Admin Password */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Change Admin Password</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Update your administrative login password</span>
                  </div>
                </div>

                {adminPassMsg && (
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} />
                    <span>{adminPassMsg}</span>
                  </div>
                )}

                {adminPassError && (
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={15} />
                    <span>{adminPassError}</span>
                  </div>
                )}

                <form onSubmit={handleChangeAdminPassword}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input"
                        style={{ paddingRight: '2.5rem' }}
                        placeholder="Enter current password (e.g. stephen@123)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">New Password (Min 6 Characters)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input"
                        style={{ paddingRight: '2.5rem' }}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input"
                        style={{ paddingRight: '2.5rem' }}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminPassLoading}
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    {adminPassLoading ? <Loader2 size={15} className="spin" /> : <Lock size={15} />}
                    <span>Update Admin Password</span>
                  </button>
                </form>
              </div>

            </div>

            {/* 3. System Telemetry & Server Diagnostics */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Server size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>System Telemetry & Health</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time server runtime, memory usage & database records</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={loadSystemTelemetry}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <RefreshCw size={13} />
                    <span>Refresh Telemetry</span>
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <Download size={13} />
                    <span>Export Database Snapshot</span>
                  </button>
                </div>
              </div>

              {systemInfo ? (
                <div>
                  <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>NODE RUNTIME</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>{systemInfo.nodeVersion}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{systemInfo.platform} ({systemInfo.arch})</span>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SERVER UPTIME</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--accent-emerald)' }}>
                        {Math.floor(systemInfo.uptimeSeconds / 60)} mins {systemInfo.uptimeSeconds % 60}s
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>● Operational</span>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>MEMORY RSS / HEAP</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--primary)' }}>
                        {systemInfo.memoryHeapUsedMb} MB
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RSS: {systemInfo.memoryRssMb} MB</span>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>DATABASE STORE</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--secondary)' }}>
                        marketplace_db
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>JSON Engine Active</span>
                    </div>
                  </div>

                  {/* Database Tables Stats Table */}
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                      <Database size={15} color="var(--primary)" />
                      <span>Live Database Collections Breakdown</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Users</div>
                        <strong style={{ fontSize: '1.1rem' }}>{systemInfo.database?.totalUsers}</strong>
                      </div>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gigs / Services</div>
                        <strong style={{ fontSize: '1.1rem' }}>{systemInfo.database?.totalGigs}</strong>
                      </div>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Projects</div>
                        <strong style={{ fontSize: '1.1rem' }}>{systemInfo.database?.totalProjects}</strong>
                      </div>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Skills</div>
                        <strong style={{ fontSize: '1.1rem' }}>{systemInfo.database?.totalSkills}</strong>
                      </div>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verifications</div>
                        <strong style={{ fontSize: '1.1rem' }}>{systemInfo.database?.totalVerifications}</strong>
                      </div>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Moderation Reports</div>
                        <strong style={{ fontSize: '1.1rem' }}>{systemInfo.database?.totalReports}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  <button onClick={loadSystemTelemetry} className="btn btn-primary btn-sm">
                    Load System Diagnostics
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}


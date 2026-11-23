import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultSettings = {
  header_brand_title: 'CampusGig AI',
  header_tagline: 'NEXT-GEN STUDENT MARKETPLACE',
  announcement_banner_enabled: 0,
  announcement_banner_text: '',
  hero_badge: '',
  hero_headline: 'Find Verified Student Help or Earn With Your Skills',
  hero_subheadline: 'Instant neural skill matching, automated escrow protection, and top-tier college freelancers for software, design, editing, and academic projects.',
  hero_search_placeholder: "Search: 'Web Design', 'Poster', 'Python', 'Video Editing'…",
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
};

const SiteSettingsContext = createContext({
  siteSettings: defaultSettings,
  loading: false,
  refreshSettings: () => {},
  saveSettings: async () => {}
});

export function SiteSettingsProvider({ children }) {
  const [siteSettings, setSiteSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSiteSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.warn('Failed to load dynamic site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async (updates) => {
    const token = localStorage.getItem('campusgig_token');
    const res = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save website customizations');
    }
    setSiteSettings(data.settings);
    return data;
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        siteSettings,
        loading,
        refreshSettings: fetchSettings,
        saveSettings
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export default SiteSettingsContext;

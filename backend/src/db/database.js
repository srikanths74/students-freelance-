import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'marketplace_db.json');

export const defaultSiteSettings = {
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
  footer_about_text: 'The premier student freelance marketplace connecting verified university talent with campus and client projects.',
  footer_trust_badge: 'Verified Student Platform',
  footer_copyright_text: '© 2026 CampusGig. All rights reserved.',
  footer_love_text: 'Incubated at MCC - MRF Innovation Park • Madras Christian College',
  platform_commission_percent: 5,
  minimum_budget_inr: 200,
  support_email: 'srikanthstephen2007@gmail.com'
};

// Default initial state
const defaultSchema = {
  users: [],
  skills: [],
  skill_files: [],
  verification_requests: [],
  categories: [],
  services: [],
  portfolio_items: [],
  projects: [],
  proposals: [],
  messages: [],
  wallets: [],
  transactions: [],
  reviews: [],
  notifications: [],
  reports: [],
  pending_otps: {},
  site_settings: { ...defaultSiteSettings }
};

export const DEFAULT_PROFESSIONAL_AVATARS = [
  '/avatars/bitmoji_male_1.jpg',
  '/avatars/bitmoji_female_1.jpg',
  '/avatars/bitmoji_male_2.jpg',
  '/avatars/bitmoji_female_2.jpg',
  '/avatars/bitmoji_male_3.jpg',
  '/avatars/bitmoji_female_3.jpg',
  '/avatars/bitmoji_male_4.jpg',
  '/avatars/bitmoji_female_4.jpg',
  '/avatars/bitmoji_male_5.jpg',
  '/avatars/bitmoji_female_5.jpg',
  '/avatars/bitmoji_male_6.jpg',
  '/avatars/bitmoji_female_6.jpg'
];


export function getDeterministicAvatar(name = 'Student') {
  let hash = 0;
  const str = String(name || 'Student');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_PROFESSIONAL_AVATARS.length;
  return DEFAULT_PROFESSIONAL_AVATARS[index];
}

class RelationalDatabase {
  constructor() {
    this.data = { ...defaultSchema };
    this.counters = {};
    this.load();
  }

  savePendingOtp(type, key, payload) {
    if (!this.data.pending_otps) this.data.pending_otps = {};
    if (!this.data.pending_otps[type]) this.data.pending_otps[type] = {};
    this.data.pending_otps[type][key] = payload;
    this.save();
  }

  getPendingOtp(type, key) {
    if (!this.data.pending_otps || !this.data.pending_otps[type]) return null;
    return this.data.pending_otps[type][key] || null;
  }

  deletePendingOtp(type, key) {
    if (this.data.pending_otps && this.data.pending_otps[type]) {
      delete this.data.pending_otps[type][key];
      this.save();
    }
  }

  load() {
    try {
      if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf8').replace(/^\uFEFF/, '');
        const parsed = JSON.parse(raw);
        this.data = { ...defaultSchema, ...parsed };
        // Upgrade legacy / stock avatars to 3D Snapchat Bitmojis
        if (Array.isArray(this.data.users)) {
          let updatedAny = false;
          this.data.users.forEach(u => {
            if (!u.avatar_url || u.avatar_url.includes('dicebear.com/') || u.avatar_url.includes('images.unsplash.com')) {
              u.avatar_url = getDeterministicAvatar(u.name);
              updatedAny = true;
            }
          });
          if (updatedAny) this.save();
        }

        if (!this.data.proposals) this.data.proposals = [];
        const hasOpenJobs = (this.data.projects || []).some(p => p.status === 'OPEN' || p.is_public);
        if (!hasOpenJobs && Array.isArray(this.data.projects) && this.data.projects.length > 0) {
          const clientUser = (this.data.users || []).find(u => u.role === 'client') || { id: 6 };
          const p1 = this.createProject({
            client_id: clientUser.id,
            freelancer_id: null,
            category_id: 2,
            title: 'Need Creative Logo & Brand Vector Identity for Tech Innovators Club',
            description: 'We are launching our student robotics & AI society. Need a modern, minimalist logo with clean vector mark, dark & light theme variants, and social media display avatars.',
            requirements: 'Deliverables: Vector SVG, AI or Figma file, high-resolution PNG with transparent background.',
            skills_required: 'Logo Design, Illustrator, Vector Art, Graphic Design',
            budget: 850,
            deadline_days: 3,
            is_public: 1
          });
          const p2 = this.createProject({
            client_id: clientUser.id,
            freelancer_id: null,
            category_id: 1,
            title: 'Full-Stack React & Node Dashboard for Final Year Research Prototype',
            description: 'Looking for a skilled student developer to build a modern dashboard with charts and REST API integration for our college sensor telemetry project.',
            requirements: 'Clean modular React components, responsive CSS, and backend endpoint connection.',
            skills_required: 'React, Node.js, JavaScript, Chart.js',
            budget: 2200,
            deadline_days: 5,
            is_public: 1
          });
          const studentUser = (this.data.users || []).find(u => u.role === 'student');
          if (studentUser) {
            this.createProposal({
              project_id: p1.id,
              freelancer_id: studentUser.id,
              bid_amount: 800,
              delivery_days: 2,
              pitch: 'Hi! I specialize in clean minimalist vector logos and design systems. I can deliver 3 unique concept drafts within 24 hours with unlimited color revisions.'
            });
          }
        }
      } else {
        this.save();
      }
      this.initCounters();
    } catch (err) {
      console.error('Error loading database file, initializing clean state:', err);
      this.data = { ...defaultSchema };
      this.save();
      this.initCounters();
    }
  }

  initCounters() {
    for (const table of Object.keys(this.data)) {
      const items = this.data[table];
      if (Array.isArray(items)) {
        const maxId = items.reduce((max, item) => Math.max(max, item?.id || 0), 0);
        this.counters[table] = maxId;
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  nextId(table) {
    if (!this.counters[table]) {
      this.counters[table] = 0;
    }
    this.counters[table] += 1;
    return this.counters[table];
  }

  isStudentProfileCompleted(user) {
    if (!user) return false;
    if (user.role !== 'student') return true;
    if (user.profile_completed === 1) return true;
    if (user.profile_completed === 0) return false;

    // Evaluate required fields if not explicitly set
    const hasName = Boolean(user.name && user.name.trim());
    const hasPhone = Boolean(user.phone && user.phone.trim());
    const hasResume = Boolean((user.resume_url && user.resume_url.trim()) || (user.resume_filename && user.resume_filename.trim()));
    const hasGithub = Boolean(user.github_url && user.github_url.trim());
    const hasPortfolio = Boolean(user.portfolio_url && user.portfolio_url.trim());
    const hasCollege = Boolean(user.college && user.college.trim() && user.college !== 'Campus / College' && user.college !== 'University Campus');
    const hasDepartment = Boolean(user.department && user.department.trim());
    const hasBio = Boolean(user.bio && user.bio.trim().length >= 10);
    const skills = this.getUserSkills(user.id);
    const hasSkills = Boolean(skills && skills.length > 0);

    return Boolean(hasName && hasPhone && hasResume && hasGithub && hasPortfolio && hasCollege && hasDepartment && hasBio && hasSkills);
  }

  findUserByEmail(email) {
    const q = (email || '').toLowerCase().trim();
    return (this.data.users || []).find(u => 
      u.email.toLowerCase() === q || 
      (u.college_email && u.college_email.toLowerCase() === q)
    );
  }

  findUserById(id) {
    return (this.data.users || []).find(u => Number(u.id) === Number(id));
  }

  createUser(userObj) {
    const id = this.nextId('users');
    const newUser = {
      id,
      name: userObj.name,
      email: userObj.email.toLowerCase().trim(),
      password_hash: userObj.password_hash,
      role: userObj.role || 'student',
      college: userObj.college || 'College of Engineering',
      department: userObj.department || 'Computer Science',
      year_of_study: userObj.year_of_study || '3rd Year',
      bio: userObj.bio || '',
      avatar_url: (userObj.avatar_url && !userObj.avatar_url.includes('dicebear.com/7.x/avataaars'))
        ? userObj.avatar_url
        : getDeterministicAvatar(userObj.name),
      is_verified_student: userObj.is_verified_student !== undefined ? userObj.is_verified_student : 1,
      is_suspended: userObj.is_suspended || 0,
      response_time: userObj.response_time || 'Within 1 hour',
      phone: userObj.phone || '',
      is_phone_verified: userObj.is_phone_verified || 0,
      github_url: userObj.github_url || '',
      linkedin_url: userObj.linkedin_url || '',
      resume_url: userObj.resume_url || '',
      resume_filename: userObj.resume_filename || '',
      portfolio_url: userObj.portfolio_url || '',
      profile_completed: userObj.profile_completed !== undefined 
        ? userObj.profile_completed 
        : (userObj.role === 'student' ? 0 : 1),
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);

    // Auto-create wallet
    this.createWallet(id, userObj.initial_balance || 2500);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  deleteUser(id) {
    const userId = Number(id);
    const user = this.findUserById(userId);
    if (!user) return false;
    this.data.users = (this.data.users || []).filter(u => Number(u.id) !== userId);
    this.data.services = (this.data.services || []).filter(s => Number(s.user_id) !== userId);
    this.data.skills = (this.data.skills || []).filter(s => Number(s.user_id) !== userId);
    this.data.skill_files = (this.data.skill_files || []).filter(s => Number(s.user_id) !== userId);
    this.data.portfolio_items = (this.data.portfolio_items || []).filter(p => Number(p.user_id) !== userId);
    this.data.verification_requests = (this.data.verification_requests || []).filter(v => Number(v.user_id) !== userId);
    this.data.reviews = (this.data.reviews || []).filter(r => Number(r.reviewer_id) !== userId && Number(r.reviewee_id) !== userId);
    this.data.wallets = (this.data.wallets || []).filter(w => Number(w.user_id) !== userId);
    this.data.notifications = (this.data.notifications || []).filter(n => Number(n.user_id) !== userId);
    this.data.messages = (this.data.messages || []).filter(m => Number(m.sender_id) !== userId && Number(m.receiver_id) !== userId);
    this.data.reports = (this.data.reports || []).filter(r => Number(r.reporter_id) !== userId && Number(r.target_id) !== userId);

    // Cancel or clean up active projects involving this user
    for (const proj of (this.data.projects || [])) {
      if (Number(proj.freelancer_id) === userId || Number(proj.client_id) === userId) {
        if (!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(proj.status)) {
          proj.status = 'CANCELLED';
          proj.cancelled_reason = `User account #${userId} (${user.name}) was permanently deleted by Administrator.`;
        }
      }
    }
    this.save();
    return true;
  }

  getAllUsers() {
    return this.data.users || [];
  }

  // --- Skills Operations ---
  getUserSkills(userId) {
    return (this.data.skills || []).filter(s => Number(s.user_id) === Number(userId));
  }

  setUserSkills(userId, skillList) {
    // skillList: Array of strings or { skill_name, proficiency }
    this.data.skills = (this.data.skills || []).filter(s => Number(s.user_id) !== Number(userId));
    for (const item of skillList) {
      const skillName = typeof item === 'string' ? item : item.skill_name;
      const proficiency = typeof item === 'object' && item.proficiency ? item.proficiency : 'Intermediate';
      if (skillName && skillName.trim()) {
        this.data.skills.push({
          id: this.nextId('skills'),
          user_id: Number(userId),
          skill_name: skillName.trim(),
          proficiency
        });
      }
    }
    this.save();
    return this.getUserSkills(userId);
  }

  // --- Categories Operations ---
  getAllCategories() {
    return this.data.categories || [];
  }

  createCategory(catObj) {
    const id = this.nextId('categories');
    const newCat = {
      id,
      name: catObj.name,
      slug: catObj.slug || catObj.name.toLowerCase().replace(/\s+/g, '-'),
      icon: catObj.icon || 'Sparkles',
      description: catObj.description || '',
      created_at: new Date().toISOString()
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id, updates) {
    const cat = (this.data.categories || []).find(c => Number(c.id) === Number(id));
    if (!cat) return null;
    Object.assign(cat, updates);
    this.save();
    return cat;
  }

  deleteCategory(id) {
    this.data.categories = (this.data.categories || []).filter(c => Number(c.id) !== Number(id));
    this.save();
    return true;
  }

  // --- Services / Gigs Operations ---
  getAllServices(filter = {}) {
    let services = [...(this.data.services || [])];

    // Filter active unless admin or own
    if (filter.activeOnly !== false) {
      services = services.filter(s => s.is_active === 1);
    }
    if (filter.category_id) {
      services = services.filter(s => Number(s.category_id) === Number(filter.category_id));
    }
    if (filter.user_id) {
      services = services.filter(s => Number(s.user_id) === Number(filter.user_id));
    }
    if (filter.min_price) {
      services = services.filter(s => s.starting_price >= Number(filter.min_price));
    }
    if (filter.max_price) {
      services = services.filter(s => s.starting_price <= Number(filter.max_price));
    }
    if (filter.min_rating) {
      services = services.filter(s => (s.rating_avg || 0) >= Number(filter.min_rating));
    }
    if (filter.max_days) {
      services = services.filter(s => s.delivery_days <= Number(filter.max_days));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      services = services.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.skills_csv || '').toLowerCase().includes(q)
      );
    }

    // Enrich with user & category data
    const enriched = services.map(s => {
      const user = this.findUserById(s.user_id);
      const cat = (this.data.categories || []).find(c => Number(c.id) === Number(s.category_id));
      const userSkills = this.getUserSkills(s.user_id);
      return {
        ...s,
        freelancer_name: user ? user.name : 'Unknown Student',
        freelancer_college: user ? user.college : '',
        freelancer_department: user ? user.department : '',
        freelancer_year: user ? user.year_of_study : '',
        freelancer_avatar: user ? user.avatar_url : '',
        freelancer_verified: user ? user.is_verified_student : 0,
        freelancer_response_time: user ? user.response_time : 'Within 1 hour',
        category_name: cat ? cat.name : 'General',
        category_slug: cat ? cat.slug : 'general',
        freelancer_skills: userSkills
      };
    });

    // Sorting
    if (filter.sort === 'price_asc') {
      enriched.sort((a, b) => a.starting_price - b.starting_price);
    } else if (filter.sort === 'price_desc') {
      enriched.sort((a, b) => b.starting_price - a.starting_price);
    } else if (filter.sort === 'rating') {
      enriched.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    } else if (filter.sort === 'popular') {
      enriched.sort((a, b) => (b.completed_count || 0) - (a.completed_count || 0));
    } else {
      // Newest default
      enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return enriched;
  }

  getServiceById(id) {
    const service = (this.data.services || []).find(s => Number(s.id) === Number(id));
    if (!service) return null;
    const user = this.findUserById(service.user_id);
    const cat = (this.data.categories || []).find(c => Number(c.id) === Number(service.category_id));
    const userSkills = this.getUserSkills(service.user_id);
    const portfolio = this.getUserPortfolio(service.user_id);
    const reviews = this.getUserReviews(service.user_id);

    return {
      ...service,
      freelancer: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year_of_study: user.year_of_study,
        bio: user.bio,
        avatar_url: user.avatar_url,
        is_verified_student: user.is_verified_student,
        response_time: user.response_time,
        skills: userSkills,
        portfolio,
        reviews
      } : null,
      category: cat
    };
  }

  createService(serviceObj) {
    const id = this.nextId('services');
    const newService = {
      id,
      user_id: Number(serviceObj.user_id),
      category_id: Number(serviceObj.category_id),
      title: serviceObj.title,
      description: serviceObj.description,
      starting_price: Number(serviceObj.starting_price),
      delivery_days: Number(serviceObj.delivery_days) || 3,
      skills_csv: serviceObj.skills_csv || '',
      cover_image: serviceObj.cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      is_active: serviceObj.is_active !== undefined ? Number(serviceObj.is_active) : 1,
      rating_avg: 5.0,
      review_count: 0,
      completed_count: 0,
      created_at: new Date().toISOString()
    };
    this.data.services.push(newService);
    this.save();
    return this.getServiceById(id);
  }

  updateService(id, updates) {
    const s = (this.data.services || []).find(item => Number(item.id) === Number(id));
    if (!s) return null;
    Object.assign(s, updates);
    this.save();
    return this.getServiceById(id);
  }

  deleteService(id) {
    this.data.services = (this.data.services || []).filter(item => Number(item.id) !== Number(id));
    this.save();
    return true;
  }

  // --- Portfolio Operations ---
  getUserPortfolio(userId) {
    return (this.data.portfolio_items || []).filter(p => Number(p.user_id) === Number(userId));
  }

  createPortfolioItem(itemObj) {
    const id = this.nextId('portfolio_items');
    const newItem = {
      id,
      user_id: Number(itemObj.user_id),
      title: itemObj.title,
      description: itemObj.description || '',
      project_url: itemObj.project_url || '',
      image_url: itemObj.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      technologies: itemObj.technologies || '',
      created_at: new Date().toISOString()
    };
    this.data.portfolio_items.push(newItem);
    this.save();
    return newItem;
  }

  deletePortfolioItem(id) {
    this.data.portfolio_items = (this.data.portfolio_items || []).filter(p => Number(p.id) !== Number(id));
    this.save();
    return true;
  }

  // --- Projects / Orders Operations ---
  getAllProjects(filter = {}) {
    let projects = [...(this.data.projects || [])];

    if (filter.is_open) {
      projects = projects.filter(p => p.status === 'OPEN' || (p.is_public && !p.freelancer_id));
    }
    if (filter.client_id) {
      projects = projects.filter(p => Number(p.client_id) === Number(filter.client_id));
    }
    if (filter.freelancer_id) {
      projects = projects.filter(p => Number(p.freelancer_id) === Number(filter.freelancer_id));
    }
    if (filter.user_id) {
      // either client or freelancer
      projects = projects.filter(p => Number(p.client_id) === Number(filter.user_id) || Number(p.freelancer_id) === Number(filter.user_id));
    }
    if (filter.category_id) {
      projects = projects.filter(p => Number(p.category_id) === Number(filter.category_id));
    }
    if (filter.status) {
      projects = projects.filter(p => p.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      projects = projects.filter(p => 
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.skills_required || '').toLowerCase().includes(q)
      );
    }

    return projects.map(p => this.enrichProject(p)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getProjectById(id) {
    const project = (this.data.projects || []).find(p => Number(p.id) === Number(id));
    if (!project) return null;
    return this.enrichProject(project);
  }

  enrichProject(p) {
    const client = this.findUserById(p.client_id);
    const freelancer = p.freelancer_id ? this.findUserById(p.freelancer_id) : null;
    const service = p.service_id ? (this.data.services || []).find(s => Number(s.id) === Number(p.service_id)) : null;
    const category = p.category_id ? (this.data.categories || []).find(c => Number(c.id) === Number(p.category_id)) : null;
    const review = (this.data.reviews || []).find(r => Number(r.project_id) === Number(p.id));
    const proposals = (this.data.proposals || []).filter(pr => Number(pr.project_id) === Number(p.id));

    return {
      ...p,
      category: category ? { id: category.id, name: category.name } : null,
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email,
        college: client.college,
        avatar_url: client.avatar_url,
        company_name: client.company_name || client.name,
        company_website: client.company_website,
        is_verified_client: client.is_verified_client
      } : null,
      freelancer: freelancer ? {
        id: freelancer.id,
        name: freelancer.name,
        email: freelancer.email,
        college: freelancer.college,
        department: freelancer.department,
        avatar_url: freelancer.avatar_url,
        is_verified_student: freelancer.is_verified_student
      } : null,
      service: service ? {
        id: service.id,
        title: service.title,
        starting_price: service.starting_price
      } : null,
      review: review || null,
      proposals_count: proposals.length
    };
  }

  createProject(projObj) {
    const id = this.nextId('projects');
    const now = new Date();
    const deadline = new Date(now.getTime() + (Number(projObj.deadline_days || 3) * 24 * 60 * 60 * 1000)).toISOString();
    const isPublic = !projObj.freelancer_id || projObj.is_public;

    const newProject = {
      id,
      service_id: projObj.service_id ? Number(projObj.service_id) : null,
      category_id: projObj.category_id ? Number(projObj.category_id) : null,
      client_id: Number(projObj.client_id),
      freelancer_id: projObj.freelancer_id ? Number(projObj.freelancer_id) : null,
      title: projObj.title,
      description: projObj.description,
      requirements: projObj.requirements || '',
      skills_required: projObj.skills_required || '',
      budget: Number(projObj.budget),
      deadline_days: Number(projObj.deadline_days || 3),
      deadline_date: deadline,
      reference_file_url: projObj.reference_file_url || null,
      reference_file_name: projObj.reference_file_name || null,
      status: isPublic ? 'OPEN' : 'REQUESTED',
      is_public: isPublic ? 1 : 0,
      escrow_funded: 0,
      submission_notes: null,
      submission_file_url: null,
      submission_file_name: null,
      revision_notes: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    this.data.projects.push(newProject);
    this.save();

    // If direct appointment, notify freelancer and create initial chat
    if (projObj.freelancer_id) {
      this.createMessage({
        project_id: id,
        sender_id: projObj.client_id,
        receiver_id: projObj.freelancer_id,
        content: `Hello! I've created a project request for "${projObj.title}" with a budget of ₹${projObj.budget}. Requirements: ${projObj.description}`,
        is_system: 0
      });

      const client = this.findUserById(projObj.client_id);
      this.createNotification({
        user_id: projObj.freelancer_id,
        type: 'PROJECT_REQUEST',
        title: 'New Project Request',
        message: `${client ? client.name : 'A client'} requested your service: "${projObj.title}" (₹${projObj.budget})`,
        link_url: `/projects/${id}`
      });
    }

    return this.getProjectById(id);
  }

  // --- Job Proposals & Applications Operations ---
  createProposal(propObj) {
    if (!this.data.proposals) this.data.proposals = [];
    const id = this.nextId('proposals');
    const newProposal = {
      id,
      project_id: Number(propObj.project_id),
      freelancer_id: Number(propObj.freelancer_id),
      bid_amount: Number(propObj.bid_amount),
      delivery_days: Number(propObj.delivery_days || 3),
      pitch: propObj.pitch || '',
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    this.data.proposals.push(newProposal);
    this.save();

    // Notify client of new application
    const project = this.getProjectById(propObj.project_id);
    const freelancer = this.findUserById(propObj.freelancer_id);
    if (project && freelancer) {
      this.createNotification({
        user_id: project.client_id,
        type: 'NEW_PROPOSAL',
        title: 'New Student Proposal! 🎯',
        message: `${freelancer.name} submitted a bid (₹${newProposal.bid_amount}) for "${project.title}".`,
        link_url: `/dashboard-client?tab=jobs`
      });
    }

    return this.enrichProposal(newProposal);
  }

  enrichProposal(p) {
    const freelancer = this.findUserById(p.freelancer_id);
    const skills = freelancer ? this.getUserSkills(freelancer.id) : [];
    const reviews = freelancer ? this.getUserReviews(freelancer.id) : [];
    const rating = reviews.length > 0 
      ? parseFloat((reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1)) 
      : 5.0;

    return {
      ...p,
      freelancer: freelancer ? {
        id: freelancer.id,
        name: freelancer.name,
        email: freelancer.email,
        college: freelancer.college,
        department: freelancer.department,
        avatar_url: freelancer.avatar_url,
        is_verified_student: freelancer.is_verified_student,
        skills,
        rating,
        reviewCount: reviews.length
      } : null
    };
  }

  getProjectProposals(projectId) {
    const list = (this.data.proposals || []).filter(p => Number(p.project_id) === Number(projectId));
    return list.map(p => this.enrichProposal(p)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getFreelancerProposals(freelancerId) {
    const list = (this.data.proposals || []).filter(p => Number(p.freelancer_id) === Number(freelancerId));
    return list.map(p => {
      const proj = this.getProjectById(p.project_id);
      return {
        ...this.enrichProposal(p),
        project: proj
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  acceptProposal(proposalId, clientId) {
    if (!this.data.proposals) this.data.proposals = [];
    const proposal = this.data.proposals.find(p => Number(p.id) === Number(proposalId));
    if (!proposal) return { success: false, message: 'Proposal not found' };

    const project = (this.data.projects || []).find(p => Number(p.id) === Number(proposal.project_id));
    if (!project) return { success: false, message: 'Project not found' };

    if (Number(project.client_id) !== Number(clientId)) {
      return { success: false, message: 'Unauthorized: Only the project owner can hire an applicant.' };
    }

    // Update proposal to ACCEPTED
    proposal.status = 'ACCEPTED';

    // Mark other proposals for this project as REJECTED
    this.data.proposals.forEach(p => {
      if (Number(p.project_id) === Number(project.id) && Number(p.id) !== Number(proposalId) && p.status === 'PENDING') {
        p.status = 'REJECTED';
      }
    });

    // Appoint freelancer to project
    project.freelancer_id = Number(proposal.freelancer_id);
    project.budget = Number(proposal.bid_amount);
    project.deadline_days = Number(proposal.delivery_days);
    project.status = 'ACCEPTED';
    project.updated_at = new Date().toISOString();

    // Lock Escrow from client wallet
    this.lockEscrow(project.client_id, project.id, project.budget);
    project.escrow_funded = 1;

    // Create initial message in project chat
    const freelancer = this.findUserById(proposal.freelancer_id);
    this.createMessage({
      project_id: project.id,
      sender_id: project.client_id,
      receiver_id: proposal.freelancer_id,
      content: `🎉 Congratulations ${freelancer ? freelancer.name : 'Student'}! Your proposal of ₹${proposal.bid_amount} has been accepted. Escrow payment is safely locked. Let's work together!`,
      is_system: 1
    });

    // Notify the hired student freelancer
    this.createNotification({
      user_id: proposal.freelancer_id,
      type: 'PROPOSAL_ACCEPTED',
      title: 'You Got Hired! 🎉',
      message: `Your bid of ₹${proposal.bid_amount} for "${project.title}" was accepted! Safe escrow is locked.`,
      link_url: `/projects/${project.id}`
    });

    this.save();
    return {
      success: true,
      message: `Hired ${freelancer ? freelancer.name : 'freelancer'} successfully! Project is now active with escrow protection.`,
      project: this.enrichProject(project),
      proposal
    };
  }

  updateProjectStatus(id, newStatus, extra = {}) {
    const project = (this.data.projects || []).find(p => Number(p.id) === Number(id));
    if (!project) return null;

    const oldStatus = project.status;
    project.status = newStatus;
    project.updated_at = new Date().toISOString();

    if (extra.submission_notes !== undefined) project.submission_notes = extra.submission_notes;
    if (extra.submission_file_url !== undefined) project.submission_file_url = extra.submission_file_url;
    if (extra.submission_file_name !== undefined) project.submission_file_name = extra.submission_file_name;
    if (extra.revision_notes !== undefined) project.revision_notes = extra.revision_notes;
    if (extra.escrow_funded !== undefined) project.escrow_funded = extra.escrow_funded;

    // Trigger wallet escrow workflows
    if (newStatus === 'ACCEPTED' && oldStatus === 'REQUESTED') {
      // Lock escrow from client wallet
      this.lockEscrow(project.client_id, project.id, project.budget);
      project.escrow_funded = 1;
    } else if (newStatus === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      // Release escrow to freelancer
      this.releaseEscrow(project.client_id, project.freelancer_id, project.id, project.budget);
      
      // Increment completed count for freelancer & service
      const freelancer = this.findUserById(project.freelancer_id);
      if (project.service_id) {
        const s = (this.data.services || []).find(item => Number(item.id) === Number(project.service_id));
        if (s) s.completed_count = (s.completed_count || 0) + 1;
      }
    } else if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
      if (project.escrow_funded) {
        this.refundEscrow(project.client_id, project.id, project.budget);
        project.escrow_funded = 0;
      }
    }

    this.save();
    return this.getProjectById(id);
  }

  updateProject(id, updates) {
    const project = (this.data.projects || []).find(p => Number(p.id) === Number(id));
    if (!project) return null;
    if (updates.status) {
      return this.updateProjectStatus(id, updates.status, updates);
    }
    Object.assign(project, updates);
    project.updated_at = new Date().toISOString();
    this.save();
    return project;
  }

  // --- Messages & Chat Operations ---
  getProjectMessages(projectId) {
    return (this.data.messages || []).filter(m => Number(m.project_id) === Number(projectId)).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  createMessage(msgObj) {
    const id = this.nextId('messages');
    const newMsg = {
      id,
      project_id: Number(msgObj.project_id),
      sender_id: Number(msgObj.sender_id),
      receiver_id: Number(msgObj.receiver_id),
      content: msgObj.content,
      attachment_url: msgObj.attachment_url || null,
      attachment_name: msgObj.attachment_name || null,
      attachment_size: msgObj.attachment_size || null,
      is_system: msgObj.is_system ? 1 : 0,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    this.data.messages.push(newMsg);
    this.save();
    return newMsg;
  }

  markMessagesAsRead(projectId, userId) {
    let count = 0;
    for (const m of (this.data.messages || [])) {
      if (Number(m.project_id) === Number(projectId) && Number(m.receiver_id) === Number(userId) && !m.is_read) {
        m.is_read = 1;
        count++;
      }
    }
    if (count > 0) this.save();
    return count;
  }

  // Direct 1-to-1 Chat (Admin <-> Student, Admin <-> Client)
  getDirectMessages(user1Id, user2Id) {
    const u1 = Number(user1Id);
    const u2 = Number(user2Id);
    return (this.data.messages || [])
      .filter(m => (
        (!m.project_id || Number(m.project_id) === 0) &&
        ((Number(m.sender_id) === u1 && Number(m.receiver_id) === u2) ||
         (Number(m.sender_id) === u2 && Number(m.receiver_id) === u1))
      ))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  markDirectMessagesAsRead(senderId, receiverId) {
    let count = 0;
    const sId = Number(senderId);
    const rId = Number(receiverId);
    for (const m of (this.data.messages || [])) {
      if ((!m.project_id || Number(m.project_id) === 0) &&
          Number(m.sender_id) === sId &&
          Number(m.receiver_id) === rId &&
          !m.is_read) {
        m.is_read = 1;
        count++;
      }
    }
    if (count > 0) this.save();
    return count;
  }

  getAdminConversations(adminId) {
    const aId = Number(adminId);
    const users = (this.data.users || []).filter(u => Number(u.id) !== aId && u.role !== 'admin');
    
    return users.map(u => {
      const { password_hash, two_factor_secret, ...safeUser } = u;
      const directMsgs = this.getDirectMessages(aId, u.id);
      const lastMessage = directMsgs.length > 0 ? directMsgs[directMsgs.length - 1] : null;
      const unreadCount = (this.data.messages || []).filter(m =>
        (!m.project_id || Number(m.project_id) === 0) &&
        Number(m.sender_id) === Number(u.id) &&
        Number(m.receiver_id) === aId &&
        !m.is_read
      ).length;

      return {
        ...safeUser,
        lastMessage,
        unreadCount
      };
    }).sort((a, b) => {
      // Prioritize unread messages first, then most recent message timestamp, then user ID
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
      const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return b.id - a.id;
    });
  }

  // --- Wallets & Transactions Operations ---
  getWallet(userId) {
    let wallet = (this.data.wallets || []).find(w => Number(w.user_id) === Number(userId));
    if (!wallet) {
      wallet = this.createWallet(userId, 2000);
    }
    const transactions = (this.data.transactions || []).filter(t => Number(t.user_id) === Number(userId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      ...wallet,
      transactions
    };
  }

  createWallet(userId, initialBalance = 2000) {
    const id = this.nextId('wallets');
    const newWallet = {
      id,
      user_id: Number(userId),
      balance: Number(initialBalance),
      escrow_balance: 0.0,
      total_earned: 0.0,
      total_spent: 0.0,
      updated_at: new Date().toISOString()
    };
    this.data.wallets.push(newWallet);
    this.save();
    return newWallet;
  }

  topupWallet(userId, amount) {
    const wallet = (this.data.wallets || []).find(w => Number(w.user_id) === Number(userId)) || this.createWallet(userId);
    wallet.balance += Number(amount);
    wallet.updated_at = new Date().toISOString();

    const tId = this.nextId('transactions');
    this.data.transactions.push({
      id: tId,
      user_id: Number(userId),
      project_id: null,
      amount: Number(amount),
      type: 'TOPUP',
      status: 'SUCCESS',
      description: `Wallet recharge via simulated UPI/Card (₹${amount})`,
      reference_id: `TXN-TOP-${Date.now()}`,
      created_at: new Date().toISOString()
    });

    this.save();
    return this.getWallet(userId);
  }

  lockEscrow(clientId, projectId, amount) {
    const wallet = (this.data.wallets || []).find(w => Number(w.user_id) === Number(clientId)) || this.createWallet(clientId);
    
    // If balance is insufficient, auto-topup to simulate seamless student payment
    if (wallet.balance < amount) {
      const topNeeded = amount - wallet.balance + 1000;
      wallet.balance += topNeeded;
      this.data.transactions.push({
        id: this.nextId('transactions'),
        user_id: Number(clientId),
        project_id: projectId,
        amount: topNeeded,
        type: 'TOPUP',
        status: 'SUCCESS',
        description: `Auto-deposit for project escrow fund`,
        reference_id: `AUTO-TOP-${Date.now()}`,
        created_at: new Date().toISOString()
      });
    }

    wallet.balance -= amount;
    wallet.escrow_balance += amount;
    wallet.total_spent += amount;
    wallet.updated_at = new Date().toISOString();

    this.data.transactions.push({
      id: this.nextId('transactions'),
      user_id: Number(clientId),
      project_id: projectId,
      amount: -amount,
      type: 'ESCROW_LOCK',
      status: 'SUCCESS',
      description: `Escrow hold for Project #${projectId}`,
      reference_id: `ESC-LCK-${Date.now()}`,
      created_at: new Date().toISOString()
    });

    this.save();
  }

  releaseEscrow(clientId, freelancerId, projectId, amount) {
    const clientWallet = (this.data.wallets || []).find(w => Number(w.user_id) === Number(clientId)) || this.createWallet(clientId);
    const freelancerWallet = (this.data.wallets || []).find(w => Number(w.user_id) === Number(freelancerId)) || this.createWallet(freelancerId);

    clientWallet.escrow_balance = Math.max(0, clientWallet.escrow_balance - amount);
    clientWallet.updated_at = new Date().toISOString();

    freelancerWallet.balance += amount;
    freelancerWallet.total_earned += amount;
    freelancerWallet.updated_at = new Date().toISOString();

    this.data.transactions.push({
      id: this.nextId('transactions'),
      user_id: Number(freelancerId),
      project_id: projectId,
      amount: amount,
      type: 'ESCROW_RELEASE',
      status: 'SUCCESS',
      description: `Payment received for completing Project #${projectId}`,
      reference_id: `ESC-REL-${Date.now()}`,
      created_at: new Date().toISOString()
    });

    this.save();
  }

  refundEscrow(clientId, projectId, amount) {
    const clientWallet = (this.data.wallets || []).find(w => Number(w.user_id) === Number(clientId)) || this.createWallet(clientId);
    clientWallet.escrow_balance = Math.max(0, clientWallet.escrow_balance - amount);
    clientWallet.balance += amount;
    clientWallet.total_spent = Math.max(0, clientWallet.total_spent - amount);
    clientWallet.updated_at = new Date().toISOString();

    this.data.transactions.push({
      id: this.nextId('transactions'),
      user_id: Number(clientId),
      project_id: projectId,
      amount: amount,
      type: 'REFUND',
      status: 'SUCCESS',
      description: `Refund for cancelled Project #${projectId}`,
      reference_id: `REF-${Date.now()}`,
      created_at: new Date().toISOString()
    });

    this.save();
  }

  // --- Reviews Operations ---
  getUserReviews(userId) {
    return (this.data.reviews || []).filter(r => Number(r.reviewee_id) === Number(userId)).map(r => {
      const reviewer = this.findUserById(r.reviewer_id);
      return {
        ...r,
        reviewer_name: reviewer ? reviewer.name : 'Student Client',
        reviewer_avatar: reviewer ? reviewer.avatar_url : '',
        reviewer_college: reviewer ? reviewer.college : ''
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createReview(reviewObj) {
    const id = this.nextId('reviews');
    const newRev = {
      id,
      project_id: Number(reviewObj.project_id),
      reviewer_id: Number(reviewObj.reviewer_id),
      reviewee_id: Number(reviewObj.reviewee_id),
      overall_rating: Number(reviewObj.overall_rating),
      communication_rating: Number(reviewObj.communication_rating || reviewObj.overall_rating),
      quality_rating: Number(reviewObj.quality_rating || reviewObj.overall_rating),
      timeliness_rating: Number(reviewObj.timeliness_rating || reviewObj.overall_rating),
      comment: reviewObj.comment || '',
      created_at: new Date().toISOString()
    };

    this.data.reviews.push(newRev);

    // Recalculate average rating for reviewee
    const allUserReviews = (this.data.reviews || []).filter(r => Number(r.reviewee_id) === Number(reviewObj.reviewee_id));
    const avg = allUserReviews.reduce((sum, r) => sum + r.overall_rating, 0) / (allUserReviews.length || 1);
    
    // Update services of this user
    for (const s of (this.data.services || [])) {
      if (Number(s.user_id) === Number(reviewObj.reviewee_id)) {
        s.rating_avg = parseFloat(avg.toFixed(1));
        s.review_count = allUserReviews.length;
      }
    }

    this.save();

    // Notify reviewee
    const reviewer = this.findUserById(reviewObj.reviewer_id);
    this.createNotification({
      user_id: reviewObj.reviewee_id,
      type: 'REVIEW_RECEIVED',
      title: 'New Review Received ⭐',
      message: `${reviewer ? reviewer.name : 'Your client'} left you a ${reviewObj.overall_rating}★ rating!`,
      link_url: `/profile/${reviewObj.reviewee_id}`
    });

    return newRev;
  }

  // --- Notifications Operations ---
  getUserNotifications(userId) {
    return (this.data.notifications || []).filter(n => Number(n.user_id) === Number(userId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createNotification(notifObj) {
    const id = this.nextId('notifications');
    const newNotif = {
      id,
      user_id: Number(notifObj.user_id),
      type: notifObj.type || 'SYSTEM',
      title: notifObj.title,
      message: notifObj.message,
      link_url: notifObj.link_url || '/',
      is_read: 0,
      created_at: new Date().toISOString()
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  markAllNotificationsRead(userId) {
    for (const n of (this.data.notifications || [])) {
      if (Number(n.user_id) === Number(userId)) {
        n.is_read = 1;
      }
    }
    this.save();
    return true;
  }

  // --- Reports & Moderation ---
  getAllReports(status) {
    let list = [...(this.data.reports || [])];
    if (status) list = list.filter(r => r.status === status);
    return list.map(r => {
      const reporter = this.findUserById(r.reporter_id);
      return {
        ...r,
        reporter_name: reporter ? reporter.name : 'Unknown User',
        reporter_email: reporter ? reporter.email : ''
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createReport(reportObj) {
    const id = this.nextId('reports');
    const newReport = {
      id,
      reporter_id: Number(reportObj.reporter_id),
      target_type: reportObj.target_type,
      target_id: Number(reportObj.target_id),
      target_name: reportObj.target_name || '',
      reason: reportObj.reason,
      details: reportObj.details || '',
      status: 'PENDING',
      admin_notes: '',
      created_at: new Date().toISOString()
    };
    this.data.reports.push(newReport);
    this.save();
    return newReport;
  }

  resolveReport(id, status, admin_notes = '') {
    const rep = (this.data.reports || []).find(r => Number(r.id) === Number(id));
    if (!rep) return null;
    rep.status = status;
    rep.admin_notes = admin_notes;
    this.save();
    return rep;
  }

  deleteReview(id) {
    const idx = (this.data.reviews || []).findIndex(r => Number(r.id) === Number(id));
    if (idx !== -1) {
      this.data.reviews.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  deleteMessage(id) {
    const idx = (this.data.messages || []).findIndex(m => Number(m.id) === Number(id));
    if (idx !== -1) {
      this.data.messages.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Platform Statistics (Admin) ---
  getPlatformStats() {
    const allUsers = this.data.users || [];
    const totalStudents = allUsers.filter(u => u.role === 'student').length;
    const totalClients = allUsers.filter(u => u.role === 'client').length;
    const totalUsers = allUsers.filter(u => u.role !== 'admin').length;
    const activeUsers = allUsers.filter(u => !u.is_suspended && u.role !== 'admin').length;
    const verifiedStudents = allUsers.filter(u => u.is_verified_student === 1).length;

    const totalServices = (this.data.services || []).length;
    const activeServices = (this.data.services || []).filter(s => s.is_active === 1).length;

    const allProjects = this.data.projects || [];
    const totalProjects = allProjects.length;
    const completedProjects = allProjects.filter(p => p.status === 'COMPLETED').length;
    const activeProjects = allProjects.filter(p => ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION'].includes(p.status)).length;
    const pendingProjects = allProjects.filter(p => p.status === 'REQUESTED').length;

    const allReports = this.data.reports || [];
    const totalReports = allReports.length;
    const reportedUsers = allReports.filter(r => r.target_type === 'user').length;
    const pendingReports = allReports.filter(r => r.status === 'PENDING').length;
    
    // Revenue calculation (5% platform fee on completed volume)
    const grossVolume = allProjects.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
    const platformRevenue = Math.round(grossVolume * 0.05);

    // Categories breakdown
    const categoryStats = (this.data.categories || []).map(cat => {
      const count = (this.data.services || []).filter(s => Number(s.category_id) === Number(cat.id)).length;
      return { id: cat.id, name: cat.name, service_count: count };
    }).sort((a, b) => b.service_count - a.service_count);

    return {
      totalStudents,
      totalClients,
      totalUsers,
      activeUsers,
      verifiedStudents,
      totalServices,
      activeServices,
      totalProjects,
      completedProjects,
      activeProjects,
      pendingProjects,
      totalReports,
      reportedUsers,
      pendingReports,
      grossVolume,
      platformRevenue,
      categoryStats
    };
  }

  // --- Skill Files Operations ---
  getUserSkillFiles(userId) {
    return (this.data.skill_files || []).filter(f => Number(f.user_id) === Number(userId));
  }

  createSkillFile(fileObj) {
    const id = this.nextId('skill_files');
    const newFile = {
      id,
      user_id: Number(fileObj.user_id),
      title: fileObj.title || 'Work Sample',
      file_url: fileObj.file_url,
      file_name: fileObj.file_name || 'attachment',
      file_size: fileObj.file_size || 0,
      file_type: fileObj.file_type || 'document',
      category: fileObj.category || (
        /cert|diploma|degree|course|completion|award|license|badge|credential/i.test(fileObj.title || '') ||
        /cert|diploma|degree|course|completion|award|license|badge|credential/i.test(fileObj.file_name || '')
          ? 'certificate'
          : 'sample'
      ),
      created_at: new Date().toISOString()
    };
    this.data.skill_files = this.data.skill_files || [];
    this.data.skill_files.push(newFile);
    this.save();
    return newFile;
  }

  deleteSkillFile(fileId, userId) {
    this.data.skill_files = (this.data.skill_files || []).filter(f => 
      !(Number(f.id) === Number(fileId) && Number(f.user_id) === Number(userId))
    );
    this.save();
    return true;
  }

  // --- Verification Requests Operations ---
  createVerificationRequest(reqObj) {
    const id = this.nextId('verification_requests');
    const newReq = {
      id,
      user_id: Number(reqObj.user_id),
      user_type: reqObj.user_type || 'student', // 'student' or 'client'
      document_url: reqObj.document_url,
      document_name: reqObj.document_name || 'Verification Document',
      organization_name: reqObj.organization_name || '',
      college_name: reqObj.college_name || '',
      notes: reqObj.notes || '',
      status: 'PENDING', // 'PENDING', 'APPROVED', 'REJECTED'
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewer_id: null,
      admin_note: ''
    };
    this.data.verification_requests = this.data.verification_requests || [];
    this.data.verification_requests.push(newReq);
    this.save();
    return newReq;
  }

  getAllVerificationRequests(filter = {}) {
    let requests = this.data.verification_requests || [];
    if (filter.status) {
      requests = requests.filter(r => r.status === filter.status);
    }
    if (filter.user_type) {
      requests = requests.filter(r => r.user_type === filter.user_type);
    }
    return requests.map(r => {
      const user = this.findUserById(r.user_id);
      return {
        ...r,
        user: user ? { id: user.id, name: user.name, email: user.email, role: user.role, college: user.college, avatar_url: user.avatar_url } : null
      };
    });
  }

  getVerificationRequestById(id) {
    return (this.data.verification_requests || []).find(r => Number(r.id) === Number(id));
  }

  updateVerificationRequest(id, updates) {
    const req = this.getVerificationRequestById(id);
    if (!req) return null;
    Object.assign(req, updates);
    this.save();
    return req;
  }

  // --- Dynamic Website Customizer & CMS Settings ---
  getSiteSettings() {
    if (!this.data.site_settings || Object.keys(this.data.site_settings).length === 0) {
      this.data.site_settings = { ...defaultSiteSettings };
      this.save();
    }
    // Upgrade legacy informal footer settings
    if (!this.data.site_settings.footer_love_text ||
        this.data.site_settings.footer_love_text.includes('Made with') ||
        this.data.site_settings.footer_love_text.includes('❤️') ||
        !this.data.site_settings.footer_love_text.includes('MCC')) {
      this.data.site_settings.footer_love_text = defaultSiteSettings.footer_love_text;
      this.data.site_settings.footer_trust_badge = defaultSiteSettings.footer_trust_badge;
      this.data.site_settings.footer_copyright_text = defaultSiteSettings.footer_copyright_text;
      this.data.site_settings.footer_about_text = defaultSiteSettings.footer_about_text;
      this.save();
    }
    return this.data.site_settings;
  }

  updateSiteSettings(updates) {
    if (!this.data.site_settings) {
      this.data.site_settings = { ...defaultSiteSettings };
    }
    this.data.site_settings = {
      ...this.data.site_settings,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.site_settings;
  }
}

const db = new RelationalDatabase();
export default db;

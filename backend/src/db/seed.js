import bcrypt from 'bcryptjs';
import db from './database.js';

export async function seedDatabase() {
  console.log('Seeding database with realistic student marketplace data...');

  // Clear existing data
  db.data.users = [];
  db.data.skills = [];
  db.data.categories = [];
  db.data.services = [];
  db.data.portfolio_items = [];
  db.data.projects = [];
  db.data.messages = [];
  db.data.wallets = [];
  db.data.transactions = [];
  db.data.reviews = [];
  db.data.notifications = [];
  db.data.reports = [];
  db.counters = {};

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('stephen@123', 10);

  // 1. Seed Categories
  const categoriesData = [
    { name: 'Web Development', slug: 'web-development', icon: 'Globe', description: 'Websites, landing pages, React apps, full-stack portals' },
    { name: 'Graphic Design', slug: 'graphic-design', icon: 'Palette', description: 'Event posters, flyers, banners, social media kits' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', icon: 'Layout', description: 'Figma mockups, app wireframes, user experience design' },
    { name: 'Programming & Tech', slug: 'programming-tech', icon: 'Code2', description: 'Python scripts, bug fixes, algorithmic problem solving' },
    { name: 'Video Editing', slug: 'video-editing', icon: 'Video', description: 'College fest aftermovies, reels, YouTube editing, animations' },
    { name: 'Content Writing', slug: 'content-writing', icon: 'PenTool', description: 'Articles, essays, research summaries, technical blogs' },
    { name: 'Tutoring & Academics', slug: 'tutoring-academics', icon: 'GraduationCap', description: '1-on-1 tutoring in Math, Physics, CS, and languages' },
    { name: 'App Development', slug: 'app-development', icon: 'Smartphone', description: 'Flutter, React Native, iOS, Android mobile apps' },
    { name: 'Presentation & Pitch Decks', slug: 'presentation-design', icon: 'Presentation', description: 'Pitch decks, PowerPoint, Google Slides, symposium decks' },
    { name: 'Photography & Media', slug: 'photography-media', icon: 'Camera', description: 'Campus event photography, photo retouching, Lightroom' },
    { name: 'Data Science & Python', slug: 'data-science', icon: 'Database', description: 'Data visualization, Pandas, statistical analysis, Jupyter' },
    { name: 'Digital Marketing & SEO', slug: 'digital-marketing', icon: 'TrendingUp', description: 'Social media growth, campus branding, SEO optimization' },
    { name: 'Music & Audio', slug: 'music-audio', icon: 'Music', description: 'Voiceovers, podcast audio mixing, beat making, background music' },
    { name: 'Translation & Other', slug: 'translation-other', icon: 'Languages', description: 'Language translation, document proofreading, transcription' }
  ];

  const categories = [];
  for (const cat of categoriesData) {
    categories.push(db.createCategory(cat));
  }

  // 2. Seed Users
  const usersData = [
    {
      name: 'Rahul Kumar',
      email: 'rahul@college.edu',
      password_hash: passwordHash,
      role: 'student',
      college: 'Indian Institute of Information Technology',
      department: 'Computer Science & Engineering',
      year_of_study: '3rd Year',
      bio: 'Fullstack developer passionate about building fast, responsive React & Node.js web apps. Winner of 2 Hackathons. Quick turnarounds guaranteed!',
      avatar_url: '/avatars/bitmoji_male_3.jpg',
      is_verified_student: 1,
      response_time: 'Within 30 mins',
      initial_balance: 4500
    },
    {
      name: 'Ananya Sen',
      email: 'ananya@design.edu',
      password_hash: passwordHash,
      role: 'student',
      college: 'National Institute of Design',
      department: 'Communication & Visual Design',
      year_of_study: '4th Year',
      bio: 'Award-winning student designer specializing in high-impact college fest posters, brand identities, and sleek Figma UI/UX interfaces.',
      avatar_url: '/avatars/bitmoji_female_2.jpg',
      is_verified_student: 1,
      response_time: 'Within 15 mins',
      initial_balance: 6200
    },
    {
      name: 'Rohan Verma',
      email: 'rohan@media.edu',
      password_hash: passwordHash,
      role: 'student',
      college: 'St. Xavier\'s College of Media & Arts',
      department: 'Film & Visual Media',
      year_of_study: '2nd Year',
      bio: 'Short-form video editor & motion designer. Over 500k views on client Instagram Reels and YouTube Shorts. Let\'s make your content pop!',
      avatar_url: '/avatars/bitmoji_male_4.jpg',
      is_verified_student: 1,
      response_time: 'Within 1 hour',
      initial_balance: 3800
    },
    {
      name: 'Sneha Patel',
      email: 'sneha@tech.ac.in',
      password_hash: passwordHash,
      role: 'student',
      college: 'Delhi Technological University',
      department: 'Information Technology',
      year_of_study: '3rd Year',
      bio: 'Data enthusiast and CS tutor. I build Python automation scripts and explain complex algorithms & calculus in simple, intuitive steps.',
      avatar_url: '/avatars/bitmoji_female_5.jpg',
      is_verified_student: 1,
      response_time: 'Within 45 mins',
      initial_balance: 5100
    },
    {
      name: 'Vikram Rao',
      email: 'vikram@univ.edu',
      password_hash: passwordHash,
      role: 'student',
      college: 'University of Arts & Sciences',
      department: 'English Literature & Journalism',
      year_of_study: '2nd Year',
      bio: 'Published student writer & editor. I craft crisp technical blogs, project reports, and ATS-optimized resumes that land tech interviews.',
      avatar_url: '/avatars/bitmoji_male_1.jpg',
      is_verified_student: 1,
      response_time: 'Within 2 hours',
      initial_balance: 2900
    },
    {
      name: 'Priya Sharma',
      email: 'priya@college.edu',
      password_hash: passwordHash,
      role: 'client',
      college: 'Delhi University, Hindu College',
      department: 'Economics & Mathematics',
      year_of_study: '2nd Year',
      bio: 'Active student coordinator and club organizer looking to collaborate with talented student developers and designers for campus initiatives.',
      avatar_url: '/avatars/bitmoji_female_3.jpg',
      is_verified_student: 1,
      response_time: 'Within 1 hour',
      initial_balance: 7500
    },
    {
      name: 'Srikanth Stephen (Admin)',
      email: 'srikanthstephen2007@gmail.com',
      password_hash: adminHash,
      role: 'admin',
      college: 'Platform Administration',
      department: 'Marketplace Operations',
      year_of_study: 'Faculty / Admin',
      bio: 'Marketplace administrator verifying student credentials, managing quality guidelines, and monitoring community safety.',
      avatar_url: '/avatars/bitmoji_male_5.jpg',
      is_verified_student: 1,
      response_time: 'Instant',
      initial_balance: 50000
    }
  ];

  const users = [];
  for (const u of usersData) {
    users.push(db.createUser(u));
  }

  // 3. Seed Skills
  const userSkillsMap = {
    1: ['React', 'Node.js', 'Next.js', 'TypeScript', 'MongoDB', 'Express', 'Tailwind CSS', 'Git'],
    2: ['Figma', 'Graphic Design', 'Canva', 'Adobe Illustrator', 'Photoshop', 'UI/UX', 'Poster Design', 'Branding'],
    3: ['Adobe Premiere Pro', 'After Effects', 'Video Editing', 'Motion Graphics', 'Reels / Shorts', 'Sound Design', 'CapCut Pro'],
    4: ['Python', 'Data Science', 'Pandas', 'Calculus', 'Data Structures & Algorithms', 'Machine Learning', 'SQL'],
    5: ['Technical Writing', 'Copywriting', 'SEO', 'Resume Writing', 'Research Papers', 'Proofreading', 'Content Strategy'],
    6: ['Project Management', 'Event Planning', 'Financial Modeling', 'Public Speaking', 'Social Media Management']
  };

  for (const [uId, skills] of Object.entries(userSkillsMap)) {
    db.setUserSkills(uId, skills.map(s => ({ skill_name: s, proficiency: 'Expert' })));
  }

  // 4. Seed Portfolios
  const portfolioData = [
    {
      user_id: 1,
      title: 'College Tech Symposium 2026 Portal',
      description: 'Built a responsive registration and live leaderboards web app for 1,200+ campus participants using React and Express.',
      image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      project_url: 'https://github.com/rahul/symposium-portal',
      technologies: 'React, Node.js, Tailwind, SQLite'
    },
    {
      user_id: 1,
      title: 'Hostel Roommate & Mess Expense Tracker',
      description: 'A lightweight Progressive Web App for splitting canteen bills and tracking hostel roommate chores.',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      project_url: 'https://github.com/rahul/expense-tracker',
      technologies: 'Next.js, TypeScript, Chart.js'
    },
    {
      user_id: 2,
      title: 'Annual Cultural Fest "TARANG 2026" Brand Kit',
      description: 'Created the full visual identity including 12 event posters, stage backdrop banners, ID badges, and Instagram story templates.',
      image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
      project_url: 'https://behance.net/ananya-tarang',
      technologies: 'Figma, Illustrator, Photoshop'
    },
    {
      user_id: 2,
      title: 'Campus Food Delivery App (UI/UX Case Study)',
      description: 'Comprehensive 40-screen mobile UX flow with interactive micro-interactions and dark mode color scheme.',
      image_url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
      project_url: 'https://figma.com/@ananya-campus-food',
      technologies: 'Figma, FigJam, Prototyping'
    },
    {
      user_id: 3,
      title: 'Robotics Club Hackathon Aftermovie',
      description: 'Cinematic 3-minute recap video with 3D motion tracking, sound effects, and color grading.',
      image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      project_url: 'https://youtube.com/watch?v=demo',
      technologies: 'Premiere Pro, After Effects'
    }
  ];

  for (const p of portfolioData) {
    db.createPortfolioItem(p);
  }

  // 5. Seed Services / Gigs
  const servicesData = [
    {
      user_id: 1,
      category_id: 1, // Web Dev
      title: 'I will build a responsive React & Node.js website for your college club or project',
      description: 'I will create a sleek, mobile-optimized modern website using React, Tailwind/CSS, and Node.js. Includes responsive layout, interactive forms, smooth animations, and clean code documentation.',
      starting_price: 1800,
      delivery_days: 3,
      skills_csv: 'React, Node.js, Web Development, Frontend, JavaScript',
      cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 1,
      category_id: 4, // Programming & Tech
      title: 'I will fix bugs, optimize performance, and clean up your JavaScript/Python code',
      description: 'Stuck on a tricky bug before a deadline? I will debug your code, solve logical errors, improve performance, and provide clear explanations of what went wrong.',
      starting_price: 600,
      delivery_days: 1,
      skills_csv: 'JavaScript, Python, Bug Fixing, Code Review, Node.js',
      cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 2,
      category_id: 2, // Graphic Design
      title: 'I will design a high-impact college fest poster, flyer & Instagram kit',
      description: 'Get an eye-catching poster that attracts crowds to your college fest, workshop, or club event! Includes print-ready PDF (300 DPI), high-res JPEG/PNG, and Instagram story formats.',
      starting_price: 700,
      delivery_days: 2,
      skills_csv: 'Photoshop, Canva, Graphic Design, Poster Design, Illustrator',
      cover_image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 2,
      category_id: 3, // UI/UX
      title: 'I will design modern UI/UX mockups and prototypes in Figma for your app or website',
      description: 'Complete Figma wireframes, component design system, and clickable prototypes tailored for student startups and academic submissions.',
      starting_price: 1500,
      delivery_days: 3,
      skills_csv: 'Figma, UI/UX Design, Wireframing, Mobile App Design, Prototyping',
      cover_image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 3,
      category_id: 5, // Video Editing
      title: 'I will edit viral Instagram Reels, TikToks, and YouTube Shorts with dynamic captions',
      description: 'Transform your raw footage into engaging short-form videos with Alex Hormozi style animated subtitles, sound effects, B-rolls, zooms, and trending music.',
      starting_price: 800,
      delivery_days: 2,
      skills_csv: 'Premiere Pro, Video Editing, Reels, Shorts, Motion Graphics',
      cover_image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 3,
      category_id: 5, // Video Editing
      title: 'I will edit cinematic college fest aftermovies and event highlight videos',
      description: 'Professional color grading, audio synchronization, beat drops, transition effects, and 4K output for your campus memories.',
      starting_price: 2500,
      delivery_days: 4,
      skills_csv: 'After Effects, Premiere Pro, Event Video, Color Grading',
      cover_image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 4,
      category_id: 7, // Tutoring & Academics
      title: 'I will tutor you 1-on-1 in Data Structures, Algorithms, or Engineering Math',
      description: 'Clear your concepts in Binary Trees, Dynamic Programming, Graph Algorithms, or Calculus. 60-minute interactive live session with personalized practice problems & notes.',
      starting_price: 500,
      delivery_days: 1,
      skills_csv: 'Tutoring, Data Structures, Python, Algorithms, Mathematics',
      cover_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 4,
      category_id: 11, // Data Science
      title: 'I will write Python automation scripts and analyze datasets using Pandas & Matplotlib',
      description: 'Automate tedious web scraping, Excel data cleaning, or generate beautiful charts and statistical summaries for your assignments.',
      starting_price: 1100,
      delivery_days: 2,
      skills_csv: 'Python, Pandas, Data Analysis, Web Scraping, Automation',
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 5,
      category_id: 6, // Content Writing
      title: 'I will write well-researched technical articles, project reports, and essays',
      description: 'Zero plagiarism, well-structured, thoroughly cited content formatted to IEEE or APA standards. Fast delivery with revision support.',
      starting_price: 650,
      delivery_days: 2,
      skills_csv: 'Content Writing, Technical Writing, Research, Proofreading',
      cover_image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
    },
    {
      user_id: 5,
      category_id: 9, // Presentation & Pitch Decks
      title: 'I will design a winning PowerPoint / Google Slides deck for your seminar or pitch',
      description: 'Professional visual slides with custom infographics, sleek typography, clean data visualizations, and speaker notes.',
      starting_price: 900,
      delivery_days: 2,
      skills_csv: 'PowerPoint, Pitch Deck, Google Slides, Presentation Design',
      cover_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
    }
  ];

  for (const s of servicesData) {
    db.createService(s);
  }

  // 6. Seed Projects & Lifecycle Data
  const projectsData = [
    {
      service_id: 1,
      client_id: 6, // Priya
      freelancer_id: 1, // Rahul
      title: 'Department Tech Symposium Website',
      description: 'Need a responsive website for our Computer Science Department symposium with event schedule, registration form, and speaker bio section.',
      requirements: 'Must look modern in dark theme with blue accents. Mobile responsive. Forms should validate inputs.',
      budget: 2000,
      deadline_days: 5,
      status: 'COMPLETED'
    },
    {
      service_id: 3,
      client_id: 6, // Priya
      freelancer_id: 2, // Ananya
      title: 'Annual E-Cell Summit Poster & Social Media Banners',
      description: 'Design 3 flyers for our Entrepreneurship Cell Summit: 1 main headline poster and 2 Instagram carousel templates.',
      requirements: 'Vibrant neon gradient style. Include QR code for registration. Provide source AI/Figma files.',
      budget: 1200,
      deadline_days: 3,
      status: 'IN_PROGRESS'
    },
    {
      service_id: 5,
      client_id: 1, // Rahul hiring Rohan
      freelancer_id: 3, // Rohan
      title: 'Hackathon Demo Video 60-Second Edit',
      description: 'Edit a punchy 60-second product demo pitch video for our Hackathon submission with upbeat background score and animated captions.',
      requirements: '1080x1920 vertical format. Alex Hormozi style subtitle popups. Deliver MP4.',
      budget: 900,
      deadline_days: 2,
      status: 'SUBMITTED'
    }
  ];

  const p1 = db.createProject(projectsData[0]);
  db.updateProjectStatus(p1.id, 'ACCEPTED');
  db.updateProjectStatus(p1.id, 'IN_PROGRESS');
  db.updateProjectStatus(p1.id, 'SUBMITTED', {
    submission_notes: 'All pages built and deployed on Vercel preview. Source code zipped with full README documentation.',
    submission_file_url: 'https://example.com/symposium-final-v1.zip',
    submission_file_name: 'symposium-final-deliverable.zip'
  });
  db.updateProjectStatus(p1.id, 'COMPLETED');

  // Seed Review for Project 1
  db.createReview({
    project_id: p1.id,
    reviewer_id: 6,
    reviewee_id: 1,
    overall_rating: 5,
    communication_rating: 5,
    quality_rating: 5,
    timeliness_rating: 5,
    comment: 'Outstanding work by Rahul! Delivered the symposium website 1 day ahead of schedule. The animations and mobile layout are fantastic. Highly recommended!'
  });

  const p2 = db.createProject(projectsData[1]);
  db.updateProjectStatus(p2.id, 'ACCEPTED');
  db.updateProjectStatus(p2.id, 'IN_PROGRESS');

  const p3 = db.createProject(projectsData[2]);
  db.updateProjectStatus(p3.id, 'ACCEPTED');
  db.updateProjectStatus(p3.id, 'IN_PROGRESS');
  db.updateProjectStatus(p3.id, 'SUBMITTED', {
    submission_notes: 'Here is the 60s edit with audio mix and dynamic subtitle animations. Please let me know if you want any color tweaks!',
    submission_file_url: 'https://example.com/hackathon-demo-60s.mp4',
    submission_file_name: 'hackathon-demo-final.mp4'
  });

  // 7. Seed Chat Messages for Project 2
  db.createMessage({
    project_id: p2.id,
    sender_id: 6,
    receiver_id: 2,
    content: 'Hi Ananya! Super excited to work with you on the E-Cell Summit posters.',
    is_system: 0
  });

  db.createMessage({
    project_id: p2.id,
    sender_id: 2,
    receiver_id: 6,
    content: 'Hi Priya! Thanks for reaching out. Could you share your brand color codes and high-res club logo?',
    is_system: 0
  });

  db.createMessage({
    project_id: p2.id,
    sender_id: 6,
    receiver_id: 2,
    content: 'Sure! Our primary color is Electric Violet (#7C3AED) and Emerald (#10B981). Here is our SVG logo file.',
    attachment_name: 'ecell_vector_logo.svg',
    attachment_url: 'https://example.com/assets/ecell_vector_logo.svg',
    attachment_size: 142000,
    is_system: 0
  });

  db.createMessage({
    project_id: p2.id,
    sender_id: 2,
    receiver_id: 6,
    content: 'Got it! I will share the initial draft layout by tomorrow evening. 👍',
    is_system: 0
  });

  // 8. Seed Open Public Projects (Job Board)
  const openProj1 = db.createProject({
    client_id: 6, // Priya
    freelancer_id: null,
    category_id: 2, // Graphic Design
    title: 'Need Creative Logo & Brand Vector Identity for Tech Innovators Club',
    description: 'We are launching our student robotics & AI society. Need a modern, minimalist logo with clean vector mark, dark & light theme variants, and social media display avatars.',
    requirements: 'Deliverables: Vector SVG, AI or Figma file, high-resolution PNG with transparent background.',
    skills_required: 'Logo Design, Illustrator, Vector Art, Graphic Design',
    budget: 850,
    deadline_days: 3,
    is_public: 1
  });

  const openProj2 = db.createProject({
    client_id: 6, // Priya
    freelancer_id: null,
    category_id: 1, // Web Development
    title: 'Full-Stack React & Node Dashboard for Final Year Research Prototype',
    description: 'Looking for a skilled student developer to build a modern dashboard with charts and REST API integration for our college sensor telemetry project.',
    requirements: 'Clean modular React components, responsive CSS, and backend endpoint connection.',
    skills_required: 'React, Node.js, JavaScript, Chart.js',
    budget: 2200,
    deadline_days: 5,
    is_public: 1
  });

  // Seed sample proposal by student Rahul on openProj1
  db.createProposal({
    project_id: openProj1.id,
    freelancer_id: 1, // Rahul
    bid_amount: 800,
    delivery_days: 2,
    pitch: 'Hi Priya! I specialize in clean minimalist vector logos and design systems. I can deliver 3 unique concept drafts within 24 hours with unlimited color revisions.'
  });

  // 9. Seed Sample Reports (for Admin moderation testing)
  db.createReport({
    reporter_id: 6,
    target_type: 'service',
    target_id: 2,
    target_name: 'Bug Fixing Service',
    reason: 'Spam',
    details: 'Testing platform report submission flow for sample validation.'
  });

  console.log('Database seeding finished successfully!');
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

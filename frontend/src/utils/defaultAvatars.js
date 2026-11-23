// Curated collection of vibrant 3D Snapchat Bitmoji / Pixar-style college student avatars
// High-resolution, expressive 3D character avatars with distinctive styles, accessories & campus vibes.

export const SNAPCHAT_BITMOJI_AVATARS = [
  {
    id: 'snap-male-1',
    name: 'College Vibe (Alex)',
    role: 'Full-Stack & Mobile',
    gender: 'male',
    category: 'campus',
    tag: 'Casual',
    url: '/avatars/bitmoji_male_1.jpg'
  },
  {
    id: 'snap-female-1',
    name: 'Tech & Scholar (Ananya)',
    role: 'AI & Data Science',
    gender: 'female',
    category: 'tech',
    tag: 'Coder',
    url: '/avatars/bitmoji_female_1.jpg'
  },
  {
    id: 'snap-male-2',
    name: 'Audio & Tech (Marcus)',
    role: 'Cybersecurity & Cloud',
    gender: 'male',
    category: 'tech',
    tag: 'Hacker',
    url: '/avatars/bitmoji_male_2.jpg'
  },
  {
    id: 'snap-female-2',
    name: 'Creative Studio (Zara)',
    role: 'UI/UX & Branding',
    gender: 'female',
    category: 'creative',
    tag: 'Design',
    url: '/avatars/bitmoji_female_2.jpg'
  },
  {
    id: 'snap-male-3',
    name: 'Engineering Lead (Rahul)',
    role: 'Backend & Python',
    gender: 'male',
    category: 'tech',
    tag: 'Dev',
    url: '/avatars/bitmoji_male_3.jpg'
  },
  {
    id: 'snap-female-3',
    name: 'Design Prodigy (Priya)',
    role: 'Graphic & 3D Artist',
    gender: 'female',
    category: 'creative',
    tag: 'Artist',
    url: '/avatars/bitmoji_female_3.jpg'
  },
  {
    id: 'snap-male-4',
    name: 'Video & Motion (Leo)',
    role: 'Video Editor & Motion',
    gender: 'male',
    category: 'creative',
    tag: 'Editor',
    url: '/avatars/bitmoji_male_4.jpg'
  },
  {
    id: 'snap-female-4',
    name: 'Gamer & AI (Maya)',
    role: 'Game Dev & Web3',
    gender: 'female',
    category: 'tech',
    tag: 'AI Dev',
    url: '/avatars/bitmoji_female_4.jpg'
  },
  {
    id: 'snap-male-5',
    name: 'Campus Influencer (Devon)',
    role: 'Social & Brand Strategist',
    gender: 'male',
    category: 'campus',
    tag: 'Leader',
    url: '/avatars/bitmoji_male_5.jpg'
  },
  {
    id: 'snap-female-5',
    name: 'Data Science (Sneha)',
    role: 'ML & Data Analyst',
    gender: 'female',
    category: 'tech',
    tag: 'Data',
    url: '/avatars/bitmoji_female_5.jpg'
  },
  {
    id: 'snap-male-6',
    name: 'Streetwear & Chill (Kai)',
    role: 'Frontend & Content',
    gender: 'male',
    category: 'campus',
    tag: 'Creator',
    url: '/avatars/bitmoji_male_6.jpg'
  },
  {
    id: 'snap-female-6',
    name: 'UI/UX Stylist (Chloe)',
    role: 'Product Designer',
    gender: 'female',
    category: 'creative',
    tag: 'UI/UX',
    url: '/avatars/bitmoji_female_6.jpg'
  }
];

// Alias for backwards compatibility across older components
export const PROFESSIONAL_AVATARS = SNAPCHAT_BITMOJI_AVATARS;

/**
 * Checks if a given avatar URL should be upgraded to the modern 3D Snapchat Bitmoji avatar:
 * - Empty / null
 * - Unsplash stock photos (the old corporate headshots)
 * - DiceBear 2D flat cartoon avatars
 */
export function isUnwantedOrOldAvatar(url) {
  if (!url || typeof url !== 'string') return true;
  // If it's an Unsplash stock photo, replace with 3D Snapchat Bitmoji
  if (url.includes('images.unsplash.com/photo-')) return true;
  // If it's an old 2D DiceBear cartoon
  if (url.includes('dicebear.com/')) return true;
  return false;
}

export function isCartoonAvatar(url) {
  return isUnwantedOrOldAvatar(url);
}

/**
 * Returns a deterministic, vibrant 3D Snapchat Bitmoji avatar for a given user or name.
 */
export function getProfessionalAvatar(userOrName, preferredGender = null) {
  let rawUrl = '';
  let name = 'Student';

  if (typeof userOrName === 'object' && userOrName !== null) {
    rawUrl = userOrName.avatar_url || userOrName.freelancer_avatar || userOrName.reviewer_avatar || '';
    name = userOrName.name || userOrName.freelancer_name || userOrName.reviewer_name || 'Student';
  } else if (typeof userOrName === 'string') {
    if (userOrName.startsWith('http') || userOrName.startsWith('/uploads/') || userOrName.startsWith('/avatars/')) {
      rawUrl = userOrName;
    } else {
      name = userOrName;
    }
  }

  // If the user already has a valid custom uploaded avatar or a Bitmoji avatar, keep it
  if (rawUrl && !isUnwantedOrOldAvatar(rawUrl)) {
    return rawUrl;
  }

  // Filter pool if preferredGender is specified
  let pool = SNAPCHAT_BITMOJI_AVATARS;
  if (preferredGender === 'male') {
    pool = SNAPCHAT_BITMOJI_AVATARS.filter(a => a.gender === 'male');
  } else if (preferredGender === 'female') {
    pool = SNAPCHAT_BITMOJI_AVATARS.filter(a => a.gender === 'female');
  }

  // Deterministic string hash selection
  let hash = 0;
  const str = String(name || 'Student');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index].url;
}

export const getSnapchatAvatar = getProfessionalAvatar;

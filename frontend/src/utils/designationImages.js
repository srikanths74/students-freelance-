/**
 * Curated high-resolution card cover photos and designation titles
 * matching specific student freelance fields, categories, and departments.
 */

export const designationPhotoMap = {
  'web-development': {
    title: 'Full-Stack & Web Developer',
    icon: '💻',
    photo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tag: 'Web & React'
  },
  'graphic-design': {
    title: 'Graphic & Poster Designer',
    icon: '🎨',
    photo: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    tag: 'Visual Design'
  },
  'ui-ux-design': {
    title: 'UI/UX Product Designer',
    icon: '✨',
    photo: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
    tag: 'Figma & UI'
  },
  'programming-tech': {
    title: 'Software & Python Engineer',
    icon: '⚡',
    photo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    tag: 'Code & Algorithms'
  },
  'video-editing': {
    title: 'Video Editor & Motion Creator',
    icon: '🎬',
    photo: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    tag: 'Reels & Cinema'
  },
  'content-writing': {
    title: 'Content Writer & Copywriter',
    icon: '✍️',
    photo: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    tag: 'Editorial & Copy'
  },
  'tutoring-academics': {
    title: 'Academic Tutor & Mentor',
    icon: '📚',
    photo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    tag: 'STEM & Academics'
  },
  'app-development': {
    title: 'Mobile App Developer',
    icon: '📱',
    photo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    tag: 'iOS & Android'
  },
  'presentation-design': {
    title: 'Pitch Deck & Slide Designer',
    icon: '📊',
    photo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    tag: 'Pitch Decks'
  },
  'photography-media': {
    title: 'Campus Media & Photographer',
    icon: '📸',
    photo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    tag: 'Photo & Media'
  },
  'data-science': {
    title: 'Data Scientist & ML Analyst',
    icon: '📈',
    photo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tag: 'Data & AI'
  },
  'digital-marketing': {
    title: 'Growth & Social Marketer',
    icon: '🚀',
    photo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tag: 'Marketing & SEO'
  },
  'music-audio': {
    title: 'Audio Producer & Sound Artist',
    icon: '🎵',
    photo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    tag: 'Music & Audio'
  }
};

const defaultDesignation = {
  title: 'Campus Student Freelancer',
  icon: '⭐',
  photo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  tag: 'Campus Talent'
};

/**
 * Returns suitable designation photo and badge based on category, department or skills
 */
export function getDesignationInfo(categoryOrDepartment, fallbackSlug = '') {
  const text = `${categoryOrDepartment || ''} ${fallbackSlug || ''}`.toLowerCase();

  if (text.includes('web') || text.includes('fullstack') || text.includes('frontend') || text.includes('react') || text.includes('node')) {
    return designationPhotoMap['web-development'];
  }
  if (text.includes('graphic') || text.includes('poster') || text.includes('banner') || text.includes('brand') || text.includes('visual design')) {
    return designationPhotoMap['graphic-design'];
  }
  if (text.includes('ui') || text.includes('ux') || text.includes('figma') || text.includes('wireframe') || text.includes('prototype')) {
    return designationPhotoMap['ui-ux-design'];
  }
  if (text.includes('video') || text.includes('film') || text.includes('reel') || text.includes('animation') || text.includes('motion')) {
    return designationPhotoMap['video-editing'];
  }
  if (text.includes('program') || text.includes('python') || text.includes('code') || text.includes('computer science') || text.includes('software') || text.includes('it') || text.includes('information tech')) {
    return designationPhotoMap['programming-tech'];
  }
  if (text.includes('content') || text.includes('write') || text.includes('essay') || text.includes('blog') || text.includes('copy') || text.includes('literature') || text.includes('journalism')) {
    return designationPhotoMap['content-writing'];
  }
  if (text.includes('tutor') || text.includes('academic') || text.includes('math') || text.includes('physics') || text.includes('calculus')) {
    return designationPhotoMap['tutoring-academics'];
  }
  if (text.includes('app') || text.includes('mobile') || text.includes('flutter') || text.includes('android') || text.includes('ios')) {
    return designationPhotoMap['app-development'];
  }
  if (text.includes('presentation') || text.includes('pitch') || text.includes('deck') || text.includes('slide')) {
    return designationPhotoMap['presentation-design'];
  }
  if (text.includes('photo') || text.includes('camera') || text.includes('lens')) {
    return designationPhotoMap['photography-media'];
  }
  if (text.includes('data') || text.includes('analytics') || text.includes('pandas') || text.includes('machine learning')) {
    return designationPhotoMap['data-science'];
  }
  if (text.includes('marketing') || text.includes('seo') || text.includes('growth')) {
    return designationPhotoMap['digital-marketing'];
  }
  if (text.includes('music') || text.includes('audio') || text.includes('sound')) {
    return designationPhotoMap['music-audio'];
  }

  return defaultDesignation;
}

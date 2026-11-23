import db from '../db/database.js';

export class AIService {
  /**
   * AI Project Description Generator:
   * Generates a structured, professional project requirement document from a brief one-liner.
   */
  static generateProjectDescription(prompt) {
    const p = (prompt || '').trim();
    if (!p) {
      return {
        title: 'Custom Student Project',
        description: 'Detailed specifications to be discussed with student freelancer.',
        deliverables: ['Source Code / Design Files', 'Documentation & Instructions', 'Final Walkthrough'],
        suggestedBudget: 1500,
        suggestedDays: 3,
        skillsRecommended: ['Web Development', 'UI/UX Design']
      };
    }

    const lower = p.toLowerCase();

    // Determine category & domain heuristics
    let domain = 'general';
    let suggestedBudget = 1500;
    let suggestedDays = 3;
    let skillsRecommended = [];

    if (lower.includes('website') || lower.includes('web') || lower.includes('react') || lower.includes('symposium') || lower.includes('portal')) {
      domain = 'web';
      suggestedBudget = 2000;
      suggestedDays = 4;
      skillsRecommended = ['React', 'Node.js', 'HTML/CSS', 'Responsive Design', 'JavaScript'];
    } else if (lower.includes('poster') || lower.includes('flyer') || lower.includes('fest') || lower.includes('graphic') || lower.includes('logo') || lower.includes('banner')) {
      domain = 'graphic';
      suggestedBudget = 800;
      suggestedDays = 2;
      skillsRecommended = ['Photoshop', 'Canva', 'Illustrator', 'Graphic Design', 'Typography'];
    } else if (lower.includes('app') || lower.includes('mobile') || lower.includes('android') || lower.includes('flutter') || lower.includes('ios')) {
      domain = 'app';
      suggestedBudget = 3500;
      suggestedDays = 7;
      skillsRecommended = ['Flutter', 'React Native', 'Mobile UI/UX', 'Firebase', 'REST APIs'];
    } else if (lower.includes('video') || lower.includes('reel') || lower.includes('edit') || lower.includes('youtube') || lower.includes('short')) {
      domain = 'video';
      suggestedBudget = 1000;
      suggestedDays = 2;
      skillsRecommended = ['Premiere Pro', 'After Effects', 'Video Editing', 'Motion Graphics', 'Sound Sync'];
    } else if (lower.includes('tutor') || lower.includes('math') || lower.includes('algorithm') || lower.includes('dsa') || lower.includes('teach')) {
      domain = 'tutoring';
      suggestedBudget = 600;
      suggestedDays = 1;
      skillsRecommended = ['Tutoring', 'Data Structures', 'Calculus', 'Python', 'Problem Solving'];
    } else if (lower.includes('python') || lower.includes('data') || lower.includes('scrap') || lower.includes('ml') || lower.includes('ai')) {
      domain = 'data';
      suggestedBudget = 1600;
      suggestedDays = 3;
      skillsRecommended = ['Python', 'Pandas', 'Data Analysis', 'Web Scraping', 'NumPy'];
    } else if (lower.includes('write') || lower.includes('article') || lower.includes('report') || lower.includes('essay') || lower.includes('resume')) {
      domain = 'writing';
      suggestedBudget = 750;
      suggestedDays = 2;
      skillsRecommended = ['Content Writing', 'Technical Writing', 'Proofreading', 'Research', 'Resume Writing'];
    }

    const title = p.charAt(0).toUpperCase() + p.slice(1);
    
    let structuredDesc = `### 📋 Project Scope & Objectives
The goal of this project is to develop/design: "${p}".
This project aims to deliver a high-quality, professional student deliverable on schedule with clean implementation and smooth user experience.

### 🎯 Key Requirements & Deliverables:
1. **Core Deliverable**: Complete, polished primary output matching agreed specifications.
2. **Quality Assurance**: Thoroughly tested, responsive, and checked against requirements.
3. **Source Files**: Full delivery of all source materials (e.g. Figma files, Code repo, or 4K Video exports).
4. **Documentation**: Clear guide / instructions for easy handoff and demonstration.

### 📅 Milestones:
- **Phase 1 (Day 1)**: Requirements clarification, design drafts / architecture blueprint.
- **Phase 2 (Midpoint)**: Working prototype / intermediate preview for client feedback.
- **Phase 3 (Final)**: Complete deliverable submission, minor revisions, and project handoff.`;

    return {
      title,
      description: structuredDesc,
      requirements: `1. Regular communication via in-app chat.\n2. Provide source files upon final submission.\n3. Responsive on mobile & desktop (if applicable).`,
      suggestedBudget,
      suggestedDays,
      skillsRecommended
    };
  }

  /**
   * AI Skill Matching Engine:
   * Compares client project requirements against a freelancer's specific skills.
   */
  static matchSkills(requiredTextOrArray, freelancerSkills) {
    const reqText = Array.isArray(requiredTextOrArray) 
      ? requiredTextOrArray.join(' ').toLowerCase()
      : (requiredTextOrArray || '').toLowerCase();

    const fSkillNames = (freelancerSkills || []).map(s => (typeof s === 'string' ? s : s.skill_name).toLowerCase());
    
    // Core tech keywords dictionary
    const dictionary = [
      'react', 'node.js', 'nodejs', 'javascript', 'typescript', 'python', 'mongodb', 'sql',
      'figma', 'ui/ux', 'photoshop', 'illustrator', 'canva', 'graphic design', 'branding',
      'premiere pro', 'after effects', 'video editing', 'motion graphics', 'reels',
      'flutter', 'react native', 'mobile app', 'data structures', 'algorithms', 'calculus',
      'pandas', 'data science', 'machine learning', 'content writing', 'technical writing',
      'seo', 'resume writing', 'powerpoint', 'presentation design', 'pitch deck', 'express'
    ];

    const detectedInReq = dictionary.filter(kw => reqText.includes(kw));
    if (detectedInReq.length === 0) {
      // General match
      return {
        matchScore: 88,
        matchedSkills: fSkillNames.slice(0, 3),
        missingSkills: [],
        compatibilityNote: 'Good general profile match based on domain experience.'
      };
    }

    const matched = [];
    const missing = [];

    for (const kw of detectedInReq) {
      const found = fSkillNames.some(f => f.includes(kw) || kw.includes(f));
      if (found) {
        matched.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      } else {
        missing.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }

    const ratio = matched.length / (detectedInReq.length || 1);
    const score = Math.round(Math.min(99, Math.max(65, ratio * 40 + 58)));

    return {
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      totalMatched: matched.length,
      totalRequired: detectedInReq.length,
      compatibilityNote: score >= 85 
        ? '🔥 Excellent Skill Match! High compatibility for your project needs.'
        : '✨ Compatible Match. Review past portfolio projects for details.'
    };
  }

  /**
   * AI Freelancer Recommender:
   * Returns ranked student freelancers matching a natural language project brief.
   */
  static recommendFreelancers(projectBrief) {
    const users = db.getAllUsers().filter(u => u.role !== 'admin' && !u.is_suspended);
    const results = [];

    for (const user of users) {
      const skills = db.getUserSkills(user.id);
      const services = db.getAllServices({ user_id: user.id });
      const portfolio = db.getUserPortfolio(user.id);
      const reviews = db.getUserReviews(user.id);

      const skillMatch = this.matchSkills(projectBrief, skills);
      
      // Calculate overall AI composite score:
      // skillMatch score (50%) + Rating factor (25%) + Completed projects (15%) + Response time (10%)
      const ratingBonus = ((user.rating_avg || 4.8) / 5.0) * 25;
      const completedBonus = Math.min(15, (services.reduce((sum, s) => sum + (s.completed_count || 0), 0) + portfolio.length) * 1.5);
      const responseBonus = user.response_time.includes('15') ? 10 : user.response_time.includes('30') ? 9 : 7;
      
      const compositeScore = Math.round(Math.min(99, (skillMatch.matchScore * 0.5) + ratingBonus + completedBonus + responseBonus));

      results.push({
        user: {
          id: user.id,
          name: user.name,
          college: user.college,
          department: user.department,
          year_of_study: user.year_of_study,
          avatar_url: user.avatar_url,
          is_verified_student: user.is_verified_student,
          bio: user.bio,
          response_time: user.response_time,
          skills
        },
        aiScore: compositeScore,
        matchedSkills: skillMatch.matchedSkills,
        missingSkills: skillMatch.missingSkills,
        relevanceReason: `Strong match in ${skillMatch.matchedSkills.length > 0 ? skillMatch.matchedSkills.join(', ') : 'domain skills'} with ${user.year_of_study} ${user.department} expertise.`,
        topService: services[0] || null,
        portfolioCount: portfolio.length,
        reviewCount: reviews.length
      });
    }

    // Sort by AI score descending
    results.sort((a, b) => b.aiScore - a.aiScore);
    return results;
  }

  /**
   * AI Gig Copy Optimizer:
   * Generates optimized gig description & pricing recommendations.
   */
  static generateGigCopy(title, categoryName) {
    return {
      suggestedTitle: title.startsWith('I will') ? title : `I will ${title}`,
      description: `### What I Offer in this Gig:
- Professional, high-standard deliverables tailored to your exact campus / project requirements.
- Fast turnaround with regular progress updates.
- Complete source files (Figma, Clean Code, or High-Res Assets) included.
- Friendly student-to-student collaboration with revision support.

### Why Choose Me?
- Verified student on platform with proven track record.
- Clean and well-commented handoffs.
- Flexible packages suited for student budgets.`,
      tags: ['Student Freelancer', categoryName, 'Fast Delivery', 'Top Rated'],
      suggestedStartingPrice: 800,
      suggestedDeliveryDays: 2
    };
  }
}

export default AIService;

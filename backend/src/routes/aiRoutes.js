import express from 'express';
import AIService from '../services/aiService.js';
import db from '../db/database.js';

const router = express.Router();

// 1. AI Freelancer Recommendation
router.post('/recommend', (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a project description prompt' });
    }

    const recommendations = AIService.recommendFreelancers(prompt);
    return res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    console.error('AI Recommendation error:', err);
    return res.status(500).json({ success: false, message: 'AI Recommendation failed' });
  }
});

// 2. AI Project Description Generator
router.post('/generate-description', (req, res) => {
  try {
    const { prompt } = req.body;
    const generated = AIService.generateProjectDescription(prompt);
    return res.json({ success: true, generated });
  } catch (err) {
    console.error('AI Generator error:', err);
    return res.status(500).json({ success: false, message: 'AI Generation failed' });
  }
});

// 3. AI Skill Match Analyzer
router.post('/skill-match', (req, res) => {
  try {
    const { required_skills, freelancer_id } = req.body;

    let freelancerSkills = [];
    if (freelancer_id) {
      freelancerSkills = db.getUserSkills(freelancer_id);
    } else if (req.body.freelancer_skills) {
      freelancerSkills = req.body.freelancer_skills;
    }

    const analysis = AIService.matchSkills(required_skills, freelancerSkills);
    return res.json({ success: true, analysis });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Skill match analysis failed' });
  }
});

// 4. AI Gig Copywriter
router.post('/gig-copy', (req, res) => {
  try {
    const { title, category_name } = req.body;
    const copy = AIService.generateGigCopy(title || 'build web app', category_name || 'Web Development');
    return res.json({ success: true, copy });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gig copy generation failed' });
  }
});

export default router;

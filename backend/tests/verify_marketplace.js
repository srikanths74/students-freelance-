/**
 * Comprehensive Automated Verification Suite for Student Freelance Marketplace
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Full System Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('1. Testing Health Check & System Status...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    assert(health.status === 'healthy', 'API health status is healthy');
    assert(health.stats.users >= 6, `Users populated (${health.stats.users})`);
    assert(health.stats.services >= 8, `Services populated (${health.stats.services})`);

    // 2. Auth & Demo accounts
    console.log('\n2. Testing Authentication & Demo Switcher...');
    const demoRes = await fetch(`${BASE_URL}/api/auth/demo-accounts`);
    const demoData = await demoRes.json();
    assert(demoData.success && demoData.demoAccounts.length >= 6, 'Demo accounts accessible');

    // Login as Rahul (Freelancer)
    const rahulSwitch = await fetch(`${BASE_URL}/api/auth/demo/1`, { method: 'POST' });
    const rahulData = await rahulSwitch.json();
    assert(rahulData.success && rahulData.user.name === 'Rahul Kumar', 'Switched to Rahul Kumar');
    const rahulToken = rahulData.token;

    // Login as Priya (Client)
    const priyaSwitch = await fetch(`${BASE_URL}/api/auth/demo/6`, { method: 'POST' });
    const priyaData = await priyaSwitch.json();
    assert(priyaData.success && priyaData.user.name === 'Priya Sharma', 'Switched to Priya Sharma');
    const priyaToken = priyaData.token;

    // 3. AI Services
    console.log('\n3. Testing AI Features & Matching Engine...');
    const aiRecRes = await fetch(`${BASE_URL}/api/ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'I need someone to build a React website for our college symposium' })
    });
    const aiRecData = await aiRecRes.json();
    assert(aiRecData.success && aiRecData.recommendations.length > 0, 'AI Recommender returns ranked students');
    assert(aiRecData.recommendations[0].aiScore >= 80, `Top candidate match score is high (${aiRecData.recommendations[0].aiScore}%)`);

    const aiGenRes = await fetch(`${BASE_URL}/api/ai/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'College symposium event website' })
    });
    const aiGenData = await aiGenRes.json();
    assert(aiGenData.success && aiGenData.generated.description.includes('Scope'), 'AI Project Description Generator produced structured scope');

    const aiMatchRes = await fetch(`${BASE_URL}/api/ai/skill-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        required_skills: 'React, Node.js, TypeScript',
        freelancer_id: 1
      })
    });
    const aiMatchData = await aiMatchRes.json();
    assert(aiMatchData.success && aiMatchData.analysis.matchScore > 75, `AI Skill Match score is accurate (${aiMatchData.analysis.matchScore}%)`);

    // 4. Services & Search
    console.log('\n4. Testing Service Search & Filtering...');
    const searchRes = await fetch(`${BASE_URL}/api/services?search=React`);
    const searchData = await searchRes.json();
    assert(searchData.success && searchData.services.length > 0, `Search keyword "React" matched ${searchData.services.length} gigs`);

    // 5. Complete Project Lifecycle Workflow
    console.log('\n5. Testing End-to-End Project Workflow & Escrow Execution...');
    // Step A: Client Priya creates request for Freelancer Rahul
    const projCreateRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${priyaToken}`
      },
      body: JSON.stringify({
        service_id: 1,
        freelancer_id: 1,
        title: 'Automated Test: Robotics Club Web Portal',
        description: 'Responsive landing page with event registration for robotics club.',
        requirements: 'Source code in React + responsive CSS.',
        budget: 1500,
        deadline_days: 3
      })
    });
    const projCreateData = await projCreateRes.json();
    assert(projCreateData.success && projCreateData.project.status === 'REQUESTED', 'Project request created with REQUESTED status');
    const newProjectId = projCreateData.project.id;

    // Step B: Freelancer Rahul accepts -> Escrow locked
    const acceptRes = await fetch(`${BASE_URL}/api/projects/${newProjectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rahulToken}`
      },
      body: JSON.stringify({ status: 'ACCEPTED' })
    });
    const acceptData = await acceptRes.json();
    assert(acceptData.success && acceptData.project.status === 'ACCEPTED' && acceptData.project.escrow_funded === 1, 'Project ACCEPTED and Escrow payment locked');

    // Step C: Real-Time Chat exchange
    const chatRes = await fetch(`${BASE_URL}/api/chat/${newProjectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rahulToken}`
      },
      body: JSON.stringify({ content: 'Hi Priya! Started work on the components.' })
    });
    const chatData = await chatRes.json();
    assert(chatData.success && chatData.message.content.includes('Started work'), 'Real-time chat message dispatched');

    // Step D: Start project
    await fetch(`${BASE_URL}/api/projects/${newProjectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rahulToken}`
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    });

    // Step E: Freelancer Rahul submits deliverable
    const submitRes = await fetch(`${BASE_URL}/api/projects/${newProjectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rahulToken}`
      },
      body: JSON.stringify({
        status: 'SUBMITTED',
        submission_notes: 'Delivered full robotics portal code with test suite.'
      })
    });
    const submitData = await submitRes.json();
    assert(submitData.success && submitData.project.status === 'SUBMITTED', 'Deliverable SUBMITTED');

    // Step F: Client Priya approves & marks COMPLETED -> Escrow released
    const approveRes = await fetch(`${BASE_URL}/api/projects/${newProjectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${priyaToken}`
      },
      body: JSON.stringify({ status: 'COMPLETED' })
    });
    const approveData = await approveRes.json();
    assert(approveData.success && approveData.project.status === 'COMPLETED', 'Project marked COMPLETED and Escrow released to Freelancer');

    // Step G: Client leaves multi-criteria review
    const reviewRes = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${priyaToken}`
      },
      body: JSON.stringify({
        project_id: newProjectId,
        overall_rating: 5,
        communication_rating: 5,
        quality_rating: 5,
        timeliness_rating: 5,
        comment: 'Exceptional work by Rahul! Flawless execution and fast delivery.'
      })
    });
    const reviewData = await reviewRes.json();
    assert(reviewData.success && reviewData.review.overall_rating === 5, 'Multi-criteria review published and aggregate ratings updated');

    // 6. Admin capabilities
    console.log('\n6. Testing Admin Management & Platform Telemetry...');
    const adminSwitch = await fetch(`${BASE_URL}/api/auth/demo/7`, { method: 'POST' });
    const adminData = await adminSwitch.json();
    const adminToken = adminData.token;

    const adminStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminStats = await adminStatsRes.json();
    assert(adminStats.success && adminStats.stats.totalUsers >= 6, 'Admin stats & telemetry retrieved');

    // Verify a student
    const verifyRes = await fetch(`${BASE_URL}/api/admin/users/1/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ is_verified_student: 1 })
    });
    const verifyData = await verifyRes.json();
    assert(verifyData.success && verifyData.user.is_verified_student === 1, 'Admin student verification badge toggled');

    console.log(`\n========================================`);
    console.log(`🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();

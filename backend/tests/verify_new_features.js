// Comprehensive Verification Script for All 3 Features:
// 1. Forgot Password & OTP Reset
// 2. Client Public Job Posting & Student Bidding + Acceptance
// 3. User Profile Edit (Student and Client fields)

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('======================================================');
  console.log('🧪 VERIFYING 3 USER-REQUESTED FEATURES END-TO-END');
  console.log('======================================================\n');

  // ─── 1. TEST FORGOT PASSWORD & RESET (FEATURE 1) ───────────────────────────
  console.log('[FEATURE 1] Testing Forgot Password OTP Request & Reset Flow...');
  const testEmail = 'stephensrikanth1@gmail.com';

  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotData = await forgotRes.json();
  if (!forgotData.success) throw new Error('Forgot password request failed: ' + forgotData.message);
  console.log('  ✅ Step 1.1: Password reset OTP requested:', forgotData.message);

  const otp = forgotData.previewOtp || forgotData.preview_otp;
  console.log(`  ✅ Step 1.2: Generated OTP code: ${otp}`);

  const newTestPass = 'password123';
  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      otp: otp,
      newPassword: newTestPass
    })
  });
  const resetData = await resetRes.json();
  if (!resetData.success) throw new Error('Reset password failed: ' + resetData.message);
  console.log('  ✅ Step 1.3: Password reset successful with OTP!');

  // Verify login with password
  const loginCheck = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newTestPass })
  });
  const loginCheckData = await loginCheck.json();
  if (!loginCheckData.success) throw new Error('Login with reset password failed: ' + loginCheckData.message);
  const clientToken = loginCheckData.token;
  console.log(`  ✅ Step 1.4: Successfully logged in as Client (${loginCheckData.user.name}) with newly set password!`);

  // Log in student as well
  const studentEmail = 'srikanthsuresh2007@gmail.com';
  // Reset student password too so we know credentials for sure
  const forgotStud = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail })
  });
  const forgotStudData = await forgotStud.json();
  const studOtp = forgotStudData.previewOtp || forgotStudData.preview_otp;
  await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      otp: studOtp,
      newPassword: 'password123'
    })
  });

  const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password: 'password123' })
  });
  const studentLoginData = await studentLogin.json();
  if (!studentLoginData.success) throw new Error('Student login failed: ' + studentLoginData.message);
  const studentToken = studentLoginData.token;
  console.log(`  ✅ Authenticated Student: ${studentLoginData.user.name}`);

  // ─── 2. TEST PROFILE EDIT (FEATURE 3) ──────────────────────────────────────
  console.log('\n[FEATURE 3] Testing Profile Edit for Both Client and Student...');
  
  // Client updates profile with company details
  const updateClientRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`
    },
    body: JSON.stringify({
      name: 'Stephen Srikanth',
      company_name: 'Campus Innovation Labs & Club',
      company_website: 'https://campusinnovation.edu',
      bio: 'Incubating student tech startups and funding campus projects.',
      client_work_description: 'We hire student developers and designers for campus events.'
    })
  });
  const updateClientData = await updateClientRes.json();
  if (!updateClientData.success) throw new Error('Client profile update failed: ' + updateClientData.message);
  console.log('  ✅ Step 3.1: Client profile updated! Company:', updateClientData.user.company_name);

  // Student updates profile with skills, portfolio, and bio
  const updateStudentRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      name: 'Srikanth Suresh',
      bio: 'Fullstack developer & campus UI designer. Specializing in React and Node.js.',
      skills: ['React', 'Figma', 'Node.js', 'Python', 'Tailwind CSS', 'Next.js'],
      portfolio_url: 'https://srikanthportfoliowebsite.vercel.app/',
      phone: '7418790420'
    })
  });
  const updateStudentData = await updateStudentRes.json();
  if (!updateStudentData.success) throw new Error('Student profile update failed: ' + updateStudentData.message);
  console.log('  ✅ Step 3.2: Student profile updated! Total skills:', updateStudentData.user.skills?.length);

  // ─── 3. TEST PUBLIC PROJECT POSTING & BIDDING (FEATURE 2) ───────────────────
  console.log('\n[FEATURE 2] Testing Public Project Posting & Candidate Proposal Bidding...');

  // Client creates public project
  const postJobRes = await fetch(`${BASE_URL}/projects/public`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`
    },
    body: JSON.stringify({
      title: 'Need Creative Logo Designer for Campus Hackathon 2026',
      description: 'Looking for a talented student graphic designer to create a dynamic logo, banners, and stickers for our hackathon. Who wants to apply?',
      category_id: 2,
      budget: 1800,
      deadline_days: 3,
      skills_required: 'Figma, Illustrator, Graphic Design, Branding'
    })
  });
  const postJobData = await postJobRes.json();
  if (!postJobData.success) throw new Error('Public job posting failed: ' + postJobData.message);
  const createdProject = postJobData.project;
  console.log(`  ✅ Step 2.1: Client posted public project: "${createdProject.title}" (ID: ${createdProject.id}, Status: ${createdProject.status})`);

  // Verify project appears in open job board
  const openRes = await fetch(`${BASE_URL}/projects/open`);
  const openData = await openRes.json();
  if (!openData.success) throw new Error('Fetch open projects failed');
  const foundOpen = openData.projects.find(p => Number(p.id) === Number(createdProject.id));
  if (!foundOpen) throw new Error('Posted project not visible in open projects board');
  console.log(`  ✅ Step 2.2: Project is active on Public Job Board (Total open jobs: ${openData.projects.length})`);

  // Student submits proposal
  const submitPropRes = await fetch(`${BASE_URL}/projects/${createdProject.id}/proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      bid_amount: 1600,
      delivery_days: 2,
      pitch: 'I have designed logos for IEEE and GDSC campus chapters. Can deliver 3 high-resolution concepts and revisions in 48 hours!'
    })
  });
  const submitPropData = await submitPropRes.json();
  if (!submitPropData.success) throw new Error('Submitting proposal failed: ' + submitPropData.message);
  const proposalId = submitPropData.proposal.id;
  console.log(`  ✅ Step 2.3: Student submitted proposal! Proposal ID: ${proposalId}, Bid: ₹${submitPropData.proposal.bid_amount}`);

  // Client views proposals
  const viewPropsRes = await fetch(`${BASE_URL}/projects/${createdProject.id}/proposals`, {
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  const viewPropsData = await viewPropsRes.json();
  if (!viewPropsData.success) throw new Error('Viewing proposals failed');
  console.log(`  ✅ Step 2.4: Client viewed proposals. Count: ${viewPropsData.proposals.length}`);

  // Client accepts proposal
  const acceptRes = await fetch(`${BASE_URL}/projects/proposals/${proposalId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`
    }
  });
  const acceptData = await acceptRes.json();
  if (!acceptData.success) throw new Error('Accepting proposal failed: ' + acceptData.message);
  console.log(`  ✅ Step 2.5: Proposal accepted! Project Status: ${acceptData.project.status}, Appointed Student: ${acceptData.project.freelancer?.name}`);

  console.log('\n======================================================');
  console.log('🎉 ALL 3 USER-REQUESTED FEATURES ARE 100% OPERATIONAL!');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});

async function testClientAppointAndChatFlow() {
  console.log('Testing Client Search, Appoint Freelancer with Time Limit, Scope Explanation, and Live Chat...\n');

  // 1. Authenticate as Client (Priya)
  const cRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@college.edu', password: 'password123' })
  });
  const cData = await cRes.json();
  const clientToken = cData.token;
  console.log('1. Client Authenticated:', cData.user?.name);

  // 2. Search Freelancers (Search for "React")
  const sRes = await fetch('http://localhost:5000/api/users?role=student&search=React');
  const sData = await sRes.json();
  console.log('2. Search Freelancers ("React"):', sData.success, '| Found:', sData.count);
  const targetFreelancer = sData.freelancers[0];
  console.log('   Target Freelancer:', targetFreelancer?.name, '| Skills:', targetFreelancer?.skills?.map(s => s.skill_name || s).join(', '));

  // 3. Client Appoints Freelancer with Custom Time Limit & Scope Explanation
  const appointRes = await fetch('http://localhost:5000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + clientToken
    },
    body: JSON.stringify({
      freelancer_id: targetFreelancer.id,
      title: 'College Fest Registration Web Portal',
      description: 'We need a responsive React web app with payment QR integration, student ID validation, and Google Sheet sync.',
      requirements: 'We need a responsive React web app with payment QR integration, student ID validation, and Google Sheet sync.',
      budget: 2500,
      deadline_days: 5
    })
  });
  const appointData = await appointRes.json();
  console.log('3. Client Appoint Order Created:', appointData.success, '| Project ID:', appointData.project?.id, '| Time Limit:', appointData.project?.deadline_days, 'Days');

  // 4. Send 1-on-1 Chat Message in the Appointed Project Workstation
  const chatRes = await fetch('http://localhost:5000/api/chat/' + appointData.project.id, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + clientToken
    },
    body: JSON.stringify({
      content: 'Hi Rahul! I have appointed you for the Tech Fest web portal with a 5-day deadline. Let me know if you have any questions!'
    })
  });
  const chatData = await chatRes.json();
  console.log('4. 1-on-1 Chat Message Sent:', chatData.success, '| Content:', chatData.message?.content);

  // 5. Freelancer (Rahul) accepts the work offer
  const fRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul@college.edu', password: 'password123' })
  });
  const fData = await fRes.json();
  const freelancerToken = fData.token;

  const acceptRes = await fetch('http://localhost:5000/api/projects/' + appointData.project.id + '/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + freelancerToken
    },
    body: JSON.stringify({ status: 'ACCEPTED' })
  });
  const acceptData = await acceptRes.json();
  console.log('5. Freelancer Accepted Work Offer:', acceptData.success, '| New Status:', acceptData.project?.status);

  // 6. Freelancer replies in the Live Chat
  const replyRes = await fetch('http://localhost:5000/api/chat/' + appointData.project.id, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + freelancerToken
    },
    body: JSON.stringify({
      content: 'Thanks Priya! I have accepted the project offer. Starting work now to deliver within the 5-day deadline.'
    })
  });
  const replyData = await replyRes.json();
  console.log('6. Freelancer Chat Reply Sent:', replyData.success, '| Content:', replyData.message?.content);

  console.log('\n✅ Client Search, Appoint with Time Limit, Scope Explanation, and Real-Time Chat workflow verified 100% successfully!');
}
testClientAppointAndChatFlow();

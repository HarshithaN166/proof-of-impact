import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testCampaignImages() {
  console.log('--- Step 1: Login as Organization ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'org@greenfuture.org',
      password: 'DemoPass123!',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Logged in successfully.');

  console.log('--- Step 2: Create Health and Community Campaign ---');
  const healthRes = await fetch(`${BASE_URL}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Community Mobile Clinic & Vaccination Drive',
      description: 'Delivering primary medical consultations, basic health screenings, and free medicines to underserved rural districts.',
      category: 'Health and Community',
      unit: 'Patients Treated',
      targetQuantity: 500,
      locationLabel: 'Southern Rural Clinics',
      startDate: '2026-04-01',
      endDate: '2026-11-30',
      status: 'ACTIVE',
    }),
  });
  const healthData = await healthRes.json();
  console.log('Created Health Campaign:', healthData.campaign?.title, 'ID:', healthData.campaign?._id);

  console.log('--- Step 3: Create Clean Water Initiative Campaign ---');
  const waterRes = await fetch(`${BASE_URL}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Clean Water Initiative & Filtration Wells',
      description: 'Installing solar-powered reverse osmosis water filtration points to guarantee safe drinking water for 10 community villages.',
      category: 'Cleanliness',
      unit: 'Liters Purified',
      targetQuantity: 100000,
      locationLabel: 'Lake Basin Watershed',
      startDate: '2026-05-01',
      endDate: '2026-12-31',
      status: 'ACTIVE',
    }),
  });
  const waterData = await waterRes.json();
  console.log('Created Clean Water Campaign:', waterData.campaign?.title, 'ID:', waterData.campaign?._id);

  console.log('--- Step 4: Verify Public Listing ---');
  const publicRes = await fetch(`${BASE_URL}/campaigns`);
  const publicData = await publicRes.json();
  console.log('Total campaigns in DB now:', publicData.count);
  for (const c of publicData.campaigns) {
    console.log(`- [${c.category}] ${c.title} (Org: ${c.organizationName || c.organizationId?.organizationName})`);
  }
}

testCampaignImages().catch(console.error);


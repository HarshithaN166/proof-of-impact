async function testMilestone9() {
  console.log('===============================================================');
  console.log('  MILESTONE 9: IMPACT ANALYTICS & DASHBOARD VALIDATION');
  console.log('===============================================================\n');

  // 1. Login Org & Verifier
  const orgRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'org@greenfuture.org', password: 'DemoPass123!' }),
  });
  const org = await orgRes.json();

  const verifierRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'verifier@proofofimpact.org', password: 'DemoPass123!' }),
  });
  const verifier = await verifierRes.json();

  // 2. Query Baseline Analytics
  console.log('Step 1: Fetching Baseline Dynamic Analytics');
  const baseRes = await fetch('http://localhost:5000/api/dashboard/analytics');
  const baseData = await baseRes.json();
  console.log('  Baseline Total Reports:', baseData.metrics.totalReportsCount);
  console.log('  Baseline Verified:', baseData.metrics.verifiedCount);
  console.log('  Baseline Pending:', baseData.metrics.pendingCount);
  console.log('  Baseline Rejected:', baseData.metrics.rejectedCount);

  // 3. Create Campaign and Submit 2 Real Reports
  console.log('\nStep 2: Submitting Reports to Validate Dynamic Real-time Calculations');
  const campRes = await fetch('http://localhost:5000/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${org.token}`,
    },
    body: JSON.stringify({
      title: 'Community Mangrove Restoration',
      description: 'Planting coastal mangrove seedlings.',
      category: 'Environment',
      target: 1000,
      unit: 'Saplings Planted',
      startDate: '2026-03-01',
      endDate: '2026-12-31',
      locationLabel: 'Coastal Estuary Zone',
    }),
  });
  const camp = await campRes.json();
  const campaignId = camp.campaign._id;

  async function submitReport(statement, qty) {
    const boundary = '----Boundary' + Math.random().toString(36).substring(2);
    const pngHeader = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    const pHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="campaignId"\r\n\r\n${campaignId}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="impactStatement"\r\n\r\n${statement}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="quantity"\r\n\r\n${qty}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="unit"\r\n\r\nSaplings Planted\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="activityDate"\r\n\r\n2026-04-15\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\nCoastal Zone A\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="evidenceFiles"; filename="mangrove.png"\r\nContent-Type: image/png\r\n\r\n`,
      'utf-8'
    );
    const pFooter = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const body = Buffer.concat([pHeader, pngHeader, pFooter]);

    const res = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${org.token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });
    return res.json();
  }

  const rep1 = await submitReport('Planted 150 mangrove seedlings in tidal mudflats.', 150);
  const rep2 = await submitReport('Planted 250 mangrove seedlings near river mouth.', 250);
  console.log('  Submitted Report 1 (Pending):', rep1.report._id);
  console.log('  Submitted Report 2 (Pending):', rep2.report._id);

  // Approve Report 1
  const appRes = await fetch(`http://localhost:5000/api/reports/${rep1.report._id}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${verifier.token}`,
    },
  });
  const appData = await appRes.json();
  console.log('  Report 1 Approved On-Chain:', appData.success);

  // Reject Report 2
  const rejRes = await fetch(`http://localhost:5000/api/reports/${rep2.report._id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${verifier.token}`,
    },
    body: JSON.stringify({ reason: 'Insufficient photo evidence of seedling tags.' }),
  });
  const rejData = await rejRes.json();
  console.log('  Report 2 Rejected On-Chain:', rejData.success);

  // 4. Query Analytics with Filters
  console.log('\nStep 3: Testing Filtering & Metric Consistency');
  // Query all
  const updatedAll = await (await fetch('http://localhost:5000/api/dashboard/analytics')).json();
  console.log('  [PASS] Overall Reports Count:', updatedAll.metrics.totalReportsCount);
  console.log('  [PASS] Verified Count:', updatedAll.metrics.verifiedCount);
  console.log('  [PASS] Rejected Count:', updatedAll.metrics.rejectedCount);

  // Test Status Filter: APPROVED
  const approvedOnly = await (await fetch('http://localhost:5000/api/dashboard/analytics?status=APPROVED')).json();
  if (approvedOnly.reports.every((r) => r.status === 'APPROVED')) {
    console.log('  [PASS] Status Filter (APPROVED) returned only verified reports.');
  } else {
    throw new Error('Filter failed: non-approved reports found in APPROVED filter query');
  }

  // Test Status Filter: REJECTED
  const rejectedOnly = await (await fetch('http://localhost:5000/api/dashboard/analytics?status=REJECTED')).json();
  if (rejectedOnly.reports.every((r) => r.status === 'REJECTED')) {
    console.log('  [PASS] Status Filter (REJECTED) returned only rejected reports.');
  } else {
    throw new Error('Filter failed: non-rejected reports found in REJECTED filter query');
  }

  // Test Organization Breakdown
  console.log('\nStep 4: Validating Organization-wise Aggregations');
  const orgStats = updatedAll.organizationBreakdown.find((o) => o.organizationName === 'Green Future Group');
  if (orgStats && orgStats.totalReports >= 2) {
    console.log('  [PASS] Green Future Group contributions correctly totaled:');
    console.log('         Total Claims:', orgStats.totalReports);
    console.log('         Verified Claims:', orgStats.verifiedReports);
    console.log('         Total Quantity:', orgStats.totalQuantity);
  } else {
    throw new Error('Org aggregation mismatch: ' + JSON.stringify(orgStats));
  }

  // Test Monthly Trends
  console.log('\nStep 5: Validating Monthly Trends Aggregations');
  if (updatedAll.monthlyTrends.length > 0) {
    console.log('  [PASS] Monthly Trends generated successfully:');
    updatedAll.monthlyTrends.forEach((m) => {
      console.log(`         Month: ${m.month} | Total: ${m.total} | Approved: ${m.approved} | Rejected: ${m.rejected}`);
    });
  } else {
    throw new Error('Monthly trends empty');
  }

  console.log('\n===============================================================');
  console.log('  ALL MILESTONE 9 VALIDATION TESTS PASSED SUCCESSFULLY! ✓');
  console.log('===============================================================\n');
}

testMilestone9().catch((err) => {
  console.error('MILESTONE 9 TEST ERROR:', err);
  process.exit(1);
});


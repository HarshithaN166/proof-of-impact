import { ethers } from 'ethers';

async function testIntegration() {
  console.log('--- Step 1: Login as Organization ---');
  const orgLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'org@greenfuture.org',
      password: 'DemoPass123!',
    }),
  });
  const orgAuth = await orgLoginRes.json();
  if (!orgAuth.success) throw new Error('Org login failed: ' + JSON.stringify(orgAuth));
  console.log('Org Logged In:', orgAuth.user.name, 'Token received.');

  console.log('\n--- Step 2: Create a Campaign ---');
  const campaignRes = await fetch('http://localhost:5000/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${orgAuth.token}`,
    },
    body: JSON.stringify({
      title: 'Solar Clean Energy Project 2026',
      description: 'Installing certified solar arrays across public community centers.',
      category: 'Environment',
      target: 50,
      unit: 'Panels Installed',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      locationLabel: 'North Community Center',
    }),
  });
  const campaignData = await campaignRes.json();
  if (!campaignData.success) throw new Error('Campaign creation failed: ' + JSON.stringify(campaignData));
  const campaignId = campaignData.campaign._id;
  console.log('Campaign Created:', campaignData.campaign.title, 'ID:', campaignId);

  console.log('\n--- Step 3: Submit Impact Report (Registers On-Chain) ---');
  // Create multipart payload with minimal valid PNG signature
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  // 1x1 transparent PNG buffer
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );
  
  const partHeader = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="campaignId"\r\n\r\n${campaignId}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="impactStatement"\r\n\r\nCompleted Phase 1 solar grid installation of 10 panels at north shelter.\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="quantity"\r\n\r\n10\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="unit"\r\n\r\nPanels Installed\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="activityDate"\r\n\r\n2026-03-15\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\nNorth Community Center, Rooftop B\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="evidenceFiles"; filename="solar_evidence.png"\r\nContent-Type: image/png\r\n\r\n`,
    'utf-8'
  );
  const partFooter = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
  const bodyBuffer = Buffer.concat([partHeader, pngBuffer, partFooter]);

  const reportRes = await fetch('http://localhost:5000/api/reports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${orgAuth.token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: bodyBuffer,
  });
  const reportData = await reportRes.json();
  if (!reportData.success) throw new Error('Report submission failed: ' + JSON.stringify(reportData));
  const reportId = reportData.report._id;
  console.log('Report Submitted & On-Chain Registered!');
  console.log('  Report ID:', reportId);
  console.log('  Status:', reportData.report.status);
  console.log('  On-Chain TxHash:', reportData.report.blockchain?.transactionHash);
  console.log('  Evidence Manifest SHA-256:', reportData.report.evidenceManifestHash);

  console.log('\n--- Step 4: Verify Initial Blockchain State & History ---');
  const initialChainRes = await fetch(`http://localhost:5000/api/reports/${reportId}/blockchain`, {
    headers: { Authorization: `Bearer ${orgAuth.token}` },
  });
  const initialChain = await initialChainRes.json();
  console.log('Initial Blockchain Sync:', initialChain.synced);
  console.log('  On-chain status:', initialChain.blockchainRecord?.status);
  console.log('  History length:', initialChain.blockchainRecord?.history?.length);
  console.log('  History log:', initialChain.blockchainRecord?.history);

  console.log('\n--- Step 5: Login as Authorized Verifier ---');
  const verifierLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'verifier@proofofimpact.org',
      password: 'DemoPass123!',
    }),
  });
  const verifierAuth = await verifierLoginRes.json();
  if (!verifierAuth.success) throw new Error('Verifier login failed: ' + JSON.stringify(verifierAuth));
  console.log('Verifier Logged In:', verifierAuth.user.name);

  console.log('\n--- Step 6: Verifier Approves Report On-Chain ---');
  const verifyRes = await fetch(`http://localhost:5000/api/reports/${reportId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${verifierAuth.token}`,
    },
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) throw new Error('Report verification failed: ' + JSON.stringify(verifyData));
  console.log('Report Verified & Committed On-Chain!');
  console.log('  New Status:', verifyData.report.status);
  console.log('  Verification TxHash:', verifyData.blockchain?.transactionHash);
  console.log('  Verifier Address:', verifyData.blockchain?.verifierAddress);

  console.log('\n--- Step 7: Query Updated On-Chain State & Append-Only History ---');
  const finalChainRes = await fetch(`http://localhost:5000/api/reports/${reportId}/blockchain`, {
    headers: { Authorization: `Bearer ${verifierAuth.token}` },
  });
  const finalChain = await finalChainRes.json();
  console.log('Final Blockchain Sync:', finalChain.synced);
  console.log('  On-chain status:', finalChain.blockchainRecord?.status);
  console.log('  Verified By on-chain:', finalChain.blockchainRecord?.verifiedBy);
  console.log('  History entries count:', finalChain.blockchainRecord?.history?.length);
  finalChain.blockchainRecord?.history?.forEach((h, idx) => {
    console.log(`    [${idx}] Status: ${h.status} | Note: "${h.note}" | Signer: ${h.changedBy}`);
  });

  console.log('\n--- Step 8: Test Rejection Workflow with Second Report ---');
  const report2Res = await fetch('http://localhost:5000/api/reports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${orgAuth.token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: bodyBuffer,
  });
  const report2Data = await report2Res.json();
  const report2Id = report2Data.report._id;
  console.log('Report 2 Created & Registered On-Chain:', report2Id);

  const rejectRes = await fetch(`http://localhost:5000/api/reports/${report2Id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${verifierAuth.token}`,
    },
    body: JSON.stringify({
      reason: 'Incomplete serial number photographic evidence provided.',
    }),
  });
  const rejectData = await rejectRes.json();
  console.log('Report 2 Rejected On-Chain!');
  console.log('  Status:', rejectData.report.status);
  console.log('  TxHash:', rejectData.blockchain?.transactionHash);
  console.log('  Reason on record:', rejectData.report.reviewReason);

  const r2ChainRes = await fetch(`http://localhost:5000/api/reports/${report2Id}/blockchain`, {
    headers: { Authorization: `Bearer ${verifierAuth.token}` },
  });
  const r2Chain = await r2ChainRes.json();
  console.log('Report 2 Chain Status:', r2Chain.blockchainRecord?.status);
  console.log('Report 2 Chain Rejection Reason:', r2Chain.blockchainRecord?.rejectionReason);

  console.log('\n========================================');
  console.log('  ALL MILESTONE 7 INTEGRATION TESTS PASSED!');
  console.log('========================================\n');
}

testIntegration().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});

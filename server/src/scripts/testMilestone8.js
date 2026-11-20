import fs from 'fs';
import path from 'path';

async function runMilestone8SecuritySuite() {
  console.log('===============================================================');
  console.log('  MILESTONE 8: EVIDENCE INTEGRITY & SECURITY TEST SUITE');
  console.log('===============================================================\n');

  // Test Accounts Login
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

  // Create test campaign
  const campRes = await fetch('http://localhost:5000/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${org.token}`,
    },
    body: JSON.stringify({
      title: 'Water Well Restoration Project',
      description: 'Restoring borehole systems.',
      category: 'Cleanliness',
      target: 20,
      unit: 'Wells Built',
      startDate: '2026-02-01',
      endDate: '2026-12-31',
      locationLabel: 'Eastern District',
    }),
  });
  const camp = await campRes.json();
  const campaignId = camp.campaign._id;

  // Helper to submit report with file
  async function submitTestReport(statement, customContent = 'genuine-well-evidence-data') {
    const boundary = '----Boundary' + Math.random().toString(36).substring(2);
    const pngHeader = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    const fileBytes = Buffer.concat([pngHeader, Buffer.from(customContent)]);

    const pHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="campaignId"\r\n\r\n${campaignId}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="impactStatement"\r\n\r\n${statement}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="quantity"\r\n\r\n5\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="unit"\r\n\r\nWells Built\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="activityDate"\r\n\r\n2026-04-10\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\nWell Site #4\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="evidenceFiles"; filename="well_photo.png"\r\nContent-Type: image/png\r\n\r\n`,
      'utf-8'
    );
    const pFooter = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const body = Buffer.concat([pHeader, fileBytes, pFooter]);

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

  // -------------------------------------------------------------------------
  // TEST 1: Genuine Evidence Hash Validation (Expected: VALID)
  // -------------------------------------------------------------------------
  console.log('TEST 1: Genuine Evidence Integrity Verification');
  const genuineReportData = await submitTestReport('Restored and tested Well #4 with clean pump flow.');
  const report1Id = genuineReportData.report._id;

  const check1Res = await fetch(`http://localhost:5000/api/reports/${report1Id}/integrity`, {
    headers: { Authorization: `Bearer ${org.token}` },
  });
  const check1 = await check1Res.json();

  if (check1.overallIntegrity === 'VALID' && check1.manifest.matchesOnChain === true) {
    console.log('  [PASS] Genuine report evaluated as VALID. Manifest matches on-chain.');
  } else {
    throw new Error('TEST 1 FAILED: ' + JSON.stringify(check1));
  }

  // -------------------------------------------------------------------------
  // TEST 2: Evidence Tampering Detection (Expected: TAMPERED)
  // -------------------------------------------------------------------------
  console.log('\nTEST 2: Evidence Modification & Tamper Detection');
  const diskFile = path.resolve('server', genuineReportData.report.evidence[0].storageReference);
  // Modify the file on disk to simulate malicious alteration after upload
  const originalBytes = fs.readFileSync(diskFile);
  fs.appendFileSync(diskFile, '\nMALICIOUS_INJECTED_TAMPER_STRING');

  const check2Res = await fetch(`http://localhost:5000/api/reports/${report1Id}/integrity`, {
    headers: { Authorization: `Bearer ${org.token}` },
  });
  const check2 = await check2Res.json();

  // Restore the original file so disk state remains intact
  fs.writeFileSync(diskFile, originalBytes);

  if (check2.overallIntegrity === 'TAMPERED' && check2.files[0].status === 'TAMPERED') {
    console.log('  [PASS] Tampered file successfully flagged as TAMPERED.');
    console.log('         Expected Hash:', check2.files[0].expectedSha256);
    console.log('         Recalculated Hash:', check2.files[0].recalculatedSha256);
  } else {
    throw new Error('TEST 2 FAILED: Tamper was not detected! ' + JSON.stringify(check2));
  }

  // -------------------------------------------------------------------------
  // TEST 3: Unauthorized Verifier Access Block (Security Test)
  // -------------------------------------------------------------------------
  console.log('\nTEST 3: Unauthorized User Attempting Verification');
  const unauthVerifyRes = await fetch(`http://localhost:5000/api/reports/${report1Id}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${org.token}`, // Organization role, not Verifier
    },
  });
  if (unauthVerifyRes.status === 403) {
    console.log('  [PASS] Organization blocked from approving report (403 Forbidden).');
  } else {
    throw new Error('TEST 3 FAILED: Organization was allowed to verify! Status: ' + unauthVerifyRes.status);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Verifier Permission Check (Authorized Verifier Verification)
  // -------------------------------------------------------------------------
  console.log('\nTEST 4: Authorized Verifier Approving Report');
  const authVerifyRes = await fetch(`http://localhost:5000/api/reports/${report1Id}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${verifier.token}`,
    },
  });
  const authVerify = await authVerifyRes.json();
  if (authVerify.success && authVerify.report.status === 'APPROVED') {
    console.log('  [PASS] Authorized verifier approved report on-chain. Status: APPROVED.');
  } else {
    throw new Error('TEST 4 FAILED: ' + JSON.stringify(authVerify));
  }

  // -------------------------------------------------------------------------
  // TEST 5: Double-Verification / Illegal Status Change Rejection
  // -------------------------------------------------------------------------
  console.log('\nTEST 5: Prevent Double-Verification (State Transition Guard)');
  const doubleVerifyRes = await fetch(`http://localhost:5000/api/reports/${report1Id}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${verifier.token}`,
    },
  });
  if (doubleVerifyRes.status === 400) {
    console.log('  [PASS] Double review reverted: already reviewed report cannot be re-verified.');
  } else {
    throw new Error('TEST 5 FAILED: Expected 400 Bad Request on double verification.');
  }

  // -------------------------------------------------------------------------
  // TEST 6: Invalid Report ID Handling
  // -------------------------------------------------------------------------
  console.log('\nTEST 6: Invalid Report ID Request');
  const fakeId = '665000000000000000000099';
  const invalidRes = await fetch(`http://localhost:5000/api/reports/${fakeId}/integrity`, {
    headers: { Authorization: `Bearer ${org.token}` },
  });
  if (invalidRes.status === 404) {
    console.log('  [PASS] Non-existent report returned 404 Not Found.');
  } else {
    throw new Error('TEST 6 FAILED: Expected 404 on invalid ID.');
  }

  // -------------------------------------------------------------------------
  // TEST 7: Cross-Organization Integrity Inspection Protection
  // -------------------------------------------------------------------------
  console.log('\nTEST 7: Cross-Organization Access Control');
  // Register another org
  const org2Res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Unrelated Org Admin',
      email: 'hacker@unauthorized.org',
      password: 'DemoPass123!',
      organizationName: 'Unauthorized Org LLC',
    }),
  });
  const org2 = await org2Res.json();

  const crossInspectRes = await fetch(`http://localhost:5000/api/reports/${report1Id}/integrity`, {
    headers: { Authorization: `Bearer ${org2.token}` },
  });
  if (crossInspectRes.status === 403) {
    console.log('  [PASS] Cross-organization evidence inspection blocked (403 Forbidden).');
  } else {
    throw new Error('TEST 7 FAILED: Other org was able to inspect evidence! Status: ' + crossInspectRes.status);
  }

  console.log('\n===============================================================');
  console.log('  ALL 7 SECURITY & INTEGRITY TESTS PASSED SUCCESSFULLY! ✓');
  console.log('===============================================================\n');
}

runMilestone8SecuritySuite().catch((err) => {
  console.error('\nSECURITY SUITE FAILURE:', err.message);
  process.exit(1);
});

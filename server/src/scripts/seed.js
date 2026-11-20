import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';

export const seedDatabase = async () => {
  console.log('[Seed] Checking for initial demo accounts...');

  const passwordHash = await bcrypt.hash('DemoPass123!', 10);

  // 1. Admin Account
  const existingAdmin = await User.findOne({ email: 'admin@proofofimpact.org' });
  if (!existingAdmin) {
    await User.create({
      name: 'System Administrator',
      email: 'admin@proofofimpact.org',
      passwordHash,
      role: 'admin',
      organizationName: 'Proof of Impact Foundation',
      isActive: true,
    });
    console.log('[Seed] Created default Admin: admin@proofofimpact.org (password: DemoPass123!)');
  }

  // 2. Authorized Verifier Account (Requirement 4: created strictly by admin/seed)
  const existingVerifier = await User.findOne({ email: 'verifier@proofofimpact.org' });
  if (!existingVerifier) {
    await User.create({
      name: 'Dr. Evelyn Reed (Lead Auditor)',
      email: 'verifier@proofofimpact.org',
      passwordHash,
      role: 'verifier',
      organizationName: 'Independent Climate & Social Audit Council',
      isActive: true,
    });
    console.log('[Seed] Created Authorized Verifier: verifier@proofofimpact.org (password: DemoPass123!)');
  }

  // 3. Demo Organization Account
  const existingOrg = await User.findOne({ email: 'org@greenfuture.org' });
  if (!existingOrg) {
    await User.create({
      name: 'Sarah Jenkins',
      email: 'org@greenfuture.org',
      passwordHash,
      role: 'organization',
      organizationName: 'Green Future Group',
      isActive: true,
    });
    console.log('[Seed] Created Demo Organization: org@greenfuture.org (password: DemoPass123!)');
  }

  console.log('[Seed] Seed check completed successfully.');
};

// If run directly via `npm run seed`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDatabase();
      await seedDatabase();
      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]', err);
      process.exit(1);
    }
  })();
}


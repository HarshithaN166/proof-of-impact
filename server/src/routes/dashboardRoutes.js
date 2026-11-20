import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import {
  getOrganizationOverview,
  getVerifierOverview,
  getImpactAnalytics,
} from '../controllers/dashboardController.js';

const router = express.Router();

// Milestone 9: Public & Authorized Impact Analytics Endpoint
router.get('/analytics', getImpactAnalytics);

router.get(
  '/organization',
  requireAuth,
  requireRole('organization', 'admin'),
  getOrganizationOverview
);

router.get(
  '/verifier',
  requireAuth,
  requireRole('verifier', 'admin'),
  getVerifierOverview
);

export default router;


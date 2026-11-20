import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import {
  getPublicCampaigns,
  createCampaign,
  getMyCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController.js';

const router = express.Router();

// Public route for real MongoDB campaigns
router.get('/', getPublicCampaigns);

// Organization-restricted routes
router.post('/', requireAuth, requireRole('organization', 'admin'), createCampaign);
router.get('/mine', requireAuth, requireRole('organization', 'admin'), getMyCampaigns);
router.get('/:id', getCampaignById);
router.patch('/:id', requireAuth, requireRole('organization', 'admin'), updateCampaign);
router.delete('/:id', requireAuth, requireRole('organization', 'admin'), deleteCampaign);

export default router;


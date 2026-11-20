import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { uploadEvidence } from '../middleware/upload.js';
import {
  previewEvidenceOcr,
  submitReport,
  getMyReports,
  getReportById,
  verifyReport,
  rejectReport,
  getReportBlockchainDetails,
  validateReportEvidenceIntegrity,
} from '../controllers/reportController.js';

const router = express.Router();

// Preview OCR and file SHA-256 before final report submission
router.post(
  '/ocr-preview',
  requireAuth,
  requireRole('organization', 'admin'),
  uploadEvidence.single('evidenceFile'),
  previewEvidenceOcr
);

// Submit full report with uploaded evidence files (registers on-chain)
router.post(
  '/',
  requireAuth,
  requireRole('organization', 'admin'),
  uploadEvidence.array('evidenceFiles', 5),
  submitReport
);

// List all reports submitted by the logged-in organization
router.get('/mine', requireAuth, requireRole('organization', 'admin'), getMyReports);

// Get single report (with ownership check)
router.get('/:id', requireAuth, getReportById);

// Milestone 7: Get full on-chain status and history
router.get('/:id/blockchain', requireAuth, getReportBlockchainDetails);

// Milestone 8: Recalculate and validate evidence cryptographic integrity
router.get('/:id/integrity', requireAuth, validateReportEvidenceIntegrity);

// Milestone 7: Verifier decision actions
router.post('/:id/verify', requireAuth, requireRole('verifier', 'admin'), verifyReport);
router.post('/:id/reject', requireAuth, requireRole('verifier', 'admin'), rejectReport);

export default router;


import path from 'path';
import fs from 'fs';
import { ImpactReport } from '../models/ImpactReport.js';
import { Campaign } from '../models/Campaign.js';
import { AuditEvent } from '../models/AuditEvent.js';
import {
  calculateFileSha256,
  generateEvidenceManifestHash,
  performOcr,
} from '../services/evidenceService.js';
import {
  registerReportOnChain,
  verifyReportOnChain,
  rejectReportOnChain,
  getOnChainReportDetails,
} from '../services/blockchainService.js';

// Instant OCR & SHA-256 Extraction Preview
export const previewEvidenceOcr = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No evidence file uploaded.' });
    }

    const filePath = req.file.path;
    const sha256 = calculateFileSha256(filePath);
    const ocrText = await performOcr(filePath, req.file.mimetype);

    res.json({
      success: true,
      fileInfo: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        storageReference: `uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        sha256,
        ocrText,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Submit full impact report with evidence
export const submitReport = async (req, res, next) => {
  try {
    const {
      campaignId,
      impactStatement,
      quantity,
      unit,
      activityDate,
      location,
      methodology,
      correctedOcrText,
    } = req.body;

    // 1. Validate Campaign Ownership (Requirement 1 & 10)
    if (!campaignId) {
      return res.status(400).json({ success: false, error: 'Campaign ID is required.' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Referenced campaign was not found.' });
    }

    if (campaign.organizationId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You can only submit impact reports for your own organization’s campaigns.',
      });
    }

    // 2. Validate Required Fields
    if (!impactStatement || !impactStatement.trim()) {
      return res.status(400).json({ success: false, error: 'Impact statement / activity description is required.' });
    }

    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity <= 0) {
      return res.status(400).json({ success: false, error: 'Impact quantity must be a positive number.' });
    }

    if (!activityDate) {
      return res.status(400).json({ success: false, error: 'Activity date is required.' });
    }

    // 3. Process Uploaded Files & Calculate SHA-256 (Requirement 3, 4, 5)
    const files = req.files || [];
    const evidenceItems = [];
    const fileHashes = [];
    let aggregatedOcr = correctedOcrText ? correctedOcrText.trim() : '';

    for (const file of files) {
      const sha256 = calculateFileSha256(file.path);
      fileHashes.push(sha256);

      // Perform OCR if not already supplied
      let fileOcr = '';
      if (!correctedOcrText) {
        fileOcr = await performOcr(file.path, file.mimetype);
        if (fileOcr) {
          aggregatedOcr += (aggregatedOcr ? '\n\n' : '') + fileOcr;
        }
      }

      evidenceItems.push({
        fileName: file.filename,
        originalName: file.originalname,
        storageReference: `uploads/${file.filename}`,
        sha256,
        mimeType: file.mimetype,
        fileSize: file.size,
        ocrText: fileOcr,
      });
    }

    // Generate Deterministic Evidence Manifest Hash
    const evidenceManifestHash = fileHashes.length > 0
      ? generateEvidenceManifestHash(fileHashes, campaignId)
      : null;

    // 4. Duplicate Check (Section 5.7 of spec)
    let duplicateWarning = null;
    if (fileHashes.length > 0) {
      const existingDuplicate = await ImpactReport.findOne({
        campaignId,
        organizationId: req.user._id,
        activityDate: new Date(activityDate),
        'evidence.sha256': { $in: fileHashes },
      });

      if (existingDuplicate) {
        duplicateWarning = 'Notice: A report with identical activity date and evidence file already exists for this campaign.';
      }
    }

    // 5. Create Impact Report (Status: PENDING)
    let report = await ImpactReport.create({
      campaignId,
      organizationId: req.user._id,
      impactStatement: impactStatement.trim(),
      quantity: numericQuantity,
      unit: unit ? unit.trim() : campaign.unit,
      activityDate: new Date(activityDate),
      location: location ? location.trim() : campaign.locationLabel,
      methodology: methodology ? methodology.trim() : '',
      evidence: evidenceItems,
      evidenceManifestHash,
      ocrText: aggregatedOcr,
      status: 'PENDING',
    });

    // 6. Milestone 7: On-Chain Registration with ProofOfImpact.sol
    let blockchainResult = null;
    let blockchainError = null;
    try {
      blockchainResult = await registerReportOnChain(report._id, evidenceManifestHash);
      if (blockchainResult) {
        report.blockchain = {
          transactionHash: blockchainResult.transactionHash,
          contractAddress: blockchainResult.contractAddress,
          onChainReportId: blockchainResult.onChainReportId,
          verifiedAt: null,
          verifierAddress: null,
        };
        await report.save();
      }
    } catch (bcErr) {
      console.error('[Blockchain] Report on-chain registration failed:', bcErr.message);
      blockchainError = bcErr.message;
    }

    // 7. Audit Trail Event
    await AuditEvent.create({
      actorUserId: req.user._id,
      action: 'IMPACT_SUBMITTED',
      targetType: 'ImpactReport',
      targetId: report._id.toString(),
      metadata: {
        campaignTitle: campaign.title,
        quantity: numericQuantity,
        unit: report.unit,
        evidenceCount: evidenceItems.length,
        manifestHash: evidenceManifestHash,
        blockchainTx: blockchainResult?.transactionHash || null,
        blockchainError,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Impact report submitted and recorded on blockchain.',
      report,
      blockchain: blockchainResult,
      duplicateWarning,
      blockchainError,
    });
  } catch (err) {
    next(err);
  }
};

// Get all reports submitted by the logged-in organization (Requirement 11)
export const getMyReports = async (req, res, next) => {
  try {
    const reports = await ImpactReport.find({ organizationId: req.user._id })
      .populate('campaignId', 'title category unit status locationLabel')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    next(err);
  }
};

// Get single report details (with strict access control)
export const getReportById = async (req, res, next) => {
  try {
    const report = await ImpactReport.findById(req.params.id)
      .populate('campaignId', 'title category unit status locationLabel')
      .populate('organizationId', 'name organizationName email');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Impact report not found.' });
    }

    // Requirement 11: Organizations can only inspect their own reports
    if (req.user.role === 'organization' && report.organizationId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to view another organization’s report.',
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (err) {
    next(err);
  }
};

// Milestone 7: Verify Report by Authorized Verifier
export const verifyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await ImpactReport.findById(id).populate('campaignId');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Impact report not found.' });
    }

    if (report.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Report cannot be verified because it is currently ${report.status}. Only PENDING reports can be verified.`,
      });
    }

    // 1. On-Chain Verification
    let blockchainResult = null;
    let blockchainError = null;
    try {
      blockchainResult = await verifyReportOnChain(report._id);
    } catch (bcErr) {
      console.error('[Blockchain] Verification on-chain call failed:', bcErr.message);
      blockchainError = bcErr.message;
      return res.status(502).json({
        success: false,
        error: `Blockchain verification transaction failed: ${bcErr.message}`,
      });
    }

    // 2. Update Database Record
    report.status = 'APPROVED';
    report.reviewReason = 'Verified and approved by authorized verifier on blockchain.';
    if (blockchainResult) {
      report.blockchain = {
        ...report.blockchain,
        transactionHash: blockchainResult.transactionHash,
        verifiedAt: blockchainResult.verifiedAt,
        verifierAddress: blockchainResult.verifierAddress,
      };
    }
    await report.save();

    // 3. Update Campaign Progress
    if (report.campaignId) {
      const campaign = await Campaign.findById(report.campaignId._id);
      if (campaign) {
        campaign.currentProgress = (campaign.currentProgress || 0) + report.quantity;
        if (campaign.currentProgress >= campaign.target) {
          campaign.status = 'Completed';
        }
        await campaign.save();
      }
    }

    // 4. Audit Log
    await AuditEvent.create({
      actorUserId: req.user._id,
      action: 'IMPACT_VERIFIED',
      targetType: 'ImpactReport',
      targetId: report._id.toString(),
      metadata: {
        campaignTitle: report.campaignId?.title,
        verifiedBy: req.user.email,
        blockchainTx: blockchainResult?.transactionHash,
      },
    });

    res.json({
      success: true,
      message: 'Impact report verified and committed on-chain successfully.',
      report,
      blockchain: blockchainResult,
    });
  } catch (err) {
    next(err);
  }
};

// Milestone 7: Reject Report by Authorized Verifier
export const rejectReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required.' });
    }

    const report = await ImpactReport.findById(id).populate('campaignId');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Impact report not found.' });
    }

    if (report.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Report cannot be rejected because it is currently ${report.status}. Only PENDING reports can be rejected.`,
      });
    }

    // 1. On-Chain Rejection
    let blockchainResult = null;
    try {
      blockchainResult = await rejectReportOnChain(report._id, reason.trim());
    } catch (bcErr) {
      console.error('[Blockchain] Rejection on-chain call failed:', bcErr.message);
      return res.status(502).json({
        success: false,
        error: `Blockchain rejection transaction failed: ${bcErr.message}`,
      });
    }

    // 2. Update Database Record
    report.status = 'REJECTED';
    report.reviewReason = reason.trim();
    if (blockchainResult) {
      report.blockchain = {
        ...report.blockchain,
        transactionHash: blockchainResult.transactionHash,
        verifiedAt: blockchainResult.verifiedAt,
        verifierAddress: blockchainResult.verifierAddress,
      };
    }
    await report.save();

    // 3. Audit Log
    await AuditEvent.create({
      actorUserId: req.user._id,
      action: 'IMPACT_REJECTED',
      targetType: 'ImpactReport',
      targetId: report._id.toString(),
      metadata: {
        campaignTitle: report.campaignId?.title,
        rejectedBy: req.user.email,
        reason: reason.trim(),
        blockchainTx: blockchainResult?.transactionHash,
      },
    });

    res.json({
      success: true,
      message: 'Impact report rejected and recorded on-chain.',
      report,
      blockchain: blockchainResult,
    });
  } catch (err) {
    next(err);
  }
};

// Milestone 7: Get Complete Blockchain State & History for a Report
export const getReportBlockchainDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await ImpactReport.findById(id);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Impact report not found.' });
    }

    const onChainDetails = await getOnChainReportDetails(report._id);

    res.json({
      success: true,
      reportId: report._id,
      mongoStatus: report.status,
      blockchainRecord: onChainDetails,
      synced: onChainDetails.exists ? onChainDetails.status === report.status : false,
    });
  } catch (err) {
    next(err);
  }
};

// Milestone 8: Recalculate Evidence Hashes & Validate Integrity against Blockchain
export const validateReportEvidenceIntegrity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await ImpactReport.findById(id).populate('campaignId');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Impact report not found.' });
    }

    // Access control: organizations can only inspect their own reports
    if (req.user.role === 'organization' && report.organizationId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You cannot inspect integrity of another organization’s evidence.',
      });
    }

    // 1. Recalculate SHA-256 for each disk file
    const recalculatedFiles = [];
    const freshHashes = [];
    let allFilesPresent = true;
    let anyFileTampered = false;

    for (const item of report.evidence || []) {
      const fullPath = path.resolve(item.storageReference);
      let currentSha256 = null;
      let fileExists = fs.existsSync(fullPath);
      let isMatch = false;

      if (fileExists) {
        currentSha256 = calculateFileSha256(fullPath);
        isMatch = (currentSha256.toLowerCase() === item.sha256.toLowerCase());
        freshHashes.push(currentSha256);
      } else {
        allFilesPresent = false;
      }

      if (!isMatch) {
        anyFileTampered = true;
      }

      recalculatedFiles.push({
        fileName: item.fileName,
        originalName: item.originalName,
        expectedSha256: item.sha256,
        recalculatedSha256: currentSha256,
        fileExists,
        status: isMatch ? 'VALID' : 'TAMPERED',
      });
    }

    // 2. Deterministic Manifest Hash Recalculation
    const recalculatedManifestHash = freshHashes.length > 0
      ? generateEvidenceManifestHash(freshHashes, report.campaignId?._id?.toString() || '')
      : null;

    const dbManifestMatch = (recalculatedManifestHash && report.evidenceManifestHash)
      ? recalculatedManifestHash.toLowerCase() === report.evidenceManifestHash.toLowerCase()
      : false;

    // 3. Query On-Chain Manifest Hash from ProofOfImpact.sol
    let onChainDetails = null;
    let onChainManifestMatch = false;
    let onChainError = null;

    try {
      onChainDetails = await getOnChainReportDetails(report._id);
      if (onChainDetails.exists && onChainDetails.evidenceManifestHash) {
        const cleanChainHash = onChainDetails.evidenceManifestHash.replace(/^0x/, '').toLowerCase();
        const cleanRecalcHash = (recalculatedManifestHash || '').replace(/^0x/, '').toLowerCase();
        onChainManifestMatch = (cleanChainHash === cleanRecalcHash);
      }
    } catch (bcErr) {
      onChainError = bcErr.message;
    }

    const overallIntegrity = (!anyFileTampered && allFilesPresent && onChainManifestMatch)
      ? 'VALID'
      : 'TAMPERED';

    res.json({
      success: true,
      reportId: report._id,
      overallIntegrity,
      allFilesPresent,
      filesCount: recalculatedFiles.length,
      files: recalculatedFiles,
      manifest: {
        databaseManifestHash: report.evidenceManifestHash,
        recalculatedManifestHash,
        matchesDatabase: dbManifestMatch,
        onChainManifestHash: onChainDetails?.evidenceManifestHash || null,
        matchesOnChain: onChainManifestMatch,
      },
      blockchain: {
        contractAddress: onChainDetails?.contractAddress,
        reportIdHash: onChainDetails?.reportIdHash,
        onChainStatus: onChainDetails?.status,
        transactionHash: report.blockchain?.transactionHash,
        verifiedBy: onChainDetails?.verifiedBy,
        submittedBy: onChainDetails?.submittedBy,
        synced: onChainDetails ? onChainDetails.status === report.status : false,
        historyCount: onChainDetails?.history?.length || 0,
      },
      onChainError,
    });
  } catch (err) {
    next(err);
  }
};



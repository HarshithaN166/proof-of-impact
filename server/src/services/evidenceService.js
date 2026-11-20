import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

/**
 * Calculate SHA-256 hash of a file stored on disk
 */
export const calculateFileSha256 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

/**
 * Generate a deterministic Evidence Manifest SHA-256 Hash
 * Sorts all file hashes alphabetically to ensure reproducibility
 */
export const generateEvidenceManifestHash = (fileHashes = [], campaignId = '') => {
  const sorted = [...fileHashes].sort();
  const manifestData = sorted.join(':') + (campaignId ? `|${campaignId}` : '');
  return crypto.createHash('sha256').update(manifestData).digest('hex');
};

/**
 * Perform OCR on uploaded images to extract readable text
 * Safe error handling: never fails the upload if OCR cannot parse image
 */
export const performOcr = async (filePath, mimeType) => {
  // Support image OCR (JPG, PNG, WebP)
  if (!mimeType || (!mimeType.includes('image') && !mimeType.includes('pdf'))) {
    return '';
  }

  try {
    const { data } = await Tesseract.recognize(filePath, 'eng', {
      errorHandler: (e) => console.warn('[OCR Worker]', e),
    });
    return data.text ? data.text.trim() : '';
  } catch (err) {
    console.warn(`[OCR Notice] Could not extract text from ${path.basename(filePath)}: ${err.message}`);
    return '';
  }
};


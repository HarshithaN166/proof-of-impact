import React, { useState } from 'react';
import {
  X,
  FileUp,
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
  Tag,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  Sparkles,
  Eye,
  Trash2,
  ScanText,
} from 'lucide-react';
import { api } from '../services/api';

export default function SubmitReportModal({
  isOpen,
  onClose,
  onSuccess,
  campaigns = [],
  preselectedCampaignId = '',
}) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    preselectedCampaignId || (campaigns[0]?._id || '')
  );
  const [impactStatement, setImpactStatement] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [location, setLocation] = useState('');
  const [methodology, setMethodology] = useState('');

  // Files & OCR state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);

  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedHash, setCopiedHash] = useState('');

  // Update unit & location when selected campaign changes
  const handleCampaignChange = (campaignId) => {
    setSelectedCampaignId(campaignId);
    const camp = campaigns.find((c) => c._id === campaignId);
    if (camp) {
      setUnit(camp.unit || '');
      setLocation(camp.locationLabel || '');
    }
  };

  // Sync unit when modal opens
  React.useEffect(() => {
    if (isOpen && campaigns.length > 0) {
      const initialId = preselectedCampaignId || campaigns[0]._id;
      handleCampaignChange(initialId);
    }
    setError('');
    setDuplicateWarning('');
  }, [isOpen, preselectedCampaignId, campaigns]);

  if (!isOpen) return null;

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 5) {
      setError('You can upload a maximum of 5 evidence documents per report.');
      return;
    }

    const newFiles = [...selectedFiles];
    const newPreviews = [...filePreviews];

    for (const file of files) {
      // Validate file type
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowed.includes(file.type.toLowerCase())) {
        setError(`File ${file.name} is not supported. Only JPG, PNG, and PDF files are allowed.`);
        return;
      }

      // Validate 10MB size limit
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} exceeds the 10 MB size limit.`);
        return;
      }

      newFiles.push(file);

      // Create preview object
      const isImg = file.type.startsWith('image/');
      newPreviews.push({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        isImg,
        previewUrl: isImg ? URL.createObjectURL(file) : null,
        sha256: null,
      });
    }

    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
    setError('');
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    const updatedPreviews = [...filePreviews];

    if (updatedPreviews[index]?.previewUrl) {
      URL.revokeObjectURL(updatedPreviews[index].previewUrl);
    }

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  // OCR & SHA-256 Scan Trigger
  const handleRunOcr = async (fileIndex) => {
    const file = selectedFiles[fileIndex];
    if (!file) return;

    try {
      setOcrRunning(true);
      setError('');
      const data = await api.previewOcr(file);

      // Update preview with real server-computed SHA-256
      const updatedPreviews = [...filePreviews];
      updatedPreviews[fileIndex].sha256 = data.fileInfo.sha256;
      setFilePreviews(updatedPreviews);

      if (data.fileInfo.ocrText) {
        setOcrText((prev) => (prev ? prev + '\n\n' : '') + data.fileInfo.ocrText);
      }
      setOcrCompleted(true);
    } catch (err) {
      setError(err.message || 'OCR extraction failed on this file.');
    } finally {
      setOcrRunning(false);
    }
  };

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDuplicateWarning('');

    if (!selectedCampaignId) {
      setError('Please select an active campaign.');
      return;
    }
    if (!impactStatement.trim()) {
      setError('Please enter an impact statement describing the activity.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Please enter a positive numeric quantity.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please upload at least one evidence photograph or document (JPG, PNG, or PDF).');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('campaignId', selectedCampaignId);
      formData.append('impactStatement', impactStatement.trim());
      formData.append('quantity', quantity);
      formData.append('unit', unit.trim());
      formData.append('activityDate', activityDate);
      formData.append('location', location.trim());
      formData.append('methodology', methodology.trim());
      formData.append('correctedOcrText', ocrText.trim());

      selectedFiles.forEach((file) => {
        formData.append('evidenceFiles', file);
      });

      const res = await api.submitReport(formData);

      if (res.duplicateWarning) {
        setDuplicateWarning(res.duplicateWarning);
      }

      onSuccess(res.report, res.duplicateWarning);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit impact report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Submit Impact Report & Evidence
              </h3>
              <p className="text-xs text-slate-500">
                Upload verifiable activity logs, documents, and compute SHA-256 fingerprints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Campaign Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Select Campaign <span className="text-rose-500">*</span>
            </label>
            {campaigns.length === 0 ? (
              <p className="text-xs text-amber-600 font-semibold bg-amber-50 p-3 rounded-xl border border-amber-200">
                No active campaigns found. Please create a campaign first before submitting impact reports.
              </p>
            ) : (
              <select
                value={selectedCampaignId}
                onChange={(e) => handleCampaignChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              >
                {campaigns.map((camp) => (
                  <option key={camp._id} value={camp._id}>
                    {camp.title} ({camp.category}) &bull; Target: {camp.targetQuantity?.toLocaleString()} {camp.unit}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Impact Statement */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Impact Statement / Activity Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={impactStatement}
              onChange={(e) => setImpactStatement(e.target.value)}
              placeholder="e.g. Conducted sapling plantation drive planting 100 indigenous neem saplings in Zone 3."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all resize-none"
            />
          </div>

          {/* Quantity, Unit & Activity Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. saplings"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Activity Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>
          </div>

          {/* Location and Methodology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Activity Location / Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Community Forest Sector 4"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Counting Methodology
              </label>
              <input
                type="text"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                placeholder="e.g. Physical tally sheet signed by coordinator"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>
          </div>

          {/* Evidence Upload Zone (Requirements 3, 4, 5) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Upload Evidence Files (Photos, PDF Documents) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Max 5 files &bull; 10 MB each</span>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-[#176B45]/40 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <input
                type="file"
                id="evidence-file-input"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelection}
                className="hidden"
              />
              <label
                htmlFor="evidence-file-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#176B45]">Click to choose evidence files</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, and PDF</p>
                </div>
              </label>
            </div>

            {/* Selected Files Preview & OCR Extraction */}
            {filePreviews.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Uploaded File Previews ({filePreviews.length}/5):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filePreviews.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {f.isImg ? (
                            <img
                              src={f.previewUrl}
                              alt={f.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#3B82B6] flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                            <span className="text-[10px] text-slate-400">{f.size}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Run OCR & Hash button */}
                      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                        {f.sha256 ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded max-w-full truncate">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{f.sha256.slice(0, 16)}...</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRunOcr(idx)}
                            disabled={ocrRunning}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3B82B6] hover:underline cursor-pointer"
                          >
                            <ScanText className="w-3.5 h-3.5" />
                            <span>Scan OCR & SHA-256</span>
                          </button>
                        )}

                        {f.sha256 && (
                          <button
                            type="button"
                            onClick={() => handleCopyHash(f.sha256)}
                            title="Copy SHA-256"
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedHash === f.sha256 ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OCR Review & Correction Box (Requirements 6 & 7) */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanText className="w-4 h-4 text-[#3B82B6]" />
                <span className="text-xs font-bold text-slate-900">
                  OCR Text Extraction Review
                </span>
                {ocrRunning && (
                  <span className="text-[10px] text-[#3B82B6] font-semibold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Extracting...
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Auditor Aid Only
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Review and correct readable text extracted from your evidence files below. <em>Notice: OCR is provided as a reviewer aid and does not constitute independent proof.</em>
            </p>

            <textarea
              rows={3}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="Click 'Scan OCR & SHA-256' above or type/correct recognized text here (e.g. certificates, numbers, receipts, banners)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || campaigns.length === 0}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-md shadow-[#176B45]/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Hashing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


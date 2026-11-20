import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  FileCode,
  Layers,
  Clock,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  FileText,
  ScanText,
  MapPin,
  Calendar,
  TrendingUp,
  Link,
  History,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportDetailsModal({ report, isOpen, onClose }) {
  const [copiedHash, setCopiedHash] = useState('');
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [loadingChain, setLoadingChain] = useState(false);
  const [chainError, setChainError] = useState('');

  // Milestone 8: Evidence Integrity Verification State
  const [integrityData, setIntegrityData] = useState(null);
  const [validatingIntegrity, setValidatingIntegrity] = useState(false);
  const [integrityError, setIntegrityError] = useState('');

  useEffect(() => {
    if (isOpen && report?._id) {
      loadBlockchainDetails();
      runIntegrityCheck();
    }
  }, [isOpen, report?._id]);

  const loadBlockchainDetails = async () => {
    try {
      setLoadingChain(true);
      setChainError('');
      const data = await api.getReportBlockchainDetails(report._id);
      setBlockchainInfo(data);
    } catch (err) {
      setChainError(err.message || 'Could not fetch blockchain state');
    } finally {
      setLoadingChain(false);
    }
  };

  const runIntegrityCheck = async () => {
    try {
      setValidatingIntegrity(true);
      setIntegrityError('');
      const data = await api.validateEvidenceIntegrity(report._id);
      setIntegrityData(data);
    } catch (err) {
      setIntegrityError(err.message || 'Integrity check failed');
    } finally {
      setValidatingIntegrity(false);
    }
  };

  if (!isOpen || !report) return null;

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const formattedDate = report.activityDate
    ? new Date(report.activityDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Impact Report & Evidence Record
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    report.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : report.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {report.status === 'PENDING' ? 'Pending Review' : report.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Campaign: <strong>{report.campaignId?.title || 'Impact Initiative'}</strong>
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

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-800">
          {/* Claim Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Impact Statement
            </span>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {report.impactStatement}
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#176B45]" />
                Reported Quantity
              </span>
              <p className="text-base font-extrabold text-slate-900">
                {report.quantity?.toLocaleString()} {report.unit}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#3B82B6]" />
                Activity Date
              </span>
              <p className="text-xs font-bold text-slate-800">{formattedDate}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                Location
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">
                {report.location || report.campaignId?.locationLabel || 'Recorded in proof'}
              </p>
            </div>
          </div>

          {/* Evidence Manifest SHA-256 Digest (Requirement 5) */}
          {report.evidenceManifestHash && (
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#3B82B6]" />
                  Deterministic Evidence Manifest SHA-256:
                </span>
                <button
                  onClick={() => handleCopy(report.evidenceManifestHash)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedHash === report.evidenceManifestHash ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="font-mono text-[11px] text-emerald-400 break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {report.evidenceManifestHash}
              </p>
              <p className="text-[10px] text-slate-400">
                Aggregated cryptographic hash over sorted file hashes. This is the exact digest that commits to the smart contract upon verification.
              </p>
            </div>
          )}

          {/* =========================================================================
              Milestone 7: Live Blockchain State & Status History
             ========================================================================= */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  On-Chain Smart Contract Record
                </h4>
              </div>
              <button
                onClick={loadBlockchainDetails}
                disabled={loadingChain}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingChain ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            {loadingChain ? (
              <div className="text-xs text-slate-400 flex items-center gap-2 py-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Querying local Ethereum Hardhat node...</span>
              </div>
            ) : chainError ? (
              <p className="text-xs text-amber-400">{chainError}</p>
            ) : blockchainInfo?.blockchainRecord?.exists ? (
              <div className="space-y-3 text-xs">
                {/* Status sync row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">On-Chain Status</span>
                    <p className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                      {blockchainInfo.blockchainRecord.status}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Database vs Chain Sync</span>
                    <p className="font-bold text-sm text-slate-200 mt-0.5 flex items-center gap-1">
                      {blockchainInfo.synced ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">100% Synchronized</span>
                        </>
                      ) : (
                        <span className="text-amber-400">Pending Sync</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Transaction Hash */}
                {report.blockchain?.transactionHash && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Blockchain Transaction Hash (TxHash):</span>
                      <button
                        onClick={() => handleCopy(report.blockchain.transactionHash)}
                        className="hover:text-white flex items-center gap-1"
                      >
                        {copiedHash === report.blockchain.transactionHash ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-[#3B82B6] break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      {report.blockchain.transactionHash}
                    </p>
                  </div>
                )}

                {/* Submitter & Verifier addresses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Registered By:</span>
                    <p className="font-mono text-slate-300 truncate mt-0.5">
                      {blockchainInfo.blockchainRecord.submittedBy}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Auditor / Verifier:</span>
                    <p className="font-mono text-slate-300 truncate mt-0.5">
                      {blockchainInfo.blockchainRecord.verifiedBy === '0x0000000000000000000000000000000000000000'
                        ? 'Pending Auditor Decision'
                        : blockchainInfo.blockchainRecord.verifiedBy}
                    </p>
                  </div>
                </div>

                {/* Complete Append-Only Status History (Requirement 7) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#3B82B6]" />
                    Append-Only Status History Log:
                  </span>
                  <div className="space-y-1.5">
                    {blockchainInfo.blockchainRecord.history?.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span
                            className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md ${
                              step.status === 'APPROVED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : step.status === 'REJECTED'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {step.status}
                          </span>
                          <p className="text-[11px] text-slate-300 mt-1">{step.note}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Report registration not yet confirmed on blockchain.
              </p>
            )}
          </div>

          {/* Uploaded Evidence Files List (Requirement 4 & 5) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Attached Evidence Documents ({report.evidence?.length || 0}):
            </h4>

            {(!report.evidence || report.evidence.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No files attached to this report.</p>
            ) : (
              <div className="space-y-2">
                {report.evidence.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#176B45] shrink-0" />
                        <span className="font-bold text-slate-800 truncate">
                          {f.originalName || f.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({(f.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>

                      <a
                        href={`http://localhost:5000/${f.storageReference}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-[#176B45] hover:underline flex items-center gap-1"
                      >
                        <span>View File</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* SHA-256 Digest */}
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80 font-mono text-[11px]">
                      <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">SHA-256:</span>
                      <span className="truncate mx-2 text-slate-700">{f.sha256}</span>
                      <button
                        onClick={() => handleCopy(f.sha256)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                      >
                        {copiedHash === f.sha256 ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OCR Extracted Text Review (Requirement 6 & 7) */}
          {report.ocrText && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <ScanText className="w-4 h-4 text-[#3B82B6]" />
                <span>Extracted Text Content (OCR Audit Record)</span>
              </div>
              <p className="font-mono text-xs text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200/80 max-h-32 overflow-y-auto">
                {report.ocrText}
              </p>
            </div>
          )}

          {/* =========================================================================
              Milestone 8: Evidence Cryptographic Integrity Verification Panel
             ========================================================================= */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#176B45]" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Evidence Integrity & Tamper Detection
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Recalculates file SHA-256 digests and validates against smart contract
                  </p>
                </div>
              </div>

              <button
                onClick={runIntegrityCheck}
                disabled={validatingIntegrity}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${validatingIntegrity ? 'animate-spin' : ''}`} />
                <span>Re-Verify</span>
              </button>
            </div>

            {validatingIntegrity ? (
              <div className="text-xs text-slate-500 flex items-center gap-2 py-3">
                <RefreshCw className="w-4 h-4 animate-spin text-[#176B45]" />
                <span>Computing live SHA-256 hashes and comparing with blockchain...</span>
              </div>
            ) : integrityError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{integrityError}</span>
              </div>
            ) : integrityData ? (
              <div className="space-y-3 text-xs">
                {/* Result Pill */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Audit Finding</span>
                    <p className="text-xs text-slate-600">Cryptographic authenticity status across storage & ledger</p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 ${
                      integrityData.overallIntegrity === 'VALID'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {integrityData.overallIntegrity === 'VALID' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>VALID (AUTHENTIC)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>TAMPERED (MISMATCH DETECTED)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Per file breakdown */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    File-by-File Hash Comparison:
                  </span>
                  {integrityData.files?.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-bold text-slate-800">{f.originalName}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            f.status === 'VALID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-0.5">
                        <p className="truncate">Expected: {f.expectedSha256}</p>
                        <p className="truncate">Recalculated: {f.recalculatedSha256 || 'MISSING FILE'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manifest comparison */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between font-sans">
                    <span className="font-bold text-slate-700 text-xs">On-Chain Manifest Consensus:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        integrityData.manifest?.matchesOnChain
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {integrityData.manifest?.matchesOnChain ? 'Consensus Verified' : 'Consensus Mismatch'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    Recalculated: {integrityData.manifest?.recalculatedManifestHash}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    On-Chain: {integrityData.manifest?.onChainManifestHash}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end bg-slate-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}


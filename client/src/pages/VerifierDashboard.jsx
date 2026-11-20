import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  UserCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Inbox,
  Lock,
  ExternalLink,
  Layers,
  FileText,
  Check,
  X,
  History,
  RefreshCw,
  Copy,
} from 'lucide-react';
import ReportDetailsModal from '../components/ReportDetailsModal';

export default function VerifierDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState({
    pendingCount: 0,
    reviewedCount: 0,
    pendingReports: [],
    reviewedReports: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReportToReject, setSelectedReportToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Details modal
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.getVerifierOverview();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load verifier audit records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (reportId) => {
    try {
      setActionLoading(true);
      setError('');
      setActionSuccess('');
      const res = await api.verifyReport(reportId);
      setActionSuccess(`Report verified and committed on-chain! TxHash: ${res.blockchain?.transactionHash?.slice(0, 18)}...`);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (report) => {
    setSelectedReportToReject(report);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejecting this claim.');
      return;
    }
    try {
      setActionLoading(true);
      setError('');
      setActionSuccess('');
      const res = await api.rejectReport(selectedReportToReject._id, rejectReason.trim());
      setRejectModalOpen(false);
      setActionSuccess(`Report rejected and recorded on-chain! TxHash: ${res.blockchain?.transactionHash?.slice(0, 18)}...`);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#3B82B6]/15 text-[#3B82B6] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Authorized Auditor Portal</span>
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Role: VERIFIER
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user?.name || 'Verifier Audit Console'}
              </h1>
              <p className="text-xs text-slate-500">
                Authorized Verifier Account: <strong className="text-slate-700">{user?.email}</strong> &bull; {user?.organizationName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading || actionLoading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-mono border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-[#176B45]" />
                <span>Ethers.js Smart Contract Ready</span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Verifier Metrics */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Audit Queue Status
            </h2>
            <span className="text-[11px] text-slate-400">Real-time database queries & on-chain commitments</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Pending Impact Claims</span>
                <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                  {loading ? '...' : data.pendingCount}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Awaiting third-party verification & signing</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Completed On-Chain Audits</span>
                <h3 className="text-3xl font-extrabold text-[#176B45] mt-1">
                  {loading ? '...' : data.reviewedCount}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Historical approval/rejection decisions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Claims Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pending Evidence Submissions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Claims requiring verification, manifest comparison, and blockchain attestation
              </p>
            </div>
          </div>

          {data.pendingReports.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-base font-bold text-slate-800">Queue is currently clear</h4>
                <p className="text-xs text-slate-500">
                  There are no pending reports waiting for audit right now. All submissions have been processed.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {data.pendingReports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#176B45] bg-[#176B45]/10 px-2 py-0.5 rounded-md">
                        {report.campaignId?.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        by <strong>{report.organizationId?.organizationName || report.organizationId?.name}</strong>
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {report.impactStatement}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-bold text-slate-900">
                        {report.quantity?.toLocaleString()} {report.unit}
                      </span>
                      <span>&bull;</span>
                      <span>{report.evidence?.length || 0} Attached Document(s)</span>
                      {report.evidenceManifestHash && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Manifest: {report.evidenceManifestHash.slice(0, 16)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedReportDetails(report)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                    >
                      Inspect Evidence
                    </button>
                    <button
                      onClick={() => handleVerify(report._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#176B45] hover:bg-[#115335] text-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve On-Chain</span>
                    </button>
                    <button
                      onClick={() => handleOpenReject(report)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviewed Claims History */}
        {data.reviewedReports && data.reviewedReports.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Audited Reports Log</h3>
            <div className="space-y-3">
              {data.reviewedReports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setSelectedReportDetails(report)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4 cursor-pointer bg-white"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          report.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {report.status}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {report.campaignId?.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{report.impactStatement}</p>
                    {report.blockchain?.transactionHash && (
                      <p className="font-mono text-[10px] text-slate-400 truncate max-w-md">
                        Tx: {report.blockchain.transactionHash}
                      </p>
                    )}
                  </div>
                  <button className="text-xs font-bold text-[#3B82B6] hover:underline shrink-0">
                    View Record
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Reject Impact Claim
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Provide an official audit rejection reason. This reason will be permanently committed to the smart contract history on-chain.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Rejection Note / Findings
              </label>
              <textarea
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Photographic evidence does not demonstrate sufficient geolocation tags; unit calculations mismatch receipt."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-50"
              >
                Confirm Rejection On-Chain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReportDetails && (
        <ReportDetailsModal
          report={selectedReportDetails}
          isOpen={Boolean(selectedReportDetails)}
          onClose={() => setSelectedReportDetails(null)}
        />
      )}
    </div>
  );
}

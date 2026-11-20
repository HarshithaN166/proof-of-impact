import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  Building2,
  FileText,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import ReportDetailsModal from '../components/ReportDetailsModal';

export default function AnalyticsDashboard() {
  const [data, setData] = useState({
    metrics: {
      totalReportsCount: 0,
      verifiedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      filteredTotal: 0,
      filteredVerified: 0,
      filteredPending: 0,
      filteredRejected: 0,
    },
    organizationBreakdown: [],
    monthlyTrends: [],
    categoryBreakdown: [],
    reports: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    organizationId: 'ALL',
    status: 'ALL',
  });

  const [selectedReport, setSelectedReport] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load impact analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      organizationId: 'ALL',
      status: 'ALL',
    });
  };

  // Download Impact Summary Report (CSV / Text Report)
  const handleDownloadReport = () => {
    if (!data.reports || data.reports.length === 0) return;

    const headers = [
      'Report ID',
      'Campaign Title',
      'Category',
      'Organization',
      'Reported Quantity',
      'Unit',
      'Activity Date',
      'Verification Status',
      'Blockchain TxHash',
      'Evidence Manifest SHA-256',
      'Submission Timestamp',
    ];

    const rows = data.reports.map((r) => [
      `"${r._id}"`,
      `"${r.campaignId?.title || 'N/A'}"`,
      `"${r.campaignId?.category || 'General'}"`,
      `"${r.organizationId?.organizationName || r.organizationId?.name || 'N/A'}"`,
      r.quantity || 0,
      `"${r.unit || ''}"`,
      `"${r.activityDate ? new Date(r.activityDate).toISOString().split('T')[0] : ''}"`,
      `"${r.status}"`,
      `"${r.blockchain?.transactionHash || 'None'}"`,
      `"${r.evidenceManifestHash || 'None'}"`,
      `"${new Date(r.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `proof_of_impact_summary_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculation for percentage bar widths
  const statusPercentages = useMemo(() => {
    const total = data.metrics.filteredTotal || 1;
    return {
      approved: Math.round((data.metrics.filteredVerified / total) * 100),
      pending: Math.round((data.metrics.filteredPending / total) * 100),
      rejected: Math.round((data.metrics.filteredRejected / total) * 100),
    };
  }, [data.metrics]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#176B45]/15 text-[#176B45] flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Public Impact Intelligence</span>
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Real-time Database & On-Chain Audit Feed
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Impact Analytics & Transparency Dashboard
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl">
                Cryptographically audited performance indicators, submission trajectories, and organization-wise contributions cross-referenced with smart contract attestations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadReport}
                disabled={data.reports.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#176B45] hover:bg-[#115335] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export Summary (CSV)</span>
              </button>
              <button
                onClick={fetchAnalytics}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Refresh Analytics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* =========================================================================
            FILTERS SECTION (Requirement 3)
           ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Filter className="w-4 h-4 text-[#176B45]" />
              <span>Multi-Dimensional Filter Controls</span>
            </div>
            {(filters.startDate || filters.endDate || filters.organizationId !== 'ALL' || filters.status !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Verification Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Verified / Approved</option>
                <option value="PENDING">Pending Audit</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Organization Filter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Organization</label>
              <select
                value={filters.organizationId}
                onChange={(e) => handleFilterChange('organizationId', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]"
              >
                <option value="ALL">All Organizations</option>
                {data.organizationBreakdown.map((org) => (
                  <option key={org.organizationId} value={org.organizationId}>
                    {org.organizationName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range: Start */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">From Activity Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]"
              />
            </div>

            {/* Date Range: End */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">To Activity Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            KPI METRIC CARDS (Requirement 1 & 5)
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Reports */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Total Impact Reports</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {loading ? '...' : data.metrics.filteredTotal}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Cumulative submissions in view
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Verified Reports */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Verified & Approved</span>
              <h3 className="text-3xl font-extrabold text-[#176B45] mt-1">
                {loading ? '...' : data.metrics.filteredVerified}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {statusPercentages.approved}% of filtered total
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Pending Reports */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Pending Verification</span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                {loading ? '...' : data.metrics.filteredPending}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {statusPercentages.pending}% awaiting auditor attestation
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Rejected Reports */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Rejected Reports</span>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-1">
                {loading ? '...' : data.metrics.filteredRejected}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {statusPercentages.rejected}% failed evidence criteria
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            VISUAL CHARTS (Requirement 2)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Status Distribution Bar & Ratio */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#176B45]" />
                  Report Status Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportion of submitted claims by on-chain audit resolution
                </p>
              </div>
            </div>

            {data.metrics.filteredTotal === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No reports match current filters.</p>
            ) : (
              <div className="space-y-6">
                {/* Visual Stacked Progress Bar */}
                <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                  <div
                    style={{ width: `${statusPercentages.approved}%` }}
                    className="bg-[#176B45] h-full transition-all duration-500"
                    title={`Approved: ${data.metrics.filteredVerified}`}
                  />
                  <div
                    style={{ width: `${statusPercentages.pending}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                    title={`Pending: ${data.metrics.filteredPending}`}
                  />
                  <div
                    style={{ width: `${statusPercentages.rejected}%` }}
                    className="bg-rose-500 h-full transition-all duration-500"
                    title={`Rejected: ${data.metrics.filteredRejected}`}
                  />
                </div>

                {/* Legend & Breakdown stats */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">Verified</span>
                    <p className="text-lg font-extrabold text-[#176B45]">{data.metrics.filteredVerified}</p>
                    <span className="text-[10px] text-emerald-700">{statusPercentages.approved}%</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800">Pending</span>
                    <p className="text-lg font-extrabold text-amber-700">{data.metrics.filteredPending}</p>
                    <span className="text-[10px] text-amber-700">{statusPercentages.pending}%</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-800">Rejected</span>
                    <p className="text-lg font-extrabold text-rose-700">{data.metrics.filteredRejected}</p>
                    <span className="text-[10px] text-rose-700">{statusPercentages.rejected}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart 2: Monthly Submission Trends */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#3B82B6]" />
                  Monthly Report Submission Trends
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submission volume and approval trajectory over time
                </p>
              </div>
            </div>

            {data.monthlyTrends.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No trend data available for current selection.</p>
            ) : (
              <div className="space-y-4">
                {data.monthlyTrends.map((t) => {
                  const maxMonthly = Math.max(...data.monthlyTrends.map((m) => m.total), 1);
                  const barWidth = Math.round((t.total / maxMonthly) * 100);

                  return (
                    <div key={t.month} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-700 font-mono">{t.month}</span>
                        <span className="text-slate-900">{t.total} Report(s)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                        <div
                          style={{ width: `${barWidth}%` }}
                          className="bg-[#3B82B6] h-full rounded-full transition-all duration-500"
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                        <span className="text-emerald-600 font-bold">{t.approved} Verified</span>
                        <span>&bull;</span>
                        <span className="text-amber-600 font-bold">{t.pending} Pending</span>
                        <span>&bull;</span>
                        <span className="text-rose-600 font-bold">{t.rejected} Rejected</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            ORGANIZATION CONTRIBUTIONS (Requirement 1 & 2)
           ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#176B45]" />
                Organization-Wise Contributions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of verified output and total claims by registered NGO/corporate body
              </p>
            </div>
          </div>

          {data.organizationBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">No organization records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Organization Name</th>
                    <th className="px-4 py-3">Total Submissions</th>
                    <th className="px-4 py-3 text-emerald-700">Verified</th>
                    <th className="px-4 py-3 text-amber-700">Pending</th>
                    <th className="px-4 py-3 text-rose-700">Rejected</th>
                    <th className="px-4 py-3 rounded-r-xl">Total Units Delivered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {data.organizationBreakdown.map((org) => (
                    <tr key={org.organizationId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#176B45]" />
                        <span>{org.organizationName}</span>
                      </td>
                      <td className="px-4 py-3.5">{org.totalReports}</td>
                      <td className="px-4 py-3.5 text-[#176B45] font-bold">{org.verifiedReports}</td>
                      <td className="px-4 py-3.5 text-amber-600">{org.pendingReports}</td>
                      <td className="px-4 py-3.5 text-rose-600">{org.rejectedReports}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {org.totalQuantity?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =========================================================================
            DETAILED FILTERED AUDIT TABLE (Requirement 4)
           ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3B82B6]" />
                Audited Reports Register ({data.reports.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any row to inspect complete evidence SHA-256 hashes and on-chain verification history
              </p>
            </div>
            <button
              onClick={handleDownloadReport}
              disabled={data.reports.length === 0}
              className="text-xs font-bold text-[#176B45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Table CSV</span>
            </button>
          </div>

          {data.reports.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">No reports match the selected filters.</p>
          ) : (
            <div className="space-y-3">
              {data.reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#176B45]/40 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#176B45] bg-[#176B45]/10 px-2 py-0.5 rounded-md">
                        {report.campaignId?.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        {report.organizationId?.organizationName || report.organizationId?.name}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {report.impactStatement}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="font-bold text-slate-800">
                        {report.quantity?.toLocaleString()} {report.unit}
                      </span>
                      {report.blockchain?.transactionHash && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Tx: {report.blockchain.transactionHash.slice(0, 16)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                        report.status === 'APPROVED'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : report.status === 'REJECTED'
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : 'text-amber-800 bg-amber-50 border border-amber-200'
                      }`}
                    >
                      {report.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}


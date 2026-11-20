import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  FolderKanban,
  FileUp,
  ShieldCheck,
  User,
  LogOut,
  PlusCircle,
  TrendingUp,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Activity,
  Mail,
  Shield,
  Layers,
  Inbox,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Edit3,
  Eye,
  Check,
  FileText,
  ScanText,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import CreateCampaignModal from '../components/CreateCampaignModal';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import SubmitReportModal from '../components/SubmitReportModal';
import ReportDetailsModal from '../components/ReportDetailsModal';

const CATEGORIES = [
  'ALL',
  'Environment',
  'Food and Nutrition',
  'Education',
  'Health and Community',
  'Cleanliness',
  'Animal Welfare',
  'Other',
];

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'];

export default function OrganizationDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'campaigns' | 'submit' | 'verifications' | 'profile'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [warningToast, setWarningToast] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Milestone 5 modals
  const [submitReportOpen, setSubmitReportOpen] = useState(false);
  const [selectedCampaignForReport, setSelectedCampaignForReport] = useState('');
  const [inspectReport, setInspectReport] = useState(null);

  // Filters for My Campaigns
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [dashboardData, setDashboardData] = useState({
    profile: null,
    stats: {
      totalCampaigns: 0,
      submittedReports: 0,
      pendingVerifications: 0,
      approvedReports: 0,
      rejectedReports: 0,
    },
    campaigns: [],
    reports: [],
    recentActivities: [],
  });

  const fetchData = async () => {
    try {
      setError('');
      const data = await api.getOrganizationOverview();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch organization dashboard records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const showToast = (message, isWarning = false) => {
    if (isWarning) {
      setWarningToast(message);
      setTimeout(() => setWarningToast(''), 4500);
    } else {
      setSuccessToast(message);
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  // Filtered campaigns for My Campaigns view
  const filteredCampaigns = dashboardData.campaigns.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.locationLabel && c.locationLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'campaigns',
      label: 'My Campaigns',
      icon: FolderKanban,
      count: dashboardData.stats.totalCampaigns,
    },
    { id: 'submit', label: 'Submit Impact', icon: FileUp },
    {
      id: 'verifications',
      label: 'Verification Status',
      icon: ShieldCheck,
      count: dashboardData.stats.pendingVerifications,
    },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Toast Notifications */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#176B45] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {warningToast && (
        <div className="fixed top-20 right-5 z-50 bg-amber-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4 text-amber-200" />
          <span>{warningToast}</span>
        </div>
      )}

      {/* Top Organization Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center shrink-0 border border-[#176B45]/20 shadow-xs">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {dashboardData.profile?.organizationName || user?.organizationName || 'Organization Portal'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#176B45]/10 text-[#176B45] border border-[#176B45]/20 uppercase">
                    Verified Org
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Representative: <strong className="text-slate-700">{dashboardData.profile?.name || user?.name}</strong></span>
                  <span>&bull;</span>
                  <span>{dashboardData.profile?.email || user?.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                title="Refresh database records"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#176B45]' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setSelectedCampaignForReport('');
                  setSubmitReportOpen(true);
                }}
                disabled={dashboardData.campaigns.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B82B6] hover:bg-[#2F6C98] shadow-md shadow-[#3B82B6]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <FileUp className="w-4 h-4" />
                <span>Submit Impact</span>
              </button>
              <button
                onClick={() => {
                  setEditingCampaign(null);
                  setCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-md shadow-[#176B45]/20 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Campaign</span>
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Sub-navigation Menu */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-2 border-t border-slate-100 scrollbar-none">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#176B45] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ItemIcon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white text-[#176B45]' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================================
            TAB 1: OVERVIEW / DASHBOARD
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Stat Cards Row */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Performance Metrics
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">
                  Queried directly from MongoDB
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Total Campaigns</span>
                    <h3 className="text-3xl font-extrabold text-slate-900">
                      {loading ? '...' : dashboardData.stats.totalCampaigns}
                    </h3>
                    <p className="text-[11px] text-slate-400">Owned by this organization</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Submitted Reports</span>
                    <h3 className="text-3xl font-extrabold text-[#3B82B6]">
                      {loading ? '...' : dashboardData.stats.submittedReports}
                    </h3>
                    <p className="text-[11px] text-slate-400">Evidence packages filed</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#3B82B6]/10 text-[#3B82B6] flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Pending Verifications</span>
                    <h3 className="text-3xl font-extrabold text-amber-600">
                      {loading ? '...' : dashboardData.stats.pendingVerifications}
                    </h3>
                    <p className="text-[11px] text-slate-400">Awaiting auditor review</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Approved Reports</span>
                    <h3 className="text-3xl font-extrabold text-emerald-700">
                      {loading ? '...' : dashboardData.stats.approvedReports}
                    </h3>
                    <p className="text-[11px] text-slate-400">Verified & on-chain</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Split Section: Campaign Status vs Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Campaign Status */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Campaign Status</h3>
                    <p className="text-xs text-slate-500">Active and draft initiatives</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="text-xs font-bold text-[#176B45] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {dashboardData.campaigns.length === 0 ? (
                  <div className="text-center py-14 px-4 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="text-sm font-bold text-slate-800">No campaigns recorded</h4>
                      <p className="text-xs text-slate-500">
                        You have not published any impact campaigns yet. Create your first initiative to define scope and target impact.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCampaign(null);
                        setCreateModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create Campaign</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dashboardData.campaigns.slice(0, 5).map((camp) => (
                      <div
                        key={camp._id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                      >
                        <div
                          onClick={() => setSelectedCampaign(camp)}
                          className="space-y-0.5 cursor-pointer flex-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 hover:text-[#176B45]">
                              {camp.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {camp.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Target: {camp.targetQuantity?.toLocaleString()} {camp.unit} &bull;{' '}
                            {camp.locationLabel || 'Online/General'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedCampaignForReport(camp._id);
                              setSubmitReportOpen(true);
                            }}
                            className="text-[11px] font-bold text-[#3B82B6] hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg"
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            <span>Submit Proof</span>
                          </button>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              camp.status === 'ACTIVE'
                                ? 'text-[#176B45] bg-[#176B45]/10'
                                : camp.status === 'COMPLETED'
                                ? 'text-blue-700 bg-blue-50'
                                : 'text-slate-600 bg-slate-100'
                            }`}
                          >
                            {camp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Recent Activities */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#3B82B6]" />
                  <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
                </div>

                {dashboardData.recentActivities.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No recent activity events</p>
                    <p className="text-[11px] text-slate-400">Activity logs will populate as actions occur.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentActivities.map((act) => {
                      const dateStr = new Date(act.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <div key={act._id} className="flex items-start gap-3 text-xs">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#176B45] flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800">
                              {act.action.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[11px] text-slate-400">{dateStr}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: MY CAMPAIGNS (Search, Category Filter, Status Filter, Manage)
           ========================================================================= */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-200">
            {/* Header & New Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  My Campaigns
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage, edit, and attach impact evidence to campaigns owned by {user?.organizationName}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCampaign(null);
                  setCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Campaign</span>
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, description or location..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {STATUS_FILTERS.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedStatus === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'ALL' ? 'All Status' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
                  Category:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#176B45] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Cards Grid */}
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FolderKanban className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-800">
                    {dashboardData.campaigns.length === 0
                      ? 'No Campaigns Created Yet'
                      : 'No Matching Campaigns Found'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {dashboardData.campaigns.length === 0
                      ? 'Create your first initiative to define target goals and begin tracking impact activities.'
                      : 'Try adjusting your search query or category filters to find existing initiatives.'}
                  </p>
                </div>
                {dashboardData.campaigns.length === 0 && (
                  <button
                    onClick={() => {
                      setEditingCampaign(null);
                      setCreateModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] cursor-pointer"
                  >
                    Create First Campaign
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {filteredCampaigns.map((camp) => (
                  <div
                    key={camp._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#176B45] bg-[#176B45]/10 px-2.5 py-1 rounded-full">
                          {camp.category}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            camp.status === 'ACTIVE'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : camp.status === 'COMPLETED'
                              ? 'text-blue-700 bg-blue-50 border border-blue-200'
                              : 'text-slate-600 bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-[#176B45] transition-colors leading-snug">
                        {camp.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {camp.description}
                      </p>

                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-[#176B45]" />
                            Target Goal:
                          </span>
                          <span className="font-bold text-slate-900">
                            {camp.targetQuantity?.toLocaleString()} {camp.unit}
                          </span>
                        </div>
                        {camp.locationLabel && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate pt-1 border-t border-slate-200/60">
                            <MapPin className="w-3 h-3 text-[#3B82B6] shrink-0" />
                            <span className="truncate">{camp.locationLabel}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedCampaignForReport(camp._id);
                          setSubmitReportOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#3B82B6] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Submit Proof</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedCampaign(camp)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Inspect Campaign"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCampaign(camp);
                            setCreateModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#176B45] hover:bg-[#176B45]/10 transition-colors cursor-pointer"
                          title="Edit Campaign"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: SUBMIT IMPACT (Milestone 5 Submission Console)
           ========================================================================= */}
        {activeTab === 'submit' && (
          <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Evidence & Hashing Engine Live</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Submit Impact Report & Evidence
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload activity logs, photographs, and PDF files. The engine generates server-side SHA-256 fingerprints and OCR extracts.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCampaignForReport('');
                  setSubmitReportOpen(true);
                }}
                disabled={dashboardData.campaigns.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <FileUp className="w-4 h-4" />
                <span>Open Submission Form</span>
              </button>
            </div>

            {/* Interactive Explanation & Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">1. Activity & Quantity</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select one of your registered campaigns and enter the measurable activity statement, positive count, unit, and date.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B82B6]/10 text-[#3B82B6] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">2. SHA-256 Manifest</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every uploaded photograph and PDF is hashed with SHA-256 on the server. Sorted hashes create an immutable evidence manifest digest.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ScanText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">3. OCR Text Extraction</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recognizes text from certificates, logs, and receipts for auditor review. You can review and correct extracted text prior to submission.
                </p>
              </div>
            </div>

            {/* Quick Submit Launcher */}
            <div className="mt-6 bg-[#176B45]/5 border border-[#176B45]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Ready to attach proof to an active campaign?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  You have {dashboardData.stats.totalCampaigns} registered campaign(s) ready for impact reports.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCampaignForReport('');
                  setSubmitReportOpen(true);
                }}
                disabled={dashboardData.campaigns.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
              >
                Launch Impact Submission Form
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: VERIFICATION STATUS (Requirements 9 & 11)
           ========================================================================= */}
        {activeTab === 'verifications' && (
          <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Verification & Audit Queue
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Track verification progress, SHA-256 evidence digests, and review statuses for your submissions
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCampaignForReport('');
                  setSubmitReportOpen(true);
                }}
                disabled={dashboardData.campaigns.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Report</span>
              </button>
            </div>

            {dashboardData.reports.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-slate-800">No Reports in Queue</h3>
                  <p className="text-xs text-slate-500">
                    No impact reports have been submitted for verification yet. Click "Submit Impact" to file evidence documents for auditor review.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCampaignForReport('');
                    setSubmitReportOpen(true);
                  }}
                  disabled={dashboardData.campaigns.length === 0}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Submit First Impact Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.reports.map((report) => (
                  <div
                    key={report._id}
                    onClick={() => setInspectReport(report)}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-[#176B45]/40 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#176B45] bg-[#176B45]/10 px-2 py-0.5 rounded-md">
                          {report.campaignId?.title}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Activity Date: {new Date(report.activityDate).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {report.impactStatement}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="font-semibold text-slate-800">
                          {report.quantity?.toLocaleString()} {report.unit}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#3B82B6]" />
                          {report.evidence?.length || 0} Evidence File(s)
                        </span>
                        {report.evidenceManifestHash && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                              Digest: {report.evidenceManifestHash.slice(0, 16)}...
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
                        {report.status === 'PENDING' ? 'Pending Review' : report.status}
                      </span>
                      <button
                        type="button"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: PROFILE
           ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Organization Profile
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Credentials and verified registry details
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#176B45]/10 text-[#176B45] uppercase">
                {dashboardData.profile?.role || user?.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#176B45]" />
                  Organization Name
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {dashboardData.profile?.organizationName || user?.organizationName || 'N/A'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#3B82B6]" />
                  Authorized Representative
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {dashboardData.profile?.name || user?.name || 'N/A'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#176B45]" />
                  Official Email Address
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {dashboardData.profile?.email || user?.email || 'N/A'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#3B82B6]" />
                  Member Since
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {dashboardData.profile?.createdAt
                    ? new Date(dashboardData.profile.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Current Session'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Shield className="w-4 h-4 text-[#176B45]" />
                <span>Security & Authorization</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Your account is protected by salted bcrypt password hashing and stateless JSON Web Tokens. All API requests are scoped to your organization's unique MongoDB identifier.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Create / Edit Campaign Modal */}
      <CreateCampaignModal
        isOpen={createModalOpen}
        editCampaign={editingCampaign}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingCampaign(null);
        }}
        onSuccess={() => {
          fetchData();
          showToast(
            editingCampaign
              ? 'Campaign updated successfully!'
              : 'New impact campaign published successfully!'
          );
        }}
      />

      {/* Campaign Details Inspection Modal */}
      <CampaignDetailsModal
        isOpen={Boolean(selectedCampaign)}
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onEdit={(camp) => {
          setSelectedCampaign(null);
          setEditingCampaign(camp);
          setCreateModalOpen(true);
        }}
        onDeleted={() => {
          fetchData();
          showToast('Campaign successfully removed from database.');
        }}
      />

      {/* Milestone 5: Submit Impact Report Modal */}
      <SubmitReportModal
        isOpen={submitReportOpen}
        campaigns={dashboardData.campaigns}
        preselectedCampaignId={selectedCampaignForReport}
        onClose={() => setSubmitReportOpen(false)}
        onSuccess={(report, warning) => {
          fetchData();
          showToast('Impact report & evidence files submitted successfully!');
          if (warning) {
            showToast(warning, true);
          }
          setActiveTab('verifications');
        }}
      />

      {/* Milestone 5: Report Details Inspection Modal */}
      <ReportDetailsModal
        isOpen={Boolean(inspectReport)}
        report={inspectReport}
        onClose={() => setInspectReport(null)}
      />
    </div>
  );
}

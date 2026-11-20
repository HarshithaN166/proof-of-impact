import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock,
  Eye,
  CheckCircle2,
  TreePine,
  Utensils,
  Droplets,
  Search,
  Filter,
  Sparkles,
  Award,
  Hash,
  Database,
  Users,
  Compass,
  ArrowUpRight,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CampaignCard from '../components/CampaignCard';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import { api } from '../services/api';

export default function Home({ onAuthClick }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inspectCampaign, setInspectCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Genuine Real Database State
  const [realCampaigns, setRealCampaigns] = useState([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    totalCampaigns: 0,
    totalReportsCount: 0,
    verifiedCount: 0,
    pendingCount: 0,
    organizationsCount: 0,
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, [selectedCategory, searchTerm]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // Fetch genuine campaigns from MongoDB
      const campData = await api.getPublicCampaigns({
        category: selectedCategory,
        search: searchTerm,
      });
      setRealCampaigns(campData.campaigns || []);

      // Fetch dynamic analytics from MongoDB & Blockchain
      const analyticsData = await api.getAnalytics({});
      const uniqueOrgs = analyticsData.organizationBreakdown?.length || 0;
      const uniqueCats = analyticsData.categoryBreakdown?.length || 0;

      setAnalyticsMetrics({
        totalCampaigns: campData.count || campData.campaigns?.length || 0,
        totalReportsCount: analyticsData.metrics?.totalReportsCount || 0,
        verifiedCount: analyticsData.metrics?.verifiedCount || 0,
        pendingCount: analyticsData.metrics?.pendingCount || 0,
        organizationsCount: uniqueOrgs,
        categoriesCount: uniqueCats,
      });
    } catch (err) {
      console.warn('[Home] Could not load live records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Real Dynamic Statistics
  const dynamicStats = [
    {
      id: 1,
      label: 'Verified Impact Reports',
      value: loading ? '...' : String(analyticsMetrics.verifiedCount),
      subtext: 'Cryptographically audited on blockchain',
      icon: CheckCircle2,
      accentColor: '#176B45',
    },
    {
      id: 2,
      label: 'Pending Audits',
      value: loading ? '...' : String(analyticsMetrics.pendingCount),
      subtext: 'Awaiting third-party verifier review',
      icon: Clock,
      accentColor: '#3B82B6',
    },
    {
      id: 3,
      label: 'Active Organizations',
      value: loading ? '...' : String(analyticsMetrics.organizationsCount),
      subtext: 'Registered contributing entities',
      icon: Users,
      accentColor: '#176B45',
    },
    {
      id: 4,
      label: 'Impact Categories',
      value: loading ? '...' : String(analyticsMetrics.categoriesCount || (analyticsMetrics.totalCampaigns > 0 ? 1 : 0)),
      subtext: 'Ecology, cleanliness, nutrition, etc.',
      icon: Database,
      accentColor: '#3B82B6',
    },
  ];

  // How It Works Steps
  const workflowSteps = [
    {
      number: '01',
      title: 'Submit Claim',
      description: 'An authorized organization logs in, creates a campaign, and reports measurable impact with target metrics and dates.',
      icon: TrendingUp,
    },
    {
      number: '02',
      title: 'Evidence & Hash',
      description: 'Activity photographs and documents are uploaded. The server calculates an immutable SHA-256 cryptographic digest.',
      icon: Hash,
    },
    {
      number: '03',
      title: 'Verifier Review',
      description: 'An independent verifier inspects original evidence, methodology, and approves or rejects with documented reasons.',
      icon: ShieldCheck,
    },
    {
      number: '04',
      title: 'Record On-Chain',
      description: 'The smart contract commits the verifier address, evidence manifest hash, and timestamp to the local Hardhat blockchain.',
      icon: Lock,
    },
  ];

  // Benefits
  const benefits = [
    {
      title: 'Radical Transparency',
      description: 'Any public visitor can inspect verified impact statistics, raw evidence fingerprints, and reviewer decisions without barriers.',
      icon: Eye,
      tag: 'Public Audit',
    },
    {
      title: 'Evidence-Based Verification',
      description: 'Claims are backed by photos, logs, and verifiable units. Authorized third-party human auditors perform rigorous review.',
      icon: ShieldCheck,
      tag: 'Rigorous Review',
    },
    {
      title: 'Tamper-Evident Records',
      description: 'Evidence SHA-256 hashes and verification states are committed to smart contracts, making retroactive modifications impossible.',
      icon: Lock,
      tag: 'Solidity Contract',
    },
    {
      title: 'Public Accountability',
      description: 'Clear demarcation between pending claims and verified outcomes. Incompatible metrics are never improperly conflated.',
      icon: Award,
      tag: 'Zero Misleading Metrics',
    },
  ];

  return (
    <div id="top" className="min-h-screen flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#176B45]/5 via-[#3B82B6]/5 to-transparent blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176B45]/10 border border-[#176B45]/20 text-xs font-bold text-[#176B45]">
              <Sparkles className="w-4 h-4 text-[#176B45]" />
              <span>Tamper-Evident Impact Verification Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Make Every Impact{' '}
              <span className="text-[#176B45] relative inline-block">
                Count.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#3B82B6]/40"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Don't just claim social and environmental impact. Submit evidence-backed reports, undergo rigorous third-party verification, and anchor results to an immutable blockchain audit trail.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#campaigns"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-lg shadow-[#176B45]/25 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span>Explore Impact</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/analytics"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-700 hover:text-[#176B45] bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all duration-200 cursor-pointer"
              >
                <span>View Live Analytics</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#176B45]" />
                <span>SHA-256 Evidence Hashing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#176B45]" />
                <span>Solidity Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3B82B6]" />
                <span>Open Public Verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION (Calculated strictly from MongoDB records) */}
      <section className="py-12 bg-slate-50/70 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3B82B6]">
              Real-time Metrics
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Platform Verification Activity
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Live statistics dynamically calculated from MongoDB records and Hardhat smart contract events.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicStats.map((stat) => (
              <StatCard
                key={stat.id}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                subtext={stat.subtext}
                accentColor={stat.accentColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#176B45]/10 text-[#176B45] text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transparent Protocol</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Proof of Impact Works
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              A four-step verification cycle converting real-world impact assertions into tamper-evident on-chain credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-[#176B45]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-2xl font-black text-slate-300 font-mono">
                        {step.number}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
                        <StepIcon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED CAMPAIGNS (GENUINE DATABASE RECORDS) */}
      <section id="campaigns" className="py-20 bg-slate-50 border-t border-slate-200/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#176B45]/10 text-[#176B45] text-xs font-bold mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>Verified Initiatives</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Impact Campaigns
              </h2>
              <p className="text-slate-600 mt-2 text-sm max-w-xl">
                Real campaigns created by registered organizations in the database. Each campaign is backed by authentic reports and verifiable evidence.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'Environment', 'Cleanliness', 'Health and Community', 'Food and Nutrition'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#176B45] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Real Campaign Cards Grid */}
          {realCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {realCampaigns.map((camp) => (
                <CampaignCard
                  key={camp._id}
                  campaign={camp}
                  onInspect={(c) => setInspectCampaign(c)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-800">No Registered Campaigns in Database</h3>
                <p className="text-xs text-slate-500">
                  There are currently no real campaigns matching your selection. Register as an organization to create the first verified impact campaign!
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#176B45] hover:bg-[#115335] text-white shadow-xs"
              >
                <span>Register Organization</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Bottom Callout */}
          <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82B6]/15 text-[#3B82B6] flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Ready to submit your organization's impact?
                </h4>
                <p className="text-xs text-slate-500">
                  Register your organization account to access the verified submission portal.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#176B45] text-white hover:bg-[#115335] shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Register Organization
            </Link>
          </div>
        </div>
      </section>

      {/* CORE BENEFITS */}
      <section id="benefits" className="py-20 lg:py-28 bg-white border-t border-slate-200/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#176B45]/10 text-[#176B45] text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Key Advantages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Proof of Impact?
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Replacing unverified social claims with transparent, audit-ready cryptographic proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b) => {
              const BIcon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center mb-5">
                      <BIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B82B6] mb-1.5 block">
                      {b.tag}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Campaign Details Modal */}
      {inspectCampaign && (
        <CampaignDetailsModal
          campaign={inspectCampaign}
          isOpen={Boolean(inspectCampaign)}
          onClose={() => setInspectCampaign(null)}
        />
      )}
    </div>
  );
}

function Clock(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

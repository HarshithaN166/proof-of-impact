import { Campaign } from '../models/Campaign.js';
import { ImpactReport } from '../models/ImpactReport.js';
import { AuditEvent } from '../models/AuditEvent.js';

// Get records specifically for the logged-in organization
export const getOrganizationOverview = async (req, res, next) => {
  try {
    const orgId = req.user._id;

    // Fetch actual campaigns created by THIS organization
    const campaigns = await Campaign.find({ organizationId: orgId }).sort({ createdAt: -1 });

    // Fetch actual reports submitted by THIS organization
    const reports = await ImpactReport.find({ organizationId: orgId })
      .populate('campaignId', 'title category unit status')
      .sort({ createdAt: -1 });

    // Fetch recent audit activities for this organization
    const auditEvents = await AuditEvent.find({ actorUserId: orgId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate real metrics strictly from the database records
    const stats = {
      totalCampaigns: campaigns.length,
      submittedReports: reports.length,
      pendingVerifications: reports.filter((r) => r.status === 'PENDING').length,
      approvedReports: reports.filter((r) => r.status === 'APPROVED').length,
      rejectedReports: reports.filter((r) => r.status === 'REJECTED').length,
    };

    res.json({
      success: true,
      profile: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        organizationName: req.user.organizationName,
        role: req.user.role,
        createdAt: req.user.createdAt,
        isActive: req.user.isActive,
      },
      stats,
      campaigns,
      reports,
      recentActivities: auditEvents,
    });
  } catch (err) {
    next(err);
  }
};

// Get records specifically for the logged-in verifier
export const getVerifierOverview = async (req, res, next) => {
  try {
    // Verifiers see real pending claims waiting for review
    const pendingReports = await ImpactReport.find({ status: 'PENDING' })
      .populate('campaignId', 'title category unit organizationName')
      .populate('organizationId', 'name organizationName email')
      .sort({ createdAt: 1 });

    // Verifiers see real claims that have been reviewed
    const reviewedReports = await ImpactReport.find({ status: { $in: ['APPROVED', 'REJECTED'] } })
      .populate('campaignId', 'title category unit organizationName')
      .populate('organizationId', 'name organizationName email')
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json({
      success: true,
      pendingCount: pendingReports.length,
      reviewedCount: reviewedReports.length,
      pendingReports,
      reviewedReports,
    });
  } catch (err) {
    next(err);
  }
};

// Milestone 9: Comprehensive Impact Analytics & Dynamic Aggregations
export const getImpactAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, organizationId, status } = req.query;

    const filter = {};

    // 1. Filter by Date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // 2. Filter by Organization
    if (organizationId && organizationId !== 'ALL') {
      filter.organizationId = organizationId;
    }

    // 3. Filter by Status
    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }

    // Query filtered reports
    const reports = await ImpactReport.find(filter)
      .populate('campaignId', 'title category unit target currentProgress')
      .populate('organizationId', 'name organizationName email')
      .sort({ createdAt: -1 });

    // Global counts (overall irrespective of filters for baseline KPI comparisons)
    const allReports = await ImpactReport.find({});
    const totalReportsCount = allReports.length;
    const verifiedCount = allReports.filter((r) => r.status === 'APPROVED').length;
    const pendingCount = allReports.filter((r) => r.status === 'PENDING').length;
    const rejectedCount = allReports.filter((r) => r.status === 'REJECTED').length;

    // Filtered counts
    const filteredTotal = reports.length;
    const filteredVerified = reports.filter((r) => r.status === 'APPROVED').length;
    const filteredPending = reports.filter((r) => r.status === 'PENDING').length;
    const filteredRejected = reports.filter((r) => r.status === 'REJECTED').length;

    // Organization-wise impact breakdown
    const orgBreakdownMap = {};
    for (const rep of reports) {
      const orgKey = rep.organizationId?._id?.toString() || 'Unknown';
      const orgName = rep.organizationId?.organizationName || rep.organizationId?.name || 'Unnamed Org';
      if (!orgBreakdownMap[orgKey]) {
        orgBreakdownMap[orgKey] = {
          organizationId: orgKey,
          organizationName: orgName,
          totalReports: 0,
          verifiedReports: 0,
          pendingReports: 0,
          rejectedReports: 0,
          totalQuantity: 0,
        };
      }
      orgBreakdownMap[orgKey].totalReports += 1;
      if (rep.status === 'APPROVED') orgBreakdownMap[orgKey].verifiedReports += 1;
      if (rep.status === 'PENDING') orgBreakdownMap[orgKey].pendingReports += 1;
      if (rep.status === 'REJECTED') orgBreakdownMap[orgKey].rejectedReports += 1;
      orgBreakdownMap[orgKey].totalQuantity += (rep.quantity || 0);
    }
    const organizationBreakdown = Object.values(orgBreakdownMap);

    // Monthly trends (Last 6-12 months grouping)
    const monthlyTrendsMap = {};
    for (const rep of reports) {
      const d = new Date(rep.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTrendsMap[monthKey]) {
        monthlyTrendsMap[monthKey] = {
          month: monthKey,
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
        };
      }
      monthlyTrendsMap[monthKey].total += 1;
      if (rep.status === 'APPROVED') monthlyTrendsMap[monthKey].approved += 1;
      if (rep.status === 'PENDING') monthlyTrendsMap[monthKey].pending += 1;
      if (rep.status === 'REJECTED') monthlyTrendsMap[monthKey].rejected += 1;
    }
    const monthlyTrends = Object.values(monthlyTrendsMap).sort((a, b) => a.month.localeCompare(b.month));

    // Category breakdown
    const categoryBreakdownMap = {};
    for (const rep of reports) {
      const cat = rep.campaignId?.category || 'General';
      categoryBreakdownMap[cat] = (categoryBreakdownMap[cat] || 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryBreakdownMap).map(([category, count]) => ({
      category,
      count,
    }));

    res.json({
      success: true,
      metrics: {
        totalReportsCount,
        verifiedCount,
        pendingCount,
        rejectedCount,
        filteredTotal,
        filteredVerified,
        filteredPending,
        filteredRejected,
      },
      organizationBreakdown,
      monthlyTrends,
      categoryBreakdown,
      reports,
    });
  } catch (err) {
    next(err);
  }
};


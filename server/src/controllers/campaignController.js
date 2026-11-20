import { Campaign } from '../models/Campaign.js';
import { AuditEvent } from '../models/AuditEvent.js';

// Get public campaigns for homepage exploration
export const getPublicCampaigns = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { locationLabel: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const campaigns = await Campaign.find(filter)
      .populate('organizationId', 'name organizationName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (err) {
    next(err);
  }
};

// Create a new campaign (Organization only)
export const createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      unit,
      targetQuantity,
      startDate,
      endDate,
      locationLabel,
      status,
      imageUrl,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Campaign title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Campaign description is required.' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'Impact category is required.' });
    }
    if (!unit || !unit.trim()) {
      return res.status(400).json({ success: false, error: 'Unit of impact is required (e.g. saplings, meals, books).' });
    }

    const validCategories = [
      'Environment',
      'Food and Nutrition',
      'Education',
      'Health and Community',
      'Cleanliness',
      'Animal Welfare',
      'Other',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const campaignStatus = ['DRAFT', 'ACTIVE', 'COMPLETED'].includes(status?.toUpperCase())
      ? status.toUpperCase()
      : 'ACTIVE';

    const campaign = await Campaign.create({
      title: title.trim(),
      description: description.trim(),
      category,
      unit: unit.trim(),
      targetQuantity: Number(targetQuantity) || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      locationLabel: locationLabel?.trim() || '',
      status: campaignStatus,
      imageUrl: imageUrl?.trim() || '',
      organizationId: req.user._id,
      organizationName: req.user.organizationName || req.user.name,
    });

    // Record audit event
    await AuditEvent.create({
      actorUserId: req.user._id,
      action: 'CAMPAIGN_CREATED',
      targetType: 'Campaign',
      targetId: campaign._id.toString(),
      metadata: { title: campaign.title, category: campaign.category },
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully.',
      campaign,
    });
  } catch (err) {
    next(err);
  }
};

// Get only the logged-in organization's campaigns
export const getMyCampaigns = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    const query = { organizationId: req.user._id };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { locationLabel: searchRegex }];
    }

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (err) {
    next(err);
  }
};

// Get single campaign by ID
export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    res.json({
      success: true,
      campaign,
    });
  } catch (err) {
    next(err);
  }
};

// Update an organization's own campaign
export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    // Strict Rule 12: Ownership boundary check
    if (campaign.organizationId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to modify another organization’s campaign.',
      });
    }

    const {
      title,
      description,
      category,
      unit,
      targetQuantity,
      startDate,
      endDate,
      locationLabel,
      status,
      imageUrl,
    } = req.body;

    if (title && !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title cannot be blank.' });
    }
    if (description && !description.trim()) {
      return res.status(400).json({ success: false, error: 'Description cannot be blank.' });
    }

    if (title) campaign.title = title.trim();
    if (description) campaign.description = description.trim();
    if (category) campaign.category = category;
    if (unit) campaign.unit = unit.trim();
    if (typeof targetQuantity !== 'undefined') campaign.targetQuantity = Number(targetQuantity) || 0;
    if (startDate) campaign.startDate = new Date(startDate);
    if (endDate) campaign.endDate = new Date(endDate);
    if (typeof locationLabel !== 'undefined') campaign.locationLabel = locationLabel.trim();
    if (status && ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].includes(status.toUpperCase())) {
      campaign.status = status.toUpperCase();
    }
    if (typeof imageUrl !== 'undefined') campaign.imageUrl = imageUrl.trim();

    await campaign.save();

    // Record audit event
    await AuditEvent.create({
      actorUserId: req.user._id,
      action: 'CAMPAIGN_UPDATED',
      targetType: 'Campaign',
      targetId: campaign._id.toString(),
      metadata: { status: campaign.status, title: campaign.title },
    });

    res.json({
      success: true,
      message: 'Campaign updated successfully.',
      campaign,
    });
  } catch (err) {
    next(err);
  }
};

// Delete / Archive a campaign (Owner only)
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    // Strict Rule 12: Ownership check
    if (campaign.organizationId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to delete this campaign.',
      });
    }

    await Campaign.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Campaign removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};


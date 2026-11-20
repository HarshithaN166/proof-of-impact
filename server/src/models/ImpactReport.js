import mongoose from 'mongoose';

const evidenceItemSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    storageReference: { type: String, required: true },
    sha256: { type: String, required: true },
    mimeType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    ocrText: { type: String, default: '' },
  },
  { _id: false }
);

const impactReportSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    impactStatement: {
      type: String,
      required: [true, 'Impact statement / activity description is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    activityDate: {
      type: Date,
      required: [true, 'Activity date is required'],
    },
    methodology: {
      type: String,
      trim: true,
      default: '',
    },
    evidence: [evidenceItemSchema],
    evidenceManifestHash: {
      type: String,
      default: null,
    },
    ocrText: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewReason: {
      type: String,
      default: null,
    },
    blockchain: {
      transactionHash: { type: String, default: null },
      contractAddress: { type: String, default: null },
      onChainReportId: { type: String, default: null },
      verifiedAt: { type: Date, default: null },
      verifierAddress: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

export const ImpactReport = mongoose.model('ImpactReport', impactReportSchema);

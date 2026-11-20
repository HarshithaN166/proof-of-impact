import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'USER_LOGGED_IN',
        'CAMPAIGN_CREATED',
        'CAMPAIGN_UPDATED',
        'IMPACT_SUBMITTED',
        'IMPACT_APPROVED',
        'IMPACT_VERIFIED',
        'IMPACT_REJECTED',
      ],
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);


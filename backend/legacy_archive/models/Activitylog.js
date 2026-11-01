// ActivityLog.js — Audit trail for all significant actions
// TTL index auto-deletes logs older than 90 days

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    userType:   String,
    action:     { type: String, required: true },
    entityType: String,   // 'College' | 'Scholarship' | 'Application' | etc.
    entityId:   mongoose.Schema.Types.ObjectId,
    metadata: {
      type: Map,
      of:   mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: false,   // using manual timestamp field above
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
activityLogSchema.index({ userId:     1 });
activityLogSchema.index({ action:     1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ timestamp:  -1 });

// TTL — auto-delete logs older than 90 days
activityLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7_776_000 }  // 90 days
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
// Notification.js — In-app notifications
// TTL index auto-deletes READ notifications after 30 days

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    notificationType: { type: String, required: true },
    title:            { type: String, required: true },
    message:          String,
    relatedEntity: {
      entityType: String,                        // 'Scholarship' | 'Application' | etc.
      entityId:   mongoose.Schema.Types.ObjectId,
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
notificationSchema.index({ userId: 1, isRead:     1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// TTL — auto-delete READ notifications after 30 days
notificationSchema.index(
  { readAt: 1 },
  {
    expireAfterSeconds:    2_592_000,  // 30 days
    partialFilterExpression: { isRead: true },
  }
);

export default mongoose.model('Notification', notificationSchema);
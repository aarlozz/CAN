// notificationController.js — In-app notification endpoints
//
// All handlers require protect middleware — any authenticated role.
//
//   getNotifications  GET  /api/notifications
//   markAsRead        PUT  /api/notifications/:id/read
//   markAllAsRead     PUT  /api/notifications/read-all

const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────────
// GET /api/notifications
// Returns the logged-in user's notifications, unread first then
// newest-first within each group.
//
// Query params:
//   ?unreadOnly=true   — return only unread notifications
//   ?page=1&limit=20
// ─────────────────────────────────────────────────────────────────
exports.getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;

  const query = { userId: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip     = (pageNum - 1) * limitNum;

  // Run count + fetch in parallel
  const [total, notifications, unreadCount] = await Promise.all([
    Notification.countDocuments(query),
    Notification
      .find(query)
      .sort({ isRead: 1, createdAt: -1 })   // unread (isRead=false=0) first, then newest
      .skip(skip)
      .limit(limitNum)
      .lean(),
    // Always return current unread count for notification badge — even when fetching all
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.json({
    success: true,
    data:    notifications,
    pagination: {
      total,
      page:    pageNum,
      limit:   limitNum,
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1,
    },
    unreadCount,
  });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/notifications/:id/read
// Marks a single notification as read.
// Sets isRead:true + readAt:now — this starts the 30-day TTL clock.
// Returns 404 if not found or belongs to a different user.
// ─────────────────────────────────────────────────────────────────
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id:    req.params.id,
      userId: req.user._id,      // ownership — cannot read another user's notification
    },
    {
      isRead: true,
      readAt: new Date(),        // TTL index on readAt starts the 30-day expiry clock
    },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found.',
    });
  }

  res.json({
    success: true,
    message: 'Notification marked as read.',
    data:    notification,
  });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/notifications/read-all
// Marks ALL unread notifications for the logged-in user as read.
// Single updateMany query — efficient for bulk operation.
// ─────────────────────────────────────────────────────────────────
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const now = new Date();

  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: now }
  );

  res.json({
    success:      true,
    message:      `${result.modifiedCount} notification(s) marked as read.`,
    markedCount:  result.modifiedCount,
  });
});
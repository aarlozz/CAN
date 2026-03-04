// notificationRoutes.js — In-app notification endpoints
//
// All routes require authentication (any role).
//
//   GET  /api/notifications              — own notifications (paginated, unread first)
//   PUT  /api/notifications/read-all     — mark all as read
//   PUT  /api/notifications/:id/read     — mark one as read

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

// IMPORTANT: /read-all must be defined BEFORE /:id/read
// otherwise Express matches "read-all" as the :id param
router.get('/',               protect, getNotifications);
router.put('/read-all',       protect, markAllAsRead);
router.put('/:id/read',       protect, markAsRead);

module.exports = router;
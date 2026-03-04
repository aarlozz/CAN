// notificationHelper.js — Utility for creating in-app notifications
//
// Called by other controllers after key events. NEVER throws — a notification
// failure must never block the action that triggered it.
//
// Usage:
//   const { createNotification } = require('../utils/notificationHelper');
//
//   // Fire-and-forget (don't await unless you need to)
//   createNotification({
//     userId:           student.userId,
//     notificationType: 'application_approved',
//     title:            'Your application was approved!',
//     message:          `Congratulations — your application to ${scholarship.scholarshipTitle} has been approved.`,
//     relatedEntity:    { entityType: 'Application', entityId: application._id },
//     priority:         'high',
//   });

const Notification = require('../models/Notification');

/**
 * Creates a single notification document.
 *
 * @param {Object}  options
 * @param {ObjectId|string} options.userId           — recipient User._id
 * @param {string}  options.notificationType         — e.g. 'application_submitted'
 * @param {string}  options.title                    — short heading
 * @param {string}  [options.message]                — longer description (optional)
 * @param {Object}  [options.relatedEntity]          — { entityType, entityId }
 * @param {'low'|'medium'|'high'} [options.priority] — defaults to 'medium'
 *
 * @returns {Promise<void>}  Resolves silently even on error
 */
const createNotification = async ({
  userId,
  notificationType,
  title,
  message,
  relatedEntity,
  priority = 'medium',
}) => {
  try {
    await Notification.create({
      userId,
      notificationType,
      title,
      message,
      relatedEntity,
      priority,
    });
  } catch (err) {
    // Log but never propagate — notifications are non-critical
    console.warn('⚠️  Failed to create notification:', err.message);
  }
};

module.exports = { createNotification };
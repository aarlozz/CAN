import Notification from "../models/Notification.js";

export const createNotification = async ({
  userId,
  notificationType,
  title,
  message,
  relatedEntity,
  priority = "medium",
}) => {
  try {
    await Notification.create({ userId, notificationType, title, message, relatedEntity, priority });
  } catch (err) {
    console.warn("⚠️  Failed to create notification:", err.message);
  }
};
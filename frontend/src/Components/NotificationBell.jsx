// NotificationBell.jsx
//
// Bell icon + unread badge for the shared Header. Polls the backend every
// 20s so notifications (e.g. "your scholarship was approved") show up
// without a page refresh. Clicking a notification marks it read; there's
// also a "Mark all as read" action.
//
// Exposes onNewNotification(notification) so a page (like the student
// dashboard) can react — e.g. pop up a toast — when a *new* notification
// arrives, without having to run its own separate poller.

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const POLL_INTERVAL_MS = 20000;

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const PRIORITY_DOT = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

export default function NotificationBell({ onNewNotification }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 20 },
      });
      const data = res.data.data || [];
      setNotifications(data);
      setUnreadCount(res.data.unreadCount || 0);

      // Detect brand-new notifications (not seen in a previous poll) so the
      // caller can pop up a toast for them — but skip the very first load,
      // otherwise every existing unread notification would "pop" at once.
      if (!firstLoadRef.current && onNewNotification) {
        for (const n of data) {
          if (!seenIdsRef.current.has(n._id) && !n.isRead) {
            onNewNotification(n);
          }
        }
      }
      seenIdsRef.current = new Set(data.map((n) => n._id));
      firstLoadRef.current = false;
    } catch {
      // Silent — notifications are non-critical, don't disrupt the UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await axios.put(
        `${API}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      // Non-critical — leave optimistic state as-is
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await axios.put(
        `${API}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      // Non-critical
    }
  };

  if (!token) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className={`relative flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
          open
            ? "bg-gray-900 text-white border-gray-900"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-gray-400">Loading…</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-gray-400">
                No notifications yet.
              </div>
            )}

            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 ${
                  n.isRead ? "" : "bg-red-50/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      n.isRead ? "bg-transparent" : PRIORITY_DOT[n.priority] || "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-snug ${
                        n.isRead ? "text-gray-500 font-normal" : "text-gray-900 font-semibold"
                      }`}
                    >
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

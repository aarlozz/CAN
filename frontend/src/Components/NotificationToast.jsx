// NotificationToast.jsx
//
// A prominent, auto-dismissing popup — distinct from the small header bell —
// used specifically to surface high-stakes notifications the moment they
// arrive (e.g. "your scholarship application was approved").

export default function NotificationToast({ notification, onClose }) {
  if (!notification) return null;

  const isApproved = notification.notificationType === "application_approved";
  const isRejected = notification.notificationType === "application_rejected";

  const accent = isApproved
    ? "border-emerald-400 bg-emerald-50"
    : isRejected
      ? "border-red-400 bg-red-50"
      : "border-gray-200 bg-white";

  const iconWrap = isApproved
    ? "bg-emerald-500"
    : isRejected
      ? "bg-red-500"
      : "bg-gray-800";

  return (
    <div className="fixed top-20 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm animate-[slideIn_0.25s_ease-out]">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div className={`flex items-start gap-3 border rounded-xl shadow-lg p-4 ${accent}`}>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${iconWrap}`}>
          {isApproved ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : isRejected ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
          {notification.message && (
            <p className="text-xs text-gray-600 mt-1 leading-snug">{notification.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

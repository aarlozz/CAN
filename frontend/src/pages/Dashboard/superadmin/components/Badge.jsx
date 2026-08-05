import React from "react";

export default function Badge({ status }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    verified: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const normalizedStatus = status?.toLowerCase() || "pending";
  const appliedStyle = styles[normalizedStatus] || styles.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${appliedStyle}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

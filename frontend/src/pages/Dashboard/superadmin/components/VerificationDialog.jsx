import React, { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";

export default function VerificationDialog({ isOpen, onClose, onSubmit, currentStatus }) {
  const [status, setStatus] = useState(currentStatus || "pending");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Business Rule: Rejection requires remarks
    if (status === "rejected" && !remarks.trim()) {
      setError("Remarks are strictly required when rejecting an institution.");
      return;
    }

    setLoading(true);
    const success = await onSubmit({ status, remarks });
    setLoading(false);
    
    if (success) {
      onClose();
    } else {
      setError("Failed to verify institution. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Verify Institution</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Set Verification Status</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  status === "verified" ? "border-green-500 bg-green-50 text-green-700 shadow-sm shadow-green-100" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>
                  <input 
                    type="radio" 
                    name="status" 
                    value="verified" 
                    checked={status === "verified"} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="sr-only"
                  />
                  <CheckCircle size={18} className={status === "verified" ? "text-green-600" : "text-slate-400"} />
                  <span className="font-semibold text-sm">Approve</span>
                </label>

                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  status === "rejected" ? "border-red-500 bg-red-50 text-red-700 shadow-sm shadow-red-100" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>
                  <input 
                    type="radio" 
                    name="status" 
                    value="rejected" 
                    checked={status === "rejected"} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="sr-only"
                  />
                  <XCircle size={18} className={status === "rejected" ? "text-red-600" : "text-slate-400"} />
                  <span className="font-semibold text-sm">Reject</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Remarks / Feedback 
                {status === "rejected" && <span className="text-red-500 ml-1">*</span>}
                {status === "verified" && <span className="text-slate-400 font-normal ml-1">(Optional)</span>}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required={status === "rejected"}
                rows={4}
                placeholder={status === "rejected" ? "Please provide a reason for rejection..." : "Any additional notes..."}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm shadow-red-200 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

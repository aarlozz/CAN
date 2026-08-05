import React, { useState } from "react";
import { X } from "lucide-react";

export default function CreateAdminModal({ isOpen, onClose, onSubmit, provinces }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", assignedProvince: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isSuccess = await onSubmit(form, setSuccess, setError, setLoading);
    if (isSuccess) {
      setTimeout(() => {
        onClose();
        setForm({ name: "", email: "", password: "", assignedProvince: "" });
        setSuccess("");
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Create Province Admin</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 border border-green-100">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                placeholder="admin@province.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Temporary Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Province</label>
              <select
                name="assignedProvince"
                value={form.assignedProvince}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
              >
                <option value="">Select a Province...</option>
                {provinces.map((prov) => (
                  <option key={prov._id} value={prov._id}>
                    {prov.provinceName}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Admin Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
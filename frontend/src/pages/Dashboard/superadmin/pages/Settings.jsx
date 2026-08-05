import React, { useState } from "react";
import axios from "axios";
import { Lock, User as UserIcon } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings({ user }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API}/api/super-admin/settings/password`,
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.message || "Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your administrator account credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Details (Read Only) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><UserIcon size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-900">Admin Profile</h3>
              <p className="text-xs text-slate-500">Your current session details.</p>
            </div>
          </div>
          
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500 mb-1">Full Name</dt>
              <dd className="font-medium text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{user?.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 mb-1">Email Address</dt>
              <dd className="font-medium text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{user?.email || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 mb-1">Role</dt>
              <dd className="font-medium text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 capitalize">{user?.role?.replace("_", " ") || "N/A"}</dd>
            </div>
          </dl>
        </div>

        {/* Password Update */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">Update your security credentials.</p>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-6 border border-green-100">{success}</div>}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm shadow-red-200 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

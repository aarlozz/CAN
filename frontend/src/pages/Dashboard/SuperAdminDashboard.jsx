import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    institutions: 0,
    scholarships: 0,
    applications: 0,
  });
  const [admins, setAdmins] = useState([]);
  const [provinces, setProvinces] = useState([]);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    assignedProvince: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStats();
    fetchAdmins();
    fetchProvinces();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/super-admin/stats`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API}/api/super-admin/province-admins`, { headers });
      setAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await axios.get(`${API}/api/location/provinces`);
      setProvinces(res.data.provinces || []);
    } catch (err) {
      console.error("Failed to fetch provinces", err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${API}/api/super-admin/province-admins/${id}/status`, {}, { headers });
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API}/api/super-admin/province-admins`, form, { headers });
      setSuccess("Province Admin created successfully!");
      setForm({ name: "", email: "", password: "", assignedProvince: "" });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create Province Admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Super Admin Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Students", value: stats.students, color: "bg-blue-100 text-blue-600" },
            { label: "Institutions", value: stats.institutions, color: "bg-green-100 text-green-600" },
            { label: "Scholarships", value: stats.scholarships, color: "bg-purple-100 text-purple-600" },
            { label: "Applications", value: stats.applications, color: "bg-yellow-100 text-yellow-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className={`p-4 rounded-lg ${stat.color} mr-4`}>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Admin Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Province Admin</h2>
              
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
              {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{success}</div>}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    required
                    minLength="6"
                    autoComplete="new-password"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Province</label>
                  <select
                    name="assignedProvince"
                    value={form.assignedProvince}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                  >
                    <option value="">Select a Province...</option>
                    {provinces.map((prov) => (
                      <option key={prov._id} value={prov._id}>
                        {prov.provinceName}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
                >
                  {loading ? "Creating..." : "Create Admin Account"}
                </button>
              </form>
            </div>
          </div>

          {/* Admin List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Province Administrators</h2>
                <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-semibold">
                  {admins.length} Total
                </span>
              </div>
              
              {admins.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No Province Admins have been created yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-4 font-medium">Name / Email</th>
                        <th className="px-6 py-4 font-medium">Province</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{admin.user.name}</div>
                            <div className="text-sm text-gray-500">{admin.user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                              {admin.assignedProvince?.name || admin.assignedProvince?.provinceName || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {admin.isActive ? (
                              <span className="flex items-center text-green-600 text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Active
                              </span>
                            ) : (
                              <span className="flex items-center text-red-600 text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(admin._id)}
                              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                                admin.isActive 
                                  ? "bg-red-50 text-red-600 hover:bg-red-100" 
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              {admin.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

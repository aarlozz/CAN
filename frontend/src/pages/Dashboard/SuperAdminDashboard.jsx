import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./superadmin/layout/AdminLayout";
import DashboardHome from "./superadmin/pages/DashboardHome";
import ProvinceAdmins from "./superadmin/pages/ProvinceAdmins";
import Institutions from "./superadmin/pages/Institutions";
import Scholarships from "./superadmin/pages/Scholarships";
import Applications from "./superadmin/pages/Applications";
import Reports from "./superadmin/pages/Reports";
import Settings from "./superadmin/pages/Settings";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SuperAdminDashboard() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  // User State
  const [user, setUser] = useState(null);

  // Data State
  const [stats, setStats] = useState({
    students: 0,
    institutions: 0,
    scholarships: 0,
    applications: 0,
  });
  
  // These will be passed to ProvinceAdmins in Phase 2
  const [admins, setAdmins] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Attempt to parse user from localStorage
    try {
      const storedUser = JSON.parse(localStorage.getItem("can_user"));
      if (storedUser) setUser(storedUser);
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    }

    // Initial data fetch
    fetchStats();
    fetchAdmins();
    fetchProvinces();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/super-admin/stats`, { headers });
      setStats(res.data);
      if (res.data.adminUser) {
        setUser(res.data.adminUser);
      }
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

  // Controller Handlers (To be passed as props in Phase 2)
  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${API}/api/super-admin/province-admins/${id}/status`, {}, { headers });
      fetchAdmins(); // Refresh data
    } catch (err) {
      // Future: use a toast instead of alert
      alert(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleCreateAdmin = async (form, setSuccess, setError, setLoading) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API}/api/super-admin/province-admins`, form, { headers });
      setSuccess("Province Admin created successfully!");
      fetchAdmins(); // Refresh data
      return true; // Indicate success to the modal
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create Province Admin.");
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  // Router Switch
  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome user={user} stats={stats} setActiveTab={setActiveTab} />;
      case "province-admins":
        return <ProvinceAdmins admins={admins} provinces={provinces} handleToggleStatus={handleToggleStatus} handleCreateAdmin={handleCreateAdmin} />;
      case "institutions":
        return <Institutions provinces={provinces} isSuperAdmin={true} />;
      case "scholarships":
        return <Scholarships />;
      case "applications":
        return <Applications />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings user={user} />;
      default:
        return <DashboardHome user={user} stats={stats} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
      {renderActiveTab()}
    </AdminLayout>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Reports() {
  const [data, setData] = useState({ applications: {}, scholarships: {}, institutions: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/super-admin/reports/detailed`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // Helper to safely sum values
  const sumValues = (obj) => Object.values(obj || {}).reduce((a, b) => a + b, 0);

  const totalApps = sumValues(data.applications);
  const totalScholars = sumValues(data.scholarships);
  const totalInsts = sumValues(data.institutions);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Analytics and demographic aggregations for the CAN platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Applications Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={20} /></div>
            <h3 className="font-bold text-slate-900">Applications by Status</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(data.applications || {}).map(([status, count]) => {
              const percentage = totalApps > 0 ? (count / totalApps) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1 text-slate-600 capitalize">
                    <span>{status.replace("_", " ")}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {totalApps === 0 && <p className="text-sm text-slate-400">No data available.</p>}
          </div>
        </div>

        {/* Scholarships Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><PieChartIcon size={20} /></div>
            <h3 className="font-bold text-slate-900">Scholarships by Type</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(data.scholarships || {}).map(([type, count]) => {
              const percentage = totalScholars > 0 ? (count / totalScholars) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1 text-slate-600 capitalize">
                    <span>{type.replace("_", " ")}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {totalScholars === 0 && <p className="text-sm text-slate-400">No data available.</p>}
          </div>
        </div>

        {/* Institutions Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><BarChart3 size={20} /></div>
            <h3 className="font-bold text-slate-900">Institution Verifications</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(data.institutions || {}).map(([status, count]) => {
              const percentage = totalInsts > 0 ? (count / totalInsts) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1 text-slate-600 capitalize">
                    <span>{status}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {totalInsts === 0 && <p className="text-sm text-slate-400">No data available.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

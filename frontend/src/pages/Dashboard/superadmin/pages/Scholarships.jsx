import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GraduationCap, Search, Filter } from "lucide-react";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Scholarships() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  
  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchScholarships = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/super-admin/scholarships`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
        }
      });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Failed to fetch scholarships", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchScholarships(1);
  }, [fetchScholarships]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.pages) {
      fetchScholarships(newPage);
    }
  };

  const columns = [
    {
      header: "Scholarship Title",
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.scholarshipTitle}</div>
          <div className="text-slate-500 text-xs mt-0.5">{row.institutionName || row.institutionId?.institutionName || "Unknown Institution"}</div>
        </div>
      )
    },
    {
      header: "Coverage",
      cell: (row) => (
        <span className="text-slate-700 text-sm capitalize">
          {row.coverage?.scholarshipType2?.replace("_", " ") || "N/A"}
        </span>
      )
    },
    {
      header: "Seats",
      cell: (row) => (
        <span className="text-slate-700 text-sm">
          {row.remainingSeats} / {row.totalSeats}
        </span>
      )
    },
    {
      header: "Deadline",
      cell: (row) => (
        <span className={`text-sm ${row.isExpired ? "text-red-600 font-medium" : "text-slate-700"}`}>
          {new Date(row.applicationDeadline).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Status",
      cell: (row) => <Badge status={row.isActive ? "active" : "inactive"} />
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scholarships</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of all active and upcoming scholarship programs.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search scholarships..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={data}
        isLoading={loading}
        emptyStateIcon={GraduationCap}
        emptyStateTitle="No Scholarships Found"
        emptyStateMessage="Try adjusting your search or filter criteria."
      />

      <Pagination 
        page={meta.page} 
        pages={meta.pages} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
}

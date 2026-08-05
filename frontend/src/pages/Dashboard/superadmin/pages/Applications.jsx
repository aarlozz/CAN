import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FileText, Search, Filter } from "lucide-react";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Applications() {
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

  const fetchApplications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/super-admin/applications`, {
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
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.pages) {
      fetchApplications(newPage);
    }
  };

  const columns = [
    {
      header: "Applicant Name",
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.studentSnapshot?.fullName || "N/A"}</div>
          <div className="text-slate-500 text-xs mt-0.5">{row.studentSnapshot?.email || "No Email"}</div>
        </div>
      )
    },
    {
      header: "Scholarship",
      cell: (row) => (
        <span className="text-slate-700 text-sm font-medium">
          {row.scholarshipId?.scholarshipTitle || "Unknown Scholarship"}
        </span>
      )
    },
    {
      header: "Type",
      cell: (row) => (
        <span className="text-slate-700 text-sm capitalize bg-slate-100 px-2.5 py-1 rounded-md">
          {row.applicationType}
        </span>
      )
    },
    {
      header: "Applied On",
      cell: (row) => (
        <span className="text-slate-500 text-sm">
          {new Date(row.appliedAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Status",
      cell: (row) => <Badge status={row.applicationStatus} />
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-500 mt-1">Review student applications across all institutions.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by applicant name..."
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
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={data}
        isLoading={loading}
        emptyStateIcon={FileText}
        emptyStateTitle="No Applications Found"
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

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Building2, Search, Filter } from "lucide-react";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import InstitutionDetailsModal from "../components/InstitutionDetailsModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Institutions({ provinces, isSuperAdmin = true }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  
  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  
  const [selectedInst, setSelectedInst] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchInstitutions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Use super-admin or province-admin endpoint based on role. 
      // For this phase, we assume the Super Admin endpoint handles global viewing.
      const endpoint = `${API}/api/super-admin/institutions`; 
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
          provinceId: provinceFilter
        }
      });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Failed to fetch institutions", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, provinceFilter]);

  useEffect(() => {
    fetchInstitutions(1);
  }, [fetchInstitutions]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.pages) {
      fetchInstitutions(newPage);
    }
  };

  const columns = [
    {
      header: "Institution Name",
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.institutionName}</div>
          <div className="text-slate-500 text-xs mt-0.5">{row.user?.email || "No Email"}</div>
        </div>
      )
    },
    {
      header: "Province",
      cell: (row) => (
        <span className="text-slate-700 text-sm">
          {row.location?.provinceRef?.provinceId?.provinceName || "N/A"}
        </span>
      )
    },
    {
      header: "Status",
      cell: (row) => <Badge status={row.verification?.status} />
    },
    {
      header: "Date Applied",
      cell: (row) => (
        <span className="text-slate-500 text-sm">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Action",
      cell: (row) => (
        <button
          onClick={() => setSelectedInst(row)}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institutions Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and verify registered educational institutions.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by institution name..."
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
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none appearance-none shadow-sm cursor-pointer max-w-[200px]"
            >
              <option value="all">All Provinces</option>
              {provinces?.map(p => (
                <option key={p._id} value={p._id}>{p.provinceName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={data}
        isLoading={loading}
        emptyStateIcon={Building2}
        emptyStateTitle="No Institutions Found"
        emptyStateMessage="Try adjusting your search or filter criteria."
      />

      <Pagination 
        page={meta.page} 
        pages={meta.pages} 
        onPageChange={handlePageChange} 
      />

      <InstitutionDetailsModal 
        isOpen={!!selectedInst}
        onClose={() => setSelectedInst(null)}
        institution={selectedInst}
        isSuperAdmin={isSuperAdmin}
        onVerify={() => {}} // Super admin doesn't verify directly here, only Province Admin
      />
    </div>
  );
}

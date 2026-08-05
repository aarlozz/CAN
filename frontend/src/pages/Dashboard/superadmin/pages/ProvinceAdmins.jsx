import React, { useState } from "react";
import { UserPlus, ShieldAlert } from "lucide-react";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import CreateAdminModal from "../components/CreateAdminModal";

export default function ProvinceAdmins({ admins, provinces, handleToggleStatus, handleCreateAdmin }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filter & Pagination Logic (Client-side since admins array is usually small, but built for scale)
  const filteredAdmins = admins.filter((admin) =>
    admin.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const columns = [
    {
      header: "Name & Email",
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.user.name}</div>
          <div className="text-slate-500 text-xs mt-0.5">{row.user.email}</div>
        </div>
      )
    },
    {
      header: "Assigned Province",
      cell: (row) => (
        <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
          {row.assignedProvince?.name || row.assignedProvince?.provinceName || "Unknown"}
        </span>
      )
    },
    {
      header: "Status",
      cell: (row) => <Badge status={row.isActive ? "active" : "inactive"} />
    },
    {
      header: "Action",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            row.isActive 
              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100" 
              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
          }`}
        >
          {row.isActive ? "Deactivate" : "Activate"}
        </button>
      )
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Province Administrators</h1>
          <p className="text-sm text-slate-500 mt-1">Manage regional admin accounts and their access levels.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-red-200"
        >
          <UserPlus size={18} />
          Create Admin
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={paginatedAdmins}
        isLoading={false}
        emptyStateIcon={ShieldAlert}
        emptyStateTitle="No Province Admins Found"
        emptyStateMessage="There are no province administrators matching your current search criteria."
      />

      <Pagination 
        page={page} 
        pages={totalPages} 
        onPageChange={setPage} 
      />

      <CreateAdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAdmin}
        provinces={provinces}
      />
    </div>
  );
}

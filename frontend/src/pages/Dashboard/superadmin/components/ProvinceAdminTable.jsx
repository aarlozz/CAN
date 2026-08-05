import { Search } from "lucide-react";
import DataTable from "./DataTable";

export default function ProvinceAdminTable({
  admins,
}) {
  const columns = [
    {
      key: "name",
      title: "Administrator",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.user.name}
          </p>

          <p className="text-sm text-slate-500">
            {row.user.email}
          </p>
        </div>
      ),
    },

    {
      key: "province",
      title: "Province",
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
          {row.assignedProvince?.provinceName}
        </span>
      ),
    },

    {
      key: "status",
      title: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "action",
      title: "Action",
      render: () => (
        <button className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          View
        </button>
      ),
    },
  ];

  return (
    <section className="mt-12">

      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Province Administrators
          </h2>

          <p className="text-slate-500">
            Manage all province administrators.
          </p>
        </div>

        <div className="flex gap-4">

          {/* Search */}

          <div className="relative">

            <Search
              className="absolute left-3 top-3.5 text-slate-400"
              size={18}
            />

            <input
              placeholder="Search..."
              className="rounded-xl border border-slate-200 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

          </div>

          <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-600">
            {admins.length} Total
          </div>

        </div>

      </div>

      <DataTable
        columns={columns}
        data={admins}
        emptyMessage="No Province Administrators found."
      />

    </section>
  );
}
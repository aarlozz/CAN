import LocationCascade from "../../../../Components/LocationCascade";
import { TYPE_COLORS, STATUS_COLORS } from "../utils/constants";

export default function InstitutionApplicationsTab({
  applications,
  appTotal,
  appPage,
  appPages,
  appLoading,
  appFilters,
  setAppFilters,
  clearAppFilters,
  fetchApplications,
  scholarships,
  setSelectedApp,
  handleReview,
}) {
  const filterInputCls =
    "border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Applications</h2>
        <span className="text-xs text-gray-400">{appTotal} total</span>
      </div>

      {/* ── FILTER BAR ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Search student name…"
            value={appFilters.search}
            onChange={(e) =>
              setAppFilters((f) => ({ ...f, search: e.target.value }))
            }
            className={`${filterInputCls} w-44`}
          />

          <select
            value={appFilters.scholarshipId}
            onChange={(e) =>
              setAppFilters((f) => ({
                ...f,
                scholarshipId: e.target.value,
              }))
            }
            className={filterInputCls}
          >
            <option value="">All Scholarships</option>
            {scholarships.map((s) => (
              <option key={s._id} value={s._id}>
                {s.scholarshipTitle}
              </option>
            ))}
          </select>

          <select
            value={appFilters.scholarshipType}
            onChange={(e) =>
              setAppFilters((f) => ({
                ...f,
                scholarshipType: e.target.value,
              }))
            }
            className={filterInputCls}
          >
            <option value="">All Scholarship Types</option>
            {[
              "full_tuition",
              "partial_tuition",
              "merit_based",
              "need_based",
              "disability",
              "gender",
              "ethnic",
            ].map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={appFilters.applicationType}
            onChange={(e) =>
              setAppFilters((f) => ({
                ...f,
                applicationType: e.target.value,
              }))
            }
            className={filterInputCls}
          >
            <option value="">All Application Types</option>
            <option value="merit">Merit</option>
            <option value="reservation">Reservation</option>
          </select>

          <select
            value={appFilters.status}
            onChange={(e) =>
              setAppFilters((f) => ({ ...f, status: e.target.value }))
            }
            className={filterInputCls}
          >
            <option value="">All Statuses</option>
            {[
              "pending",
              "under_review",
              "approved",
              "rejected",
              "withdrawn",
            ].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={appFilters.gender}
            onChange={(e) =>
              setAppFilters((f) => ({ ...f, gender: e.target.value }))
            }
            className={filterInputCls}
          >
            <option value="">Any Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="number"
            placeholder="Min NPR"
            value={appFilters.minAmount}
            onChange={(e) =>
              setAppFilters((f) => ({
                ...f,
                minAmount: e.target.value,
              }))
            }
            className={`${filterInputCls} w-24`}
          />
          <input
            type="number"
            placeholder="Max NPR"
            value={appFilters.maxAmount}
            onChange={(e) =>
              setAppFilters((f) => ({
                ...f,
                maxAmount: e.target.value,
              }))
            }
            className={`${filterInputCls} w-24`}
          />

          <button
            onClick={clearAppFilters}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Location cascade — Province → District → Municipality */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <LocationCascade
            idMode="name"
            province={appFilters.province}
            district={appFilters.district}
            municipality={appFilters.municipality}
            onChange={({ province, district, municipality }) =>
              setAppFilters((f) => ({
                ...f,
                province,
                district,
                municipality,
              }))
            }
            gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-3"
          />
        </div>
      </div>

      {appLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">📨</div>
          <p className="font-medium">No applications match these filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Student
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Scholarship
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 text-sm">
                          {app.studentSnapshot?.fullName || "—"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {app.studentSnapshot?.location?.district}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px] truncate">
                        {app.scholarship?.scholarshipTitle || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            TYPE_COLORS[app.applicationType] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {app.applicationType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            STATUS_COLORS[app.applicationStatus] ||
                            "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-[10px] px-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium w-max border border-indigo-100 transition-colors shadow-sm cursor-pointer"
                          >
                            View Details
                          </button>
                          {app.applicationStatus === "pending" && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() =>
                                  handleReview(app._id, "approved")
                                }
                                className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium border border-green-100 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(app._id, "under_review")
                                }
                                className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium border border-blue-100 cursor-pointer"
                              >
                                Review
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(app._id, "rejected")
                                }
                                className="text-[10px] px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium border border-red-100 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {app.applicationStatus === "under_review" && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() =>
                                  handleReview(app._id, "approved")
                                }
                                className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium border border-green-100 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(app._id, "rejected")
                                }
                                className="text-[10px] px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium border border-red-100 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── PAGINATION ──────────────────────────────────────────── */}
          {appPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                disabled={appPage <= 1}
                onClick={() => fetchApplications(appFilters, appPage - 1)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-gray-400">
                Page {appPage} of {appPages}
              </span>
              <button
                disabled={appPage >= appPages}
                onClick={() => fetchApplications(appFilters, appPage + 1)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

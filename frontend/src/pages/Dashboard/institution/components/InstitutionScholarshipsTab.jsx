import { Link } from "react-router-dom";
import ScholarshipFormWizard from "../../../../Components/scholarshipformwizard";
import { TYPE_COLORS, STATUS_COLORS, SeatsBar } from "../utils/constants";

export default function InstitutionScholarshipsTab({
  scholarships,
  showScholarshipForm,
  form,
  setForm,
  set,
  setCoverageField,
  setAcademicField,
  editingId,
  schError,
  schLoading,
  openCreateForm,
  openEditForm,
  handleDeleteScholarship,
  handleScholarshipSubmit,
  closeForm,
  inputCls,
  labelCls,
}) {
  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Scholarships</h2>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <span className="text-lg leading-none">+</span>
          Post Scholarship
        </button>
      </div>

      {/* ── CREATE / EDIT WIZARD ───────────────────────────────────── */}
      {showScholarshipForm && (
        <ScholarshipFormWizard
          form={form}
          setForm={setForm}
          set={set}
          setCoverageField={setCoverageField}
          setAcademicField={setAcademicField}
          editingId={editingId}
          schError={schError}
          schLoading={schLoading}
          onSubmit={handleScholarshipSubmit}
          onCancel={closeForm}
          inputCls={inputCls}
          labelCls={labelCls}
        />
      )}

      {/* ── CARD GRID ──────────────────────────────────────────────── */}
      {scholarships.length === 0 && !showScholarshipForm ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium">No scholarships posted yet</p>
          <p className="text-sm mt-1">
            Click "+ Post Scholarship" to create your first one.
          </p>
        </div>
      ) : (
        <>
          {scholarships.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scholarships.map((s) => (
                  <div
                    key={s._id}
                    className={`bg-white rounded-xl border shadow-sm p-5 hover:border-gray-200 transition-colors ${
                      editingId === s._id
                        ? "border-amber-300 ring-1 ring-amber-200"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                        {s.scholarshipTitle}
                      </h4>
                      {s.coverage?.scholarshipType2 && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            TYPE_COLORS[s.coverage.scholarshipType2] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s.coverage.scholarshipType2.replace("_", " ")}
                        </span>
                      )}
                      {s.verification?.status && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase ${
                            STATUS_COLORS[s.verification.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s.verification.status.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                    <div className="space-y-1.5 mb-4">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>📅</span>
                        {new Date(s.applicationDeadline).toLocaleDateString(
                          "en-NP",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                      {s.coverage?.amountNpr > 0 && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span>💰</span> NPR{" "}
                          {s.coverage.amountNpr.toLocaleString()}
                        </p>
                      )}
                      {s.coverage?.percentage > 0 && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span>📊</span> {s.coverage.percentage}% coverage
                        </p>
                      )}
                      {s.coverage?.totalProgramFeeNpr > 0 && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span>🎓</span> Fee: NPR{" "}
                          {s.coverage.totalProgramFeeNpr.toLocaleString()}
                        </p>
                      )}
                      {s.totalSeats > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">🪑</span>
                          <SeatsBar
                            remaining={s.remainingSeats}
                            total={s.totalSeats}
                          />
                        </div>
                      )}
                      {s.eligibilityCriteria?.targetLevel && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span>🎓</span>{" "}
                          {s.eligibilityCriteria.targetLevel.replace("_", " ")}
                        </p>
                      )}
                      {(s.eligibilityCriteria?.minGPA != null ||
                        s.eligibilityCriteria?.minPercentage != null) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span>📈</span>{" "}
                          {s.eligibilityCriteria.minGPA != null
                            ? `Min GPA ${s.eligibilityCriteria.minGPA}`
                            : `Min ${s.eligibilityCriteria.minPercentage}%`}
                        </p>
                      )}
                      {s.eligibilityCriteria?.ethnicCategory &&
                        s.eligibilityCriteria.ethnicCategory !== "any" && (
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 capitalize">
                            <span>🏷️</span>{" "}
                            {s.eligibilityCriteria.ethnicCategory.replace(
                              "_",
                              " "
                            )}
                          </p>
                        )}
                      {s.eligibilityCriteria?.entranceExamName && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span>📝</span>{" "}
                          {s.eligibilityCriteria.entranceExamName}
                          {s.eligibilityCriteria.minEntranceScore != null &&
                            ` ≥ ${s.eligibilityCriteria.minEntranceScore}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>📝</span>{" "}
                        {s.statistics?.totalApplications || 0} applications
                      </p>
                    </div>
                    {/* Card action buttons: View, Edit, Delete */}
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <Link
                        to={`/scholarships/${s._id}`}
                        className="flex-1 text-center text-xs font-medium py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => openEditForm(s)}
                        className="flex-1 text-xs font-medium py-1.5 border border-amber-100 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteScholarship(s._id)}
                        className="flex-1 text-xs font-medium py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── TABLE ───────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">
                    All Scholarships
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          Title
                        </th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          Type
                        </th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          Deadline
                        </th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          Seats
                        </th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          Applications
                        </th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {scholarships.map((s) => (
                        <tr
                          key={s._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            editingId === s._id ? "bg-amber-50" : ""
                          }`}
                        >
                          <td className="px-5 py-3 font-medium text-gray-900 text-sm">
                            {s.scholarshipTitle}
                          </td>
                          <td className="px-4 py-3">
                            {s.coverage?.scholarshipType2 ? (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  TYPE_COLORS[s.coverage.scholarshipType2] ||
                                  "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {s.coverage.scholarshipType2.replace("_", " ")}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(s.applicationDeadline).toLocaleDateString(
                              "en-NP",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <SeatsBar
                              remaining={s.remainingSeats}
                              total={s.totalSeats}
                            />
                          </td>
                          <td className="px-4 py-3">
                            {s.verification?.status ? (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                                  STATUS_COLORS[s.verification.status] ||
                                  "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {s.verification.status.replace("_", " ")}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {s.statistics?.totalApplications || 0}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end">
                              <Link
                                to={`/scholarships/${s._id}`}
                                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => openEditForm(s)}
                                className="text-xs text-amber-500 hover:text-amber-700 font-medium cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteScholarship(s._id)}
                                className="text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

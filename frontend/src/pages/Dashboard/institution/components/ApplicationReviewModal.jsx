import { STATUS_COLORS, TYPE_COLORS } from "../utils/constants";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ApplicationReviewModal({
  selectedApp,
  setSelectedApp,
  handleReview,
}) {
  if (!selectedApp) return null;

  const app = selectedApp;
  const snapshot = app.studentSnapshot || {};
  const merit = app.meritDetails || {};
  const academics = merit.academicRecords || {};
  const reservation = app.reservationDetails || {};
  const docs = app.documents || [];

  const handleAction = async (status) => {
    await handleReview(app._id, status);
    setSelectedApp((prev) => (prev ? { ...prev, applicationStatus: status } : null));
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6"
      onClick={() => setSelectedApp(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                Application Review
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  STATUS_COLORS[app.applicationStatus] || "bg-gray-100 text-gray-700"
                }`}
              >
                {app.applicationStatus.replace("_", " ")}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  TYPE_COLORS[app.applicationType] || "bg-gray-100 text-gray-600"
                }`}
              >
                {app.applicationType}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Applied for:{" "}
              <span className="font-semibold text-gray-800">
                {app.scholarship?.scholarshipTitle || "Scholarship"}
              </span>{" "}
              ·{" "}
              {new Date(app.createdAt || app.appliedAt || Date.now()).toLocaleDateString(
                "en-NP",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )}
            </p>
          </div>
          <button
            onClick={() => setSelectedApp(null)}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm divide-y divide-gray-100">
          {/* 1. Student Personal Information */}
          <section className="space-y-3">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <span>👤</span> Student Snapshot
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-[11px] text-gray-400">Full Name</p>
                <p className="font-semibold text-gray-900">{snapshot.fullName || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Email</p>
                <p className="font-medium text-gray-700 break-all">{snapshot.email || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Phone</p>
                <p className="font-medium text-gray-700">{snapshot.phone || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Gender</p>
                <p className="font-medium text-gray-700">{snapshot.gender || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Date of Birth</p>
                <p className="font-medium text-gray-700">
                  {snapshot.dateOfBirth
                    ? new Date(snapshot.dateOfBirth).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Location</p>
                <p className="font-medium text-gray-700">
                  {[
                    snapshot.location?.municipality,
                    snapshot.location?.district,
                    snapshot.location?.province,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            </div>

            {/* Guardian Info */}
            {snapshot.guardianInfo && (
              <div className="grid grid-cols-3 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400">Guardian Name</p>
                  <p className="font-medium text-gray-800">
                    {snapshot.guardianInfo.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Relation</p>
                  <p className="font-medium text-gray-800">
                    {snapshot.guardianInfo.relation || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Guardian Contact</p>
                  <p className="font-medium text-gray-800">
                    {snapshot.guardianInfo.phone || "—"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* 2. Education & Academic Records */}
          <section className="pt-5 space-y-3">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <span>🎓</span> Academic & Merit Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SEE / SLC */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="font-semibold text-xs text-gray-700 mb-2 border-b border-gray-200/60 pb-1">
                  Secondary (SLC / SEE)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">GPA / %</span>
                    <span className="font-medium text-gray-800">
                      {academics.slcGpa ? `GPA ${academics.slcGpa}` : academics.slcPercentage ? `${academics.slcPercentage}%` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Board & Year</span>
                    <span className="font-medium text-gray-800">
                      {academics.slcBoard || "—"} {academics.slcYear ? `(${academics.slcYear})` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* +2 / Higher Secondary */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="font-semibold text-xs text-gray-700 mb-2 border-b border-gray-200/60 pb-1">
                  Higher Secondary (+2 / Diploma)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">GPA / %</span>
                    <span className="font-medium text-gray-800">
                      {academics.plus2Gpa ? `GPA ${academics.plus2Gpa}` : academics.plus2Percentage ? `${academics.plus2Percentage}%` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Stream & Year</span>
                    <span className="font-medium text-gray-800">
                      {academics.plus2Stream || academics.plus2Board || "—"}{" "}
                      {academics.plus2Year ? `(${academics.plus2Year})` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entrance Score & Extracurriculars */}
            {(academics.entranceName || academics.entranceScore != null || merit.achievements) && (
              <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-100/60 space-y-2 text-xs">
                {academics.entranceName && (
                  <div>
                    <span className="font-medium text-gray-700">Entrance Exam: </span>
                    <span className="text-gray-900 font-semibold">
                      {academics.entranceName} (Score: {academics.entranceScore ?? "N/A"})
                    </span>
                  </div>
                )}
                {merit.achievements && (
                  <div>
                    <span className="font-medium text-gray-700 block text-[11px]">Achievements / Honors:</span>
                    <p className="text-gray-600 mt-0.5">{merit.achievements}</p>
                  </div>
                )}
                {merit.extraCurricular && (
                  <div>
                    <span className="font-medium text-gray-700 block text-[11px]">Extra-Curricular:</span>
                    <p className="text-gray-600 mt-0.5">{merit.extraCurricular}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 3. Reservation Details (if applicable) */}
          {(app.applicationType === "reservation" || reservation.reservationCategory) && (
            <section className="pt-5 space-y-3">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <span>🏷️</span> Reservation Category Details
              </h4>
              <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-400 block text-[10px]">Category</span>
                  <span className="font-semibold text-purple-900 capitalize">
                    {reservation.reservationCategory?.replace("_", " ") || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Caste / Ethnicity</span>
                  <span className="font-medium text-gray-800">{reservation.caste || snapshot.reservationInfo?.caste || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">School Type</span>
                  <span className="font-medium text-gray-800">{reservation.schoolType || snapshot.educationInfo?.schoolType || "—"}</span>
                </div>
                {reservation.disabilityType && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">Disability Type</span>
                    <span className="font-medium text-gray-800">{reservation.disabilityType}</span>
                  </div>
                )}
                {reservation.supportingDetails && (
                  <div className="col-span-full">
                    <span className="text-gray-400 block text-[10px]">Additional Notes</span>
                    <p className="text-gray-700 mt-0.5">{reservation.supportingDetails}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 4. Submitted Documents */}
          <section className="pt-5 space-y-3">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <span>📁</span> Uploaded Documents ({docs.length})
            </h4>
            {docs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No documents attached.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {docs.map((doc, idx) => {
                  const fileUrl = doc.filePath?.startsWith("http")
                    ? doc.filePath
                    : `${API}/${doc.filePath?.replace(/^(\.?\/)?/, "")}`;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-xs text-gray-800 truncate capitalize">
                          {doc.documentType?.replace("_", " ") || doc.documentTitle || "Document"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {doc.fileName || "File"} {doc.fileSize ? `· ${(doc.fileSize / 1024).toFixed(0)} KB` : ""}
                        </p>
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors shrink-0"
                      >
                        View ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={() => setSelectedApp(null)}
            className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("under_review")}
              disabled={app.applicationStatus === "under_review"}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Mark Under Review
            </button>
            <button
              onClick={() => handleAction("rejected")}
              disabled={app.applicationStatus === "rejected"}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction("approved")}
              disabled={app.applicationStatus === "approved"}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Approve Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

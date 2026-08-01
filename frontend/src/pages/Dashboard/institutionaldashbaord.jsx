import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 mb-3">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-gray-800 text-xs">{value}</span>
    </div>
  );
}

function ExpandSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-medium transition-colors"
      >
        <span>{title}</span>
        <span
          className="text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          ›
        </span>
      </button>
      {open && (
        <div className="px-3 pt-3 pb-1 bg-gray-50 rounded-b-lg mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

const TYPE_COLORS = {
  merit: "bg-blue-50 text-blue-700",
  reservation: "bg-purple-50 text-purple-700",
  both: "bg-green-50 text-green-700",
  full_tuition: "bg-teal-50 text-teal-700",
  partial_tuition: "bg-cyan-50 text-cyan-700",
  merit_based: "bg-blue-50 text-blue-700",
  need_based: "bg-orange-50 text-orange-700",
  disability: "bg-purple-50 text-purple-700",
  gender: "bg-pink-50 text-pink-700",
  ethnic: "bg-yellow-50 text-yellow-700",
};

const STATUS_COLORS = {
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  under_review: "bg-blue-50 text-blue-700",
  withdrawn: "bg-gray-100 text-gray-500",
  pending: "bg-yellow-50 text-yellow-700",
};

const LEVEL_COLORS = {
  school: "bg-green-50 text-green-700",
  plus_two: "bg-blue-50 text-blue-700",
  bachelors: "bg-purple-50 text-purple-700",
  masters: "bg-orange-50 text-orange-700",
  phd: "bg-red-50 text-red-700",
  diploma: "bg-yellow-50 text-yellow-700",
};

const EMPTY_FORM = {
  scholarshipTitle: "",
  description: "",
  termsAndConditions: "",
  applicationDeadline: "",
  scholarshipType2: "",
  amountNpr: "",
  percentage: "",
  targetLevel: "",
  targetFaculty: "",
  subject: "",
  gender: "any",
  isNepali: true,
  hasDisability: false,
  additionalRequirements: "",
  requiredDocuments: "",
  totalSeats: "",
  remainingSeats: "",
  provinceName: "",
  districtName: "",
  municipalityName: "",
};

const EMPTY_COURSE = {
  courseName: "",
  level: "",
  duration: "",
  description: "",
  faculty: "",
  seats: "",
  isActive: true,
};

function scholarshipToForm(s) {
  return {
    scholarshipTitle: s.scholarshipTitle || "",
    description: s.description || "",
    termsAndConditions: s.termsAndConditions || "",
    applicationDeadline: s.applicationDeadline
      ? new Date(s.applicationDeadline).toISOString().split("T")[0]
      : "",
    scholarshipType2: s.coverage?.scholarshipType2 || "",
    amountNpr:
      s.coverage?.amountNpr != null ? String(s.coverage.amountNpr) : "",
    percentage:
      s.coverage?.percentage != null ? String(s.coverage.percentage) : "",
    targetLevel: s.eligibilityCriteria?.targetLevel || "",
    targetFaculty: s.eligibilityCriteria?.targetFaculty || "",
    subject: s.eligibilityCriteria?.subject || "",
    gender: s.eligibilityCriteria?.gender || "any",
    isNepali: s.eligibilityCriteria?.isNepali ?? true,
    hasDisability: s.eligibilityCriteria?.hasDisability ?? false,
    additionalRequirements: s.eligibilityCriteria?.additionalRequirements || "",
    requiredDocuments: Array.isArray(s.eligibilityCriteria?.requiredDocuments)
      ? s.eligibilityCriteria.requiredDocuments.join(", ")
      : "",
    totalSeats: s.totalSeats != null ? String(s.totalSeats) : "",
    remainingSeats: s.remainingSeats != null ? String(s.remainingSeats) : "",
    provinceName: s.locationFilter?.province?.provinceName || "",
    districtName: s.locationFilter?.district?.districtName || "",
    municipalityName: s.locationFilter?.municipality?.municipalityName || "",
  };
}

// ─── Seats progress bar ───────────────────────────────────────────────────────

function SeatsBar({ remaining, total }) {
  if (!total) return <span className="text-xs text-gray-400">—</span>;
  const pct = Math.round(((remaining ?? total) / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {remaining ?? total}/{total}
      </span>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 mt-6 first:mt-0">
      {children}
    </p>
  );
}

// ─── Profile Tab Component ────────────────────────────────────────────────────

function ProfileTab({ data, token }) {
  const [description, setDescription] = useState(data?.description || "");
  const [descLoading, setDescLoading] = useState(false);
  const [descSuccess, setDescSuccess] = useState("");
  const [descError, setDescError] = useState("");

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  // Load courses
  useEffect(() => {
    axios
      .get(`${API}/api/institution/courses`, { headers })
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  // Save description
  const handleSaveDescription = async () => {
    setDescLoading(true);
    setDescError("");
    setDescSuccess("");
    try {
      await axios.patch(
        `${API}/api/institution/profile/description`,
        { description },
        { headers },
      );
      setDescSuccess("Description saved successfully!");
      setTimeout(() => setDescSuccess(""), 3000);
    } catch (err) {
      setDescError(
        err.response?.data?.message || "Failed to save description.",
      );
    } finally {
      setDescLoading(false);
    }
  };

  // Open course form
  const openCreateCourse = () => {
    setEditingCourseId(null);
    setCourseForm(EMPTY_COURSE);
    setCourseError("");
    setShowCourseForm(true);
  };

  const openEditCourse = (course) => {
    setEditingCourseId(course._id);
    setCourseForm({
      courseName: course.courseName || "",
      level: course.level || "",
      duration: course.duration != null ? String(course.duration) : "",
      description: course.description || "",
      faculty: course.faculty || "",
      seats: course.seats != null ? String(course.seats) : "",
      isActive: course.isActive ?? true,
    });
    setCourseError("");
    setShowCourseForm(true);
  };

  const closeCourseForm = () => {
    setShowCourseForm(false);
    setEditingCourseId(null);
    setCourseForm(EMPTY_COURSE);
    setCourseError("");
  };

  const setField = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setCourseForm((f) => ({ ...f, [field]: val }));
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setCourseError("");
    setCourseLoading(true);
    const payload = {
      courseName: courseForm.courseName,
      level: courseForm.level,
      duration: courseForm.duration ? Number(courseForm.duration) : undefined,
      description: courseForm.description || undefined,
      faculty: courseForm.faculty || undefined,
      seats: courseForm.seats ? Number(courseForm.seats) : undefined,
      isActive: courseForm.isActive,
    };
    try {
      if (editingCourseId) {
        const res = await axios.put(
          `${API}/api/institution/courses/${editingCourseId}`,
          payload,
          { headers },
        );
        setCourses((prev) =>
          prev.map((c) => (c._id === editingCourseId ? res.data.course : c)),
        );
      } else {
        const res = await axios.post(
          `${API}/api/institution/courses`,
          payload,
          {
            headers,
          },
        );
        setCourses((prev) => [res.data.course, ...prev]);
      }
      closeCourseForm();
    } catch (err) {
      setCourseError(
        err.response?.data?.message ||
          (editingCourseId
            ? "Failed to update course."
            : "Failed to add course."),
      );
    } finally {
      setCourseLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await axios.delete(`${API}/api/institution/courses/${id}`, { headers });
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  const loc = data?.location || {};
  const contact = data?.contactPerson || {};

  return (
    <div className="space-y-6">
      {/* ── Institution Info Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-base font-bold text-blue-700">
            {(data?.institutionName || "IN")
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              {data?.institutionName}
            </h3>
            <p className="text-[10px] text-gray-400">
              {data?.institutionType} · Est. {data?.establishedYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
          {/* Location */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Location
            </p>
            {loc.street && <InfoRow label="Street" value={loc.street} />}
            {loc.ward && <InfoRow label="Ward" value={`Ward ${loc.ward}`} />}
            {loc.municipality && (
              <InfoRow label="Municipality" value={loc.municipality} />
            )}
            {loc.district && <InfoRow label="District" value={loc.district} />}
            {loc.province && <InfoRow label="Province" value={loc.province} />}
            {data?.website && <InfoRow label="Website" value={data.website} />}
          </div>

          {/* Contact Person */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Contact Person
            </p>
            {contact.name ? (
              <>
                <InfoRow label="Name" value={contact.name} />
                <InfoRow label="Designation" value={contact.designation} />
                <InfoRow label="Phone" value={contact.phone} />
                <InfoRow label="Email" value={contact.email} />
              </>
            ) : (
              <p className="text-xs text-gray-400">No contact person added.</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Quick Stats
            </p>
            <InfoRow label="Total Courses" value={String(courses.length)} />
            <InfoRow
              label="Active Courses"
              value={String(courses.filter((c) => c.isActive).length)}
            />
          </div>
        </div>
      </div>

      {/* ── Description Editor ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Institution Description
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              This will be visible to students browsing your profile.
            </p>
          </div>
        </div>

        {descError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {descError}
          </div>
        )}
        {descSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span>✓</span> {descSuccess}
          </div>
        )}

        <textarea
          className={inputCls + " resize-none"}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your institution — history, vision, achievements, facilities..."
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSaveDescription}
            disabled={descLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {descLoading ? "Saving…" : "Save Description"}
          </button>
        </div>
      </div>

      {/* ── Courses Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Courses Offered</h2>
          <button
            onClick={openCreateCourse}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            Add Course
          </button>
        </div>

        {/* Course Form */}
        {showCourseForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingCourseId ? "Edit Course" : "Add New Course"}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Fields marked <span className="text-red-400">*</span> are
                  required.
                </p>
              </div>
              {editingCourseId && (
                <span className="text-[10px] font-semibold px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full">
                  ✏️ Editing
                </span>
              )}
            </div>

            {courseError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {courseError}
              </div>
            )}

            <form onSubmit={handleCourseSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>
                    Course Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputCls}
                    required
                    value={courseForm.courseName}
                    onChange={setField("courseName")}
                    placeholder="e.g. Bachelor of Computer Engineering"
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    className={inputCls}
                    required
                    value={courseForm.level}
                    onChange={setField("level")}
                  >
                    <option value="">— Select level —</option>
                    <option value="school">School</option>
                    <option value="plus_two">Plus Two</option>
                    <option value="bachelors">Bachelors</option>
                    <option value="masters">Masters</option>
                    <option value="phd">PhD</option>
                    <option value="diploma">Diploma</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Faculty / Stream</label>
                  <input
                    className={inputCls}
                    value={courseForm.faculty}
                    onChange={setField("faculty")}
                    placeholder="e.g. Science & Technology"
                  />
                </div>
                <div>
                  <label className={labelCls}>Duration (years)</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    step="0.5"
                    value={courseForm.duration}
                    onChange={setField("duration")}
                    placeholder="e.g. 4"
                  />
                </div>
                <div>
                  <label className={labelCls}>Total Seats</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="1"
                    value={courseForm.seats}
                    onChange={setField("seats")}
                    placeholder="e.g. 60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    value={courseForm.description}
                    onChange={setField("description")}
                    placeholder="Brief overview of the course..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={courseForm.isActive}
                    onChange={setField("isActive")}
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Course is currently active / accepting students
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeCourseForm}
                  className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseLoading}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {courseLoading
                    ? editingCourseId
                      ? "Saving…"
                      : "Adding…"
                    : editingCourseId
                      ? "Save Changes"
                      : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses Grid */}
        {coursesLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full" />
          </div>
        ) : courses.length === 0 && !showCourseForm ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📚</div>
            <p className="font-medium">No courses added yet</p>
            <p className="text-sm mt-1">
              Click "+ Add Course" to list the courses you offer.
            </p>
          </div>
        ) : (
          courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className={`bg-white rounded-xl border shadow-sm p-5 transition-colors ${
                    editingCourseId === course._id
                      ? "border-amber-300 ring-1 ring-amber-200"
                      : "border-gray-100 hover:border-gray-200"
                  } ${!course.isActive ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                      {course.courseName}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        LEVEL_COLORS[course.level] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.level?.replace("_", " ")}
                    </span>
                  </div>

                  {course.faculty && (
                    <p className="text-[11px] text-gray-400 mb-2">
                      {course.faculty}
                    </p>
                  )}

                  {course.description && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}

                  <div className="space-y-1 mb-4">
                    {course.duration && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>⏱</span> {course.duration} year
                        {course.duration !== 1 ? "s" : ""}
                      </p>
                    )}
                    {course.seats && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>🪑</span> {course.seats} seats
                      </p>
                    )}
                    <p className="text-xs flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          course.isActive ? "bg-green-400" : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={
                          course.isActive ? "text-green-600" : "text-gray-400"
                        }
                      >
                        {course.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => openEditCourse(course)}
                      className="flex-1 text-xs font-medium py-1.5 border border-amber-100 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="flex-1 text-xs font-medium py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InstitutionalDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("scholarships");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [schLoading, setSchLoading] = useState(false);
  const [schError, setSchError] = useState("");

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const profileReq = axios
      .get(`${API}/api/institution/dashboard-institution`, { headers })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else
          setError(err.response?.data?.message || "Failed to load dashboard.");
      });

    const scholarshipReq = axios
      .get(`${API}/api/scholarship/my`, { headers })
      .then((res) => setScholarships(res.data.scholarships || []))
      .catch(() => setScholarships([]));

    const applicationReq = axios
      .get(`${API}/api/application/institution`, { headers })
      .then((res) => setApplications(res.data.applications || []))
      .catch(() => setApplications([]));

    Promise.all([profileReq, scholarshipReq, applicationReq]).finally(() =>
      setLoading(false),
    );
  }, [navigate, token]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchError("");
    setShowScholarshipForm(true);
  };

  const openEditForm = (scholarship) => {
    setEditingId(scholarship._id);
    setForm(scholarshipToForm(scholarship));
    setSchError("");
    setShowScholarshipForm(true);
    setTimeout(() => {
      document
        .getElementById("scholarship-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const closeForm = () => {
    setShowScholarshipForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchError("");
  };

  const set = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const buildPayload = () => ({
    scholarshipTitle: form.scholarshipTitle,
    description: form.description || undefined,
    termsAndConditions: form.termsAndConditions || undefined,
    applicationDeadline: form.applicationDeadline,
    coverage: {
      scholarshipType2: form.scholarshipType2 || undefined,
      amountNpr: form.amountNpr ? Number(form.amountNpr) : undefined,
      percentage: form.percentage ? Number(form.percentage) : undefined,
    },
    eligibilityCriteria: {
      targetLevel: form.targetLevel || undefined,
      targetFaculty: form.targetFaculty || undefined,
      subject: form.subject || undefined,
      gender: form.gender,
      isNepali: form.isNepali,
      hasDisability: form.hasDisability,
      additionalRequirements: form.additionalRequirements || undefined,
      requiredDocuments: form.requiredDocuments
        ? form.requiredDocuments
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    },
    totalSeats: form.totalSeats ? Number(form.totalSeats) : undefined,
    remainingSeats: form.remainingSeats
      ? Number(form.remainingSeats)
      : undefined,
    locationFilter: {
      province: form.provinceName
        ? { provinceName: form.provinceName }
        : undefined,
      district: form.districtName
        ? { districtName: form.districtName }
        : undefined,
      municipality: form.municipalityName
        ? { municipalityName: form.municipalityName }
        : undefined,
    },
  });

  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    setSchError("");
    if (form.remainingSeats !== "" && form.totalSeats !== "") {
      if (Number(form.remainingSeats) > Number(form.totalSeats)) {
        setSchError("Remaining seats cannot exceed total seats.");
        return;
      }
    }
    setSchLoading(true);
    try {
      const payload = buildPayload();
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        const res = await axios.put(
          `${API}/api/scholarship/${editingId}`,
          payload,
          { headers },
        );
        const updated = res.data.scholarship;
        setScholarships((prev) =>
          prev.map((s) => (s._id === editingId ? updated : s)),
        );
      } else {
        const res = await axios.post(`${API}/api/scholarship/create`, payload, {
          headers,
        });
        setScholarships((prev) => [res.data.scholarship, ...prev]);
      }

      closeForm();
    } catch (err) {
      setSchError(
        err.response?.data?.message ||
          (editingId
            ? "Failed to update scholarship."
            : "Failed to create scholarship."),
      );
    } finally {
      setSchLoading(false);
    }
  };

  const handleDeleteScholarship = async (id) => {
    if (!window.confirm("Delete this scholarship?")) return;
    try {
      await axios.delete(`${API}/api/scholarship/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScholarships((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  const handleReview = async (appId, status) => {
    try {
      await axios.patch(
        `${API}/api/application/${appId}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, applicationStatus: status } : a,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600"
          >
            Back to Login
          </button>
        </div>
      </>
    );

  const loc = data?.location || {};
  const user = data?.user || {};
  const initials = (data?.institutionName || "IN")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const pendingCount = applications.filter(
    (a) => a.applicationStatus === "pending",
  ).length;
  const approvedCount = applications.filter(
    (a) => a.applicationStatus === "approved",
  ).length;

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left – institution identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {data?.institutionName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {data?.institutionType} · {loc.district}, {loc.province}
              </p>
            </div>
          </div>

          {/* Center – tabs (now 3) */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
            {["scholarships", "applications", "profile"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  // close sidebar when switching to profile tab
                  if (t === "profile") setSidebarOpen(false);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
                {t === "applications" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right – profile toggle + logout */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Profile button now switches to profile tab */}
            <button
              onClick={() => {
                setTab("profile");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                tab === "profile"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        <main className="flex-1 min-w-0 space-y-6">
          {/* Stats row — hidden on profile tab */}
          {tab !== "profile" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Scholarships",
                  value: scholarships.length,
                  accent: true,
                },
                { label: "Applications", value: applications.length },
                { label: "Pending", value: pendingCount },
                { label: "Approved", value: approvedCount },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
                >
                  <p
                    className={`text-2xl font-bold ${accent ? "text-blue-600" : "text-gray-800"}`}
                  >
                    {value}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── SCHOLARSHIPS TAB ── */}
          {tab === "scholarships" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Scholarships
                </h2>
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <span className="text-lg leading-none">+</span>
                  Post Scholarship
                </button>
              </div>

              {showScholarshipForm && (
                <div
                  id="scholarship-form"
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {editingId ? "Edit Scholarship" : "New Scholarship"}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Fields marked <span className="text-red-400">*</span>{" "}
                        are required.
                      </p>
                    </div>
                    {editingId && (
                      <span className="text-[10px] font-semibold px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full">
                        ✏️ Editing
                      </span>
                    )}
                  </div>

                  {schError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 mt-4">
                      {schError}
                    </div>
                  )}

                  <form onSubmit={handleScholarshipSubmit}>
                    <SectionHeading>Core Details</SectionHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          Scholarship Title{" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <input
                          className={inputCls}
                          required
                          value={form.scholarshipTitle}
                          onChange={set("scholarshipTitle")}
                          placeholder="e.g. Merit Scholarship 2025"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Description</label>
                        <textarea
                          className={inputCls + " resize-none"}
                          rows={3}
                          value={form.description}
                          onChange={set("description")}
                          placeholder="Describe the scholarship and its purpose..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Terms & Conditions</label>
                        <textarea
                          className={inputCls + " resize-none"}
                          rows={3}
                          value={form.termsAndConditions}
                          onChange={set("termsAndConditions")}
                          placeholder="Any terms and conditions applicants should be aware of..."
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Application Deadline{" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <input
                          className={inputCls}
                          type="date"
                          required
                          value={form.applicationDeadline}
                          onChange={set("applicationDeadline")}
                        />
                      </div>
                    </div>

                    <SectionHeading>Coverage</SectionHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Scholarship Type</label>
                        <select
                          className={inputCls}
                          value={form.scholarshipType2}
                          onChange={set("scholarshipType2")}
                        >
                          <option value="">— Select type —</option>
                          <option value="full_tuition">Full Tuition</option>
                          <option value="partial_tuition">
                            Partial Tuition
                          </option>
                          <option value="merit_based">Merit Based</option>
                          <option value="need_based">Need Based</option>
                          <option value="disability">Disability</option>
                          <option value="gender">Gender</option>
                          <option value="ethnic">Ethnic</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Amount (NPR)</label>
                        <input
                          className={inputCls}
                          type="number"
                          min="0"
                          value={form.amountNpr}
                          onChange={set("amountNpr")}
                          placeholder="e.g. 50000"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Coverage Percentage (%)
                        </label>
                        <input
                          className={inputCls}
                          type="number"
                          min="0"
                          max="100"
                          value={form.percentage}
                          onChange={set("percentage")}
                          placeholder="e.g. 100"
                        />
                      </div>
                    </div>

                    <SectionHeading>Seats</SectionHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Total Seats</label>
                        <input
                          className={inputCls}
                          type="number"
                          min="1"
                          value={form.totalSeats}
                          onChange={set("totalSeats")}
                          placeholder="e.g. 10"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Remaining / Available Seats
                        </label>
                        <input
                          className={inputCls}
                          type="number"
                          min="0"
                          value={form.remainingSeats}
                          onChange={set("remainingSeats")}
                          placeholder="Defaults to Total Seats if left empty"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Leave blank to default to total seats.
                        </p>
                      </div>
                    </div>

                    <SectionHeading>Eligibility Criteria</SectionHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Target Level</label>
                        <select
                          className={inputCls}
                          value={form.targetLevel}
                          onChange={set("targetLevel")}
                        >
                          <option value="">— Any level —</option>
                          <option value="plus_two">Plus Two</option>
                          <option value="bachelor">Bachelor</option>
                          <option value="master">Master</option>
                          <option value="mphil">M.Phil</option>
                          <option value="phd">PhD</option>
                          <option value="diploma">Diploma</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Target Faculty</label>
                        <input
                          className={inputCls}
                          value={form.targetFaculty}
                          onChange={set("targetFaculty")}
                          placeholder="e.g. Science, Management"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Subject</label>
                        <input
                          className={inputCls}
                          value={form.subject}
                          onChange={set("subject")}
                          placeholder="e.g. Computer Engineering"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Gender</label>
                        <select
                          className={inputCls}
                          value={form.gender}
                          onChange={set("gender")}
                        >
                          <option value="any">Any</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          Additional Requirements
                        </label>
                        <textarea
                          className={inputCls + " resize-none"}
                          rows={2}
                          value={form.additionalRequirements}
                          onChange={set("additionalRequirements")}
                          placeholder="Any other eligibility details..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Required Documents</label>
                        <input
                          className={inputCls}
                          value={form.requiredDocuments}
                          onChange={set("requiredDocuments")}
                          placeholder="Comma-separated: slc_marksheet, plus2_gradesheet, citizenship"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Separate multiple documents with a comma.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          id="isNepali"
                          type="checkbox"
                          className="w-4 h-4 accent-red-500"
                          checked={form.isNepali}
                          onChange={set("isNepali")}
                        />
                        <label
                          htmlFor="isNepali"
                          className="text-sm text-gray-700"
                        >
                          Nepali citizens only
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          id="hasDisability"
                          type="checkbox"
                          className="w-4 h-4 accent-red-500"
                          checked={form.hasDisability}
                          onChange={set("hasDisability")}
                        />
                        <label
                          htmlFor="hasDisability"
                          className="text-sm text-gray-700"
                        >
                          For students with disability
                        </label>
                      </div>
                    </div>

                    <SectionHeading>
                      Location Filter{" "}
                      <span className="normal-case font-normal text-gray-400">
                        (leave blank = open to all)
                      </span>
                    </SectionHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Province</label>
                        <input
                          className={inputCls}
                          value={form.provinceName}
                          onChange={set("provinceName")}
                          placeholder="e.g. Bagmati"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>District</label>
                        <input
                          className={inputCls}
                          value={form.districtName}
                          onChange={set("districtName")}
                          placeholder="e.g. Kathmandu"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Municipality</label>
                        <input
                          className={inputCls}
                          value={form.municipalityName}
                          onChange={set("municipalityName")}
                          placeholder="e.g. Kathmandu Metropolitan"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={closeForm}
                        className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={schLoading}
                        className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                      >
                        {schLoading
                          ? editingId
                            ? "Saving…"
                            : "Posting…"
                          : editingId
                            ? "Save Changes"
                            : "Post Scholarship"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

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
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[s.coverage.scholarshipType2] || "bg-gray-100 text-gray-600"}`}
                                >
                                  {s.coverage.scholarshipType2.replace(
                                    "_",
                                    " ",
                                  )}
                                </span>
                              )}
                              {s.verification?.status && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase ${STATUS_COLORS[s.verification.status] || "bg-gray-100 text-gray-600"}`}
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
                                {new Date(
                                  s.applicationDeadline,
                                ).toLocaleDateString("en-NP", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              {s.coverage?.amountNpr > 0 && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>💰</span> NPR{" "}
                                  {s.coverage.amountNpr.toLocaleString()}
                                </p>
                              )}
                              {s.coverage?.percentage > 0 && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>📊</span> {s.coverage.percentage}%
                                  coverage
                                </p>
                              )}
                              {s.totalSeats > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-500">
                                    🪑
                                  </span>
                                  <SeatsBar
                                    remaining={s.remainingSeats}
                                    total={s.totalSeats}
                                  />
                                </div>
                              )}
                              {s.eligibilityCriteria?.targetLevel && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>🎓</span>{" "}
                                  {s.eligibilityCriteria.targetLevel.replace(
                                    "_",
                                    " ",
                                  )}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <span>📝</span>{" "}
                                {s.statistics?.totalApplications || 0}{" "}
                                applications
                              </p>
                            </div>
                            {/* Card action buttons — now 3: View, Edit, Delete */}
                            <div className="flex gap-2 pt-3 border-t border-gray-50">
                              <Link
                                to={`/scholarships/${s._id}`}
                                className="flex-1 text-center text-xs font-medium py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-colors"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => openEditForm(s)}
                                className="flex-1 text-xs font-medium py-1.5 border border-amber-100 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteScholarship(s._id)}
                                className="flex-1 text-xs font-medium py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
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
                                className={`hover:bg-gray-50 transition-colors ${editingId === s._id ? "bg-amber-50" : ""}`}
                              >
                                <td className="px-5 py-3 font-medium text-gray-900 text-sm">
                                  {s.scholarshipTitle}
                                </td>
                                <td className="px-4 py-3">
                                  {s.coverage?.scholarshipType2 ? (
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[s.coverage.scholarshipType2] || "bg-gray-100 text-gray-600"}`}
                                    >
                                      {s.coverage.scholarshipType2.replace(
                                        "_",
                                        " ",
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                  {new Date(
                                    s.applicationDeadline,
                                  ).toLocaleDateString("en-NP", {
                                    day: "numeric",
                                    month: "short",
                                  })}
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
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[s.verification.status] || "bg-gray-100 text-gray-600"}`}
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
                                      className="text-xs text-amber-500 hover:text-amber-700 font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteScholarship(s._id)
                                      }
                                      className="text-xs text-red-400 hover:text-red-600 font-medium"
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
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── APPLICATIONS TAB ── */}
          {tab === "applications" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">
                  Applications
                </h2>
                <span className="text-xs text-gray-400">
                  {applications.length} total · {pendingCount} pending
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                  <div className="text-5xl mb-3">📨</div>
                  <p className="font-medium">No applications yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                            {app.scholarshipId?.scholarshipTitle || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[app.applicationType] || "bg-gray-100 text-gray-600"}`}
                            >
                              {app.applicationType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[app.applicationStatus] || "bg-gray-100 text-gray-500"}`}
                            >
                              {app.applicationStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {app.applicationStatus === "pending" && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() =>
                                    handleReview(app._id, "approved")
                                  }
                                  className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleReview(app._id, "under_review")
                                  }
                                  className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() =>
                                    handleReview(app._id, "rejected")
                                  }
                                  className="text-[10px] px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium"
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
                                  className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleReview(app._id, "rejected")
                                  }
                                  className="text-[10px] px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {["approved", "rejected", "withdrawn"].includes(
                              app.applicationStatus,
                            ) && (
                              <span className="text-[10px] text-gray-400">
                                No actions
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && <ProfileTab data={data} token={token} />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

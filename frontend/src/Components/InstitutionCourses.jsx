import { useEffect, useState } from "react";
import axios from "axios";
import EducationCascade from "./EducationCascade";
import { STUDY_LEVELS } from "../constants/educationTaxonomy";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_COURSE = {
  level: "",
  faculty: "",
  program: "",
  duration: "",
  description: "",
};

const levelLabel = (value) =>
  STUDY_LEVELS.find((l) => l.value === value)?.label || value;

export default function InstitutionCourses({ inputCls, labelCls }) {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_COURSE);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/api/institution/courses`, { headers })
      .then((res) => setCourses(res.data.courses || []))
      .catch((err) =>
        setListError(err.response?.data?.message || "Failed to load courses."),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_COURSE);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (course) => {
    setEditingId(course._id);
    setForm({
      level: course.level || "",
      faculty: course.faculty || "",
      program: course.program || "",
      duration: course.duration || "",
      description: course.description || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_COURSE);
    setFormError("");
  };

  const handleCascadeChange = ({ level, faculty, program }) => {
    setForm((f) => ({ ...f, level, faculty, program }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.level) {
      setFormError("Please select a level.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Please add a short description of what you teach.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await axios.put(
          `${API}/api/institution/courses/${editingId}`,
          form,
          { headers },
        );
        setCourses((prev) =>
          prev.map((c) => (c._id === editingId ? res.data.course : c)),
        );
      } else {
        const res = await axios.post(`${API}/api/institution/courses`, form, {
          headers,
        });
        setCourses((prev) => [res.data.course, ...prev]);
      }
      closeForm();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          (editingId ? "Failed to update course." : "Failed to add course."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Remove this course? Existing scholarships tied to it will be unaffected.",
      )
    )
      return;
    try {
      await axios.delete(`${API}/api/institution/courses/${id}`, { headers });
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove course.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Courses & Programs
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Register what you teach — scholarships can only be posted for
            courses listed here.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shrink-0"
        >
          <span className="text-lg leading-none">+</span>
          Add Course
        </button>
      </div>

      {listError && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {listError}
        </div>
      )}

      {/* ── ADD / EDIT FORM ─────────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              {editingId ? "Edit Course" : "Add Course"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <EducationCascade
            level={form.level}
            faculty={form.faculty}
            program={form.program}
            onChange={handleCascadeChange}
            labels={{
              level: "Level",
              faculty: "Faculty",
              program: "Degree / Program",
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duration</label>
              <input
                type="text"
                placeholder="e.g. 4 years"
                className={inputCls}
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="What does this course cover? Any specializations, faculty highlights, or intake notes worth mentioning."
              className={inputCls}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          {formError && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              {saving ? "Saving…" : editingId ? "Save Changes" : "Add Course"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-medium text-gray-500 px-5 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── COURSE LIST ─────────────────────────────────────────────────── */}
      {courses.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🎓</div>
          <p className="font-medium">No courses registered yet</p>
          <p className="text-sm mt-1">
            Add the programs you teach so you can post scholarships for them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div
              key={c._id}
              className={`bg-white rounded-xl border shadow-sm p-5 hover:border-gray-200 transition-colors ${
                editingId === c._id
                  ? "border-amber-300 ring-1 ring-amber-200"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                  {c.program || levelLabel(c.level)}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                  {levelLabel(c.level)}
                </span>
              </div>

              {c.faculty && (
                <p className="text-xs text-gray-500 mb-2">{c.faculty}</p>
              )}

              {c.description && (
                <p className="text-gray-400 text-xs mb-3 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              )}

              {c.duration && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                  <span>⏱️</span> {c.duration}
                </p>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button
                  onClick={() => openEditForm(c)}
                  className="flex-1 text-xs font-medium py-1.5 border border-amber-100 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="flex-1 text-xs font-medium py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
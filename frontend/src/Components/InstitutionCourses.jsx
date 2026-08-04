import { useEffect, useState } from "react";
import axios from "axios";
import CourseCatalogPicker from "./CourseCatalogPicker";
import {
  STUDY_LEVELS,
  findFacultyById,
  findProgramById,
} from "../constants/educationTaxonomy";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fixed: taxonomy objects use `id`/`name`, not `value`/`label`.
const levelLabel = (id) => STUDY_LEVELS.find((l) => l.id === id)?.name || id;

export default function InstitutionCourses() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const fetchCourses = () => {
    setLoading(true);
    axios
      .get(`${API}/api/institution/courses`, { headers })
      .then((res) => setCourses(res.data.courses || []))
      .catch((err) =>
        setListError(err.response?.data?.message || "Failed to load courses."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">
          Courses & Programs
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Select what you teach — scholarships can only be posted for
          courses listed here.
        </p>
      </div>

      {/* ── CATALOG PICKER (add courses) ────────────────────────────────── */}
      <CourseCatalogPicker token={token} onAdded={fetchCourses} />

      {/* ── COURSE LIST ─────────────────────────────────────────────────── */}
      {listError && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {listError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🎓</div>
          <p className="font-medium">No courses registered yet</p>
          <p className="text-sm mt-1">
            Use the picker above to add the programs you teach.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => {
            const programName = c.program ? findProgramById(c.program)?.name || c.program : null;
            const facultyName = c.faculty ? findFacultyById(c.faculty)?.name || c.faculty : null;
            return (
              <div
                key={c._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                    {programName || levelLabel(c.level)}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                    {levelLabel(c.level)}
                  </span>
                </div>

                {facultyName && (
                  <p className="text-xs text-gray-500 mb-2">{facultyName}</p>
                )}

                {c.description && (
                  <p className="text-gray-400 text-xs mb-3 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                )}

                {(c.durationYears || c.duration) && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                    <span>⏱️</span> {c.durationYears ? `${c.durationYears} years` : c.duration}
                  </p>
                )}

                <div className="pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="w-full text-xs font-medium py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
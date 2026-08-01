// EducationCascade.jsx
//
// Reusable Target Level → Faculty → Program cascading dropdown, mirroring
// LocationCascade's UX: pick a level, faculty options narrow to that level,
// pick a faculty, program options narrow to that faculty.
//
// For levels with no faculty step (primary, lower_secondary, secondary, see,
// short_term_training, ca, pre_diploma, postgraduate_diploma, mphil, phd),
// the Faculty and Program selects are hidden automatically.
//
// Usage:
//   <EducationCascade
//     level={form.targetLevel}
//     faculty={form.targetFaculty}
//     program={form.degreeProgram}
//     onChange={({ level, faculty, program }) => { ... }}
//   />

import {
  STUDY_LEVELS,
  LEVELS_WITH_FACULTY,
  getFacultiesForLevel,
  getProgramsForFaculty,
} from "../constants/educationTaxonomy";

const selectCls =
  "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed w-full";
const labelCls =
  "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block";

export default function EducationCascade({
  level = "",
  faculty = "",
  program = "",
  onChange,
  gridClassName = "grid grid-cols-1 sm:grid-cols-3 gap-4",
  labels = { level: "Target Level", faculty: "Faculty", program: "Program" },
}) {
  const hasFacultyStep = LEVELS_WITH_FACULTY.includes(level);
  const faculties = hasFacultyStep ? getFacultiesForLevel(level) : [];
  const programs = hasFacultyStep ? getProgramsForFaculty(level, faculty) : [];

  const emit = (next) => {
    if (onChange) onChange(next);
  };

  const handleLevelChange = (e) => {
    const val = e.target.value;
    // Changing level always resets faculty + program, since they no longer apply
    emit({ level: val, faculty: "", program: "" });
  };

  const handleFacultyChange = (e) => {
    const val = e.target.value;
    // Changing faculty resets program, since programs are faculty-specific
    emit({ level, faculty: val, program: "" });
  };

  const handleProgramChange = (e) => {
    emit({ level, faculty, program: e.target.value });
  };

  return (
    <div className={gridClassName}>
      <div>
        <label className={labelCls}>{labels.level}</label>
        <select className={selectCls} value={level} onChange={handleLevelChange}>
          <option value="">— Any level —</option>
          {STUDY_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {hasFacultyStep && (
        <div>
          <label className={labelCls}>{labels.faculty}</label>
          <select
            className={selectCls}
            value={faculty}
            onChange={handleFacultyChange}
            disabled={!level}
          >
            <option value="">— Any faculty —</option>
            {faculties.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasFacultyStep && (
        <div>
          <label className={labelCls}>{labels.program}</label>
          <select
            className={selectCls}
            value={program}
            onChange={handleProgramChange}
            disabled={!faculty}
          >
            <option value="">
              {!faculty ? "Select Faculty first" : "— Any program —"}
            </option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
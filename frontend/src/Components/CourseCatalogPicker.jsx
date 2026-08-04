// Components/CourseCatalogPicker.jsx
//
// Replaces one-by-one course adding. Institution picks a level, sees the
// full faculty/program tree, checks the programs it offers, edits years
// inline, and submits everything in one request.

import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LEVEL_OPTIONS = [
  { id: "plus_two", name: "Plus Two (+2)" },
  { id: "diploma_pcl", name: "Diploma / PCL" },
  { id: "bachelor", name: "Bachelor's" },
  { id: "master", name: "Master's" },
];

export default function CourseCatalogPicker({ token, onAdded }) {
  const [level, setLevel] = useState("");
  const [catalog, setCatalog] = useState(null);
  const [selections, setSelections] = useState({}); // key: `${facultyId}:${programId}` -> years
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!level) {
      setCatalog(null);
      return;
    }
    setLoading(true);
    setSelections({});
    setMsg("");
    axios
      .get(`${API}/api/institution/courses/catalog`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { level },
      })
      .then((res) => setCatalog(res.data))
      .catch(() => setMsg("Failed to load course catalog."))
      .finally(() => setLoading(false));
  }, [level, token]);

  const toggle = (facultyId, program) => {
    const key = `${facultyId}:${program.id}`;
    setSelections((prev) => {
      const next = { ...prev };
      if (key in next) delete next[key];
      else next[key] = program.defaultDurationYears || "";
      return next;
    });
  };

  const setYears = (facultyId, programId, val) =>
    setSelections((prev) => ({ ...prev, [`${facultyId}:${programId}`]: val }));

  const submit = async () => {
    const payload = Object.entries(selections).map(([key, durationYears]) => {
      const [facultyId, programId] = key.split(":");
      return {
        facultyId,
        programId,
        durationYears: durationYears ? Number(durationYears) : undefined,
      };
    });
    if (payload.length === 0) return;

    setSubmitting(true);
    setMsg("");
    try {
      const res = await axios.post(
        `${API}/api/institution/courses/bulk`,
        { level, selections: payload },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMsg(res.data.message);
      setSelections({});
      onAdded?.();
      // Refresh catalog so "already added" states update
      const refreshed = await axios.get(`${API}/api/institution/courses/catalog`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { level },
      });
      setCatalog(refreshed.data);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to add courses.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = Object.keys(selections).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Level
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64"
        >
          <option value="">Select a level…</option>
          {LEVEL_OPTIONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {catalog?.governingBodyLabel && (
        <p className="text-xs text-gray-500">
          Governed by: {catalog.governingBodyLabel}
        </p>
      )}

      {loading && <p className="text-xs text-gray-400">Loading catalog…</p>}

      {catalog?.faculties?.length > 0 &&
        catalog.faculties.map((f) => (
          <div key={f.id} className="border border-gray-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-800 mb-2">{f.name}</p>
            <div className="space-y-1.5">
              {f.programs.map((p) => {
                const key = `${f.id}:${p.id}`;
                const checked = key in selections;
                return (
                  <div key={p.id} className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={p.alreadyAdded}
                      onChange={() => toggle(f.id, p)}
                    />
                    <span className={p.alreadyAdded ? "text-gray-300" : "text-gray-700"}>
                      {p.name}
                      {p.alreadyAdded && " (already added)"}
                    </span>
                    {checked && (
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={selections[key]}
                        onChange={(e) => setYears(f.id, p.id, e.target.value)}
                        className="w-16 border border-gray-200 rounded px-1.5 py-0.5 text-xs ml-auto"
                        placeholder="years"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {catalog && !catalog.needsFaculty && (
        <p className="text-xs text-gray-500">
          This level has no faculty/program step — click below to add it directly.
        </p>
      )}

      {catalog && (
        <button
          onClick={submit}
          disabled={(catalog.needsFaculty && selectedCount === 0) || submitting}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40"
        >
          {submitting
            ? "Adding…"
            : catalog.needsFaculty
              ? `Add ${selectedCount || ""} course${selectedCount === 1 ? "" : "s"}`
              : "Add course"}
        </button>
      )}

      {msg && <p className="text-xs text-gray-500">{msg}</p>}
    </div>
  );
}
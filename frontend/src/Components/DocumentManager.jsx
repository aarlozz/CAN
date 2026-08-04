import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const LEVELS = ["+2", "Bachelor", "Master", "PhD"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // keep in sync with backend/middleware/upload.js

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function GroupLabel({ children }) {
  return (
    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 mt-5 first:mt-0">
      {children}
    </p>
  );
}

function DocumentRow({ doc, onUpload, onDelete, onView, uploadingKey }) {
  const inputRef = useRef(null);
  const isUploadingThis = uploadingKey === doc.key;

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="min-w-0 flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
            doc.uploaded
              ? "bg-emerald-50 text-emerald-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {doc.uploaded ? "✓" : "•"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {doc.label}
            {doc.isRequired === false && (
              <span className="ml-1.5 text-[10px] text-gray-400 font-normal">
                (optional)
              </span>
            )}
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {doc.uploaded ? doc.document.fileName : "Not uploaded"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {doc.uploaded && (
          <button
            onClick={() => onView(doc.document.fileId)}
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-700"
          >
            View
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(doc.key, file);
            e.target.value = "";
          }}
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploadingThis}
          className="text-[11px] font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {isUploadingThis ? "Uploading..." : doc.uploaded ? "Replace" : "Upload"}
        </button>

        {doc.uploaded && (
          <button
            onClick={() => onDelete(doc.document._id)}
            className="text-[11px] font-semibold text-gray-400 hover:text-red-500"
            title="Remove document"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default function DocumentManager() {
  const [level, setLevel] = useState("");
  const [categories, setCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [requirements, setRequirements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [savingLevel, setSavingLevel] = useState(false);
  const [error, setError] = useState("");

  const loadMasterLists = async () => {
    try {
      const res = await axios.get(`${API}/api/document-types`, {
        headers: authHeaders(),
      });
      setAvailableCategories(res.data.categories || []);
    } catch (err) {
      // non-fatal — checklist will still work without category labels loaded
    }
  };

  const loadRequirements = async () => {
    try {
      const res = await axios.get(
        `${API}/api/student/documents/requirements`,
        { headers: authHeaders() }
      );
      setRequirements(res.data);
      if (res.data.level) setLevel(res.data.level);
      if (res.data.categories) setCategories(res.data.categories);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load document requirements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterLists();
    loadRequirements();
  }, []);

  const saveLevel = async (newLevel) => {
    setSavingLevel(true);
    setError("");
    try {
      await axios.put(
        `${API}/api/student/documents/level`,
        { level: newLevel },
        { headers: authHeaders() }
      );
      setLevel(newLevel);
      await loadRequirements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update level.");
    } finally {
      setSavingLevel(false);
    }
  };

  const toggleCategory = async (key) => {
    const next = categories.includes(key)
      ? categories.filter((c) => c !== key)
      : [...categories, key];
    setCategories(next);
    setError("");
    try {
      await axios.put(
        `${API}/api/student/documents/categories`,
        { categories: next },
        { headers: authHeaders() }
      );
      await loadRequirements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update categories.");
    }
  };

  const handleUpload = async (documentTypeKey, file) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Max size is 5MB.");
      return;
    }
    setUploadingKey(documentTypeKey);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentTypeKey", documentTypeKey);
      await axios.post(`${API}/api/student/documents/upload`, formData, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      await loadRequirements();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDelete = async (documentId) => {
    setError("");
    try {
      await axios.delete(`${API}/api/student/documents/${documentId}`, {
        headers: authHeaders(),
      });
      await loadRequirements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete document.");
    }
  };

  const handleView = async (fileId) => {
    setError("");
    try {
      const res = await axios.get(
        `${API}/api/student/documents/file/${fileId}`,
        { headers: authHeaders(), responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank");
    } catch (err) {
      setError("Failed to open document.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin w-7 h-7 border-4 border-red-100 border-t-red-400 rounded-full" />
      </div>
    );
  }

  const required = requirements?.requiredDocuments || [];
  const optional = requirements?.optionalDocuments || [];
  const common = required.filter((d) => d.group === "common");
  const levelDocs = required.filter((d) => d.group === "level");
  const categoryDocs = required.filter((d) => d.group === "category");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="text-base font-bold text-gray-900">
          Application Documents
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Upload the documents required for scholarships at your study level.
        </p>
      </div>

      {error && (
        <div className="mx-5 mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="px-5 py-4">
        {/* ── Level selector ── */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Current Study Level
          </p>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                disabled={savingLevel}
                onClick={() => saveLevel(lvl)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${
                  level === lvl
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {!level ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Select your current study level to see required documents.
          </p>
        ) : (
          <>
            {/* ── Completion progress ── */}
            <div className="mb-5 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Profile Completion
                </span>
                <span className="text-xs font-bold text-red-500">
                  {requirements?.completionPercent ?? 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${requirements?.completionPercent ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                {requirements?.totalUploaded ?? 0} of{" "}
                {requirements?.totalRequired ?? 0} required documents uploaded
              </p>
            </div>

            {/* ── Special / reservation category selector ── */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Applying for special / reservation scholarships? (optional)
              </p>
              <div className="flex gap-2 flex-wrap">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => toggleCategory(cat.key)}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      categories.includes(cat.key)
                        ? "bg-red-500 text-white border-red-500"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Checklist ── */}
            <div>
              {common.length > 0 && (
                <>
                  <GroupLabel>Common Documents</GroupLabel>
                  {common.map((doc) => (
                    <DocumentRow
                      key={doc.key}
                      doc={doc}
                      onUpload={handleUpload}
                      onDelete={handleDelete}
                      onView={handleView}
                      uploadingKey={uploadingKey}
                    />
                  ))}
                </>
              )}

              {levelDocs.length > 0 && (
                <>
                  <GroupLabel>{level} Level Documents</GroupLabel>
                  {levelDocs.map((doc) => (
                    <DocumentRow
                      key={doc.key}
                      doc={doc}
                      onUpload={handleUpload}
                      onDelete={handleDelete}
                      onView={handleView}
                      uploadingKey={uploadingKey}
                    />
                  ))}
                </>
              )}

              {categoryDocs.length > 0 && (
                <>
                  <GroupLabel>
                    Additional Documents for Selected Scholarships
                  </GroupLabel>
                  {categoryDocs.map((doc) => (
                    <DocumentRow
                      key={doc.key}
                      doc={doc}
                      onUpload={handleUpload}
                      onDelete={handleDelete}
                      onView={handleView}
                      uploadingKey={uploadingKey}
                    />
                  ))}
                </>
              )}

              {optional.length > 0 && (
                <>
                  <GroupLabel>Optional / Bonus Documents</GroupLabel>
                  {optional.map((doc) => (
                    <DocumentRow
                      key={doc.key}
                      doc={doc}
                      onUpload={handleUpload}
                      onDelete={handleDelete}
                      onView={handleView}
                      uploadingKey={uploadingKey}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
// ProfileView.jsx — /profile
//
// Works for BOTH roles (student & institution). Shows a read-only view
// with an edit pencil icon; clicking it turns the same fields into inputs.
//
// Student:
//   GET  /api/student/dashboard-student   → load
//   PUT  /api/student/complete-profile    → save
// Institution:
//   GET  /api/institution/dashboard-institution → load
//   PUT  /api/institution/profile               → save

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const SCHOOL_TYPES = ["Government", "Community", "Private", "Other"];
const EDUCATION_LEVELS = ["SEE", "+2", "Bachelors", "Masters", "Other"];
const INSTITUTION_TYPES = ["School", "College", "University"];

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-gray-800 text-sm">{value || <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm";

export default function ProfileView() {
  const role = localStorage.getItem("role");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Student form state ──────────────────────────────────────────────────
  const [studentForm, setStudentForm] = useState({
    dob: "",
    gender: "",
    phone: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    street: "",
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
    guardianOccupation: "",
    schoolName: "",
    schoolType: "",
    currentEducationLevel: "",
  });

  // ── Institution form state ──────────────────────────────────────────────
  const [institutionForm, setInstitutionForm] = useState({
    institutionName: "",
    institutionType: "",
    establishedYear: "",
    website: "",
    description: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    street: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactDesignation: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      if (role === "student") {
        const res = await api.get("/student/dashboard-student");
        const p = res.data;
        setProfile(p);
        setStudentForm({
          dob: p.personal_info?.dob ? new Date(p.personal_info.dob).toISOString().split("T")[0] : "",
          gender: p.personal_info?.gender || "",
          phone: p.personal_info?.phone || "",
          province: p.address?.province || "",
          district: p.address?.district || "",
          municipality: p.address?.municipality || "",
          ward: p.address?.ward || "",
          street: p.address?.street || "",
          guardianName: p.guardian_info?.name || "",
          guardianRelation: p.guardian_info?.relation || "",
          guardianPhone: p.guardian_info?.phone_number || "",
          guardianOccupation: p.guardian_info?.occupation || "",
          schoolName: p.educationInfo?.schoolName || "",
          schoolType: p.educationInfo?.schoolType || "",
          currentEducationLevel: p.educationInfo?.currentEducationLevel || "",
        });
      } else if (role === "institution") {
        const res = await api.get("/institution/dashboard-institution");
        const p = res.data;
        setProfile(p);
        setInstitutionForm({
          institutionName: p.institutionName || "",
          institutionType: p.institutionType || "",
          establishedYear: p.establishedYear || "",
          website: p.website || "",
          description: p.description || "",
          province: p.location?.province || "",
          district: p.location?.district || "",
          municipality: p.location?.municipality || "",
          ward: p.location?.ward || "",
          street: p.location?.street || "",
          contactName: p.contactPerson?.name || "",
          contactPhone: p.contactPerson?.phone || "",
          contactEmail: p.contactPerson?.email || "",
          contactDesignation: p.contactPerson?.designation || "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      if (role === "student") {
        await api.put("/student/complete-profile", {
          personal_info: {
            dob: studentForm.dob || undefined,
            gender: studentForm.gender || undefined,
            phone: studentForm.phone || undefined,
          },
          address: {
            province: studentForm.province,
            district: studentForm.district,
            municipality: studentForm.municipality,
            ward: studentForm.ward,
            street: studentForm.street,
          },
          guardian_info: {
            name: studentForm.guardianName,
            relation: studentForm.guardianRelation,
            phone_number: studentForm.guardianPhone,
            occupation: studentForm.guardianOccupation,
          },
          educationInfo: {
            schoolName: studentForm.schoolName,
            schoolType: studentForm.schoolType,
            currentEducationLevel: studentForm.currentEducationLevel,
          },
          // Keep existing reservationInfo untouched — not edited on this page
          reservationInfo: profile?.reservationInfo || {},
        });
      } else if (role === "institution") {
        await api.put("/institution/profile", {
          institutionName: institutionForm.institutionName,
          institutionType: institutionForm.institutionType,
          establishedYear: institutionForm.establishedYear
            ? Number(institutionForm.establishedYear)
            : undefined,
          website: institutionForm.website,
          description: institutionForm.description,
          location: {
            province: institutionForm.province,
            district: institutionForm.district,
            municipality: institutionForm.municipality,
            ward: institutionForm.ward,
            street: institutionForm.street,
          },
          contactPerson: {
            name: institutionForm.contactName,
            phone: institutionForm.contactPhone,
            email: institutionForm.contactEmail,
            designation: institutionForm.contactDesignation,
          },
        });
      }
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    profile?.user?.name || (role === "institution" ? profile?.institutionName : "") || "";
  const displayEmail = profile?.user?.email || "";

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-10 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-7 w-48 bg-gray-200 rounded mb-6" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View and update your {role === "institution" ? "institution" : "personal"} details.
            </p>
          </div>
          <Link
            to={role === "institution" ? "/dashboard-institution" : "/dashboard-student"}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* ── Avatar / identity header ── */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-xl font-bold text-red-500 shrink-0">
                  {(displayName || "U")
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{displayName || "—"}</p>
                  <p className="text-xs text-gray-400">{displayEmail || "No email on file"}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                    {role}
                  </span>
                </div>
              </div>

              {/* ── Edit pencil icon ── */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit profile"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>

            {saveError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                {saveError}
              </div>
            )}

            {/* ── STUDENT ── */}
            {role === "student" && (
              <div className="px-6 py-6">
                {!isEditing ? (
                  <>
                    <SectionTitle>Personal Info</SectionTitle>
                    <InfoRow label="Date of Birth" value={studentForm.dob} />
                    <InfoRow label="Gender" value={studentForm.gender} />
                    <InfoRow label="Phone" value={studentForm.phone} />

                    <SectionTitle className="mt-6">Address</SectionTitle>
                    <InfoRow label="Province" value={studentForm.province} />
                    <InfoRow label="District" value={studentForm.district} />
                    <InfoRow label="Municipality" value={studentForm.municipality} />
                    <InfoRow label="Ward" value={studentForm.ward} />
                    <InfoRow label="Street" value={studentForm.street} />

                    <SectionTitle className="mt-6">Guardian</SectionTitle>
                    <InfoRow label="Name" value={studentForm.guardianName} />
                    <InfoRow label="Relation" value={studentForm.guardianRelation} />
                    <InfoRow label="Phone" value={studentForm.guardianPhone} />
                    <InfoRow label="Occupation" value={studentForm.guardianOccupation} />

                    <SectionTitle className="mt-6">Education</SectionTitle>
                    <InfoRow label="School / College" value={studentForm.schoolName} />
                    <InfoRow label="School Type" value={studentForm.schoolType} />
                    <InfoRow label="Current Level" value={studentForm.currentEducationLevel} />
                  </>
                ) : (
                  <>
                    <SectionTitle>Personal Info</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="Date of Birth">
                        <input type="date" className={inputCls} value={studentForm.dob}
                          onChange={(e) => setStudentForm((f) => ({ ...f, dob: e.target.value }))} />
                      </Field>
                      <Field label="Gender">
                        <select className={inputCls} value={studentForm.gender}
                          onChange={(e) => setStudentForm((f) => ({ ...f, gender: e.target.value }))}>
                          <option value="">Select…</option>
                          {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </Field>
                      <Field label="Phone">
                        <input type="text" className={inputCls} value={studentForm.phone}
                          onChange={(e) => setStudentForm((f) => ({ ...f, phone: e.target.value }))} />
                      </Field>
                    </div>

                    <SectionTitle className="mt-6">Address</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="Province">
                        <input type="text" className={inputCls} value={studentForm.province}
                          onChange={(e) => setStudentForm((f) => ({ ...f, province: e.target.value }))} />
                      </Field>
                      <Field label="District">
                        <input type="text" className={inputCls} value={studentForm.district}
                          onChange={(e) => setStudentForm((f) => ({ ...f, district: e.target.value }))} />
                      </Field>
                      <Field label="Municipality">
                        <input type="text" className={inputCls} value={studentForm.municipality}
                          onChange={(e) => setStudentForm((f) => ({ ...f, municipality: e.target.value }))} />
                      </Field>
                      <Field label="Ward">
                        <input type="text" className={inputCls} value={studentForm.ward}
                          onChange={(e) => setStudentForm((f) => ({ ...f, ward: e.target.value }))} />
                      </Field>
                      <Field label="Street">
                        <input type="text" className={inputCls} value={studentForm.street}
                          onChange={(e) => setStudentForm((f) => ({ ...f, street: e.target.value }))} />
                      </Field>
                    </div>

                    <SectionTitle className="mt-6">Guardian</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="Name">
                        <input type="text" className={inputCls} value={studentForm.guardianName}
                          onChange={(e) => setStudentForm((f) => ({ ...f, guardianName: e.target.value }))} />
                      </Field>
                      <Field label="Relation">
                        <input type="text" className={inputCls} value={studentForm.guardianRelation}
                          onChange={(e) => setStudentForm((f) => ({ ...f, guardianRelation: e.target.value }))} />
                      </Field>
                      <Field label="Phone">
                        <input type="text" className={inputCls} value={studentForm.guardianPhone}
                          onChange={(e) => setStudentForm((f) => ({ ...f, guardianPhone: e.target.value }))} />
                      </Field>
                      <Field label="Occupation">
                        <input type="text" className={inputCls} value={studentForm.guardianOccupation}
                          onChange={(e) => setStudentForm((f) => ({ ...f, guardianOccupation: e.target.value }))} />
                      </Field>
                    </div>

                    <SectionTitle className="mt-6">Education</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="School / College Name">
                        <input type="text" className={inputCls} value={studentForm.schoolName}
                          onChange={(e) => setStudentForm((f) => ({ ...f, schoolName: e.target.value }))} />
                      </Field>
                      <Field label="School Type">
                        <select className={inputCls} value={studentForm.schoolType}
                          onChange={(e) => setStudentForm((f) => ({ ...f, schoolType: e.target.value }))}>
                          <option value="">Select…</option>
                          {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </Field>
                      <Field label="Current Education Level">
                        <select className={inputCls} value={studentForm.currentEducationLevel}
                          onChange={(e) => setStudentForm((f) => ({ ...f, currentEducationLevel: e.target.value }))}>
                          <option value="">Select…</option>
                          {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </Field>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── INSTITUTION ── */}
            {role === "institution" && (
              <div className="px-6 py-6">
                {!isEditing ? (
                  <>
                    <SectionTitle>Institution Info</SectionTitle>
                    <InfoRow label="Name" value={institutionForm.institutionName} />
                    <InfoRow label="Type" value={institutionForm.institutionType} />
                    <InfoRow label="Established Year" value={institutionForm.establishedYear} />
                    <InfoRow label="Website" value={institutionForm.website} />
                    <InfoRow label="Description" value={institutionForm.description} />

                    <SectionTitle className="mt-6">Location</SectionTitle>
                    <InfoRow label="Province" value={institutionForm.province} />
                    <InfoRow label="District" value={institutionForm.district} />
                    <InfoRow label="Municipality" value={institutionForm.municipality} />
                    <InfoRow label="Ward" value={institutionForm.ward} />
                    <InfoRow label="Street" value={institutionForm.street} />

                    <SectionTitle className="mt-6">Contact Person</SectionTitle>
                    <InfoRow label="Name" value={institutionForm.contactName} />
                    <InfoRow label="Phone" value={institutionForm.contactPhone} />
                    <InfoRow label="Email" value={institutionForm.contactEmail} />
                    <InfoRow label="Designation" value={institutionForm.contactDesignation} />
                  </>
                ) : (
                  <>
                    <SectionTitle>Institution Info</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="Institution Name">
                        <input type="text" className={inputCls} value={institutionForm.institutionName}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, institutionName: e.target.value }))} />
                      </Field>
                      <Field label="Institution Type">
                        <select className={inputCls} value={institutionForm.institutionType}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, institutionType: e.target.value }))}>
                          <option value="">Select…</option>
                          {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </Field>
                      <Field label="Established Year">
                        <input type="number" className={inputCls} value={institutionForm.establishedYear}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, establishedYear: e.target.value }))} />
                      </Field>
                      <Field label="Website">
                        <input type="text" className={inputCls} value={institutionForm.website}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, website: e.target.value }))} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <textarea rows={3} className={inputCls} value={institutionForm.description}
                        onChange={(e) => setInstitutionForm((f) => ({ ...f, description: e.target.value }))} />
                    </Field>

                    <SectionTitle className="mt-6">Location</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="Province">
                        <input type="text" className={inputCls} value={institutionForm.province}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, province: e.target.value }))} />
                      </Field>
                      <Field label="District">
                        <input type="text" className={inputCls} value={institutionForm.district}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, district: e.target.value }))} />
                      </Field>
                      <Field label="Municipality">
                        <input type="text" className={inputCls} value={institutionForm.municipality}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, municipality: e.target.value }))} />
                      </Field>
                      <Field label="Ward">
                        <input type="text" className={inputCls} value={institutionForm.ward}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, ward: e.target.value }))} />
                      </Field>
                      <Field label="Street">
                        <input type="text" className={inputCls} value={institutionForm.street}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, street: e.target.value }))} />
                      </Field>
                    </div>

                    <SectionTitle className="mt-6">Contact Person</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="Name">
                        <input type="text" className={inputCls} value={institutionForm.contactName}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, contactName: e.target.value }))} />
                      </Field>
                      <Field label="Phone">
                        <input type="text" className={inputCls} value={institutionForm.contactPhone}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, contactPhone: e.target.value }))} />
                      </Field>
                      <Field label="Email">
                        <input type="email" className={inputCls} value={institutionForm.contactEmail}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, contactEmail: e.target.value }))} />
                      </Field>
                      <Field label="Designation">
                        <input type="text" className={inputCls} value={institutionForm.contactDesignation}
                          onChange={(e) => setInstitutionForm((f) => ({ ...f, contactDesignation: e.target.value }))} />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Edit action bar ── */}
            {isEditing && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/50">
                <button
                  onClick={() => { setIsEditing(false); setSaveError(""); fetchProfile(); }}
                  disabled={saving}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function SectionTitle({ children, className = "" }) {
  return (
    <p className={`text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 ${className}`}>
      {children}
    </p>
  );
}
// ProfileView.jsx — /profile
//
// Works for BOTH roles (student & institution).
// - Overview tab: avatar (upload/delete), identity, profile-completeness bar
// - Section tabs: grouped fields, each viewable / editable
//
// Student:
//   GET  /api/student/dashboard-student   → load
//   PUT  /api/student/complete-profile    → save
// Institution:
//   GET  /api/institution/dashboard-institution → load
//   PUT  /api/institution/profile               → save
// Avatar (both roles):
//   POST   /api/user/avatar  (multipart/form-data, field "avatar") → upload/replace
//   DELETE /api/user/avatar                                        → remove

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { UNIVERSITIES } from "../constants/educationTaxonomy"; // adjust path

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const SCHOOL_TYPES = ["Government", "Community", "Private", "Other"];
const EDUCATION_LEVELS = ["SEE", "+2", "Bachelors", "Masters", "Other"];
const INSTITUTION_TYPES = ["School", "College", "University"];
const MAX_AVATAR_MB = 2;

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm transition-shadow";

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

function DetailCard({ icon, label, value }) {
  const isEmpty = !value && value !== 0;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 hover:bg-gray-50 hover:border-gray-200 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-base shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-semibold break-words ${isEmpty ? "text-gray-300 font-normal" : "text-gray-900"}`}>
          {isEmpty ? "Not provided" : value}
        </p>
      </div>
    </div>
  );
}

function DetailGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Avatar({ url, name, size = "w-16 h-16", textSize = "text-2xl" }) {
  const initials = (name || "U").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt="Profile"
        className={`${size} rounded-2xl object-cover shrink-0 shadow-lg ring-4 ring-white/10`}
      />
    );
  }
  return (
    <div className={`${size} rounded-2xl bg-red-500 flex items-center justify-center ${textSize} font-bold shrink-0 shadow-lg ring-4 ring-white/10`}>
      {initials}
    </div>
  );
}

export default function ProfileView() {
  const role = localStorage.getItem("role");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Avatar state ─────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const studentTabs = [
    { key: "overview", label: "Overview" },
    { key: "personal", label: "Personal" },
    { key: "address", label: "Address" },
    { key: "guardian", label: "Guardian" },
    { key: "education", label: "Education" },
  ];
  const institutionTabs = [
    { key: "overview", label: "Overview" },
    { key: "institution", label: "Institution" },
    { key: "location", label: "Location" },
    { key: "contact", label: "Contact" },
  ];
  const tabs = role === "institution" ? institutionTabs : studentTabs;
  const [activeTab, setActiveTab] = useState("overview");

  // ── Student form state ──────────────────────────────────────────────────
  const [studentForm, setStudentForm] = useState({
    dob: "", gender: "", phone: "",
    province: "", district: "", municipality: "", ward: "", street: "",
    guardianName: "", guardianRelation: "", guardianPhone: "", guardianOccupation: "",
    schoolName: "", schoolType: "", currentEducationLevel: "",
  });

  // ── Institution form state ──────────────────────────────────────────────
  const [institutionForm, setInstitutionForm] = useState({
    institutionName: "", institutionType: "", affiliatedUniversity: "",
    establishedYear: "", website: "", description: "",
    province: "", district: "", municipality: "", ward: "", street: "",
    contactName: "", contactPhone: "", contactEmail: "", contactDesignation: "",
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
          affiliatedUniversity: p.affiliatedUniversity || "",
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
    setSaveSuccess(false);
    try {
      if (role === "student") {
        await api.put("/student/complete-profile", {
          personal_info: {
            dob: studentForm.dob || undefined,
            gender: studentForm.gender || undefined,
            phone: studentForm.phone || undefined,
          },
          address: {
            province: studentForm.province, district: studentForm.district,
            municipality: studentForm.municipality, ward: studentForm.ward, street: studentForm.street,
          },
          guardian_info: {
            name: studentForm.guardianName, relation: studentForm.guardianRelation,
            phone_number: studentForm.guardianPhone, occupation: studentForm.guardianOccupation,
          },
          educationInfo: {
            schoolName: studentForm.schoolName, schoolType: studentForm.schoolType,
            currentEducationLevel: studentForm.currentEducationLevel,
          },
          reservationInfo: profile?.reservationInfo || {}, // untouched here
        });
      } else if (role === "institution") {
        await api.put("/institution/profile", {
          institutionName: institutionForm.institutionName,
          institutionType: institutionForm.institutionType,
          affiliatedUniversity: institutionForm.affiliatedUniversity,
          establishedYear: institutionForm.establishedYear ? Number(institutionForm.establishedYear) : undefined,
          website: institutionForm.website,
          description: institutionForm.description,
          location: {
            province: institutionForm.province, district: institutionForm.district,
            municipality: institutionForm.municipality, ward: institutionForm.ward, street: institutionForm.street,
          },
          contactPerson: {
            name: institutionForm.contactName, phone: institutionForm.contactPhone,
            email: institutionForm.contactEmail, designation: institutionForm.contactDesignation,
          },
        });
      }
      await fetchProfile();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar handlers ──────────────────────────────────────────────────────
  const handleAvatarPick = () => {
    setAvatarError("");
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setAvatarError(`Image must be under ${MAX_AVATAR_MB}MB.`);
      return;
    }

    setAvatarError("");
    setAvatarBusy(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => prev && { ...prev, user: { ...prev.user, avatar: res.data.avatar } });
      window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: { avatar: res.data.avatar } }));
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarError("");
    setAvatarBusy(true);
    try {
      await api.delete("/user/avatar");
      setProfile((prev) => prev && { ...prev, user: { ...prev.user, avatar: null } });
      window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: { avatar: null } }));
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Failed to remove photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const displayName = profile?.user?.name || (role === "institution" ? profile?.institutionName : "") || "";
  const displayEmail = profile?.user?.email || "";
  const avatarUrl = profile?.user?.avatar || null;

  // ── Profile completeness ────────────────────────────────────────────────
  const completeness = useMemo(() => {
    if (!profile) return { pct: 0, missing: [] };
    const checks =
      role === "student"
        ? [
            ["Date of Birth", studentForm.dob],
            ["Gender", studentForm.gender],
            ["Phone", studentForm.phone],
            ["Province", studentForm.province],
            ["District", studentForm.district],
            ["Municipality", studentForm.municipality],
            ["Ward", studentForm.ward],
            ["Guardian Name", studentForm.guardianName],
            ["Guardian Phone", studentForm.guardianPhone],
            ["School / College", studentForm.schoolName],
            ["Current Level", studentForm.currentEducationLevel],
            ["Profile Photo", avatarUrl],
          ]
        : [
            ["Institution Type", institutionForm.institutionType],
            ["Affiliated University", institutionForm.affiliatedUniversity],
            ["Established Year", institutionForm.establishedYear],
            ["Website", institutionForm.website],
            ["Description", institutionForm.description],
            ["Province", institutionForm.province],
            ["District", institutionForm.district],
            ["Municipality", institutionForm.municipality],
            ["Contact Name", institutionForm.contactName],
            ["Contact Phone", institutionForm.contactPhone],
            ["Contact Email", institutionForm.contactEmail],
            ["Profile Photo", avatarUrl],
          ];
    const filled = checks.filter(([, v]) => v && String(v).trim() !== "").length;
    const missing = checks.filter(([, v]) => !v || String(v).trim() === "").map(([l]) => l);
    return { pct: Math.round((filled / checks.length) * 100), missing };
  }, [role, profile, studentForm, institutionForm, avatarUrl]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-10 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-8 w-52 bg-gray-200 rounded mb-6" />
          <div className="h-40 bg-gray-100 rounded-2xl mb-4" />
          <div className="h-80 bg-gray-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your {role === "institution" ? "institution" : "personal"} details.
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

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 10.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" clipRule="evenodd" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        {profile && (
          <>
            {/* ── Identity card + completeness ── */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 sm:p-7 mb-5 text-white relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-red-500/20 rounded-full blur-2xl" />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <Avatar url={avatarUrl} name={displayName} />
                  <div>
                    <p className="font-bold text-lg leading-tight">{displayName || "—"}</p>
                    <p className="text-xs text-gray-300">{displayEmail || "No email on file"}</p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                      {role}
                    </span>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => { setIsEditing(true); if (activeTab === "overview") setActiveTab(tabs[1].key); }}
                    className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Completeness bar */}
              <div className="relative mt-6">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-medium">Profile completeness</span>
                  <span className="font-bold">{completeness.pct}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${completeness.pct}%` }}
                  />
                </div>
                {completeness.pct < 100 && completeness.missing.length > 0 && (
                  <p className="text-[11px] text-gray-300 mt-2">
                    Missing: {completeness.missing.slice(0, 3).join(", ")}
                    {completeness.missing.length > 3 ? ` +${completeness.missing.length - 3} more` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === t.key
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Content card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {saveError && (
                <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                  {saveError}
                </div>
              )}

              <div className="px-6 py-6">
                {activeTab === "overview" && (
                  <>
                    {/* ── Profile Photo section ── */}
                    <SectionTitle>Profile Photo</SectionTitle>
                    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-50">
                      <Avatar url={avatarUrl} name={displayName} size="w-20 h-20" textSize="text-2xl" />
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            onClick={handleAvatarPick}
                            disabled={avatarBusy}
                            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {avatarBusy ? "Uploading…" : avatarUrl ? "Change Photo" : "Upload Photo"}
                          </button>
                          {avatarUrl && (
                            <button
                              onClick={handleAvatarDelete}
                              disabled={avatarBusy}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2">
                          JPG, PNG, or WEBP. Max {MAX_AVATAR_MB}MB.
                        </p>
                        {avatarError && (
                          <p className="text-xs text-red-600 mt-1.5">{avatarError}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {role === "student" ? (
                  <StudentTabContent
                    tab={activeTab}
                    isEditing={isEditing}
                    form={studentForm}
                    setForm={setStudentForm}
                    displayName={displayName}
                    displayEmail={displayEmail}
                    completenessPct={completeness.pct}
                  />
                ) : (
                  <InstitutionTabContent
                    tab={activeTab}
                    isEditing={isEditing}
                    form={institutionForm}
                    setForm={setInstitutionForm}
                    displayName={displayName}
                    displayEmail={displayEmail}
                    completenessPct={completeness.pct}
                    isApproved={profile.isApproved}
                  />
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/60 sticky bottom-0">
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
          </>
        )}
      </div>
    </main>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STUDENT tab content
// ─────────────────────────────────────────────────────────────────────────
function StudentTabContent({ tab, isEditing, form, setForm, displayName, displayEmail, completenessPct }) {
  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (tab === "overview") {
    return (
      <div>
        <SectionTitle>Account</SectionTitle>
        <DetailGrid>
          <DetailCard icon="👤" label="Full Name" value={displayName} />
          <DetailCard icon="✉️" label="Email" value={displayEmail} />
        </DetailGrid>
        <p className="text-xs text-gray-400 mt-4">
          Name and email are tied to your login account. To change them, contact support.
        </p>
        {completenessPct < 100 && (
          <div className="mt-5 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
            Your profile is {completenessPct}% complete. Fill in the remaining sections so
            institutions and scholarship matching can find you more easily.
          </div>
        )}
      </div>
    );
  }

  if (tab === "personal") {
    return !isEditing ? (
      <div>
        <SectionTitle>Personal Info</SectionTitle>
        <DetailGrid>
          <DetailCard icon="🎂" label="Date of Birth" value={form.dob} />
          <DetailCard icon="⚥" label="Gender" value={form.gender} />
          <DetailCard icon="📞" label="Phone" value={form.phone} />
        </DetailGrid>
      </div>
    ) : (
      <div>
        <SectionTitle>Personal Info</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Date of Birth">
            <input type="date" className={inputCls} value={form.dob} onChange={upd("dob")} />
          </Field>
          <Field label="Gender">
            <select className={inputCls} value={form.gender} onChange={upd("gender")}>
              <option value="">Select…</option>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Phone">
            <input type="text" className={inputCls} value={form.phone} onChange={upd("phone")} />
          </Field>
        </div>
      </div>
    );
  }

  if (tab === "address") {
    return !isEditing ? (
      <div>
        <SectionTitle>Address</SectionTitle>
        <DetailGrid>
          <DetailCard icon="🗺️" label="Province" value={form.province} />
          <DetailCard icon="📍" label="District" value={form.district} />
          <DetailCard icon="🏘️" label="Municipality" value={form.municipality} />
          <DetailCard icon="#️⃣" label="Ward" value={form.ward} />
          <DetailCard icon="🛣️" label="Street" value={form.street} />
        </DetailGrid>
      </div>
    ) : (
      <div>
        <SectionTitle>Address</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Province"><input className={inputCls} value={form.province} onChange={upd("province")} /></Field>
          <Field label="District"><input className={inputCls} value={form.district} onChange={upd("district")} /></Field>
          <Field label="Municipality"><input className={inputCls} value={form.municipality} onChange={upd("municipality")} /></Field>
          <Field label="Ward"><input className={inputCls} value={form.ward} onChange={upd("ward")} /></Field>
          <Field label="Street"><input className={inputCls} value={form.street} onChange={upd("street")} /></Field>
        </div>
      </div>
    );
  }

  if (tab === "guardian") {
    return !isEditing ? (
      <div>
        <SectionTitle>Guardian</SectionTitle>
        <DetailGrid>
          <DetailCard icon="👤" label="Name" value={form.guardianName} />
          <DetailCard icon="🔗" label="Relation" value={form.guardianRelation} />
          <DetailCard icon="📞" label="Phone" value={form.guardianPhone} />
          <DetailCard icon="💼" label="Occupation" value={form.guardianOccupation} />
        </DetailGrid>
      </div>
    ) : (
      <div>
        <SectionTitle>Guardian</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Name"><input className={inputCls} value={form.guardianName} onChange={upd("guardianName")} /></Field>
          <Field label="Relation"><input className={inputCls} value={form.guardianRelation} onChange={upd("guardianRelation")} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.guardianPhone} onChange={upd("guardianPhone")} /></Field>
          <Field label="Occupation"><input className={inputCls} value={form.guardianOccupation} onChange={upd("guardianOccupation")} /></Field>
        </div>
      </div>
    );
  }

  if (tab === "education") {
    return !isEditing ? (
      <div>
        <SectionTitle>Education</SectionTitle>
        <DetailGrid>
          <DetailCard icon="🏫" label="School / College" value={form.schoolName} />
          <DetailCard icon="🏷️" label="School Type" value={form.schoolType} />
          <DetailCard icon="🎓" label="Current Level" value={form.currentEducationLevel} />
        </DetailGrid>
      </div>
    ) : (
      <div>
        <SectionTitle>Education</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="School / College Name">
            <input className={inputCls} value={form.schoolName} onChange={upd("schoolName")} />
          </Field>
          <Field label="School Type">
            <select className={inputCls} value={form.schoolType} onChange={upd("schoolType")}>
              <option value="">Select…</option>
              {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Current Education Level">
            <select className={inputCls} value={form.currentEducationLevel} onChange={upd("currentEducationLevel")}>
              <option value="">Select…</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// INSTITUTION tab content
// ─────────────────────────────────────────────────────────────────────────
function InstitutionTabContent({ tab, isEditing, form, setForm, displayName, displayEmail, completenessPct, isApproved }) {
  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (tab === "overview") {
    return (
      <div>
        <SectionTitle>Account</SectionTitle>
        <DetailGrid>
          <DetailCard icon="🏢" label="Registered Name" value={displayName} />
          <DetailCard icon="✉️" label="Email" value={displayEmail} />
          <DetailCard
            icon={isApproved ? "✓" : "⏳"}
            label="Verification Status"
            value={isApproved ? "Approved" : "Pending Approval"}
          />
        </DetailGrid>
        {completenessPct < 100 && (
          <div className="mt-5 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
            Your institution profile is {completenessPct}% complete. A fuller profile builds
            more trust with prospective students.
          </div>
        )}
      </div>
    );
  }

  if (tab === "institution") {
    return !isEditing ? (
      <div>
        <SectionTitle>Institution Info</SectionTitle>
        <DetailGrid>
          <DetailCard icon="🏢" label="Name" value={form.institutionName} />
          <DetailCard icon="🏷️" label="Type" value={form.institutionType} />
          <DetailCard icon="🎓" label="Affiliated University" value={form.affiliatedUniversity} />
          <DetailCard icon="📅" label="Established Year" value={form.establishedYear} />
          <DetailCard icon="🌐" label="Website" value={form.website} />
          <DetailCard icon="📝" label="Description" value={form.description} />
        </DetailGrid>
      </div>
    ) : (
      <div>
        <SectionTitle>Institution Info</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Institution Name">
            <input className={inputCls} value={form.institutionName} onChange={upd("institutionName")} />
          </Field>
          <Field label="Institution Type">
            <select className={inputCls} value={form.institutionType} onChange={upd("institutionType")}>
              <option value="">Select…</option>
              {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Affiliated University">
            <select className={inputCls} value={form.affiliatedUniversity} onChange={upd("affiliatedUniversity")}>
              <option value="">Select…</option>
              {UNIVERSITIES.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Established Year">
            <input type="number" className={inputCls} value={form.establishedYear} onChange={upd("establishedYear")} />
          </Field>
          <Field label="Website">
            <input className={inputCls} value={form.website} onChange={upd("website")} />
          </Field>
        </div>
        <Field label="Description">
          <textarea rows={3} className={inputCls} value={form.description} onChange={upd("description")} />
        </Field>
      </div>
    );
  }

  if (tab === "location") {
    return !isEditing ? (
      <div>
        <SectionTitle>Location</SectionTitle>
        <DetailGrid>
          <DetailCard icon="🗺️" label="Province" value={form.province} />
          <DetailCard icon="📍" label="District" value={form.district} />
          <DetailCard icon="🏘️" label="Municipality" value={form.municipality} />
          <DetailCard icon="#️⃣" label="Ward" value={form.ward} />
          <DetailCard icon="🛣️" label="Street" value={form.street} />
        </DetailGrid>
      </div>
    ) : (
      <div>
        <SectionTitle>Location</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Province"><input className={inputCls} value={form.province} onChange={upd("province")} /></Field>
          <Field label="District"><input className={inputCls} value={form.district} onChange={upd("district")} /></Field>
          <Field label="Municipality"><input className={inputCls} value={form.municipality} onChange={upd("municipality")} /></Field>
          <Field label="Ward"><input className={inputCls} value={form.ward} onChange={upd("ward")} /></Field>
          <Field label="Street"><input className={inputCls} value={form.street} onChange={upd("street")} /></Field>
        </div>
      </div>
    );
  }

  if (tab === "contact") {
    return !isEditing ? (
      <div>
        <SectionTitle>Contact Person</SectionTitle>
        <DetailGrid>
          <DetailCard icon="👤" label="Name" value={form.contactName} />
          <DetailCard icon="📞" label="Phone" value={form.contactPhone} />
          <DetailCard icon="✉️" label="Email" value={form.contactEmail} />
          <DetailCard icon="🏷️" label="Designation" value={form.contactDesignation} />
        </DetailGrid>
      </div>
    ) : (
      <div>
        <SectionTitle>Contact Person</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Name"><input className={inputCls} value={form.contactName} onChange={upd("contactName")} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.contactPhone} onChange={upd("contactPhone")} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.contactEmail} onChange={upd("contactEmail")} /></Field>
          <Field label="Designation"><input className={inputCls} value={form.contactDesignation} onChange={upd("contactDesignation")} /></Field>
        </div>
      </div>
    );
  }

  return null;
}
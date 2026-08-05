// pages/Auth/CompleteInstitutionProfile.jsx — Step 2 (final step) of
// institution signup. Reached right after Google login if profileCompleted
// is false. Submits to PUT /api/institution/complete-profile.
//
// Suggested route: <Route path="/complete-institution-profile" element={<CompleteInstitutionProfile />} />

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import LocationCascade from "../../Components/LocationCascade";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INSTITUTION_TYPES = ["School", "College", "University"];

export default function CompleteInstitutionProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    institutionName: "",
    institutionType: "",
    establishedYear: "",
    website: "",
    description: "",
    location: { province: "", district: "", municipality: "", ward: "", street: "" },
    contactPerson: { name: "", phone: "", email: "", designation: "" },
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setNested = (section, field, value) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.institutionName.trim()) {
      setError("Institution name is required.");
      return;
    }
    if (!form.location.province || !form.location.district) {
      setError("Please select at least a province and district.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        institutionName: form.institutionName,
        institutionType: form.institutionType || undefined,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
        website: form.website || undefined,
        description: form.description || undefined,
        location: form.location,
        contactPerson: form.contactPerson,
      };

      await axios.put(`${API}/api/institution/complete-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/dashboard-institution");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionTitle = (t) => (
    <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mt-6 mb-4 pb-2 border-b border-gray-100">
      {t}
    </h3>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <span className="text-red-500 font-extrabold text-2xl">CAN</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Complete your Institution Profile
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Step 2 of 2 — this is the last step before your dashboard
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {sectionTitle("Institution Info")}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Institution Name</label>
                  <input
                    className={inputCls}
                    placeholder="Institution name"
                    value={form.institutionName}
                    onChange={(e) => set("institutionName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select
                    className={inputCls}
                    value={form.institutionType}
                    onChange={(e) => set("institutionType", e.target.value)}
                  >
                    <option value="">Select Type</option>
                    {INSTITUTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Established Year</label>
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="e.g. 1995"
                    value={form.establishedYear}
                    onChange={(e) => set("establishedYear", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Website</label>
                  <input
                    className={inputCls}
                    placeholder="https://institution.edu.np"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    placeholder="Brief description..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </div>
              </div>

              {sectionTitle("Location")}
              <LocationCascade
                idMode="name"
                province={form.location.province}
                district={form.location.district}
                municipality={form.location.municipality}
                onChange={({ province, district, municipality }) =>
                  setForm((f) => ({
                    ...f,
                    location: { ...f.location, province, district, municipality },
                  }))
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelCls}>Ward</label>
                  <input
                    className={inputCls}
                    placeholder="Ward No."
                    value={form.location.ward}
                    onChange={(e) => setNested("location", "ward", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Street</label>
                  <input
                    className={inputCls}
                    placeholder="Street"
                    value={form.location.street}
                    onChange={(e) => setNested("location", "street", e.target.value)}
                  />
                </div>
              </div>

              {sectionTitle("Contact Person")}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name</label>
                  <input
                    className={inputCls}
                    placeholder="Contact person name"
                    value={form.contactPerson.name}
                    onChange={(e) => setNested("contactPerson", "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Designation</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Principal"
                    value={form.contactPerson.designation}
                    onChange={(e) => setNested("contactPerson", "designation", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={inputCls}
                    placeholder="98XXXXXXXX"
                    value={form.contactPerson.phone}
                    onChange={(e) => setNested("contactPerson", "phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="contact@institution.edu.np"
                    value={form.contactPerson.email}
                    onChange={(e) => setNested("contactPerson", "email", e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                {loading ? "Saving…" : "Complete Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
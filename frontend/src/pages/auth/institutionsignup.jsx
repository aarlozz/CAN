import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PROVINCES = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];

export default function InstitutionSignup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    institutionName: "", institutionType: "", establishedYear: "",
    website: "", description: "",
    location: { province: "", district: "", municipality: "", ward: "", street: "" },
    contactPerson: { name: "", phone: "", email: "", designation: "" },
  });

  // Maps flat input names to nested contactPerson keys
  const contactMap = { contactName: "name", contactPhone: "phone", contactEmail: "email", contactDesignation: "designation" };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["province", "district", "municipality", "ward", "street"].includes(name)) {
      setFormData((f) => ({ ...f, location: { ...f.location, [name]: value } }));
    } else if (contactMap[name]) {
      setFormData((f) => ({ ...f, contactPerson: { ...f.contactPerson, [contactMap[name]]: value } }));
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/signup-institution`, {
        ...formData,
        establishedYear: formData.establishedYear ? Number(formData.establishedYear) : undefined,
      });
      alert("Institution registered successfully!");
      navigate("/login-institution");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const cls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition";
  const lbl = "block text-sm font-medium text-gray-700 mb-1.5";
  const section = (t) => (
    <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mt-6 mb-4 pb-2 border-b border-gray-100">{t}</h3>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-red-500 font-extrabold text-2xl">CAN</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Register Your Institution</h1>
            <p className="text-gray-500 text-sm mt-1">Join CAN Federation's scholarship portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {section("Account Details")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Owner / Admin Name</label>
                <input className={cls} name="name" placeholder="Your full name" value={formData.name}
                  onChange={handleChange} required />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input className={cls} name="email" type="email" placeholder="admin@institution.edu.np"
                  value={formData.email} onChange={handleChange} required />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Password</label>
                <input className={cls} name="password" type="password" placeholder="••••••••"
                  value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            {section("Institution Details")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>Institution Name</label>
                <input className={cls} name="institutionName" placeholder="Official institution name"
                  value={formData.institutionName} onChange={handleChange} required />
              </div>
              <div>
                <label className={lbl}>Type</label>
                <select className={cls} name="institutionType" value={formData.institutionType}
                  onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option>School</option><option>College</option><option>University</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Established Year</label>
                <input className={cls} name="establishedYear" type="number" placeholder="e.g. 1985"
                  value={formData.establishedYear} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Website</label>
                <input className={cls} name="website" placeholder="https://institution.edu.np"
                  value={formData.website} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>
                <textarea className={cls + " resize-none"} name="description" rows={3}
                  placeholder="Brief description of your institution…"
                  value={formData.description} onChange={handleChange} />
              </div>
            </div>

            {section("Location")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Province</label>
                <select className={cls} name="province" value={formData.location.province}
                  onChange={handleChange} required>
                  <option value="">Select Province</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>District</label>
                <input className={cls} name="district" placeholder="District" value={formData.location.district}
                  onChange={handleChange} required />
              </div>
              <div>
                <label className={lbl}>Municipality</label>
                <input className={cls} name="municipality" placeholder="Municipality"
                  value={formData.location.municipality} onChange={handleChange} />
              </div>
              <div>
                <label className={lbl}>Ward</label>
                <input className={cls} name="ward" placeholder="Ward No." value={formData.location.ward}
                  onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Street</label>
                <input className={cls} name="street" placeholder="Street / Tole"
                  value={formData.location.street} onChange={handleChange} />
              </div>
            </div>

            {section("Contact Person")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Name</label>
                <input className={cls} name="contactName" placeholder="Contact person name"
                  value={formData.contactPerson.name} onChange={handleChange} />
              </div>
              <div>
                <label className={lbl}>Designation</label>
                <input className={cls} name="contactDesignation" placeholder="e.g. Principal"
                  value={formData.contactPerson.designation} onChange={handleChange} />
              </div>
              <div>
                <label className={lbl}>Phone</label>
                <input className={cls} name="contactPhone" placeholder="98XXXXXXXX"
                  value={formData.contactPerson.phone} onChange={handleChange} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input className={cls} name="contactEmail" type="email" placeholder="contact@institution.edu.np"
                  value={formData.contactPerson.email} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-8 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
              {loading ? "Registering…" : "Register Institution"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already registered?{" "}
            <Link to="/login-institution" className="text-red-500 hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
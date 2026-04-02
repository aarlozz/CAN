<<<<<<< HEAD
// signup.jsx — Role selector page at /signup
//
// Simple card UI: pick Student or College, then route to the
// dedicated registration form.

import { Link } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';

function Signup() {
  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center px-4">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 mt-2">Who are you registering as?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">

          {/* Student Card */}
          <Link
            to="/signup/student"
            className="group flex flex-col items-center justify-center gap-4 bg-white border-2 border-gray-200 hover:border-red-500 rounded-2xl p-10 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c3.866 0 7 1.343 7 3v1H5v-1c0-1.657 3.134-3 7-3zm0-2a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                I am a Student
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Search and apply for scholarships
              </p>
            </div>
            <span className="mt-2 text-sm font-medium text-red-600 group-hover:underline">
              Register as Student →
            </span>
          </Link>

          {/* College Card */}
          <Link
            to="/signup/college"
            className="group flex flex-col items-center justify-center gap-4 bg-white border-2 border-gray-200 hover:border-red-500 rounded-2xl p-10 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9l10 6 10-6-10-6zM2 17l10 6 10-6M2 13l10 6 10-6" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                I am a College
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Post scholarships and review applications
              </p>
            </div>
            <span className="mt-2 text-sm font-medium text-red-600 group-hover:underline">
              Register as College →
            </span>
          </Link>

        </div>

        <p className="mt-8 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 font-medium hover:underline">
            Log in
          </Link>
        </p>

      </main>

      <Footer />
    </>
  );
}

export default Signup;
=======
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PROVINCES = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    // student
    personal_info: { dob: "", gender: "", phone: "" },
    address: { province: "", district: "", municipality: "", ward: "", street: "" },
    guardian_info: { name: "", relation: "", phone_number: "", occupation: "" },
    // institution
    institutionName: "", institutionType: "", establishedYear: "", website: "", description: "",
    location: { province: "", district: "", municipality: "", ward: "", street: "" },
    contactPerson: { name: "", phone: "", email: "", designation: "" },
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setNested = (section, field, value) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      name: form.name, email: form.email, password: form.password, role,
      ...(role === "student"
        ? { personal_info: form.personal_info, address: form.address, guardian_info: form.guardian_info }
        : {
            institutionName: form.institutionName, institutionType: form.institutionType,
            establishedYear: Number(form.establishedYear), website: form.website,
            description: form.description, location: form.location, contactPerson: form.contactPerson,
          }),
    };
    try {
      await axios.post(`${API}/api/authbuild/signup`, payload);
      alert("Registered successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionTitle = (t) => (
    <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mt-6 mb-4 pb-2 border-b border-gray-100">
      {t}
    </h3>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <span className="text-red-500 font-extrabold text-2xl">CAN</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Create an account</h1>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
            {["student", "institution"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  role === r ? "bg-white text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {sectionTitle("Basic Info")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} placeholder="Full name" value={form.name}
                  onChange={(e) => set("name", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => set("email", e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Password</label>
                <input className={inputCls} type="password" placeholder="••••••••" value={form.password}
                  onChange={(e) => set("password", e.target.value)} required />
              </div>
            </div>

            {/* Student Fields */}
            {role === "student" && (
              <>
                {sectionTitle("Personal Info")}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Date of Birth</label>
                    <input className={inputCls} type="date" value={form.personal_info.dob}
                      onChange={(e) => setNested("personal_info", "dob", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select className={inputCls} value={form.personal_info.gender}
                      onChange={(e) => setNested("personal_info", "gender", e.target.value)}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} placeholder="98XXXXXXXX" maxLength={10}
                      value={form.personal_info.phone}
                      onChange={(e) => setNested("personal_info", "phone", e.target.value)} />
                  </div>
                </div>

                {sectionTitle("Address")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Province</label>
                    <select className={inputCls} value={form.address.province} required
                      onChange={(e) => setNested("address", "province", e.target.value)}>
                      <option value="">Select Province</option>
                      {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>District</label>
                    <input className={inputCls} placeholder="District" value={form.address.district} required
                      onChange={(e) => setNested("address", "district", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Municipality</label>
                    <input className={inputCls} placeholder="Municipality" value={form.address.municipality} required
                      onChange={(e) => setNested("address", "municipality", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Ward</label>
                    <input className={inputCls} placeholder="Ward No." value={form.address.ward}
                      onChange={(e) => setNested("address", "ward", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Street</label>
                    <input className={inputCls} placeholder="Street / Tole" value={form.address.street}
                      onChange={(e) => setNested("address", "street", e.target.value)} />
                  </div>
                </div>

                {sectionTitle("Guardian Info")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Guardian Name</label>
                    <input className={inputCls} placeholder="Full name" value={form.guardian_info.name} required
                      onChange={(e) => setNested("guardian_info", "name", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Relation</label>
                    <input className={inputCls} placeholder="e.g. Father" value={form.guardian_info.relation} required
                      onChange={(e) => setNested("guardian_info", "relation", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input className={inputCls} placeholder="98XXXXXXXX" maxLength={10}
                      value={form.guardian_info.phone_number} required
                      onChange={(e) => setNested("guardian_info", "phone_number", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Occupation</label>
                    <input className={inputCls} placeholder="Occupation" value={form.guardian_info.occupation}
                      onChange={(e) => setNested("guardian_info", "occupation", e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* Institution Fields */}
            {role === "institution" && (
              <>
                {sectionTitle("Institution Info")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Institution Name</label>
                    <input className={inputCls} placeholder="Institution name" value={form.institutionName} required
                      onChange={(e) => set("institutionName", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select className={inputCls} value={form.institutionType} required
                      onChange={(e) => set("institutionType", e.target.value)}>
                      <option value="">Select Type</option>
                      <option>School</option><option>College</option><option>University</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Established Year</label>
                    <input className={inputCls} type="number" placeholder="e.g. 1995" value={form.establishedYear}
                      onChange={(e) => set("establishedYear", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Website</label>
                    <input className={inputCls} placeholder="https://institution.edu.np" value={form.website}
                      onChange={(e) => set("website", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea className={inputCls + " resize-none"} rows={3} placeholder="Brief description..."
                      value={form.description} onChange={(e) => set("description", e.target.value)} />
                  </div>
                </div>

                {sectionTitle("Location")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Province</label>
                    <select className={inputCls} value={form.location.province} required
                      onChange={(e) => setNested("location", "province", e.target.value)}>
                      <option value="">Select Province</option>
                      {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>District</label>
                    <input className={inputCls} placeholder="District" value={form.location.district} required
                      onChange={(e) => setNested("location", "district", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Municipality</label>
                    <input className={inputCls} placeholder="Municipality" value={form.location.municipality}
                      onChange={(e) => setNested("location", "municipality", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Ward</label>
                    <input className={inputCls} placeholder="Ward No." value={form.location.ward}
                      onChange={(e) => setNested("location", "ward", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Street</label>
                    <input className={inputCls} placeholder="Street" value={form.location.street}
                      onChange={(e) => setNested("location", "street", e.target.value)} />
                  </div>
                </div>

                {sectionTitle("Contact Person")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input className={inputCls} placeholder="Contact person name" value={form.contactPerson.name}
                      onChange={(e) => setNested("contactPerson", "name", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Designation</label>
                    <input className={inputCls} placeholder="e.g. Principal" value={form.contactPerson.designation}
                      onChange={(e) => setNested("contactPerson", "designation", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} placeholder="98XXXXXXXX" value={form.contactPerson.phone}
                      onChange={(e) => setNested("contactPerson", "phone", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input className={inputCls} type="email" placeholder="contact@institution.edu.np"
                      value={form.contactPerson.email}
                      onChange={(e) => setNested("contactPerson", "email", e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-8 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-red-500 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
>>>>>>> e1fa25b551d5fdef7fb993a20ed4a57e87c8f083

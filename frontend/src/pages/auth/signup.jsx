import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import LocationCascade from "../../Components/LocationCascade";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(
    searchParams.get("role") === "institution" ? "institution" : "student"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/authbuild/google-login`, {
        token: credentialResponse.credential,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (
    res.data.role === "student" &&
    !res.data.profile.profileCompleted
) {
    navigate("/complete-profile");
} else if (res.data.role === "student") {
    navigate("/dashboard-student");
} else {
    navigate("/dashboard-institution");
}
    } catch (err) {
      setError(err.response?.data?.message || "Google Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-Up was unsuccessful. Please try again.");
  };


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

  // Wires a LocationCascade onChange payload ({ province, district, municipality })
  // straight into a nested form section (either "address" or "location").
  const setLocationSection = (section) => ({ province, district, municipality }) =>
    setForm((f) => ({
      ...f,
      [section]: { ...f[section], province, district, municipality },
    }));

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
    <>
    <Header />
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
                <LocationCascade
                  idMode="name"
                  province={form.address.province}
                  district={form.address.district}
                  municipality={form.address.municipality}
                  onChange={setLocationSection("address")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelCls}>Ward</label>
                    <input className={inputCls} placeholder="Ward No." value={form.address.ward}
                      onChange={(e) => setNested("address", "ward", e.target.value)} />
                  </div>
                  <div>
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
                <LocationCascade
                  idMode="name"
                  province={form.location.province}
                  district={form.location.district}
                  municipality={form.location.municipality}
                  onChange={setLocationSection("location")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelCls}>Ward</label>
                    <input className={inputCls} placeholder="Ward No." value={form.location.ward}
                      onChange={(e) => setNested("location", "ward", e.target.value)} />
                  </div>
                  <div>
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

            {role === "student" && (
              <>
                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative px-4 bg-white text-sm text-gray-500">Or sign up with</div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  />
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-red-500 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}
// pages/Auth/InstitutionSignupStart.jsx — Step 1 of institution signup.
//
// Institution picks their type + affiliated university, then continues with
// Google. Both values are sent along with the Google credential so the
// backend can create the InstitutionProfile stub with them already filled
// in (see googleLoginInstitutionBranch.js for the backend side).
//
// Suggested route: <Route path="/signup/institution" element={<InstitutionSignupStart />} />

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import { UNIVERSITIES } from "../../constants/educationTaxonomy"; // adjust path

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INSTITUTION_TYPES = ["School", "College", "University"];

export default function InstitutionSignupStart() {
  const navigate = useNavigate();
  const [institutionType, setInstitutionType] = useState("");
  const [affiliatedUniversity, setAffiliatedUniversity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canContinue = institutionType && affiliatedUniversity;

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/authbuild/google-login`, {
        token: credentialResponse.credential,
        role: "institution",
        institutionType,
        affiliatedUniversity,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (!res.data.profile?.profileCompleted) {
        navigate("/complete-institution-profile");
      } else {
        navigate("/dashboard-institution");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google Sign-Up was unsuccessful.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-Up was unsuccessful. Please try again.");
  };

  const selectCls =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <span className="text-red-500 font-extrabold text-2xl">CAN</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Register your Institution
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Step 1 of 2 — tell us a bit about your institution
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className={labelCls}>Institution Type</label>
              <select
                className={selectCls}
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
              >
                <option value="">Select type</option>
                {INSTITUTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className={labelCls}>Affiliated University</label>
              <select
                className={selectCls}
                value={affiliatedUniversity}
                onChange={(e) => setAffiliatedUniversity(e.target.value)}
              >
                <option value="">Select affiliated university</option>
                {UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {!canContinue && (
              <p className="text-xs text-gray-400 text-center mb-3">
                Select both fields to continue with Google
              </p>
            )}

            <div className={`flex justify-center ${!canContinue || loading ? "opacity-40 pointer-events-none" : ""}`}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already registered?{" "}
              <Link to="/login" className="text-red-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
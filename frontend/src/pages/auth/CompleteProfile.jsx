import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

export default function CompleteProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    personal_info: {
      dob: "",
      gender: "",
      phone: "",
    },

    address: {
      province: "",
      district: "",
      municipality: "",
      ward: "",
      street: "",
    },

    guardian_info: {
      name: "",
      relation: "",
      phone_number: "",
      occupation: "",
    },

    educationInfo: {
      schoolName: "",
      schoolType: "",
      currentEducationLevel: "",
    },

    reservationInfo: {
      caste: "",
      hasDisability: false,
      disabilityType: "",
    },
  });

  const setNested = (section, field, value) => {
    setForm((prev) => ({
      ...prev,

      [section]: {
        ...prev[section],

        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.put(`${API}/api/student/complete-profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Profile completed successfully!");

      navigate("/dashboard-student");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition";

  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  const sectionTitle = (title) => (
    <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mt-6 mb-4 pb-2 border-b border-gray-100">
      {title}
    </h3>
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <span className="text-red-500 font-extrabold text-2xl">CAN</span>

              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Complete Your Profile
              </h1>

              <p className="text-gray-500 mt-2">
                Welcome! Your Google account has been created successfully.
                Please complete your profile before continuing.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* ================= Personal Information ================= */}

              {sectionTitle("Personal Information")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Date of Birth</label>

                  <input
                    type="date"
                    className={inputCls}
                    value={form.personal_info.dob}
                    onChange={(e) =>
                      setNested("personal_info", "dob", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Gender</label>

                  <select
                    className={inputCls}
                    value={form.personal_info.gender}
                    onChange={(e) =>
                      setNested("personal_info", "gender", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Gender</option>

                    <option value="Male">Male</option>

                    <option value="Female">Female</option>

                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Phone Number</label>

                  <input
                    type="tel"
                    className={inputCls}
                    value={form.personal_info.phone}
                    onChange={(e) =>
                      setNested("personal_info", "phone", e.target.value)
                    }
                    placeholder="98XXXXXXXX"
                    required
                  />
                </div>
              </div>

              {/* ================= Address ================= */}

              {sectionTitle("Address")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Province</label>

                  <select
                    className={inputCls}
                    value={form.address.province}
                    onChange={(e) =>
                      setNested("address", "province", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Province</option>

                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>District</label>

                  <input
                    className={inputCls}
                    value={form.address.district}
                    onChange={(e) =>
                      setNested("address", "district", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Municipality</label>

                  <input
                    className={inputCls}
                    value={form.address.municipality}
                    onChange={(e) =>
                      setNested("address", "municipality", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Ward</label>

                  <input
                    className={inputCls}
                    value={form.address.ward}
                    onChange={(e) =>
                      setNested("address", "ward", e.target.value)
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Street</label>

                  <input
                    className={inputCls}
                    value={form.address.street}
                    onChange={(e) =>
                      setNested("address", "street", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* ================= Guardian ================= */}

              {sectionTitle("Guardian Information")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Guardian Name</label>

                  <input
                    className={inputCls}
                    value={form.guardian_info.name}
                    onChange={(e) =>
                      setNested("guardian_info", "name", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Relation</label>

                  <input
                    className={inputCls}
                    value={form.guardian_info.relation}
                    onChange={(e) =>
                      setNested("guardian_info", "relation", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Phone Number</label>

                  <input
                    className={inputCls}
                    value={form.guardian_info.phone_number}
                    onChange={(e) =>
                      setNested("guardian_info", "phone_number", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Occupation</label>

                  <input
                    className={inputCls}
                    value={form.guardian_info.occupation}
                    onChange={(e) =>
                      setNested("guardian_info", "occupation", e.target.value)
                    }
                  />
                </div>
              </div>
              {/* ================= Education ================= */}

              {sectionTitle("Education Information")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelCls}>School Name</label>

                  <input
                    className={inputCls}
                    value={form.educationInfo.schoolName}
                    onChange={(e) =>
                      setNested("educationInfo", "schoolName", e.target.value)
                    }
                    placeholder="Enter your school name"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>School Type</label>

                  <select
                    className={inputCls}
                    value={form.educationInfo.schoolType}
                    onChange={(e) =>
                      setNested("educationInfo", "schoolType", e.target.value)
                    }
                    required
                  >
                    <option value="">Select School Type</option>
                    <option value="Government">Government</option>
                    <option value="Community">Community</option>
                    <option value="Private">Private</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Current Education Level</label>

                  <select
                    className={inputCls}
                    value={form.educationInfo.currentEducationLevel}
                    onChange={(e) =>
                      setNested(
                        "educationInfo",
                        "currentEducationLevel",
                        e.target.value,
                      )
                    }
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="SEE">SEE</option>
                    <option value="+2">+2</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* ================= Reservation ================= */}

              {sectionTitle("Reservation Information")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Caste</label>

                  <input
                    className={inputCls}
                    value={form.reservationInfo.caste}
                    onChange={(e) =>
                      setNested("reservationInfo", "caste", e.target.value)
                    }
                    placeholder="Enter your caste"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Do you have any disability?
                  </label>

                  <select
                    className={inputCls}
                    value={form.reservationInfo.hasDisability ? "Yes" : "No"}
                    onChange={(e) =>
                      setNested(
                        "reservationInfo",
                        "hasDisability",
                        e.target.value === "Yes",
                      )
                    }
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {form.reservationInfo.hasDisability && (
                  <div className="md:col-span-2">
                    <label className={labelCls}>Disability Type</label>

                    <input
                      className={inputCls}
                      value={form.reservationInfo.disabilityType}
                      onChange={(e) =>
                        setNested(
                          "reservationInfo",
                          "disabilityType",
                          e.target.value,
                        )
                      }
                      placeholder="Describe disability"
                    />
                  </div>
                )}
              </div>

              {/* ================= Submit ================= */}

              <div className="mt-10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition duration-200"
                >
                  {loading ? "Completing Profile..." : "Complete Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

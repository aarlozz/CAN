import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import image15 from "../../assets/images/image/image15.png";
import api from "../../services/api";                    // ✅ use central api instance, not raw axios

function Login() {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");        // show error message in UI (not just alert)
  const [loading, setLoading] = useState(false); // disable button while request is in flight

  const navigate = useNavigate();                // redirect after login

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");                                // clear error on any input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", form);

      // Save token + institution info to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("institution", JSON.stringify(response.data.institution));

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 flex justify-center items-start px-4 sm:px-6 md:px-8 lg:px-0">
        <section
          className="relative flex flex-col items-center justify-center bg-cover bg-center rounded-3xl w-full max-w-4xl md:max-w-5xl lg:max-w-6xl overflow-hidden"
          style={{ backgroundImage: `url(${image15})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/50"></div>

          {/* Heading */}
          <p className="text-3xl sm:text-4xl text-center font-semibold z-10 mt-8 sm:mt-10 px-2 sm:px-4">
            Login to your account
          </p>

          {/* Form Container */}
          <div className="bg-red-400/55 w-full sm:w-[90%] md:w-[80%] lg:w-[70%] flex flex-col items-center rounded-3xl px-4 sm:px-6 md:px-8 py-6 mt-6 sm:mt-2 mb-10">
            <div className="relative w-full flex flex-col z-10 gap-4 sm:gap-6">

              {/* Welcome Text */}
              <p className="text-2xl sm:text-3xl font-semibold text-center mt-6 sm:mt-12">
                Welcome Back
              </p>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">

                {/* EMAIL */}
                <div className="flex flex-col w-full px-2 sm:px-0">
                  <label
                    htmlFor="email"
                    className="ml-2 sm:ml-4 text-sm sm:text-base text-left"
                  >
                    Enter your Email:
                  </label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-3xl w-full md:w-[90%] h-12 mt-1 px-3 sm:px-4"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="flex flex-col w-full px-2 sm:px-0">
                  <label
                    htmlFor="password"
                    className="ml-2 sm:ml-4 text-sm sm:text-base text-left"
                  >
                    Enter your password:
                  </label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-3xl w-full md:w-[90%] h-12 mt-1 px-3 sm:px-4"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-center mt-2 mb-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-10 py-3 rounded-3xl transition-colors duration-200"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>

                {/* SIGNUP LINK */}
                <p className="text-center text-sm pb-4">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-red-700 font-semibold hover:underline">
                    Sign up here
                  </Link>
                </p>

              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Login;
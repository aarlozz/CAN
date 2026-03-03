import React, { useState } from 'react';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import { Link, useNavigate } from 'react-router-dom';
import image15 from "../../assets/images/image/image15.png";
import api from "../../services/api";               // ✅ central api instance, not raw axios

function Signup() {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [form, setForm] = useState({
    institutional_name: '',
    province: '',
    city: '',
    street_address: '',
    website: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',                           // ✅ field now exists in state
  });
  const [error, setError]     = useState('');      // ✅ inline errors instead of alert()
  const [loading, setLoading] = useState(false);   // ✅ prevent double submit

  const navigate = useNavigate();                  // ✅ redirect after signup

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      // Strip confirm_password — backend doesn't need it
      const { confirm_password, ...payload } = form;

      await api.post('/auth/signup', payload);     // ✅ no hardcoded URL

      navigate('/login');                          // ✅ redirect to login after signup

    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
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
      <main className="h-full mt-37.5">
        <section
          className="relative flex flex-col items-center justify-center w-340 h-300 bg-cover bg-center rounded-3xl mx-auto overflow-hidden"
          style={{ backgroundImage: `url(${image15})` }}
        >
          <div className="absolute inset-0 bg-white/60"></div>

          <p className="text-4xl text-center font-semibold z-10 mt-10">
            Create your account
          </p>

          <div className="bg-red-400/55 w-200.75 flex flex-col h-auto items-center rounded-4xl px-4 py-4 p-10 mt-2 mb-10">
            <div className="relative w-full h-full flex flex-col z-10 gap-6">

              <p className="text-2xl font-semibold text-left mt-12 mx-auto">
                Sign Up to start your scholarship journey
              </p>

              <div className="text-1xl font-semibold text-left flex mx-auto">
                <span>Student Signup / </span>
                <span className="text-red-700">Institution Signup</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm text-center mx-auto w-full max-w-lg">
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex flex-col gap-y-5 w-140"
              >
                {/* Institution Name */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="institutional_name" className="text-left">
                    Name of Institution
                  </label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="text"
                    id="institutional_name"
                    name="institutional_name"
                    value={form.institutional_name}
                    onChange={handleChange}
                    placeholder="Institution name"
                    required
                  />
                </div>

                {/* Province */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="province" className="text-left">Province</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="text"
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    placeholder="Province"
                    required
                  />
                </div>

                {/* City */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="city" className="text-left">City</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="text"
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                {/* Street Address */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="street_address" className="text-left">Street Address</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="text"
                    id="street_address"
                    name="street_address"
                    value={form.street_address}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </div>

                {/* Website */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="website" className="text-left">Website</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="url"
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="email" className="text-left">Email</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="phone" className="text-left">Phone</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="password" className="text-left">Password</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="password"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col ml-4 w-full h-18">
                  <label htmlFor="confirm_password" className="text-left">Confirm Password</label>
                  <input
                    className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-center mt-4 mb-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-10 py-3 rounded-3xl transition-colors duration-200"
                  >
                    {loading ? 'Registering...' : 'Sign Up'}
                  </button>
                </div>

                {/* Login Link */}
                <p className="text-center text-sm pb-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-red-700 font-semibold hover:underline">
                    Login here
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

export default Signup;
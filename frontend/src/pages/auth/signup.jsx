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
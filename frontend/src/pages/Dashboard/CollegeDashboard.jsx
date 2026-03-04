// CollegeDashboard.jsx — College dashboard
// Phase 1: shell with auth-aware header and logout.
// Phase 3 will add: real API stats, scholarship management, application review.

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';

function CollegeDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // profile comes from login response — { collegeName, verification: { status } }
  const collegeName        = profile?.collegeName ?? user?.email ?? 'College';
  const verificationStatus = profile?.verification?.status ?? 'pending';

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 px-6 max-w-5xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-red-600 text-white rounded-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {collegeName} 👋</h1>
            <p className="text-sm mt-1 opacity-80">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 font-semibold px-5 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Verification Status Banner */}
        {verificationStatus !== 'verified' && (
          <div className={`rounded-2xl p-4 mb-6 text-sm font-medium ${
            verificationStatus === 'pending'
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {verificationStatus === 'pending'
              ? '⏳ Your college account is pending verification by a provincial admin. You can complete your profile while you wait.'
              : '❌ Your college account was rejected. Please contact support for details.'}
          </div>
        )}

        {/* Stat Cards — placeholder, Phase 3 will call the API */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Scholarships Posted</h2>
            <p className="text-4xl font-bold text-red-600">—</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Applications Received</h2>
            <p className="text-4xl font-bold text-red-600">—</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Pending Review</h2>
            <p className="text-4xl font-bold text-red-600">—</p>
          </div>
        </div>

        {/* Coming soon placeholder */}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
          <p className="text-lg font-medium">Full dashboard coming in Phase 3</p>
          <p className="text-sm mt-1">Scholarship management, applications, and profile completion will appear here.</p>
        </div>

      </main>
      <Footer />
    </>
  );
}

export default CollegeDashboard;
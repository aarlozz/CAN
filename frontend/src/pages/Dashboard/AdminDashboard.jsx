// AdminDashboard.jsx — Admin and ProvincialAdmin dashboard
// Phase 1: shell with auth-aware header and logout.
// Phase 3 will add: pending colleges queue, platform stats, user management.

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isProvincialAdmin = user?.userType === 'provincial_admin';

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 px-6 max-w-5xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-red-600 text-white rounded-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {isProvincialAdmin ? 'Provincial Admin Dashboard' : 'Admin Dashboard'} 👋
            </h1>
            <p className="text-sm mt-1 opacity-80">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 font-semibold px-5 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stat Cards — placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Pending Colleges</h2>
            <p className="text-4xl font-bold text-red-600">—</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Verified Colleges</h2>
            <p className="text-4xl font-bold text-red-600">—</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Total Applications</h2>
            <p className="text-4xl font-bold text-red-600">—</p>
          </div>
        </div>

        {/* Coming soon placeholder */}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
          <p className="text-lg font-medium">Full dashboard coming in Phase 3</p>
          <p className="text-sm mt-1">College verification queue, platform stats, and user management will appear here.</p>
        </div>

      </main>
      <Footer />
    </>
  );
}

export default AdminDashboard;
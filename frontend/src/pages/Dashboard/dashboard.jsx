import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';

function Dashboard() {
  const [institution, setInstitution] = useState(null);
  const navigate = useNavigate();

  // ─────────────────────────────────────────
  // Load institution info from localStorage
  // ─────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('institution');
    if (!stored) {
      navigate('/login');   // extra guard — redirect if somehow no data
      return;
    }
    setInstitution(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('institution');
    navigate('/login');
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 px-6 max-w-4xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-red-600 text-white rounded-2xl p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {institution?.name ?? 'Institution'} 👋
            </h1>
            <p className="text-sm mt-1 opacity-80">{institution?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 font-semibold px-5 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Placeholder Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">Scholarships Posted</h2>
            <p className="text-4xl font-bold text-red-600">0</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">Applications Received</h2>
            <p className="text-4xl font-bold text-red-600">0</p>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

export default Dashboard;
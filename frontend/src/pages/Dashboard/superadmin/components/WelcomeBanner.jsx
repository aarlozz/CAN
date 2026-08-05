import React from "react";

export default function WelcomeBanner({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 mb-8 text-white shadow-lg shadow-red-900/20 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || "Admin"}! 👋
        </h1>
        <p className="text-red-100 max-w-xl text-sm sm:text-base leading-relaxed">
          Here is what's happening across the CAN Federation today. Review pending institutions and monitor scholarship applications.
        </p>
      </div>
    </div>
  );
}
import React from "react";
import WelcomeBanner from "../components/WelcomeBanner";
import StatsGrid from "../components/StatsGrid";
import QuickActions from "../components/QuickActions";

export default function DashboardHome({ user, stats, setActiveTab }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <WelcomeBanner user={user} />
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Platform Overview</h2>
        <StatsGrid stats={stats} />
      </div>

      <QuickActions setActiveTab={setActiveTab} />
    </div>
  );
}

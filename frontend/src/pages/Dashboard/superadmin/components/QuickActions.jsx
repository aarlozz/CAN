import React from "react";
import { UserPlus, Building, ShieldCheck, Download } from "lucide-react";

export default function QuickActions({ setActiveTab }) {
  const actions = [
    {
      title: "Add Province Admin",
      description: "Create a new administrative account",
      icon: UserPlus,
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100",
      onClick: () => setActiveTab("province-admins")
    },
    {
      title: "Verify Institutions",
      description: "Review pending institution signups",
      icon: ShieldCheck,
      color: "text-amber-600",
      bg: "bg-amber-50 hover:bg-amber-100",
      onClick: () => setActiveTab("institutions")
    },
    {
      title: "Browse Directory",
      description: "View all approved institutions",
      icon: Building,
      color: "text-green-600",
      bg: "bg-green-50 hover:bg-green-100",
      onClick: () => setActiveTab("institutions")
    },
    {
      title: "Generate Report",
      description: "Download system analytics (CSV)",
      icon: Download,
      color: "text-purple-600",
      bg: "bg-purple-50 hover:bg-purple-100",
      onClick: () => alert("Report generation coming soon!") // Future hook
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={action.onClick}
              className={`flex items-start gap-4 p-4 rounded-2xl border border-transparent transition-all text-left ${action.bg}`}
            >
              <div className={`p-2 bg-white rounded-xl shadow-sm shrink-0 ${action.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-0.5">{action.title}</h4>
                <p className="text-xs text-slate-600">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
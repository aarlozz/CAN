import React from "react";
import { Users, Building2, GraduationCap, FileText } from "lucide-react";

export default function StatsGrid({ stats }) {
  const statCards = [
    { 
      label: "Total Students", 
      value: stats.students, 
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    { 
      label: "Institutions", 
      value: stats.institutions, 
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100"
    },
    { 
      label: "Scholarships", 
      value: stats.scholarships, 
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
    { 
      label: "Applications", 
      value: stats.applications, 
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value?.toLocaleString() || 0}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={stat.color} />
              </div>
            </div>
            {/* Subtle bottom accent line */}
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity ${stat.bg}`}></div>
          </div>
        );
      })}
    </div>
  );
}
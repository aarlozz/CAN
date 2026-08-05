import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = "No data found", 
  message = "There is currently no data to display here." 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}

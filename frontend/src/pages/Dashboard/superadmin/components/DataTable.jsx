import React from "react";
import EmptyState from "./EmptyState";

export default function DataTable({ 
  columns, 
  data, 
  isLoading, 
  emptyStateTitle, 
  emptyStateMessage,
  emptyStateIcon 
}) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="animate-pulse flex flex-col">
          <div className="h-12 bg-slate-50 border-b border-slate-200"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-slate-100 bg-white"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <EmptyState 
          icon={emptyStateIcon} 
          title={emptyStateTitle} 
          message={emptyStateMessage} 
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/80 transition-colors duration-150">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-sm text-slate-700">
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
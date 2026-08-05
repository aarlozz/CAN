import React, { useState } from "react";
import { X, Building2, MapPin, Mail, Phone, Calendar, CheckCircle, Clock } from "lucide-react";
import Badge from "./Badge";
import VerificationDialog from "./VerificationDialog";

export default function InstitutionDetailsModal({ isOpen, onClose, institution, isSuperAdmin = false, onVerify }) {
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);

  if (!isOpen || !institution) return null;

  const {
    institutionName,
    institutionType,
    establishedYear,
    website,
    description,
    user,
    location,
    contactPerson,
    verification,
    createdAt
  } = institution;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-4xl relative z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{institutionName}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Badge status={verification?.status} /></span>
                  <span className="flex items-center gap-1"><Clock size={14} /> Submitted {new Date(createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Basic Info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Basic Information</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500">Type:</dt><dd className="font-medium text-slate-900">{institutionType}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Established:</dt><dd className="font-medium text-slate-900">{establishedYear || "N/A"}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Website:</dt><dd className="font-medium text-blue-600 hover:underline"><a href={website} target="_blank" rel="noreferrer">{website || "N/A"}</a></dd></div>
                </dl>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">{description || "No description provided."}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Contact Person</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500">Name:</dt><dd className="font-medium text-slate-900">{contactPerson?.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Designation:</dt><dd className="font-medium text-slate-900">{contactPerson?.designation || "N/A"}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Phone:</dt><dd className="font-medium text-slate-900">{contactPerson?.phone}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Account Email:</dt><dd className="font-medium text-slate-900">{user?.email}</dd></div>
                </dl>
              </div>

              {/* Location */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Location Details</h3>
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>
                    {location?.street && `${location.street}, `}
                    {location?.ward && `Ward ${location.ward}, `}
                    {location?.municipality},<br/>
                    {location?.district}, {location?.province}
                  </span>
                </div>
              </div>

              {/* Verification History */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Verification Audit</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Verified By:</dt>
                    <dd className="font-medium text-slate-900">{verification?.verifiedBy?.name || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Date:</dt>
                    <dd className="font-medium text-slate-900">
                      {verification?.verifiedAt ? new Date(verification.verifiedAt).toLocaleString() : "Pending"}
                    </dd>
                  </div>
                  {verification?.remarks && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <dt className="text-slate-500 text-xs mb-1">Remarks / Feedback:</dt>
                      <dd className="bg-slate-50 p-3 rounded-lg text-slate-700 italic border border-slate-200">
                        "{verification.remarks}"
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            {!isSuperAdmin && (
              <button 
                onClick={() => setVerifyDialogOpen(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Update Verification
              </button>
            )}
          </div>
        </div>
      </div>

      <VerificationDialog 
        isOpen={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        currentStatus={verification?.status}
        onSubmit={async (data) => {
          const success = await onVerify(institution._id, data);
          if (success) {
            setVerifyDialogOpen(false);
            onClose(); // Close details modal after verification
          }
          return success;
        }}
      />
    </>
  );
}

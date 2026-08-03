import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CANlogo from "../../assets/images/logo/CAN_logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProvinceAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("institutions");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  
  const [institutions, setInstitutions] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search and Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchInstitutions();
    fetchScholarships();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const res = await axios.get(`${API}/api/province-admin/institutions`, { headers });
      setInstitutions(res.data);
    } catch (err) {
      console.error("Failed to fetch institutions:", err.response?.data?.message || err);
    }
  };

  const fetchScholarships = async () => {
    try {
      const res = await axios.get(`${API}/api/province-admin/scholarships`, { headers });
      setScholarships(res.data);
    } catch (err) {
      console.error("Failed to fetch scholarships:", err.response?.data?.message || err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const verifyInstitution = async (id, status, remarks = "") => {
    if (!window.confirm(`Are you sure you want to mark this institution as ${status}?`)) return;
    try {
      await axios.patch(`${API}/api/province-admin/institutions/${id}/verify`, { status, remarks }, { headers });
      fetchInstitutions();
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  const verifyScholarship = async (id, status, remarks = "") => {
    if (!window.confirm(`Are you sure you want to mark this scholarship as ${status}?`)) return;
    try {
      await axios.patch(`${API}/api/province-admin/scholarships/${id}/verify`, { status, remarks }, { headers });
      fetchScholarships();
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = inst.institutionName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inst.verification?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredScholarships = scholarships.filter(schol => {
    const matchesSearch = schol.scholarshipTitle.toLowerCase().includes(search.toLowerCase());
    
    // Map the dropdown value 'verified' to 'approved' for scholarships
    let mappedStatus = statusFilter;
    if (statusFilter === "verified") mappedStatus = "approved";
    
    const matchesStatus = statusFilter === "all" || schol.verification?.status === mappedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <img src={CANlogo} alt="CAN Logo" className="h-8" />
          <span className="ml-3 font-bold text-gray-800 text-sm">Province Admin</span>
        </div>
        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("institutions")}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "institutions" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Institutions
              {institutions.filter(i => i.verification?.status === "pending").length > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {institutions.filter(i => i.verification?.status === "pending").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("scholarships")}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "scholarships" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Scholarships
              {scholarships.filter(s => s.verification?.status === "pending").length > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {scholarships.filter(s => s.verification?.status === "pending").length}
                </span>
              )}
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-gray-800 capitalize">
            {activeTab} Management
          </h1>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
              PA
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 font-medium">Status:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified/Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === "institutions" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 font-medium">Institution Info</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInstitutions.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">No institutions found.</td></tr>
                    ) : (
                      filteredInstitutions.map((inst) => (
                        <tr key={inst._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{inst.institutionName}</div>
                            <div className="text-sm text-gray-500">{inst.user?.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{inst.institutionType}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${inst.verification?.status === 'verified' ? 'bg-green-100 text-green-800' : 
                                inst.verification?.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {inst.verification?.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => setSelectedInstitution(inst)} className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md font-medium transition-colors">View Details</button>
                            {inst.verification?.status === "pending" && (
                              <>
                                <button onClick={() => verifyInstitution(inst._id, 'verified')} className="text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-md font-medium transition-colors">Approve</button>
                                <button onClick={() => verifyInstitution(inst._id, 'rejected')} className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors">Reject</button>
                              </>
                            )}
                            {inst.verification?.status !== "pending" && (
                              <span className="text-sm text-gray-400">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === "scholarships" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium">Institution</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredScholarships.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">No scholarships found.</td></tr>
                    ) : (
                      filteredScholarships.map((schol) => (
                        <tr key={schol._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{schol.scholarshipTitle}</div>
                            <div className="text-sm text-gray-500">{schol.totalSeats} seats • {schol.coverage?.scholarshipType2}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{schol.institutionName}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${schol.verification?.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                schol.verification?.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                schol.verification?.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                              {schol.verification?.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => setSelectedScholarship(schol)} className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md font-medium transition-colors">View Details</button>
                            {schol.verification?.status === "pending" && (
                              <>
                                <button onClick={() => verifyScholarship(schol._id, 'approved')} className="text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-md font-medium transition-colors">Approve</button>
                                <button onClick={() => verifyScholarship(schol._id, 'rejected')} className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors">Reject</button>
                              </>
                            )}
                            {schol.verification?.status !== "pending" && (
                              <span className="text-sm text-gray-400">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Institution Modal */}
      {selectedInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Institution Details</h3>
              <button onClick={() => setSelectedInstitution(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedInstitution.institutionName}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedInstitution.institutionType}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account Email</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedInstitution.user?.email}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Established Year</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedInstitution.establishedYear || "N/A"}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Location & Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</p>
                    <p className="text-sm text-gray-800">{[selectedInstitution.location?.street, selectedInstitution.location?.municipality, selectedInstitution.location?.district, selectedInstitution.location?.province].filter(Boolean).join(", ")}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Website</p>
                    <p className="text-sm text-blue-600">{selectedInstitution.website || "N/A"}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact Person</p>
                    <p className="text-sm text-gray-800">{selectedInstitution.contactPerson?.name || "N/A"}</p>
                    <p className="text-xs text-gray-500">{selectedInstitution.contactPerson?.designation || ""}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact Details</p>
                    <p className="text-sm text-gray-800">{selectedInstitution.contactPerson?.email || "N/A"}</p>
                    <p className="text-sm text-gray-800">{selectedInstitution.contactPerson?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              {selectedInstitution.description && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedInstitution.description}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedInstitution(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Scholarship Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Scholarship Details</h3>
              <button onClick={() => setSelectedScholarship(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Title</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedScholarship.scholarshipTitle}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Institution</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedScholarship.institutionName}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(selectedScholarship.applicationDeadline).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Coverage Type</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{selectedScholarship.coverage?.scholarshipType2?.replace("_", " ")}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seats</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedScholarship.totalSeats} Total / {selectedScholarship.remainingSeats} Remaining</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Target Level</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{selectedScholarship.eligibilityCriteria?.targetLevel?.replace("_", " ") || "N/A"}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Target Faculty / Subject</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedScholarship.eligibilityCriteria?.targetFaculty || "N/A"} - {selectedScholarship.eligibilityCriteria?.subject || "N/A"}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Eligibility Criteria</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {selectedScholarship.eligibilityCriteria?.minGPA != null && <li>Min GPA: {selectedScholarship.eligibilityCriteria.minGPA}</li>}
                  {selectedScholarship.eligibilityCriteria?.minPercentage != null && <li>Min Percentage: {selectedScholarship.eligibilityCriteria.minPercentage}%</li>}
                  {selectedScholarship.eligibilityCriteria?.entranceExamName && <li>Entrance Exam: {selectedScholarship.eligibilityCriteria.entranceExamName} {selectedScholarship.eligibilityCriteria.minEntranceScore ? `(Min Score: ${selectedScholarship.eligibilityCriteria.minEntranceScore})` : ''}</li>}
                  <li>Gender: {selectedScholarship.eligibilityCriteria?.gender || "Any"}</li>
                  {selectedScholarship.eligibilityCriteria?.ethnicCategory && <li>Ethnic Category: <span className="capitalize">{selectedScholarship.eligibilityCriteria.ethnicCategory.replace("_", " ")}</span></li>}
                </ul>
              </div>
              
              {selectedScholarship.description && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedScholarship.description}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedScholarship(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

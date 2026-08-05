import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, ChevronRight, User as UserIcon, Mail, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopNavbar({ onMenuClick, user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-900">Dashboard</span>
            <ChevronRight size={14} className="text-slate-400" />
            <span>Overview</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Search Placeholder */}
          <div className="hidden md:flex relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 w-64 bg-slate-100/50 border border-transparent rounded-full text-sm focus:bg-white focus:border-red-200 focus:ring-2 focus:ring-red-100 transition-all outline-none"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-900">Notifications</h3>
                  <span className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full">3 New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-slate-900">New Institution Registered</p>
                    <p className="text-xs text-slate-500 mt-1">Sagarmatha College has requested verification.</p>
                    <p className="text-xs text-slate-400 mt-2">2 minutes ago</p>
                  </div>
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-slate-900">Weekly Report Ready</p>
                    <p className="text-xs text-slate-500 mt-1">Your system analytics report is ready to download.</p>
                    <p className="text-xs text-slate-400 mt-2">1 hour ago</p>
                  </div>
                  <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-slate-900">System Update</p>
                    <p className="text-xs text-slate-500 mt-1">Platform maintenance scheduled for tonight at 2 AM.</p>
                    <p className="text-xs text-slate-400 mt-2">5 hours ago</p>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                  <button className="text-xs font-semibold text-red-600 hover:text-red-700">Mark all as read</button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-slate-900">{user?.name || "Admin User"}</div>
                <div className="text-xs text-slate-500">{user?.role?.replace("_", " ") || "Super Admin"}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'SA'}&backgroundColor=dc2626`}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 shrink-0">
                     <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'SA'}&backgroundColor=dc2626`}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{user?.name || "Admin User"}</h3>
                    <p className="text-xs text-slate-400 capitalize">{user?.role?.replace("_", " ") || "Super Admin"}</p>
                  </div>
                </div>
                
                <div className="p-4 space-y-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    <span className="truncate">{user?.email || "admin@network.edu.np"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Shield size={16} className="text-slate-400" />
                    <span className="capitalize">Global Access (Tier 1)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <UserIcon size={16} className="text-slate-400" />
                    <span>Member since 2026</span>
                  </div>
                </div>
                
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Secure Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, Check, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ searchPlaceholder, onSearchChange }) => {
  const { user, notifications, markNotificationsAsRead, clearNotifications } = useAuth();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const location = useLocation();

  // Determine title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('admin-dashboard')) return 'Admin Dashboard';
    if (path.includes('student-dashboard')) return 'Welcome back, ' + (user?.name || 'Student');
    if (path.includes('manage-events')) return 'Manage Events';
    if (path.includes('registrations')) return 'Registrations';
    if (path.includes('events') && !path.includes('my-events')) return 'Events Page';
    if (path.includes('my-events')) return 'My Registrations';
    if (path.includes('my-certificates')) return 'My Certificates';
    if (path.includes('certificates')) return 'Issued Certificates';
    if (path.includes('profile')) return 'User Profile';
    if (path.includes('analytics')) return 'Analytics Reports';
    if (path.includes('users')) return 'User Registry';
    if (path.includes('settings')) return 'Settings';
    return 'Portal';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 select-none shrink-0 z-20 sticky top-0 shadow-sm">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
      </div>

      {/* Center Search bar (if handlers provided) */}
      <div className="flex-1 max-w-md mx-8">
        {onSearchChange && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder || "Search..."}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
        )}
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2.5 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all duration-200 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown popup */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 text-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-800">Notifications</span>
                <div className="flex gap-2">
                  <button
                    onClick={markNotificationsAsRead}
                    className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-primary transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-55">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-slate-50/50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-8 w-[1px] bg-slate-200"></div>

        {/* User context info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{user?.name}</h4>
            <span className="text-[11px] font-semibold text-slate-400 capitalize">
              {user?.role === 'admin' ? 'Super Admin' : 'Student'}
            </span>
          </div>
          {user?.profile?.avatar ? (
            <img
              src={user.profile.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-xl border border-slate-100 object-cover shadow-sm bg-slate-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

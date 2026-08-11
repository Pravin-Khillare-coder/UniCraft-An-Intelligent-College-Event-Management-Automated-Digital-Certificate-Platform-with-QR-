import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CalendarCheck, 
  Award, 
  Bell, 
  UserCircle, 
  Settings, 
  LogOut,
  FolderClosed,
  FileCheck,
  Users,
  Megaphone,
  BarChart3,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Manage Events', path: '/manage-events', icon: FolderClosed },
    { name: 'Registrations', path: '/registrations', icon: FileCheck },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Certificates', path: '/certificates', icon: Award },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
    { name: 'Events', path: '/events', icon: CalendarDays },
    { name: 'My Events', path: '/my-events', icon: CalendarCheck },
    { name: 'Certificates', path: '/my-certificates', icon: Award },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-navy-dark/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          w-64 bg-navy text-slate-400 min-h-screen flex flex-col justify-between border-r border-navy-border shadow-premium font-sans select-none shrink-0
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand logo & mobile close button */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-indigo-400 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              U
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg tracking-wider">UniCraft</h1>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest">
                College Portal
              </span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-light transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <div className="flex-1 px-4 py-2 overflow-y-auto sidebar-scroll">
          <ul className="space-y-1.5">
            {links.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg shadow-indigo-600/20' 
                      : 'hover:bg-navy-light hover:text-white'
                    }
                  `}
                >
                  {({ isActive }) => {
                    const Icon = link.icon;
                    return (
                      <>
                        <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        <span>{link.name}</span>
                      </>
                    );
                  }}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout/User panel */}
        <div className="p-4 border-t border-navy-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-400 group-hover:text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

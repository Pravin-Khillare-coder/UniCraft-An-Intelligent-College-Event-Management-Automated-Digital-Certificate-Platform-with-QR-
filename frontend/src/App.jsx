import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyEvents from './pages/MyEvents';
import Certificates from './pages/Certificates';
import ManageEvents from './pages/ManageEvents';
import Registrations from './pages/Registrations';
import Verification from './pages/Verification';
import Profile from './pages/Profile';
import AdminCertificates from './pages/AdminCertificates';

// Loader overlay component
const FullScreenLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
    <div className="w-9 h-9 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
    <span className="text-slate-400 text-xs font-semibold">Authorizing session...</span>
  </div>
);

// Router Guards
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { user } = useAuth();
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/student-dashboard" replace />;
};

const StudentRoute = () => {
  const { user } = useAuth();
  return user && user.role === 'student' ? <Outlet /> : <Navigate to="/admin-dashboard" replace />;
};

// Common Layout Structure
const PortalLayout = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Root redirection controller
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' 
    ? <Navigate to="/admin-dashboard" replace /> 
    : <Navigate to="/student-dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Verification routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-certificate/:verificationCode" element={<Verification />} />
          <Route path="/verify/:verificationCode" element={<Verification />} />

          {/* Secure Portal routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PortalLayout />}>
              {/* Student specific portal */}
              <Route element={<StudentRoute />}>
                <Route path="/student-dashboard" element={<Dashboard />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/my-events" element={<MyEvents />} />
                <Route path="/my-certificates" element={<Certificates />} />
                <Route path="/notifications" element={<Dashboard />} /> {/* Fallback to dashboard panel */}
              </Route>

              {/* Admin specific portal */}
              <Route element={<AdminRoute />}>
                <Route path="/admin-dashboard" element={<Dashboard />} />
                <Route path="/manage-events" element={<ManageEvents />} />
                <Route path="/registrations" element={<Registrations />} />
                <Route path="/users" element={<Registrations />} /> {/* Fallback layout */}
                <Route path="/certificates" element={<AdminCertificates />} /> {/* Certificate issue interface */}
                <Route path="/announcements" element={<ManageEvents />} /> {/* Fallback */}
                <Route path="/analytics" element={<Dashboard />} /> {/* Fallback */}
              </Route>

              {/* Shared account routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Profile />} />
            </Route>
          </Route>

          {/* Root/Wildcard fallback handling */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

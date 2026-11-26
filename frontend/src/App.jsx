import React, { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';

// Pages
import Home from './pages/Home';
import ClientDashboard from './pages/ClientDashboard';
import Scanner from './pages/Scanner';
import MailSandbox from './pages/MailSandbox';
import SimulationInbox from './pages/SimulationInbox';
import RecoveryGuide from './pages/RecoveryGuide';
import SupportChat from './pages/SupportChat';
import LearningCenter from './pages/LearningCenter';
import MemberRoster from './pages/MemberRoster';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Certificates from './pages/Certificates';
import ContactUs from './pages/ContactUs';
import MasterControlPanel from './pages/MasterControlPanel';
import Profile from './pages/Profile';
import AdminConsole from './pages/AdminConsole';

const ProtectedLayout = () => {
  const { user } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar (visible on md and larger) */}
      <div className="hidden md:flex shrink-0">
        {user.is_admin ? <AdminSidebar /> : <Sidebar />}
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="relative z-10 flex h-full"
            onClick={() => setMobileMenuOpen(false)}
          >
            {user.is_admin ? (
              <AdminSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            ) : (
              <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-950 text-white rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-black text-sm text-slate-900 tracking-tight">PhishShield</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            {/* Dashboard & Landing Routes */}
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/admin-console" element={user.is_admin ? <AdminConsole /> : <Navigate to="/dashboard" replace />} />
            <Route path="/admin/control-panel" element={user.is_admin ? <MasterControlPanel /> : <Navigate to="/dashboard" replace />} />

            {/* Member Roster & Profile */}
            <Route path="/admin/users" element={user.is_admin ? <MemberRoster /> : <Navigate to="/dashboard" replace />} />
            <Route path="/profile" element={<Profile />} />

            {/* Operational Tools */}
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/simulation" element={user.is_admin ? <MailSandbox /> : <SimulationInbox />} />
            <Route path="/recovery" element={<RecoveryGuide />} />
            <Route path="/chat" element={<SupportChat />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Learning & Certification */}
            <Route path="/modules" element={<LearningCenter />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/certificates" element={<Certificates />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to={user.is_admin ? "/admin-console" : "/dashboard"} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const RootRoute = () => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to={user.is_admin ? "/admin-console" : "/dashboard"} replace /> : <Home />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
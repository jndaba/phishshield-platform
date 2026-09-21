import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Dynamically switches sidebar based on admin privileges */}
      {user.is_admin ? <AdminSidebar /> : <Sidebar />}

      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* Dashboard & Landing Routes */}
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/admin-console" element={user.is_admin ? <AdminConsole /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/control-panel" element={user.is_admin ? <MasterControlPanel /> : <Navigate to="/dashboard" replace />} />

          {/* Member Roster (Dedicated user management) & Profile */}
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
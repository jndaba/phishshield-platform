import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';
import MailSandbox from './pages/MailSandbox';
import RecoveryGuide from './pages/RecoveryGuide';
import SupportChat from './pages/SupportChat';
import LearningCenter from './pages/LearningCenter';
import AdminUsers from './pages/AdminUsers';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Certificates from './pages/Certificates';

// Layout wrapper for authenticated pages
const ProtectedLayout = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      {/* Sidebar navigation matching screenshot design */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ClientDashboard />} />
          <Route path="/admin-console" element={user.is_admin ? <AdminDashboard /> : <Navigate to="/" replace />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/sandbox" element={<MailSandbox />} />
          <Route path="/recovery" element={<RecoveryGuide />} />
          <Route path="/chat" element={<SupportChat />} />
          <Route path="/academy" element={<LearningCenter />} />
          <Route path="/admin/users" element={user.is_admin ? <AdminUsers /> : <Navigate to="/" replace />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/certificates" element={<Certificates />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Application Routes */}
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Shield, Mail, Search, BookOpen, MessageSquare, LifeBuoy, Users } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import MailSandbox from './pages/MailSandbox';
import RecoveryGuide from './pages/RecoveryGuide';
import SupportChat from './pages/SupportChat';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#0B1120] text-slate-100">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#1E293B] border-r border-slate-700/60 flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-slate-700">
              <Shield className="w-8 h-8 text-[#38BDF8]" />
              <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                PhishShield
              </span>
            </div>
            
            <nav className="space-y-1 text-sm font-medium">
              <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <Shield className="w-4 h-4" /> Command Center
              </Link>
              <Link to="/scanner" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <Search className="w-4 h-4" /> AI URL Scanner
              </Link>
              <Link to="/sandbox" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <Mail className="w-4 h-4" /> Mailbox Simulator
              </Link>
              <Link to="/recovery" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <LifeBuoy className="w-4 h-4" /> Incident Recovery
              </Link>
              <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <MessageSquare className="w-4 h-4" /> Support & Chat
              </Link>
            </nav>
          </div>

          <div className="px-3 py-3 border-t border-slate-700/60 text-xs text-slate-400">
            Authenticated as <span className="font-semibold text-sky-400">User Session</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0B1120]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/sandbox" element={<MailSandbox />} />
            <Route path="/recovery" element={<RecoveryGuide />} />
            <Route path="/chat" element={<SupportChat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
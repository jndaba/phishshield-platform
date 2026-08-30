import React, { useContext } from 'react';
import { Shield, Home, Search, Mail, BookOpen, ShieldAlert, Award, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#102A36] text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-1.5 bg-teal-500 rounded-lg text-slate-950 font-bold">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">PhishShield</h1>
            <p className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold">Security Lab</p>
          </div>
        </div>

        {/* Workspace Navigation */}
        <div className="px-4 py-6">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 block mb-3">Workspace</span>
          <nav className="space-y-1.5 text-xs font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-[#2DD4BF] text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <Home className="w-4 h-4" /> Overview
            </NavLink>

            <NavLink
              to="/scanner"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-[#2DD4BF] text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <Search className="w-4 h-4" /> URL scanner
            </NavLink>

            <NavLink
              to="/sandbox"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-[#2DD4BF] text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <Mail className="w-4 h-4" /> Simulations
            </NavLink>

            <NavLink
              to="/academy"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-[#2DD4BF] text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" /> Learning lab
            </NavLink>

            <NavLink
              to="/certificates"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-[#2DD4BF] text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <Award className="w-4 h-4" /> Certificates
            </NavLink>

            {user?.is_admin && (
              <NavLink
                to="/admin-console"
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-[#2DD4BF] text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
              >
                <ShieldAlert className="w-4 h-4" /> Admin console
              </NavLink>
            )}
          </nav>
        </div>

        {/* Dynamic Readiness Score Widget */}
        <div className="mx-4 p-4 bg-[#133544] rounded-xl border border-teal-900/40">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-slate-300">Readiness score</span>
            <span className="text-sm font-bold text-teal-300">{user?.readiness_score || 68}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-teal-400 h-full rounded-full" style={{ width: `${user?.readiness_score || 68}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">You're ahead of 64% of your cohort this week.</p>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-amber-600/30 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
            {user?.username?.substring(0, 2).toUpperCase() || 'AM'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.username || 'Learner Session'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.is_admin ? 'Administrator' : 'Learner'}</p>
          </div>
        </div>
        <button onClick={handleLogout} title="Log Out" className="text-slate-400 hover:text-red-400 transition p-1">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
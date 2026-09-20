import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Sliders, 
  Search, 
  Mail, 
  LifeBuoy, 
  PhoneCall, 
  Users, 
  FileText, 
  LogOut,
  ShieldAlert,
  Home,
  UserCog
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/chat/unread-count/');
        setUnreadCount(res.data?.unread_count ?? res.data?.total_unread ?? 0);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/admin/dashboard', label: 'Governance Cockpit', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/control-panel', label: 'Master Control Panel', icon: <Sliders className="w-4 h-4 text-blue-600" /> },
    { to: '/chat', label: 'Incident Triage Console', icon: <LifeBuoy className="w-4 h-4" />, hasBadge: true },
    { to: '/admin/users', label: 'User Registry & Roles', icon: <Users className="w-4 h-4" /> },
    { to: '/recovery', label: 'Runbook Authoring', icon: <FileText className="w-4 h-4" /> },
    { to: '/contact', label: 'Directory Management', icon: <PhoneCall className="w-4 h-4" /> },
    { to: '/scanner', label: 'Forensic URL Scanner', icon: <Search className="w-4 h-4" /> },
    { to: '/simulation', label: 'Mailbox Scenario Audit', icon: <Mail className="w-4 h-4" /> },
    { to: '/profile', label: 'Profile & Member Roster', icon: <UserCog className="w-4 h-4 text-blue-600" /> },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col justify-between border-r border-slate-200 shrink-0 h-screen sticky top-0 shadow-xs">
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">
                Phish<span className="text-blue-600">Shield</span>
              </h1>
              <p className="text-[10px] text-blue-600 uppercase tracking-widest font-bold">
                Admin Console
              </p>
            </div>
          </div>

          {/* Home Landing Link (Retains Session State) */}
          <Link
            to="/"
            title="Return to Public Home / Landing"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        {/* Admin Identity Badge */}
        <div className="mx-4 mt-4 px-3.5 py-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.username || 'Administrator'}
            </p>
            <p className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider">
              Privileged Staff
            </p>
          </div>
        </div>

        {/* Workspace Navigation */}
        <div className="px-4 py-4 overflow-y-auto flex-1">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 block mb-2">
            Operations &amp; Control
          </span>
          <nav className="space-y-1 text-xs font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>

                {item.hasBadge && unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-rose-600 rounded-full animate-bounce shrink-0">
                    +{unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Master Control Notice */}
        <div className="mx-4 mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 mb-1 text-slate-700 font-bold text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>Full Authority Mode</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Content creation, deletion, questions, and user privileges are centralized in the Master Control Panel.
          </p>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <Link to="/profile" className="flex items-center gap-2.5 truncate hover:opacity-80 transition">
          {user?.avatar ? (
            <img 
              src={user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`} 
              alt={user.username} 
              className="w-8 h-8 rounded-full object-cover border border-blue-200 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
          )}
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.username || 'Administrator'}
            </p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate">
              System Administrator
            </p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition p-1.5 rounded-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Sliders, 
  BookOpen,
  PhoneCall, 
  Search, 
  MessageSquare, 
  Users, 
  UserCheck,
  LogOut,
  ShieldAlert,
  Home
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
    { to: '/admin-console', label: 'Admin Console', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/control-panel', label: 'Master Control Panel', icon: <Sliders className="w-4 h-4" /> },
    { to: '/recovery', label: 'Runbook Authoring', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/contact', label: 'Contact Management', icon: <PhoneCall className="w-4 h-4" /> },
    { to: '/scanner', label: 'URL Scanner', icon: <Search className="w-4 h-4" /> },
    { to: '/chat', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, hasBadge: true },
    { to: '/admin/users', label: 'Member Roster', icon: <Users className="w-4 h-4" /> },
    { to: '/profile', label: 'Profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-blue-950 text-blue-50 flex flex-col justify-between border-r border-blue-900 shrink-0 h-screen sticky top-0 shadow-2xl">
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-blue-900 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="p-2 bg-blue-900 rounded-xl text-white shadow-xs border border-blue-800">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-sm tracking-tight leading-tight">
                Phish<span className="text-blue-400">Shield</span>
              </h1>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">
                Admin Console
              </p>
            </div>
          </Link>

          <Link
            to="/"
            title="Return to Public Home / Landing"
            className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        {/* Workspace Navigation */}
        <div className="px-4 py-4 overflow-y-auto flex-1">
          <span className="text-[10px] font-bold text-blue-400/70 tracking-wider uppercase px-3 block mb-2">
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
                      ? 'bg-blue-900 text-white shadow-xs border border-blue-800'
                      : 'text-blue-200 hover:bg-blue-900 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>

                {item.hasBadge && unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-blue-950 bg-white rounded-full animate-bounce shrink-0">
                    +{unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Master Control Notice */}
        <div className="mx-4 mb-4 p-3.5 bg-blue-900 rounded-xl border border-blue-800">
          <div className="flex items-center gap-1.5 mb-1 text-white font-bold text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Full Authority Mode</span>
          </div>
          <p className="text-[10px] text-blue-200 opacity-90 leading-relaxed">
            Content creation, deletion, questions, and user privileges are centralized in the Master Control Panel.
          </p>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-blue-900 flex items-center justify-between bg-blue-950 hover:bg-blue-900 transition">
        <Link to="/profile" className="flex items-center gap-2.5 truncate hover:opacity-80 transition cursor-pointer">
          {user?.avatar ? (
            <img 
              src={user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`} 
              alt={user.username} 
              className="w-8 h-8 rounded-full object-cover border border-blue-800 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-800 text-white border border-blue-700 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
          )}
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">
              {user?.username || 'Administrator'}
            </p>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider truncate">
              Administrator
            </p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="text-blue-300 hover:text-white hover:bg-blue-800 transition p-1.5 rounded-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
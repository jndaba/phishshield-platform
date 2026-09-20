import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Search, 
  Mail, 
  BookOpen, 
  Award, 
  HelpCircle,
  ShieldAlert, 
  LifeBuoy, 
  PhoneCall, 
  LogOut,
  Info,
  Home,
  User
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function LearnerSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = Boolean(user?.is_admin || user?.is_staff);

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
    { to: '/dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/scanner', label: 'URL Threat Scanner', icon: <Search className="w-4 h-4" /> },
    { to: '/simulation', label: 'Simulated Inbox (10)', icon: <Mail className="w-4 h-4" /> },
    { to: '/modules', label: 'Learning Academy', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/assessment', label: 'Questions / Assessment', icon: <HelpCircle className="w-4 h-4" /> },
    { to: '/certificates', label: 'Accredited Certificate', icon: <Award className="w-4 h-4" /> },
    { to: '/recovery', label: 'Incident Runbooks', icon: <ShieldAlert className="w-4 h-4" /> },
    { to: '/chat', label: 'Support Helpdesk', icon: <LifeBuoy className="w-4 h-4" />, hasBadge: true },
    { to: '/contact', label: 'Contact Directory', icon: <PhoneCall className="w-4 h-4" /> },
    { to: '/profile', label: 'My Profile & Security', icon: <User className="w-4 h-4" /> },
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
                Learner Portal
              </p>
            </div>
          </div>

          {/* Home Landing Link (Keeps Session Intact) */}
          <Link
            to="/"
            title="Return to Public Home / Landing"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        {/* Workspace Navigation */}
        <div className="px-4 py-3 overflow-y-auto flex-1">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 block mb-2">
            Defense Curriculum
          </span>
          <nav className="space-y-1 text-xs font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl font-bold transition ${
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

        {/* Dynamic Readiness Score Widget */}
        <div className="mx-4 mb-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-800">Readiness Score</span>
            <span className="text-xs font-black text-blue-600">{user?.readiness_score || 0}%</span>
          </div>

          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${user?.readiness_score || 0}%` }}
            />
          </div>

          <div className="pt-1 text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-700">
              <Info className="w-3 h-3 text-blue-600 shrink-0" />
              <span>What does this mean?</span>
            </div>
            <p className="leading-tight">
              A real-time index calculated from your completed learning modules and mailbox simulation accuracy. It quantifies your ability to recognize and avoid social engineering attacks.
            </p>
          </div>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <Link to="/profile" className="flex items-center gap-2.5 truncate hover:opacity-80 transition">
          {user?.avatar ? (
            <img 
              src={user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`} 
              alt={user.username} 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full font-black flex items-center justify-center text-xs shrink-0 shadow-2xs ${
              isAdmin 
                ? 'bg-blue-600 text-white' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {user?.username?.substring(0, 2).toUpperCase() || (isAdmin ? 'AD' : 'LR')}
            </div>
          )}
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.username || 'Session'}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${
              isAdmin ? 'text-blue-600' : 'text-emerald-600'
            }`}>
              {isAdmin ? 'System Administrator' : 'Enrolled Student'}
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
import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  BookOpen, 
  Search, 
  Inbox, 
  ShieldCheck, 
  Award, 
  UserCheck, 
  LogOut, 
  Home,
  Target,
  Info
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const learnerNavItems = [
    { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Learning Modules', path: '/modules', icon: BookOpen },
    { label: 'URL Scanner', path: '/scanner', icon: Search },
    { label: 'Simulated Inbox', path: '/simulation', icon: Inbox },
    { label: 'Assessment', path: '/assessment', icon: ShieldCheck },
    { label: 'Certificate', path: '/certificates', icon: Award },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  const readinessScore = user?.readiness_score || 0;
  const isQualified = readinessScore >= 70;

  return (
    <aside className="w-64 bg-blue-950 text-slate-100 flex flex-col justify-between shrink-0 select-none shadow-xl h-screen sticky top-0 border-r border-blue-900">
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-blue-900/60 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
            title="Go to Home"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-white leading-tight">PhishShield</h1>
              <p className="text-[10px] text-blue-300 font-mono tracking-wider">DEFENSE HQ</p>
            </div>
          </Link>
          <Link 
            to="/" 
            title="Return to Landing Page"
            className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900 transition"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Learner Navigation Links */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <nav className="space-y-1.5">
            {learnerNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Readiness Score Card with Brief Explanation */}
          <div className="p-3.5 bg-blue-900/40 rounded-xl border border-blue-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" /> Defense Readiness
              </span>
              <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                isQualified 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
              }`}>
                {readinessScore}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-950/80 rounded-full h-1.5 border border-blue-800 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isQualified ? 'bg-emerald-400' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, readinessScore))}%` }}
              />
            </div>

            {/* Brief Explanation */}
            <div className="flex items-start gap-1.5 text-[10px] text-blue-200/80 leading-relaxed pt-0.5">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <p>
                Calculated from module completions and simulation verdicts. A score of <strong>70%+</strong> qualifies you for certificate issuance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Profile & Logout Area */}
      <div className="p-4 border-t border-blue-900/60 bg-blue-900/20">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-3 truncate pr-2 hover:opacity-90 transition">
            <div className="w-8 h-8 rounded-lg bg-blue-800 text-blue-200 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-700">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate leading-tight">{user?.username}</p>
              <p className="text-[10px] text-blue-300 font-semibold tracking-wide">
                Learner
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
import React from 'react';
import { Shield, AlertTriangle, BookOpen, MessageSquare, RefreshCw, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { label: "Phishing Scans Run", value: "1,248", icon: Shield, color: "text-accent" },
    { label: "Threats Caught", value: "312", icon: AlertTriangle, color: "text-phishred" },
    { label: "Modules Completed", value: "4/6", icon: BookOpen, color: "text-shieldgreen" },
    { label: "Support Tickets", value: "Active", icon: MessageSquare, color: "text-amber-400" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Command Center</h1>
          <p className="text-slate-400">Welcome back. Real-time protection & awareness metrics.</p>
        </div>
        <Link to="/scanner" className="bg-accent hover:bg-sky-500 text-slate-950 font-semibold px-4 py-2 rounded-lg transition">
          Scan URL Now
        </Link>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-darkcard border border-slate-700/60 p-5 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Launch Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/simulator" className="p-6 bg-darkcard/80 border border-slate-700 rounded-xl hover:border-accent transition group">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-accent">Virtual Inbox Sandbox</h3>
          <p className="text-sm text-slate-400">Simulate incoming emails and practice spotting deceptive phishing cues safely.</p>
        </Link>
        <Link to="/recovery" className="p-6 bg-darkcard/80 border border-slate-700 rounded-xl hover:border-shieldgreen transition group">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-shieldgreen">Account Recovery Portal</h3>
          <p className="text-sm text-slate-400">Step-by-step visual procedures to recover compromised credentials and freeze accounts.</p>
        </Link>
        <Link to="/chat" className="p-6 bg-darkcard/80 border border-slate-700 rounded-xl hover:border-amber-400 transition group">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-amber-400">Admin Incident Chat</h3>
          <p className="text-sm text-slate-400">Report suspicious encounters and chat directly with platform security administrators.</p>
        </Link>
      </div>
    </div>
  );
}
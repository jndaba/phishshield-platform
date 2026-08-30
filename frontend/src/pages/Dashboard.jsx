import React from 'react';
import { Shield, AlertTriangle, BookOpen, MessageSquare, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const stats = [
    { label: "Phishing Scans Executed", value: "1,248", change: "+14%", icon: Shield, color: "text-sky-400" },
    { label: "Threats Neutralized", value: "312", change: "+8%", icon: AlertTriangle, color: "text-red-400" },
    { label: "Training Modules Done", value: "4/6", change: "67%", icon: BookOpen, color: "text-emerald-400" },
    { label: "Open Support Inquiries", value: "1 Active", change: "Live", icon: MessageSquare, color: "text-amber-400" },
  ];

  // Scan activity line chart data
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Safe URLs',
        data: [65, 78, 90, 81, 95, 110, 130],
        borderColor: '#38BDF8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Phishing URLs Blocked',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94A3B8', font: { size: 11 } }
      }
    },
    scales: {
      x: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } },
      y: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } }
    }
  };

  // Simulation detection breakdown doughnut chart
  const doughnutData = {
    labels: ['Caught Phishing', 'False Negatives', 'Legitimate Marked Safe'],
    datasets: [
      {
        data: [72, 8, 20],
        backgroundColor: ['#10B981', '#EF4444', '#38BDF8'],
        borderColor: '#1E293B',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94A3B8', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Security Command Center</h1>
          <p className="text-slate-400 text-sm">Real-time threat feeds, predictive scanning logs, and awareness metrics.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/scanner" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 shadow-md">
            <Shield className="w-4 h-4" /> Scan Suspicious Link
          </Link>
          <Link to="/sandbox" className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg text-xs transition border border-slate-700">
            Launch Mail Sandbox
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#1E293B] border border-slate-700/60 p-5 rounded-xl shadow-lg flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs font-semibold uppercase">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-700/60 p-6 rounded-xl shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4">7-Day Threat Scanning Volume</h3>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/60 p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-2">Simulation Accuracy Ratio</h3>
          <div className="h-56 relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/recovery" className="p-5 bg-[#1E293B] border border-slate-700 rounded-xl hover:border-sky-400 transition group flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase">Emergency Tool</span>
            <h4 className="text-base font-bold text-white group-hover:text-sky-400 mt-1 mb-2">Account Incident Recovery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Visual emergency workflows to freeze compromised bank credentials and revoke hijacked session cookies.</p>
          </div>
          <span className="text-xs font-semibold text-sky-400 flex items-center gap-1 mt-4">Open Guide <ArrowUpRight className="w-3.5 h-3.5" /></span>
        </Link>

        <Link to="/academy" className="p-5 bg-[#1E293B] border border-slate-700 rounded-xl hover:border-emerald-400 transition group flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase">Awareness LMS</span>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-400 mt-1 mb-2">Security Academy & Uploads</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Read interactive threat modules or use the admin portal to drag and drop new security PDF documentation.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-4">Go to Academy <ArrowUpRight className="w-3.5 h-3.5" /></span>
        </Link>

        <Link to="/assessment" className="p-5 bg-[#1E293B] border border-slate-700 rounded-xl hover:border-purple-400 transition group flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase">Certification</span>
            <h4 className="text-base font-bold text-white group-hover:text-purple-400 mt-1 mb-2">Knowledge Assessment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Take the official evaluation quiz and generate your verified PDF completion certificate.</p>
          </div>
          <span className="text-xs font-semibold text-purple-400 flex items-center gap-1 mt-4">Take Assessment <ArrowUpRight className="w-3.5 h-3.5" /></span>
        </Link>
      </div>
    </div>
  );
}
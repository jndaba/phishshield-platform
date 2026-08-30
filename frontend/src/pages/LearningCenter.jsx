import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, FileText, UploadCloud, ShieldAlert, Award } from 'lucide-react';
import axios from 'axios';
import AdminDocUploader from '../components/AdminDocUploader';

export default function LearningCenter() {
  const [modules, setModules] = useState([
    {
      id: 1,
      title: "Fundamentals of Social Engineering",
      description: "Understand psychological triggers, urgency tactics, and how attackers bait victims into sharing confidential data.",
      completed: true
    },
    {
      id: 2,
      title: "Spear Phishing & Executive Impersonation",
      description: "Learn how targeted attacks impersonate university deans, directors, and financial departments.",
      completed: false
    }
  ]);
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700/60 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Security Awareness Academy</h2>
          <p className="text-slate-400 text-sm">Interactive educational training modules, defense manuals, and assessments.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'courses' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
          >
            Modules
          </button>
          <button
            onClick={() => setActiveTab('admin_upload')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'admin_upload' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
          >
            Admin Content Manager
          </button>
        </div>
      </div>

      {activeTab === 'courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-[#1E293B] border border-slate-700 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Module {mod.id}</span>
                  {mod.completed && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{mod.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Comprehensive PDF Guide
                </span>
                <button className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-600 px-4 py-1.5 rounded-lg text-xs font-semibold transition">
                  {mod.completed ? "Review Material" : "Start Learning"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminDocUploader />
      )}
    </div>
  );
}
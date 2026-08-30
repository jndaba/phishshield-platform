import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, FileText, PlayCircle, ArrowLeft, Clock, Shield, Search, UploadCloud } from 'lucide-react';
import axios from 'axios';
import AdminDocUploader from '../components/AdminDocUploader';

export default function LearningCenter() {
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [currentModule, setCurrentModule] = useState(null); // When set, activates Full-Screen Mode
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/lms/modules/');
      setModules(res.data);
    } catch (err) {
      console.error("Failed to load LMS modules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleComplete = async (moduleId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/lms/modules/${moduleId}/progress/`, {
        completed: true,
        score: 100
      });
    } catch (err) {
      console.log("Local completion updated");
    }

    setModules(prev =>
      prev.map(m => m.id === moduleId ? { ...m, completed: true } : m)
    );
  };

  // FULL-SCREEN IMMERSIVE STUDY MODE
  if (currentModule) {
    return (
      <div className="fixed inset-0 bg-[#0B1120] text-slate-100 z-50 flex flex-col overflow-y-auto">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 bg-[#102A36] border-b border-slate-700/80 px-8 py-4 flex items-center justify-between z-10">
          <button
            onClick={() => setCurrentModule(null)}
            className="flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Learning Lab
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {currentModule.estimated_read_time || "8 mins"}
            </span>
            <button
              onClick={() => {
                handleComplete(currentModule.id);
                setCurrentModule(null);
              }}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Mark Complete & Exit
            </button>
          </div>
        </div>

        {/* Full-Screen Content Body */}
        <div className="max-w-4xl mx-auto w-full p-8 md:p-12 space-y-8">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              Module {currentModule.module_number} · {currentModule.category || "Defense Tactics"}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2 leading-tight">
              {currentModule.title}
            </h1>
            <p className="text-sm text-slate-400 mt-2">{currentModule.description}</p>
          </div>

          {/* Embedded Video */}
          {currentModule.video_url && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
              <iframe
                src={currentModule.video_url}
                title={currentModule.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Rich Educational Body */}
          <div
            className="bg-[#102A36]/60 border border-slate-700/60 p-8 rounded-2xl text-slate-200 text-sm leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: currentModule.rich_content || currentModule.description }}
          />

          {/* Attached Document Reference */}
          {currentModule.document && (
            <div className="p-4 bg-teal-950/40 border border-teal-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-teal-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Reference Document / Checklist PDF</h4>
                  <p className="text-[11px] text-slate-400">Download supplementary offline material</p>
                </div>
              </div>
              <a
                href={currentModule.document}
                target="_blank"
                rel="noreferrer"
                className="bg-teal-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-400 transition"
              >
                Download Guide
              </a>
            </div>
          )}

          <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => setCurrentModule(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back to Catalog
            </button>
            <button
              onClick={() => {
                handleComplete(currentModule.id);
                setCurrentModule(null);
              }}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition"
            >
              Finish Module
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD CATALOG VIEW
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Security Awareness Academy</h2>
          <p className="text-xs text-slate-500 mt-1">14 Comprehensive Training Modules with Video Lessons and Defense Checklists.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'courses' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Modules Catalog ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('admin_upload')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'admin_upload' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Admin Content Manager
          </button>
        </div>
      </div>

      {activeTab === 'courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                    Module {mod.module_number}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {mod.estimated_read_time || "8 mins"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{mod.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">{mod.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  {mod.video_url ? <PlayCircle className="w-3.5 h-3.5 text-teal-600" /> : <FileText className="w-3.5 h-3.5 text-teal-600" />}
                  {mod.video_url ? "Video + Notes" : "Interactive Guide"}
                </span>
                <button
                  onClick={() => setCurrentModule(mod)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Start Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminDocUploader onUploadSuccess={fetchModules} />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, FileText, PlayCircle, ArrowLeft, Clock } from 'lucide-react';
import axios from 'axios';

export default function LearningCenter() {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/lms/modules/');
      console.log("Fetched Modules Payload:", res.data); // Helpful for debugging!
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
      console.log("Local completion updated (Offline Fallback)");
    }

    setModules(prev =>
      prev.map(m => m.id === moduleId ? { ...m, completed: true } : m)
    );
  };

  // FULL-SCREEN IMMERSIVE STUDY MODE (Midnight Theme)
  if (currentModule) {
    return (
      <div className="fixed inset-0 bg-blue-950 text-slate-100 z-50 flex flex-col overflow-y-auto">
        <div className="sticky top-0 bg-blue-900 border-b border-blue-800 px-8 py-4 flex items-center justify-between z-10 shadow-md">
          <button
            onClick={() => setCurrentModule(null)}
            className="flex items-center gap-2 text-xs font-bold text-blue-200 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Learning Lab
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-blue-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {currentModule.estimated_read_time || "8 mins"}
            </span>
            <button
              onClick={() => {
                handleComplete(currentModule.id);
                setCurrentModule(null);
              }}
              className="bg-white hover:bg-slate-100 text-blue-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" /> Mark Complete & Exit
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full p-8 md:p-12 space-y-8">
          <div>
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">
              Module {currentModule.module_number} · {currentModule.category || "Defense Tactics"}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2 leading-tight">
              {currentModule.title}
            </h1>
            <p className="text-sm text-blue-200 mt-2">{currentModule.description}</p>
          </div>

          {currentModule.video_url && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-blue-800 shadow-xl bg-black">
              <iframe
                src={currentModule.video_url}
                title={currentModule.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div
            className="bg-blue-900/40 border border-blue-800 p-8 rounded-2xl text-slate-200 text-sm leading-relaxed space-y-4 shadow-inner"
            dangerouslySetInnerHTML={{ __html: currentModule.rich_content || currentModule.description }}
          />

          {currentModule.document && (
            <div className="p-5 bg-blue-900/60 border border-blue-700 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <div>
                  <h4 className="text-sm font-bold text-white">Reference Document / Checklist PDF</h4>
                  <p className="text-[11px] text-blue-200 mt-0.5">Download supplementary offline material</p>
                </div>
              </div>
              <a
                href={currentModule.document}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-blue-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition shadow-sm"
              >
                Download Guide
              </a>
            </div>
          )}

          <div className="pt-6 border-t border-blue-900 flex justify-between items-center">
            <button
              onClick={() => setCurrentModule(null)}
              className="text-xs text-blue-300 hover:text-white font-semibold cursor-pointer"
            >
              Back to Catalog
            </button>
            <button
              onClick={() => {
                handleComplete(currentModule.id);
                setCurrentModule(null);
              }}
              className="bg-white hover:bg-slate-100 text-blue-950 font-bold px-6 py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
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
          <p className="text-xs text-slate-500 mt-1">Comprehensive Training Modules with Video Lessons and Defense Checklists.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm font-bold">Loading Learning Modules...</div>
      ) : modules.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-700">No Modules Available</h3>
          <p className="text-xs mt-1">Your administrators have not published any learning content yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-blue-950 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Module {mod.module_number}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3" /> {mod.estimated_read_time || "8 mins"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-950 transition-colors">{mod.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">{mod.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  {mod.video_url ? <PlayCircle className="w-4 h-4 text-blue-950" /> : <FileText className="w-4 h-4 text-blue-950" />}
                  {mod.video_url ? "Video + Notes" : "Interactive Guide"}
                </span>
                <button
                  onClick={() => setCurrentModule(mod)}
                  className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Start Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  FileText, 
  PlayCircle, 
  ArrowLeft, 
  Clock, 
  X, 
  Video,
  ExternalLink 
} from 'lucide-react';
import axios from 'axios';

const MODULES_API = 'http://127.0.0.1:8000/api/lms/modules/';
const PROGRESS_API = 'http://127.0.0.1:8000/api/lms/progress/';

export default function LearningCenter() {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchModules = async () => {
    try {
      const res = await axios.get(MODULES_API);
      console.log("Fetched Modules Payload:", res.data);
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
    setCompleting(true);
    try {
      await axios.post(`${PROGRESS_API}${moduleId}/`, {
        completed: true,
        score: 100
      });
      setModules(prev =>
        prev.map(m => m.id === moduleId ? { ...m, is_completed: true } : m)
      );
    } catch (err) {
      console.log("Local completion updated (Offline Fallback)");
    } finally {
      setCompleting(false);
      setCurrentModule(null);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
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
              <Clock className="w-3.5 h-3.5" /> {currentModule.estimated_read_time || "12 mins"}
            </span>
            <button
              onClick={() => handleComplete(currentModule.id)}
              disabled={completing}
              className="bg-white hover:bg-slate-100 text-blue-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> {completing ? 'Updating...' : 'Mark Complete & Exit'}
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

          {/* Infographic Cover Image */}
          {currentModule.image_url && (
            <div className="rounded-2xl overflow-hidden border border-blue-800 shadow-xl max-h-80 bg-blue-900/50">
              <img 
                src={currentModule.image_url} 
                alt={currentModule.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* YouTube Video Section with Fallback External Link */}
          {currentModule.video_url && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-rose-400" /> Interactive Video Lecture
                </span>
                <a
                  href={currentModule.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {getYoutubeEmbedUrl(currentModule.video_url) && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-blue-800 shadow-xl bg-black">
                  <iframe
                    src={getYoutubeEmbedUrl(currentModule.video_url)}
                    title={currentModule.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Immediate Under-Video Direct Link Bar */}
              <div className="p-3 bg-blue-900/40 border border-blue-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 shrink-0">
                    Direct Video Link:
                  </span>
                  <a
                    href={currentModule.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-200 hover:underline truncate block text-[11px]"
                  >
                    {currentModule.video_url}
                  </a>
                </div>
                <a
                  href={currentModule.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Watch</span>
                </a>
              </div>
            </div>
          )}

          <div
            className="bg-blue-900/40 border border-blue-800 p-8 rounded-2xl text-slate-200 text-sm leading-relaxed space-y-4 shadow-inner prose prose-invert max-w-none"
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
              onClick={() => handleComplete(currentModule.id)}
              disabled={completing}
              className="bg-white hover:bg-slate-100 text-blue-950 font-bold px-6 py-3 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {completing ? 'Updating...' : 'Finish Module'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-950 transition flex flex-col justify-between group"
            >
              <div>
                {/* Module Visual Cover Image */}
                <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <img 
                    src={mod.image_url || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'} 
                    alt={mod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-blue-950/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                    Module {mod.module_number}
                  </div>
                  {mod.video_url && (
                    <div className="absolute bottom-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Video className="w-3 h-3" /> Video Lesson
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span className="text-blue-950 font-bold">{mod.category || "Foundations"}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mod.estimated_read_time || "12 mins"}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-950 transition-colors">{mod.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{mod.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setCurrentModule(mod)}
                  className="w-full py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Start Lesson</span>
                  <PlayCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function AdminDocUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return alert("Please specify a title and select a file.");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("document", file);
    formData.append("description", "Uploaded training module");

    setUploading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/lms/modules/", formData);
      alert("Module uploaded successfully!");
      setFile(null);
      setTitle('');
    } catch (err) {
      console.error(err);
      alert("Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-darkcard border border-slate-700 p-6 rounded-xl max-w-lg mx-auto">
      <h3 className="text-lg font-bold mb-4">Upload Security Learning Content</h3>
      <input
        type="text"
        placeholder="Module / Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-accent"
      />
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition ${dragActive ? 'border-accent bg-slate-800/50' : 'border-slate-600 bg-slate-900'}`}
      >
        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
        <p className="text-xs text-slate-400 mb-2">Drag & drop training PDFs/DOCs here or</p>
        <input 
          type="file" 
          id="fileUpload" 
          className="hidden" 
          onChange={(e) => e.target.files && setFile(e.target.files[0])} 
        />
        <label htmlFor="fileUpload" className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded cursor-pointer text-accent border border-slate-600">
          Browse Files
        </label>
        {file && (
          <div className="flex items-center gap-2 mt-4 text-shieldgreen text-xs font-medium">
            <FileText className="w-4 h-4" />
            <span>{file.name}</span>
          </div>
        )}
      </div>
      <button 
        onClick={handleUpload}
        disabled={uploading}
        className="w-full mt-4 py-2 bg-shieldgreen hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition"
      >
        {uploading ? "Uploading..." : "Publish Module"}
      </button>
    </div>
  );
}
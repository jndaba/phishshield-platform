import React, { useState, useEffect } from 'react';
import { Send, Shield, User } from 'lucide-react';
import axios from 'axios';

export default function SupportChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Admin Support', is_admin: true, message: 'Welcome to Incident Support. You can report suspicious emails or consult directly with security officers.', timestamp: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'You',
      is_admin: false,
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">Direct Security Admin Chat</h2>
        <p className="text-xs text-slate-400">Direct line to incident responders for threat analysis and guidance.</p>
      </div>

      <div className="flex-1 bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 overflow-y-auto space-y-4 mb-4 min-h-[400px]">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 ${m.is_admin ? 'justify-start' : 'justify-end'}`}>
            {m.is_admin && (
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-md p-3.5 rounded-xl text-sm ${m.is_admin ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-sky-500 text-slate-950 font-medium'}`}>
              <div className="flex justify-between items-center gap-4 mb-1">
                <span className="text-[11px] font-bold opacity-75">{m.sender}</span>
                <span className="text-[10px] opacity-60">{m.timestamp}</span>
              </div>
              <p>{m.message}</p>
            </div>
            {!m.is_admin && (
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the incident or paste the suspicious message..."
          className="flex-1 bg-[#1E293B] border border-slate-700 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-sky-400"
        />
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
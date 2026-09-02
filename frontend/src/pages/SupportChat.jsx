import React, { useState, useEffect, useContext, useRef } from 'react';
import { Send, MessageSquare, ShieldCheck, User, Users, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function SupportChat() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activeTargetUser, setActiveTargetUser] = useState(null); // Used by Admin to select learner thread
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchChat = async () => {
    try {
      const url = activeTargetUser
        ? `http://127.0.0.1:8000/api/chat/?target_user=${activeTargetUser.user_id}`
        : 'http://127.0.0.1:8000/api/chat/';
      const res = await axios.get(url);
      setMessages(res.data.messages || []);
      if (res.data.threads) {
        setThreads(res.data.threads);
        // Automatically select the first learner with history if none selected
        if (!activeTargetUser && res.data.threads.length > 0) {
          const firstWithHistory = res.data.threads.find(t => t.has_history) || res.data.threads[0];
          setActiveTargetUser(firstWithHistory);
        }
      }
    } catch (err) {
      console.error("Chat sync failure", err);
    }
  };

  useEffect(() => {
    fetchChat();
    const poller = setInterval(fetchChat, 3000); // 3-second live sync polling
    return () => clearInterval(poller);
  }, [activeTargetUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/chat/', {
        message: newMessage,
        receiver_id: user?.is_admin ? activeTargetUser?.user_id : null
      });
      setNewMessage('');
      fetchChat();
    } catch (err) {
      alert("Failed to deliver message. Check backend connection.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0B1120] text-slate-100 p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-4">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
              Icons Cyber Lab Support Channel
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-400" />
              {user?.is_admin ? "Administrator Support Operations & Learner Inquiries" : "Incident Response & Support Chat"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {user?.is_admin
                ? "Manage conversations, review learner question histories, and provide real-time incident resolution."
                : "Ask questions regarding modules, report deceptive email samples, or speak with Administrator Joel Ndaba."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#102A36] border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Channel Status: <strong className="text-teal-300">Active</strong></span>
          </div>
        </div>

        {/* Chat UI Container */}
        <div className="flex-1 bg-[#102A36] border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[550px]">
          
          {/* Admin Chat History / Thread Selector Sidebar */}
          {user?.is_admin && (
            <div className="w-full md:w-72 bg-[#0B1120]/70 border-r border-slate-800 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-400" /> Learner Inquiries ({threads.length})
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {threads.length > 0 ? (
                  threads.map((thread) => (
                    <div
                      key={thread.user_id}
                      onClick={() => setActiveTargetUser(thread)}
                      className={`p-3.5 cursor-pointer transition ${
                        activeTargetUser?.user_id === thread.user_id
                          ? 'bg-teal-950/40 border-l-4 border-teal-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white truncate">{thread.username}</span>
                        <span className="text-[10px] text-slate-500">{thread.last_timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{thread.last_message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">No registered learners found.</div>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div className="flex-1 flex flex-col justify-between bg-[#102A36]">
            {/* Active Thread Banner for Admins */}
            {user?.is_admin && activeTargetUser && (
              <div className="p-3 bg-[#0B1120]/40 border-b border-slate-800 px-6 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Viewing thread for: </span>
                  <strong className="text-teal-400">{activeTargetUser.username}</strong>
                  <span className="text-slate-500 text-[11px] ml-2">({activeTargetUser.email})</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Direct Message</span>
              </div>
            )}

            {/* Conversation Log */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                  <MessageSquare className="w-10 h-10 mb-2 text-slate-600" />
                  No messages in this conversation yet. Send an inquiry below to begin.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender === user?.username;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300">{m.sender}</span>
                        {m.is_admin_reply && (
                          <span className="bg-teal-900/60 text-teal-300 border border-teal-700/50 text-[9px] px-1.5 py-0.2 rounded font-semibold">
                            Admin
                          </span>
                        )}
                        <span>· {m.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isMine
                            ? 'bg-teal-500 text-slate-950 font-medium rounded-br-none'
                            : 'bg-[#0B1120] text-slate-200 border border-slate-700/80 rounded-bl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#0B1120]/40 flex gap-3">
              <input
                type="text"
                required
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  user?.is_admin
                    ? `Reply to ${activeTargetUser ? activeTargetUser.username : 'learner'}...`
                    : "Ask about a module or report an incident to Admin Joel Ndaba..."
                }
                className="flex-1 bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                disabled={sending || (user?.is_admin && !activeTargetUser)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
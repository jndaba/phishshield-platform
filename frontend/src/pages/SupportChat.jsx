import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function SupportChat() {
  const { user } = useContext(AuthContext);
  const isAdmin = Boolean(user?.is_admin || user?.is_staff);

  // Active Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('PHISHING_URL');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);

  // Counterparty Directory (Learner chooses Admin; Admin chooses Learner)
  const [counterpartyList, setCounterpartyList] = useState([]);
  const [activeCounterparty, setActiveCounterparty] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch available contacts (Admins for Learners; Learners for Admins)
  const fetchAvailableContacts = async () => {
    setLoadingContacts(true);
    try {
      if (isAdmin) {
        // Admin fetches learner directory
        const res = await axios.get('http://127.0.0.1:8000/api/auth/admin-metrics/');
        if (res.data?.learners) {
          setCounterpartyList(res.data.learners);
          if (!activeCounterparty && res.data.learners.length > 0) {
            setActiveCounterparty(res.data.learners[0]);
          }
        }
      } else {
        // Learner fetches active platform administrators
        const res = await axios.get('http://127.0.0.1:8000/api/auth/admins/active/');
        if (Array.isArray(res.data)) {
          setCounterpartyList(res.data);
          if (!activeCounterparty && res.data.length > 0) {
            setActiveCounterparty(res.data[0]);
          }
        }
      }
    } catch (err) {
      console.error("Could not fetch messaging directory", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // 2. Fetch thread messages with the selected counterparty
  const fetchThreadMessages = async (counterpartyId) => {
    if (!counterpartyId) return;
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/chat/?target_user_id=${counterpartyId}`);
      setMessages(res.data?.messages || []);
      if (res.data?.active_counterparty && !activeCounterparty) {
        setActiveCounterparty(res.data.active_counterparty);
      }
    } catch (err) {
      console.error("Failed to load chat thread", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAvailableContacts();
  }, [isAdmin]);

  // Fetch thread whenever active counterparty changes
  useEffect(() => {
    if (activeCounterparty?.id) {
      setLoadingMessages(true);
      fetchThreadMessages(activeCounterparty.id);
    }
  }, [activeCounterparty?.id]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeCounterparty?.id) return;
    const interval = setInterval(() => {
      fetchThreadMessages(activeCounterparty.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeCounterparty?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeCounterparty?.id || sending) return;

    setSending(true);
    try {
      const payload = {
        recipient_id: activeCounterparty.id,
        message: inputMessage.trim(),
        category: selectedCategory,
        subject: `Inquiry regarding ${selectedCategory.replace('_', ' ')}`
      };

      const res = await axios.post('http://127.0.0.1:8000/api/chat/', payload);
      setMessages((prev) => [...prev, res.data]);
      setInputMessage('');
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] bg-slate-50 text-slate-900 p-4 sm:p-6 flex flex-col space-y-4">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isAdmin ? 'Incident Triage & Support Desk' : 'Security Support Helpdesk'}
            </h1>
            <p className="text-xs text-slate-500">
              {isAdmin 
                ? 'Respond directly to learner-submitted suspicious URLs, incident reports, and questions.' 
                : 'Select an authorized cybersecurity administrator to get rapid guidance on suspicious findings.'}
            </p>
          </div>
        </div>

        {activeCounterparty && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">Chatting with:</span>
            <strong className="text-blue-600 font-semibold">{activeCounterparty.username}</strong>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {activeCounterparty.is_admin ? 'Admin' : 'Learner'}
            </span>
          </div>
        )}
      </div>

      {/* Main Workspace: Directory Sidebar + Active Chat Frame */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Column: Counterparty Selection (4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col min-h-0">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{isAdmin ? 'Enrolled Learners' : 'Available Administrators'}</span>
            </div>
            <button 
              onClick={fetchAvailableContacts}
              title="Refresh Contact List"
              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
            {loadingContacts ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                Locating responders...
              </div>
            ) : counterpartyList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active contacts found.
              </div>
            ) : (
              counterpartyList.map((contact) => {
                const isSelected = activeCounterparty?.id === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setActiveCounterparty(contact)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 border ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {contact.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                          {contact.username}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {contact.role || (contact.is_admin ? 'Security Coordinator' : contact.email)}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${
                      isSelected ? 'text-blue-600' : 'text-slate-300'
                    }`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Message Input (8 cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col min-h-0 overflow-hidden">
          
          {/* Thread Sub-Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Conversation with {activeCounterparty?.username || 'Responder'}
              </span>
              {activeCounterparty && (
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Online Triage
                </span>
              )}
            </div>

            {/* Incident Category Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Topic:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-600"
              >
                <option value="PHISHING_URL">Phishing URL Analysis</option>
                <option value="CREDENTIAL_LEAK">Compromised Credentials</option>
                <option value="MALICIOUS_EMAIL">Suspicious Email Attachment</option>
                <option value="SYSTEM_INQUIRY">General Inquiry</option>
              </select>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
            {loadingMessages ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                Syncing encrypted dispatches...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">No Messages Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Send a dispatch regarding a suspicious link, simulated attack, or incident inquiry to start the conversation.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.is_self;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        {isSelf ? 'You' : msg.sender_name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      isSelf 
                        ? 'bg-blue-600 text-white rounded-br-xs' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}>
                      {/* Topic Tag */}
                      <div className="mb-1.5 pb-1 border-b border-current/15 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-85">
                        <span>{msg.category.replace('_', ' ')}</span>
                      </div>
                      <p className="whitespace-pre-wrap font-medium">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              required
              disabled={!activeCounterparty || sending}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                activeCounterparty 
                  ? `Type your message to ${activeCounterparty.username}...` 
                  : 'Select an administrator or learner to begin messaging...'
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || !activeCounterparty || sending}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
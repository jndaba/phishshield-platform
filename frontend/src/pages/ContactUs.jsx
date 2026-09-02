import React, { useState, useEffect, useContext } from 'react';
import { Phone, Mail, MapPin, Building2, User, Edit3, CheckCircle, ShieldCheck, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ContactUs() {
  const { user } = useContext(AuthContext);
  const [contact, setContact] = useState({
    name: 'Joel Ndaba',
    phone: '+254721952909',
    email: 'joelndaba24@gmail.com',
    institution: 'Icons Computer School and Cyber',
    office_location: 'Nairobi, Kenya'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...contact });
  const [statusMsg, setStatusMsg] = useState('');

  const fetchContact = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/auth/contact/');
      setContact(res.data);
      setEditForm(res.data);
    } catch (err) {
      console.error("Failed to load contact info", err);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://127.0.0.1:8000/api/auth/contact/', editForm);
      setContact(res.data);
      setIsEditing(false);
      setStatusMsg('Contact details updated successfully.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update contact info.");
    }
  };

  return (
    <div className="min-h-full bg-[#0B1120] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
              Direct Support & Incident Escalation
            </span>
            <h1 className="text-3xl font-extrabold text-white">Contact Us</h1>
            <p className="text-xs text-slate-400 mt-1">
              Reach the administrator and support coordinator for technical queries, verification, or incident reporting.
            </p>
          </div>

          {user?.is_admin && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Contact Details
            </button>
          )}
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {statusMsg}
          </div>
        )}

        {/* Contact Details Card */}
        <div className="bg-[#102A36] border border-slate-800 rounded-2xl p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">
                Authorized Platform Administrator
              </span>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" /> {contact.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Lead Cybersecurity Officer & Coordinator</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-[#0B1120] border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Phone / WhatsApp</span>
                  <a href={`tel:${contact.phone}`} className="font-bold text-teal-300 hover:underline text-sm">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-[#0B1120] border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Email Support</span>
                  <a href={`mailto:${contact.email}`} className="font-bold text-teal-300 hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-[#0B1120] border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Institution</span>
                  <span className="font-semibold text-white">{contact.institution}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-[#0B1120] border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Location</span>
                  <span className="font-semibold text-white">{contact.office_location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Emergency Escalation Notice</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you have submitted sensitive credentials, passwords, or M-Pesa PINs to a suspected phishing link, initiate isolation steps on the <strong>Recovery Guide</strong> immediately before contacting support.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">
                Support Hours: Monday – Saturday (8:00 AM – 6:00 PM EAT)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#102A36] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Official Contact Information</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coordinator / Officer Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Support Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Institution</label>
                <input
                  type="text"
                  required
                  value={editForm.institution}
                  onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Office Location</label>
                <input
                  type="text"
                  required
                  value={editForm.office_location}
                  onChange={(e) => setEditForm({ ...editForm, office_location: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
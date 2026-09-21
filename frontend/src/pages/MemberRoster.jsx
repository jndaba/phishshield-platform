import React, { useState, useEffect, useContext } from 'react';
import { Users, UserPlus, Edit3, Trash2, X, Shield, Search } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function MemberRoster() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_admin: false,
    readiness_score: 0
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/auth/manage/users/');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load roster', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', is_admin: false, readiness_score: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setFormData({
      username: targetUser.username,
      email: targetUser.email,
      password: '',
      is_admin: targetUser.is_admin,
      readiness_score: targetUser.readiness_score || 0
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.patch(`http://127.0.0.1:8000/api/auth/manage/users/${editingUser.id}/`, formData);
      } else {
        await axios.post('http://127.0.0.1:8000/api/auth/manage/users/', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save account details.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert("Self-deletion is prohibited.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user ${targetUser.username}?`)) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/auth/manage/users/${targetUser.id}/`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete member.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-950" /> Member Roster
          </h2>
          <p className="text-xs text-slate-500 mt-1">Directory governance, enrollment, readiness calibration, and account provisioning.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-950"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold">
          {filteredUsers.length} total members listed
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Member Profile</span>
          <span className="text-center">Role &amp; Readiness</span>
          <span className="text-right">Manage</span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-bold font-mono">Loading member directory...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No matching accounts found.</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/70 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-bold">{u.username}</strong>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">Active Session</span>
                      )}
                    </div>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${u.is_admin ? 'bg-blue-50 text-blue-950 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {u.is_admin ? 'Administrator' : 'Learner'}
                  </span>
                  {!u.is_admin && (
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Readiness Score: {u.readiness_score || 0}%</p>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleOpenEditModal(u)}
                    className="p-2 text-slate-400 hover:text-blue-950 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit Member Information"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Member Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? `Edit Account: ${editingUser.username}` : 'Register New Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-950"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-950"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Privilege Level</label>
                  <select
                    value={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-950 bg-white"
                  >
                    <option value="false">Learner</option>
                    <option value="true">Administrator</option>
                  </select>
                </div>

                {!formData.is_admin && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Readiness Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.readiness_score}
                      onChange={(e) => setFormData({ ...formData, readiness_score: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-950"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
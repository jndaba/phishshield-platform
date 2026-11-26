import React, { useState, useEffect, useContext } from 'react';
import { Users, UserPlus, Edit3, Trash2, Shield, X, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
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
      const res = await axios.get('/api/auth/manage/users/');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
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
        // Edit existing member
        await axios.patch(`/api/auth/manage/users/${editingUser.id}/`, formData);
      } else {
        // Create new user
        await axios.post('/api/auth/manage/users/', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save user account.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Delete user ${targetUser.username}?`)) return;

    try {
      await axios.delete(`/api/auth/manage/users/${targetUser.id}/`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-950" /> Profile &amp; Member Roster
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage platform accounts, edit member data, and provision new user logins.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add New Member
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Registered Member</span>
          <span>Role &amp; Metrics</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 font-bold">Loading member registry...</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/70 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-bold">{u.username}</strong>
                    {u.id === currentUser.id && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">You</span>
                    )}
                  </div>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">{u.email}</p>
                </div>

                <div className="text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${u.is_admin ? 'bg-blue-50 text-blue-950 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {u.is_admin ? 'Administrator' : 'Learner'}
                  </span>
                  {!u.is_admin && (
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Readiness: {u.readiness_score || 0}%</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(u)}
                    className="p-2 text-slate-400 hover:text-blue-950 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit Member Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {u.id !== currentUser.id && (
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
                {editingUser ? 'Edit Member Profile' : 'Add New Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-950"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-950"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-950 bg-white"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-950"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
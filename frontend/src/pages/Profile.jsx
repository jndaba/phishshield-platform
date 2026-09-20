import React, { useState, useEffect, useContext } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  ShieldCheck, 
  Award, 
  Target, 
  BookOpen, 
  Users, 
  Search, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user: authUser, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('my-profile');
  const [stats, setStats] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterRoleFilter, setRosterRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Profile Form State
  const [formData, setFormData] = useState({
    username: authUser?.username || '',
    email: authUser?.email || '',
    current_password: '',
    new_password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(authUser?.avatar || null);

  const isAdmin = Boolean(authUser?.is_admin || authUser?.is_staff);

  useEffect(() => {
    // 1. Fetch performance stats for progress review
    axios.get('http://127.0.0.1:8000/api/auth/user-stats/')
      .then(res => setStats(res.data.stats))
      .catch(() => {});

    // 2. If admin, load member directory
    if (isAdmin) {
      axios.get('http://127.0.0.1:8000/api/auth/manage/users/')
        .then(res => setRoster(res.data || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const data = new FormData();
      if (formData.username) data.append('username', formData.username);
      if (formData.email) data.append('email', formData.email);
      if (formData.current_password) data.append('current_password', formData.current_password);
      if (formData.new_password) data.append('new_password', formData.new_password);
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await axios.patch('http://127.0.0.1:8000/api/auth/profile/update/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFeedback({ type: 'success', message: 'Profile credentials updated successfully.' });
      if (setUser && res.data.user) {
        setUser(prev => ({ ...prev, ...res.data.user }));
      }
      setFormData(prev => ({ ...prev, current_password: '', new_password: '' }));
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to update profile settings.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRoster = roster.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesRole = rosterRoleFilter === 'all' 
      ? true 
      : rosterRoleFilter === 'admin' ? u.is_admin : !u.is_admin;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-full bg-slate-50 p-6 sm:p-8 font-sans text-slate-900 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account Management &amp; Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Update account credentials, manage profile pictures, and view training progress metrics.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('my-profile')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'my-profile' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Account
            </button>
            <button
              onClick={() => setActiveTab('member-roster')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'member-roster' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Member Roster ({roster.length})
            </button>
          </div>
        )}
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: USER'S OWN PROFILE & PROGRESS */}
      {activeTab === 'my-profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Credential Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Profile Configuration
            </h2>

            <form onSubmit={handleSubmitProfile} className="space-y-4 text-xs">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4 pb-2">
                <div className="relative">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview.startsWith('blob:') || avatarPreview.startsWith('http') ? avatarPreview : `http://127.0.0.1:8000${avatarPreview}`}
                      alt="Avatar Preview" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600 font-black text-lg">
                      {authUser?.username?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                  )}
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-xs transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{authUser?.username}</h3>
                  <p className="text-slate-400 text-[11px]">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Change Password (Leave blank to keep existing)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={formData.current_password}
                        onChange={e => setFormData({ ...formData, current_password: e.target.value })}
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={formData.new_password}
                        onChange={e => setFormData({ ...formData, new_password: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Progress & Readiness Overview */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Cyber Readiness Index
                </h3>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Readiness Score
                </span>
                <span className="text-3xl font-black text-blue-600">
                  {isAdmin ? 'Exempt (Admin)' : `${authUser?.readiness_score || 0}%`}
                </span>
                <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                  {isAdmin 
                    ? 'Administrative accounts maintain governance oversight and do not require readiness scoring.' 
                    : 'Evaluates your behavioral resilience across all learning modules and mock emails.'}
                </p>
              </div>

              {!isAdmin && (
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Module Progress
                    </span>
                    <strong>{stats?.completed_modules || 0} / {stats?.total_modules || 14}</strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-500" /> Simulation Accuracy
                    </span>
                    <strong>{stats?.sim_accuracy || 0}%</strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" /> Certification Status
                    </span>
                    <strong className={stats?.is_certified ? 'text-emerald-600' : 'text-slate-400'}>
                      {stats?.is_certified ? 'Accredited' : 'In Progress'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN MEMBER ROSTER */}
      {isAdmin && activeTab === 'member-roster' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Institutional Members Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Inspect user privileges, contact records, and readiness ratings.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <select
                value={rosterRoleFilter}
                onChange={e => setRosterRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="learner">Learners Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredRoster.length > 0 ? (
              filteredRoster.map(u => (
                <div key={u.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                      u.is_admin ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold">{u.username}</strong>
                        {u.is_self && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            You
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.is_admin ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {u.is_admin ? 'Administrator' : 'Learner'}
                        </span>
                      </div>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {u.email} &middot; Enrolled: {u.date_joined}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right self-end sm:self-center">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Readiness Score
                      </span>
                      <strong className={u.is_admin ? 'text-slate-400 font-normal text-[11px]' : 'text-blue-600 text-sm font-black'}>
                        {u.is_admin ? 'Exempt' : `${u.readiness_score}%`}
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 py-6 text-center text-xs">No member accounts matched your criteria.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
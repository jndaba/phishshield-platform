import React, { useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, XCircle, Search, UserCheck } from 'lucide-react';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data representing enrolled students/users
  const [users] = useState([
    { id: 1, username: "c025-student1", email: "student1@students.dkut.ac.ke", role: "Student", completedModules: 5, totalModules: 6, passRate: "92%" },
    { id: 2, username: "ict-officer-main", email: "support@dkut.ac.ke", role: "Administrator", completedModules: 6, totalModules: 6, passRate: "100%" },
    { id: 3, username: "c025-student2", email: "student2@students.dkut.ac.ke", role: "Student", completedModules: 2, totalModules: 6, passRate: "68%" },
  ]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Platform User Monitoring & Governance</h2>
          <p className="text-xs text-slate-400">Track user progress, assess simulation completion streaks, and manage platform roles.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1E293B] border border-slate-700 pl-9 pr-4 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400 w-64"
          />
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Modules Completed</th>
              <th className="p-4">Simulation Score</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition">
                <td className="p-4 font-semibold text-white">
                  <div>{user.username}</div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.role === 'Administrator' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-300'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 font-medium">{user.completedModules} / {user.totalModules}</td>
                <td className="p-4 font-semibold text-sky-400">{user.passRate}</td>
                <td className="p-4">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-sky-400 hover:text-sky-300 font-semibold text-[11px] mr-3">Audit Logs</button>
                  <button className="text-red-400 hover:text-red-300 font-semibold text-[11px]">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
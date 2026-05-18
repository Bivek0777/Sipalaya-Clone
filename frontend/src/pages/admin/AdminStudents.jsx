import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, UserCheck } from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'student' };

export default function AdminStudents({ users, token, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filtered = (users || []).filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setErr(''); setModal(true); };
  const openEdit = u => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setErr(''); setModal(true); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      if (editing) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await axios.put(`${API}/users/${editing._id}`, payload, cfg);
      } else {
        await axios.post(`${API}/users`, form, cfg);
      }
      setModal(false); onRefresh();
    } catch (e) { setErr(e.response?.data?.message || 'Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async u => {
    if (!window.confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    try { 
      await axios.delete(`${API}/users/${u._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      onRefresh(); 
      alert('User deleted successfully');
    } catch (e) { 
      console.error('Delete failed', e);
      alert(`Delete failed: ${e.response?.status || 'Error'} - ${e.response?.data?.message || e.message}`); 
    }
  };

  const roleBadge = role => {
    const map = { admin: 'bg-red-100 text-red-700 border border-red-200', instructor: 'bg-amber-100 text-amber-700 border border-amber-200', student: 'bg-blue-100 text-blue-700 border border-blue-200' };
    return map[role] || 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const staff = filtered.filter(u => u.role === 'admin' || u.role === 'instructor');
  const students = filtered.filter(u => u.role === 'student');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* ── STAFF TABLE (ADMINS & INSTRUCTORS) ─────────────────────────────────── */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-base">Staff Members (Admins & Instructors)</h3>
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold">{staff.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Name / Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Joined Date</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">No staff members found.</td></tr>
              ) : (
                staff.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0 animate-pulse-subtle">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STUDENTS TABLE ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-base">Students</h3>
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">{students.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Name / Email</th>
                <th className="px-5 py-3 font-semibold">Joined Date</th>
                <th className="px-5 py-3 font-semibold">Enrolled Courses</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">No students found.</td></tr>
              ) : (
                students.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{u.enrolledCourses?.length || 0}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit User' : 'Add New User'}</h3>
              </div>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" required={!editing} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60">
                  {loading ? 'Saving…' : editing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

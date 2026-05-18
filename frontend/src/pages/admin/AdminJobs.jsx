import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Briefcase } from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';

const EMPTY_FORM = { title: '', company: '', description: '', deadline: '' };

export default function AdminJobs({ jobs, token, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filtered = (jobs || []).filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setErr(''); setModal(true); };
  const openEdit = j => { 
    setEditing(j); 
    setForm({ 
        title: j.title, 
        company: j.company, 
        description: j.description || '', 
        deadline: j.deadline ? j.deadline.split('T')[0] : '' 
    }); 
    setErr(''); 
    setModal(true); 
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      if (editing) {
        await axios.put(`${API}/jobs/${editing._id}`, form);
      } else {
        await axios.post(`${API}/jobs`, form);
      }
      setModal(false); onRefresh();
    } catch (e) { setErr(e.response?.data?.message || 'Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async j => {
    if (!window.confirm(`Delete job listing "${j.title}" at "${j.company}"?`)) return;
    try { await axios.delete(`${API}/jobs/${j._id}`); onRefresh(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or company…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Post New Job
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Job Title</th>
                <th className="px-5 py-3.5 font-semibold">Company</th>
                <th className="px-5 py-3.5 font-semibold">Deadline</th>
                <th className="px-5 py-3.5 font-semibold">Posted</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No jobs found.</td></tr>
              )}
              {filtered.map(j => (
                <tr key={j._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{j.title}</td>
                  <td className="px-5 py-3.5 text-slate-600">{j.company}</td>
                  <td className="px-5 py-3.5 text-slate-500">{j.deadline ? new Date(j.deadline).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(j.postedAt || j.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(j)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(j)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                <Briefcase size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Job' : 'Post New Job'}</h3>
              </div>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Senior React Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company *</label>
                <input required value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Sipalaya Info Tech" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Job details and requirements..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60">
                  {loading ? 'Saving…' : editing ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

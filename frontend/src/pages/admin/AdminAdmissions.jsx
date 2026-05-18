import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, ClipboardList } from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';

const EMPTY = { fullName: '', email: '', phone: '', course: '', paymentPreference: 'esewa', paymentPlan: 'full', status: 'pending' };

const statusColor = s => ({ pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }[s] || 'bg-slate-100 text-slate-600');
const planColor = p => p === 'full' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

export default function AdminAdmissions({ admissions, courses, token, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filtered = (admissions || []).filter(a => {
    const matchSearch = (a.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.course || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY); setErr(''); setModal(true); };
  const openEdit = a => { setEditing(a); setForm({ fullName: a.fullName, email: a.email, phone: a.phone, course: a.course, paymentPreference: a.paymentPreference, paymentPlan: a.paymentPlan, status: a.status }); setErr(''); setModal(true); };

  const handleSubmit = async e => {
    e.preventDefault(); 
    setLoading(true); 
    setErr('');
    const cfg = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editing) {
        await axios.put(`${API}/admissions/${editing._id}`, form, cfg);
      } else {
        await axios.post(`${API}/admissions`, form, cfg);
      }
      setModal(false); 
      onRefresh();
      alert('Admission saved successfully');
    } catch (e) { 
      setErr(e.response?.data?.message || 'Operation failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async a => {
    if (!window.confirm(`Delete admission for "${a.fullName}"?`)) return;
    try { 
      await axios.delete(`${API}/admissions/${a._id}`, { headers: { Authorization: `Bearer ${token}` } }); 
      onRefresh(); 
      alert('Admission deleted successfully');
    } catch (e) { 
      alert(e.response?.data?.message || 'Delete failed'); 
    }
  };

  const quickStatus = async (a, status) => {
    try { 
      await axios.put(`${API}/admissions/${a._id}`, { ...a, status }, { headers: { Authorization: `Bearer ${token}` } }); 
      onRefresh(); 
    } catch (e) { 
      alert('Update failed'); 
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search admissions…"
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Add Admission
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {['pending','approved','rejected'].map(s => (
          <span key={s} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor(s)}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}: {admissions.filter(a => a.status === s).length}
          </span>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Student</th>
                <th className="px-5 py-3.5 font-semibold">Course</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No admissions found.</td></tr>
              )}
              {filtered.map(a => (
                <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{a.fullName}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                    <p className="text-xs text-slate-400">{a.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-indigo-600 font-medium">{a.course}</td>
                  <td className="px-5 py-3.5">
                    <span className={`block px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${planColor(a.paymentPlan)}`}>{a.paymentPlan}</span>
                    <span className="text-xs text-slate-400 uppercase">{a.paymentPreference}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <select value={a.status} onChange={e => quickStatus(a, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${statusColor(a.status)}`}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(a.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(a)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          Showing {filtered.length} of {admissions.length} admissions
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Admission' : 'Add Admission'}</h3>
              </div>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Student full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="98XXXXXXXX" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Course *</label>
                  <select required value={form.course} onChange={e => setForm({...form, course: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c._id} value={c.title}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Gateway</label>
                  <select value={form.paymentPreference} onChange={e => setForm({...form, paymentPreference: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="esewa">eSewa</option>
                    <option value="khalti">Khalti</option>
                    <option value="stripe">Stripe</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Plan</label>
                  <select value={form.paymentPlan} onChange={e => setForm({...form, paymentPlan: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="full">Full</option>
                    <option value="installment">Installment</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60">
                  {loading ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

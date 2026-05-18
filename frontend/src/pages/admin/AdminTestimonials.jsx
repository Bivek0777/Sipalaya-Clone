import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Quote } from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';

const EMPTY = { name: '', role: '', image: '', content: '', rating: 5 };

export default function AdminTestimonials({ testimonials, token, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filtered = (testimonials || []).filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.role?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY); setErr(''); setModal(true); };
  const openEdit = t => { setEditing(t); setForm({ ...t }); setErr(''); setModal(true); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      if (editing) {
        await axios.put(`${API}/testimonials/${editing._id}`, form, cfg);
      } else {
        await axios.post(`${API}/testimonials`, form, cfg);
      }
      setModal(false); onRefresh();
      alert('Success story saved successfully');
    } catch (e) { setErr(e.response?.data?.message || 'Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async t => {
    if (!window.confirm(`Delete testimonial from "${t.name}"?`)) return;
    try { 
      await axios.delete(`${API}/testimonials/${t._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      onRefresh(); 
      alert('Testimonial deleted successfully');
    }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or role…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-slate-400">No testimonials found.</div>
        )}
        {filtered.map(t => (
          <div key={t._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
            <Quote size={40} className="absolute -top-2 -right-2 text-indigo-50 opacity-10" />
            <div className="flex items-center gap-3 mb-4">
              <img src={t.image || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100" alt="" />
              <div>
                <h4 className="font-bold text-slate-800">{t.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{t.role}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 italic mb-5 line-clamp-3">"{t.content}"</p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
               <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < t.rating ? 'fill-current' : 'text-slate-200'}>★</span>
                  ))}
               </div>
               <div className="flex gap-2">
                 <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={14} /></button>
                 <button onClick={() => handleDelete(t)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Quote size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h3>
              </div>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Anish Giri" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role/Company *</label>
                <input required value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Student at MIT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL</label>
                <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Testimonial Content *</label>
                <textarea required rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="The training was amazing..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60">
                  {loading ? 'Saving…' : editing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

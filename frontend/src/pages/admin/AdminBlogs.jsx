import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, FileText } from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';

const EMPTY_FORM = { title: '', content: '', excerpt: '', category: '', author: '', image: '', readTime: '', tags: '' };

const CATEGORIES = ['Industry Trends', 'Learning Tips', 'Career Guidance', 'Certifications', 'Student Success', 'Technology', 'Other'];

export default function AdminBlogs({ blogs, token, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filtered = (blogs || []).filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setErr(''); setModal(true); };
  const openEdit = b => { 
    setEditing(b); 
    setForm({ 
        title: b.title, 
        content: b.content, 
        excerpt: b.excerpt || '', 
        category: b.category || '', 
        author: b.author || '', 
        image: b.image || '', 
        readTime: b.readTime || '', 
        tags: b.tags?.join(', ') || '' 
    }); 
    setErr(''); 
    setModal(true); 
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(t => t) };
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      if (editing) {
        await axios.put(`${API}/blogs/${editing._id}`, payload, cfg);
      } else {
        await axios.post(`${API}/blogs`, payload, cfg);
      }
      setModal(false); onRefresh();
      alert('Blog saved successfully');
    } catch (e) { setErr(e.response?.data?.message || 'Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async b => {
    if (!window.confirm(`Are you sure you want to delete the blog post "${b.title}"?`)) return;
    try { 
      await axios.delete(`${API}/blogs/${b._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      onRefresh(); 
      alert('Blog post deleted successfully');
    } catch (e) { 
      console.error('Delete failed', e);
      alert(`Delete failed: ${e.response?.status || 'Error'} - ${e.response?.data?.message || e.message}`); 
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search blogs by title..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> New Blog Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Title</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Author</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No blogs found.</td></tr>
              )}
              {filtered.map(b => (
                <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {b.image && <img src={b.image} className="w-10 h-10 rounded object-cover shrink-0" alt="" />}
                      <span className="font-semibold text-slate-800 line-clamp-1">{b.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{b.category}</td>
                  <td className="px-5 py-3.5 text-slate-600">{b.author}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(b)}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Blog Post' : 'New Blog Post'}</h3>
              </div>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Future of AI in Web Dev" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Author</label>
                  <input value={form.author} onChange={e => setForm({...form, author: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Ramesh Adhikari" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL</label>
                  <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Read Time</label>
                  <input value={form.readTime} onChange={e => setForm({...form, readTime: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 5 min read" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
                  <textarea rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Short summary for SEO and listing..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Content (Markdown/HTML Supported) *</label>
                  <textarea required rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Full blog post content..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. AI, WebDev, Trends" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-4">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60">
                  {loading ? 'Saving…' : editing ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

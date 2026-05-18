import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, BookOpen } from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';

const EMPTY = {
  title: '', category: '', level: 'Beginner', duration: '', fee: '',
  instructor: '', image: '', description: '', prerequisites: '', syllabus: '', enrollmentDeadline: ''
};

const CATEGORIES = ['Web Development', 'Data Science', 'Mobile Development', 'UI/UX Design', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'AI/ML', 'Database', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const INSTRUCTORS = [
  'Pramod Mahto',
  'Saroj Giri',
  'Er. Sujan Thadarai',
  'Sangam Swornakar',
  'Ajay Dhoju',
  'Kirtan Shrestha',
  'Rajan Shrestha',
  'Saurab Karki',
  'Er. Himal Rawal',
  'Biplove Paudel',
  'Ramesh Bista'
];

export default function AdminCourses({ courses, token, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filtered = (courses || []).filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setErr('');
    setModal(true);
  };

  const openEdit = c => {
    setEditing(c);
    setForm({
      title: c.title, category: c.category, level: c.level, duration: c.duration,
      fee: c.fee, instructor: c.instructor, image: c.image || '', description: c.description,
      prerequisites: c.prerequisites || '',
      syllabus: Array.isArray(c.syllabus) ? c.syllabus.join('\n') : (c.syllabus || ''),
      enrollmentDeadline: c.enrollmentDeadline ? c.enrollmentDeadline.slice(0, 10) : ''
    });
    setErr('');
    setModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const payload = {
        ...form,
        fee: Number(form.fee),
        syllabus: form.syllabus.split('\n').filter(s => s.trim()),
      };
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      if (editing) {
        await axios.put(`${API}/courses/${editing._id}`, payload, cfg);
      } else {
        await axios.post(`${API}/courses`, payload, cfg);
      }
      setModal(false); onRefresh();
      alert('Course saved successfully');
    } catch (e) {
      setErr(e.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async c => {
    console.log('Delete Button Clicked for:', c._id, c.title);
    if (!c._id) { 
      console.error('Delete aborted: No ID found for course', c);
      alert('Error: Course ID missing. Cannot delete.'); 
      return; 
    }
    
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE the course "${c.title}"?`)) {
      console.log('Delete canceled by user');
      return;
    }
    
    try { 
      console.log(`Sending DELETE request to ${API}/courses/${c._id}`);
      const res = await axios.delete(`${API}/courses/${c._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      console.log('Delete response:', res.data);
      onRefresh(); 
      alert('Course deleted successfully');
    } catch (e) { 
      console.error('Delete operation failed:', e);
      const msg = e.response?.data?.message || e.message;
      alert(`Delete failed: ${e.response?.status || 'Error'} - ${msg}`); 
    }
  };

  const levelColor = l => ({ Beginner: 'bg-green-100 text-green-700', Intermediate: 'bg-amber-100 text-amber-700', Advanced: 'bg-red-100 text-red-700' }[l] || 'bg-slate-100 text-slate-600');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, category…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-slate-400">No courses found.</div>
        )}
        {filtered.map(c => (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-slate-100 relative overflow-hidden">
              <img src={c.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'}
                alt={c.title} className="w-full h-full object-cover" onError={e => e.target.src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'} />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${levelColor(c.level)}`}>{c.level}</span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-indigo-500 font-semibold mb-1">{c.category}</p>
              <h3 className="font-bold text-slate-800 text-base mb-2 leading-tight">{c.title}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-4">
                <span>👤 {c.instructor}</span>
                <span>⏱ {c.duration}</span>
                <span className="font-bold text-slate-700">Rs. {Number(c.fee).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold transition-colors">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => { console.log('Delete icon clicked'); handleDelete(c); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Course' : 'Add New Course'}</h3>
              </div>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Full Stack Web Development" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Level *</label>
                  <select required value={form.level} onChange={e => setForm({...form, level: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration *</label>
                  <input required value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 12 Weeks" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fee (Rs.) *</label>
                  <input required type="number" min="0" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="25000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Instructor *</label>
                  <select required value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="">Select instructor</option>
                    {INSTRUCTORS.map(ins => <option key={ins} value={ins}>{ins}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Enrollment Deadline</label>
                  <input type="date" value={form.enrollmentDeadline} onChange={e => setForm({...form, enrollmentDeadline: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL</label>
                  <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://…" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Course overview…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Prerequisites</label>
                  <input value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Basic computer knowledge" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Syllabus (one item per line)</label>
                  <textarea rows={3} value={form.syllabus} onChange={e => setForm({...form, syllabus: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder={"HTML & CSS Basics\nJavaScript\nReact.js"} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60">
                  {loading ? 'Saving…' : editing ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

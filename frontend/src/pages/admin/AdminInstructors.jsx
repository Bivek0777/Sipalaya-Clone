import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Plus, Pencil, Trash2, X, Search, GraduationCap,
  Eye, EyeOff, RefreshCw, BookOpen, Users, Award, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';
const EMPTY_FORM = { name: '', email: '', password: '', courseIds: [] };

export default function AdminInstructors({ token, courses = [], onRefresh }) {
  const [instructors, setInstructors]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [modal, setModal]                 = useState(false);
  const [assignModal, setAssignModal]     = useState(false);
  const [selectedInst, setSelectedInst]   = useState(null);
  const [showPassword, setShowPassword]   = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [err, setErr]                     = useState('');
  const [assignCourses, setAssignCourses] = useState([]);
  const [pageSize, setPageSize]           = useState(4);

  /* ─── Fetch ─────────────────────────────────────────────────────────── */
  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/instructors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstructors(data);
    } catch {
      toast.error('Failed to load instructors');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchInstructors(); }, [fetchInstructors]);

  /* ─── Helpers ───────────────────────────────────────────────────────── */
  const filtered = instructors.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  );
  const displayedInstructors = filtered.slice(0, pageSize);

  const toggleFormCourse = id =>
    setForm(p => ({
      ...p,
      courseIds: p.courseIds.includes(id) ? p.courseIds.filter(x => x !== id) : [...p.courseIds, id]
    }));

  const toggleAssignCourse = id =>
    setAssignCourses(p =>
      p.includes(id) ? p.filter(x => x !== id) : [...p, id]
    );

  /* ─── Open modals ────────────────────────────────────────────────────── */
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErr('');
    setShowPassword(false);
    setModal(true);
  };

  const openEdit = inst => {
    setEditing(inst);
    setForm({
      name: inst.name,
      email: inst.email,
      password: '',
      courseIds: (inst.assignedCourses || []).map(c => c._id)
    });
    setErr('');
    setShowPassword(false);
    setModal(true);
  };

  const openAssign = inst => {
    setSelectedInst(inst);
    setAssignCourses((inst.assignedCourses || []).map(c => c._id));
    setAssignModal(true);
  };

  /* ─── Submit: create / update ────────────────────────────────────────── */
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      if (editing) {
        const payload = { name: form.name, email: form.email, role: 'instructor', courseIds: form.courseIds };
        if (form.password) payload.password = form.password;
        await axios.put(`${API}/users/${editing._id}`, payload, cfg);
        toast.success('Instructor updated!');
      } else {
        await axios.post(`${API}/users`, { ...form, role: 'instructor' }, cfg);
        toast.success('Instructor created!');
      }
      setModal(false);
      fetchInstructors();
      onRefresh();
    } catch (e) {
      const msg = e.response?.data?.message || 'Operation failed';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Save course assignment ─────────────────────────────────────────── */
  const handleSaveAssign = async () => {
    if (!selectedInst) return;
    setSaving(true);
    try {
      await axios.put(`${API}/instructors/${selectedInst._id}/courses`,
        { courseIds: assignCourses },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Courses updated!');
      setAssignModal(false);
      fetchInstructors();
      onRefresh();
    } catch {
      toast.error('Failed to update courses');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Remove a single course inline ─────────────────────────────────── */
  const removeCourse = async (inst, courseId) => {
    const remaining = (inst.assignedCourses || []).map(c => c._id).filter(id => id !== courseId);
    try {
      await axios.put(`${API}/instructors/${inst._id}/courses`,
        { courseIds: remaining },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Course removed');
      fetchInstructors();
      onRefresh();
    } catch {
      toast.error('Failed to remove course');
    }
  };

  /* ─── Delete instructor ──────────────────────────────────────────────── */
  const handleDelete = async inst => {
    if (!window.confirm(`Delete "${inst.name}"? Their courses will become unassigned.`)) return;
    try {
      await axios.delete(`${API}/users/${inst._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Instructor deleted');
      fetchInstructors();
      onRefresh();
    } catch {
      toast.error('Delete failed');
    }
  };

  /* ─── Stats ──────────────────────────────────────────────────────────── */
  const totalAssigned   = instructors.reduce((a, i) => a + (i.assignedCourses?.length || 0), 0);
  const totalUnassigned = courses.filter(c => !c.instructorId).length;

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search instructors…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-slate-600">Show</label>
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
          </select>
          <button onClick={fetchInstructors}
            className="p-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
            <RefreshCw size={15} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={16} /> Add Instructor
          </button>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-200 text-xs font-medium mb-1">Total Instructors</p>
              <p className="text-4xl font-extrabold">{instructors.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><GraduationCap size={22} /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-medium mb-1">Courses Assigned</p>
              <p className="text-4xl font-extrabold text-slate-800">{totalAssigned}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><BookOpen size={22} /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-medium mb-1">Unassigned Courses</p>
              <p className="text-4xl font-extrabold text-slate-800">{totalUnassigned}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award size={22} /></div>
          </div>
        </div>
      </div>

      {/* ── Instructors table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users size={17} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">All Instructors</h3>
          </div>
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold">
            {filtered.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Instructor</th>
                  <th className="px-5 py-3 font-semibold">Assigned Courses</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedInstructors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <GraduationCap size={36} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-400 font-medium">No instructors found</p>
                      <p className="text-slate-400 text-xs mt-1">Create one using the button above</p>
                    </td>
                  </tr>
                ) : displayedInstructors.map(inst => (
                  <tr key={inst._id} className="hover:bg-slate-50 transition-colors group">
                    {/* Name / Email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {inst.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{inst.name}</p>
                          <p className="text-xs text-slate-500">{inst.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Courses */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(inst.assignedCourses || []).length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No courses assigned</span>
                        ) : (
                          (inst.assignedCourses || []).map(c => (
                            <span key={c._id}
                              className="group/chip flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
                              {c.title}
                              <button
                                onClick={() => removeCourse(inst, c._id)}
                                title="Remove course"
                                className="text-indigo-300 hover:text-red-500 transition-colors ml-0.5 opacity-0 group-hover/chip:opacity-100">
                                <X size={11} />
                              </button>
                            </span>
                          ))
                        )}
                        <button onClick={() => openAssign(inst)}
                          className="px-2.5 py-1 border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 rounded-full text-xs font-medium transition-colors">
                          + Assign
                        </button>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(inst.createdAt || Date.now()).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(inst)} title="Edit"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(inst)} title="Delete"
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
        )}
      </div>

      {/* ══ CREATE / EDIT MODAL ════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">
                  {editing ? 'Edit Instructor' : 'Add New Instructor'}
                </h3>
              </div>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                {err && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{err}</div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ram Sharma"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="instructor@example.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {editing ? 'New Password (leave blank to keep)' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'}
                      required={!editing} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Course multi-select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Assign Courses
                    {form.courseIds.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        {form.courseIds.length} selected
                      </span>
                    )}
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {courses.length === 0 ? (
                      <p className="text-sm text-slate-400 p-4 text-center">No courses available. Create courses first.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {courses.map(course => {
                          const checked = form.courseIds.includes(course._id);
                          const isMine  = editing && course.instructorId === editing._id;
                          const hasOther = course.instructorId && !isMine;
                          return (
                            <label key={course._id}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                              <input type="checkbox" checked={checked} onChange={() => toggleFormCourse(course._id)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 truncate">{course.title}</p>
                                <p className="text-xs text-slate-500">{course.category}</p>
                              </div>
                              {hasOther && (
                                <span className="shrink-0 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                  Other Instructor
                                </span>
                              )}
                              {isMine && (
                                <span className="shrink-0 text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Saving…' : editing ? 'Update Instructor' : 'Create Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ ASSIGN COURSES MODAL ══════════════════════════════════════════ */}
      {assignModal && selectedInst && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Manage Courses</h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <GraduationCap size={12} /> {selectedInst.name}
                </p>
              </div>
              <button onClick={() => setAssignModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Course list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {courses.length === 0 ? (
                <p className="text-sm text-slate-400 p-8 text-center">No courses available.</p>
              ) : courses.map(course => {
                const checked   = assignCourses.includes(course._id);
                const isMine    = course.instructorId === selectedInst._id;
                const hasOther  = course.instructorId && !isMine;
                return (
                  <label key={course._id}
                    className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${checked ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleAssignCourse(course._id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{course.title}</p>
                      <p className="text-xs text-slate-500">{course.category} · {course.level}</p>
                    </div>
                    {hasOther && (
                      <span className="shrink-0 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        Other
                      </span>
                    )}
                    {isMine && (
                      <span className="shrink-0 text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 shrink-0">
              <p className="text-xs text-slate-500 mb-3">
                {assignCourses.length} course{assignCourses.length !== 1 ? 's' : ''} selected
                {assignCourses.length === 0 && ' — all courses will be unassigned from this instructor'}
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAssignModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveAssign} disabled={saving}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

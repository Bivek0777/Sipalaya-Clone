import { useState, useEffect } from 'react';
import { Search, FileText, Trash2, Calendar, Award, ExternalLink, GraduationCap, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function AdminAssignments({ token }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const [tasksRes, subsRes] = await Promise.all([
        axios.get('/api/assignments/tasks/instructor', cfg),
        axios.get('/api/assignments/instructor', cfg)
      ]);
      setTasks(tasksRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin assignments data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this assignment task? This will remove all student submissions for it.')) return;
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/assignments/tasks/${id}`, cfg);
      alert('Assignment task deleted successfully');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.courseId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.courseId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActiveTab('tasks'); setSearch(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-white text-indigo-650 shadow-sm'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            Homework Prompts ({tasks.length})
          </button>
          <button
            onClick={() => { setActiveTab('submissions'); setSearch(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'submissions'
                ? 'bg-white text-indigo-650 shadow-sm'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            Student Submissions ({submissions.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === 'tasks' ? 'Search by course or title…' : 'Search by student, title, course…'}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'tasks' ? (
        /* HOMEWORK PROMPTS TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {task.courseId?.title || 'General'}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                    Max: {task.maxScore || 100} pts
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mt-4 line-clamp-1">{task.title}</h3>
                <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">{task.description}</p>
                
                {task.deadline && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 w-max">
                    <Calendar size={13} />
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-5">
                <span className="text-slate-400 text-xxs">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete Prompt
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <FileText size={48} className="mx-auto text-slate-350 mb-3" />
              <p className="font-semibold text-slate-600">No homework prompts found.</p>
              <p className="text-sm text-slate-400 mt-1">Instructor has not posted any homework tasks yet.</p>
            </div>
          )}
        </div>
      ) : (
        /* STUDENT SUBMISSIONS TAB */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 font-semibold">Student</th>
                  <th className="px-5 py-4 font-semibold">Homework Task</th>
                  <th className="px-5 py-4 font-semibold">Course</th>
                  <th className="px-5 py-4 font-semibold">Grading Status</th>
                  <th className="px-5 py-4 font-semibold">Submitted Date</th>
                  <th className="px-5 py-4 font-semibold text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{sub.studentId?.name || 'Unknown Student'}</p>
                        <p className="text-xs text-slate-450">{sub.studentId?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{sub.title}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{sub.courseId?.title || 'Unknown Course'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {sub.status === 'graded' ? (
                          <>
                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
                              Score: {sub.grade} pts
                            </span>
                          </>
                        ) : (
                          <>
                            <Award size={14} className="text-amber-500 shrink-0" />
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                              Awaiting Grade
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        Source Link <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}

                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-450 italic">
                      No assignment submissions submitted by students yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  MessageSquare, BarChart3, LogOut, Menu, X,
  TrendingUp, DollarSign, Activity, Bell, FileText, Mail,
  RefreshCw
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import AdminStudents from './admin/AdminStudents';
import AdminCourses from './admin/AdminCourses';
import AdminAdmissions from './admin/AdminAdmissions';
import AdminDemos from './admin/AdminDemos';
import AdminContacts from './admin/AdminContacts';
import AdminReports from './admin/AdminReports';
import AdminJobs from './admin/AdminJobs';
import AdminBlogs from './admin/AdminBlogs';
import AdminTestimonials from './admin/AdminTestimonials';
import { Quote } from 'lucide-react';

const API = '/api/admin';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'students',  label: 'Users',       icon: Users },
  { id: 'courses',   label: 'Courses',     icon: BookOpen },
  { id: 'admissions',label: 'Admissions',  icon: ClipboardList },
  { id: 'demos',     label: 'Demo Requests',icon: MessageSquare },
  { id: 'contacts',  label: 'Messages',     icon: Mail },
  { id: 'jobs',      label: 'Jobs',        icon: Activity },
  { id: 'blogs',     label: 'Blogs',       icon: FileText },
  { id: 'testimonials', label: 'Success Stories', icon: Quote },
  { id: 'reports',   label: 'Reports',     icon: BarChart3 },
];

export default function AdminDashboard() {
  const { user, token } = useContext(AuthContext);
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users,      setUsers]      = useState([]);
  const [courses,    setCourses]    = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [demos,      setDemos]      = useState([]);
  const [contacts,   setContacts]   = useState([]);
  const [jobs,       setJobs]       = useState([]);
  const [blogs,      setBlogs]      = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [notifOpen,  setNotifOpen]  = useState(false);


  const fetchAll = async () => {
    const cfg = { headers: { Authorization: `Bearer ${token}` } };
    setLoading(true);
    setError('');

    const fetchModule = async (path, setter) => {
      try {
        const res = await axios.get(`${API}${path}`, cfg);
        setter(res.data);
      } catch (e) {
        console.error(`Fetch failed for ${path}:`, e.message);
      }
    };

    const fetchDirect = async (url, setter) => {
      try {
        const res = await axios.get(url, cfg);
        setter(res.data);
      } catch (e) {
        console.error(`Fetch failed for ${url}:`, e.message);
      }
    };

    try {
      await Promise.all([
        fetchModule('/users', setUsers),
        fetchModule('/courses', setCourses),
        fetchModule('/admissions', setAdmissions),
        fetchModule('/demos', setDemos),
        fetchModule('/jobs', setJobs),
        fetchModule('/blogs', setBlogs),
        fetchModule('/testimonials', setTestimonials),
        fetchDirect('/api/contact', setContacts)
      ]);
    } catch (e) {
      console.error('Admin fetch error', e);
      setError(`Dashboard data load failed. Please check backend connection.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAll();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // ── Quick-stat cards for dashboard overview ──────────────────────────────
  const stats = [
    { label: 'Total Students', value: (users || []).filter(u => u.role === 'student').length, icon: Users, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 text-blue-600' },
    { label: 'Active Courses', value: (courses || []).length, icon: BookOpen, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50 text-indigo-600' },
    { label: 'Admissions', value: (admissions || []).length, icon: ClipboardList, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 text-green-600' },
    { label: 'Job Openings', value: (jobs || []).length, icon: Activity, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 text-amber-600' },
    { label: 'Blog Posts', value: (blogs || []).length, icon: FileText, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 text-purple-600' },
    { label: 'Alumni Stories', value: (testimonials || []).length, icon: Quote, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 text-cyan-600' },
    { label: 'Demo Requests', value: (demos || []).length, icon: MessageSquare, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 text-orange-600' },
    { label: 'New Messages', value: (contacts || []).filter(c => c.status === 'new').length, icon: Mail, color: 'from-red-500 to-rose-600', bg: 'bg-red-50 text-red-600' },
  ];

  // Compile active real-time notifications
  const notifications = [
    ...admissions.filter(a => a.status === 'pending').map(a => ({
      id: `adm-${a._id}`,
      type: 'admission',
      title: 'Pending Admission',
      text: `${a.fullName} - ${a.course}`,
      time: a.createdAt,
      tab: 'admissions'
    })),
    ...demos.map(d => ({
      id: `demo-${d._id}`,
      type: 'demo',
      title: 'Demo Request',
      text: `${d.fullName || d.name} - ${d.course}`,
      time: d.createdAt || d.date,
      tab: 'demos'
    })),
    ...contacts.filter(c => c.status === 'new').map(c => ({
      id: `contact-${c._id}`,
      type: 'contact',
      title: 'Unread Message',
      text: `${c.name}: "${c.purpose}"`,
      time: c.createdAt,
      tab: 'contacts'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* ── Sidebar overlay (mobile) ────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <span className="text-xl font-extrabold tracking-tight">
            Sipalaya<span className="text-indigo-400">Admin</span>
          </span>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Icon size={18} />
              {label}
              {id === 'demos' && demos.length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {demos.length}
                </span>
              )}
              {id === 'contacts' && contacts.filter(c => c.status === 'new').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {contacts.filter(c => c.status === 'new').length}
                </span>
              )}
              {id === 'admissions' && admissions.filter(a => a.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {admissions.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                {NAV.find(n => n.id === tab)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={fetchAll}
              disabled={loading}
              className={`p-2 rounded-xl transition-all duration-300 ${
                loading ? 'text-indigo-400 bg-indigo-50/50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Click-outside backdrop catcher */}
            {notifOpen && (
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setNotifOpen(false)} />
            )}

            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative p-2 rounded-xl transition-all duration-300 ${
                  notifOpen 
                    ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-600/10' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                )}
              </button>

              {/* Dynamic Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden py-1">
                  {/* Dropdown Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">Notifications</span>
                    {notifications.length > 0 && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xxs font-extrabold rounded-full">
                        {notifications.length} Alerts
                      </span>
                    )}
                  </div>

                  {/* Dropdown Content */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map(notif => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          setTab(notif.tab);
                          setNotifOpen(false);
                        }}
                        className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex gap-3 items-start"
                      >
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          notif.type === 'admission' ? 'bg-green-50 text-green-600' :
                          notif.type === 'demo' ? 'bg-orange-50 text-orange-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {notif.type === 'admission' ? <ClipboardList size={14} /> :
                           notif.type === 'demo' ? <MessageSquare size={14} /> :
                           <Mail size={14} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-xs truncate">{notif.title}</p>
                          <p className="text-slate-500 text-xxs mt-0.5 truncate leading-normal">{notif.text}</p>
                          <span className="text-slate-400 text-[10px] block mt-1">
                            {notif.time ? new Date(notif.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                      </button>
                    ))}

                    {notifications.length === 0 && (
                      <div className="py-8 px-5 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2.5 text-slate-300">
                          <Bell size={20} className="opacity-70" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">No new alerts to review.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => fetchAll()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              <Activity size={16} /> Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity size={20} />
                <p className="font-medium">{error}</p>
              </div>
              <button onClick={() => fetchAll()} className="text-sm font-bold underline hover:no-underline">Retry</button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading data…</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* ── DASHBOARD OVERVIEW ─────────────────────────────── */}
              {tab === 'dashboard' && (
                <div className="space-y-7">
                  {/* Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl ${bg}`}><Icon size={20} /></div>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
                        <p className="text-sm text-slate-500 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Revenue banner */}
                  <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-indigo-200 text-sm font-medium mb-1">Total Estimated Revenue</p>
                        <p className="text-4xl font-extrabold">
                          Rs. {(admissions || []).reduce((acc, adm) => {
                            const c = (courses || []).find(c => c._id === adm.course || c.title === adm.course);
                            return acc + (c ? Number(c.fee) : 15000);
                          }, 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-4 py-3 rounded-xl">
                        <DollarSign size={24} />
                        <div>
                          <p className="text-xs text-indigo-200">Conversion</p>
                          <p className="font-bold">
                            {(demos || []).length > 0 ? (((admissions || []).length / (demos || []).length) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent tables side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent students */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Recent Students</h3>
                        <button onClick={() => setTab('students')} className="text-xs text-indigo-600 font-semibold hover:underline">View all →</button>
                      </div>
                      <div className="space-y-3">
                        {users.filter(u => u.role === 'student').slice(0, 5).map(u => (
                          <div key={u._id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                              <p className="text-xs text-slate-500 truncate">{u.email}</p>
                            </div>
                            <span className="text-xs text-slate-400">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        ))}
                        {users.filter(u => u.role === 'student').length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4">No students yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Recent admissions */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Recent Admissions</h3>
                        <button onClick={() => setTab('admissions')} className="text-xs text-indigo-600 font-semibold hover:underline">View all →</button>
                      </div>
                      <div className="space-y-3">
                        {admissions.slice(0, 5).map(a => (
                          <div key={a._id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {a.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800 truncate">{a.fullName}</p>
                              <p className="text-xs text-indigo-500 truncate">{a.course}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              a.status === 'approved' ? 'bg-green-100 text-green-700' :
                              a.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'}`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                        {admissions.length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4">No admissions yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STUDENTS TAB ───────────────────────────────────── */}
              {tab === 'students' && (
                <AdminStudents users={users} token={token} onRefresh={fetchAll} />
              )}

              {/* ── COURSES TAB ────────────────────────────────────── */}
              {tab === 'courses' && (
                <AdminCourses courses={courses} token={token} onRefresh={fetchAll} />
              )}

              {/* ── ADMISSIONS TAB ─────────────────────────────────── */}
              {tab === 'admissions' && (
                <AdminAdmissions admissions={admissions} courses={courses} token={token} onRefresh={fetchAll} />
              )}

              {/* ── DEMO REQUESTS TAB ──────────────────────────────── */}
              {tab === 'demos' && (
                <AdminDemos demos={demos} token={token} onRefresh={fetchAll} />
              )}

              {/* ── MESSAGES/CONTACTS TAB ──────────────────────────────── */}
              {tab === 'contacts' && (
                <AdminContacts contacts={contacts} onRefresh={fetchAll} />
              )}

              {/* ── JOBS TAB ───────────────────────────────────────── */}
              {tab === 'jobs' && (
                <AdminJobs jobs={jobs} token={token} onRefresh={fetchAll} />
              )}

              {/* ── BLOGS TAB ───────────────────────────────────────── */}
              {tab === 'blogs' && (
                <AdminBlogs blogs={blogs} token={token} onRefresh={fetchAll} />
              )}

              {/* ── TESTIMONIALS TAB ─────────────────────────────────── */}
              {tab === 'testimonials' && (
                <AdminTestimonials testimonials={testimonials} token={token} onRefresh={fetchAll} />
              )}

              {/* ── REPORTS TAB ────────────────────────────────────── */}
              {tab === 'reports' && (
                <AdminReports admissions={admissions} courses={courses} users={users} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

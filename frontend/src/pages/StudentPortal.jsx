import { Book, CheckCircle, Upload, Calendar, PieChart, Download } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

const StudentPortal = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ courseId: '', title: '', fileUrl: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get('/api/auth/profile', config);
      setProfile(res.data);
      setEditForm({ name: res.data.name, email: res.data.email, password: '' });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const [attendance, setAttendance] = useState([]);

  const fetchAttendance = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/attendance/my', config);
      setAttendance(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  const [assignments, setAssignments] = useState([]);
  const fetchAssignments = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/assignments/my', config);
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchAttendance();
      fetchAssignments();
    }
  }, [token]);

  // ... (rest of the component)

  // Calculate average progress
  const avgProgress = profile?.enrolledCourses?.length 
    ? Math.round(profile.enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / profile.enrolledCourses.length)
    : 0;

  // Calculate attendance percentage — 0% if no records yet (student hasn't joined/been marked)
  const hasAttendanceRecords = attendance.length > 0;
  const attendancePercent = hasAttendanceRecords
    ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
    : 0;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.put('/api/auth/profile', editForm, config);
      
      // Update local profile state
      await fetchProfile();
      
      // Update global auth context
      if (updateUser) {
        updateUser({ name: editForm.name, email: editForm.email });
      }

      setIsEditModalOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/assignments', submitForm, config);
      alert('Assignment submitted successfully!');
      setSubmitForm({ courseId: '', title: '', fileUrl: '' });
      setIsSubmitModalOpen(false);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitLoading(false);
    }
  };

  const generateCertificate = (courseName) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "in",
      format: "letter"
    });

    const studentName = profile?.name || user?.name || 'Student';

    doc.setLineWidth(0.1);
    doc.rect(0.5, 0.5, 10, 7.5);
    doc.setLineWidth(0.02);
    doc.rect(0.6, 0.6, 9.8, 7.3);

    doc.setFont("times", "bold");
    doc.setFontSize(40);
    doc.setTextColor(33, 33, 33);
    doc.text("Certificate of Completion", 5.5, 2, null, null, "center");

    doc.setFont("times", "normal");
    doc.setFontSize(20);
    doc.text("This is to certify that", 5.5, 3, null, null, "center");

    doc.setFont("times", "italic");
    doc.setFontSize(30);
    doc.setTextColor(79, 70, 229);
    doc.text(studentName, 5.5, 4, null, null, "center");

    doc.setFont("times", "normal");
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text("has successfully completed the course", 5.5, 5, null, null, "center");

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(courseName, 5.5, 6, null, null, "center");

    doc.setFont("times", "normal");
    doc.setFontSize(14);
    const date = new Date().toLocaleDateString();
    doc.text(`Date: ${date}`, 2, 7);

    doc.text("Director, Sipalaya IT", 8, 7);
    doc.line(7.5, 6.8, 9.5, 6.8);

    doc.save(`Certificate_${courseName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile?.name || user?.name || 'Student'}!</h1>
            <p className="text-slate-600 mt-1">Here is what's happening with your courses today.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Edit Profile
            </button>
            <Link to="/courses" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Browse More Courses</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center text-indigo-600 mb-2">
                  <Book size={20} className="mr-2" />
                  <span className="font-semibold text-sm">Enrolled Courses</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{profile?.enrolledCourses?.length || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle size={20} className="mr-2" />
                  <span className="font-semibold text-sm">Completed</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{profile?.enrolledCourses?.filter(c => c.status === 'completed').length || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center text-blue-600 mb-2">
                  <PieChart size={20} className="mr-2" />
                  <span className="font-semibold text-sm">Avg. Progress</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{avgProgress}%</div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Active Courses</h2>
              <div className="space-y-6">
                
                {loading ? (
                  <p className="text-slate-500 text-center py-4">Loading your courses...</p>
                ) : profile?.enrolledCourses?.length > 0 ? (
                  profile.enrolledCourses.map((enroll, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-xl p-5 hover:border-indigo-100 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{enroll.course?.title || 'Course Title'}</h3>
                          <p className="text-sm text-slate-500">Instructor: {enroll.course?.instructor || 'Sipalaya Expert'}</p>
                        </div>
                        <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-bold rounded-full ${enroll.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {enroll.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="mb-2 flex justify-between text-sm text-slate-600">
                        <span>Overall Progress</span>
                        <span className="font-bold text-indigo-600">{enroll.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${enroll.progress}%` }}></div>
                      </div>
                      
                      {/* New Resources Section for this course */}
                      <div className="mt-6 border-t border-slate-50 pt-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                          <Download size={16} className="mr-2 text-indigo-500" />
                          Learning Resources
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                             <span className="text-slate-600">Syllabus & Curriculum</span>
                             <a href="#" className="text-indigo-600 font-bold hover:underline">Download</a>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                             <span className="text-slate-600">Handouts & Exercises</span>
                             <a href="#" className="text-indigo-600 font-bold hover:underline">Download</a>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link to={`/courses/${enroll.course?._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Go to Course Module →</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500 mb-4">You have not enrolled in any courses yet.</p>
                    <Link to="/courses" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors inline-block">Browse Courses</Link>
                  </div>
                )}

              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Assignments</h2>
                {profile?.enrolledCourses?.length > 0 && (
                  <button 
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Upload size={14} /> Submit Assignment
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Task</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length > 0 ? assignments.map((ass, idx) => (
                      <tr key={ass._id || idx} className="border-b border-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-800">{ass.title}</td>
                        <td className="px-4 py-4">{ass.courseId?.title}</td>
                        <td className="px-4 py-4 font-bold text-indigo-600">{ass.grade || 'Pending'}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${ass.status === 'graded' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {ass.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <a href={ass.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View File</a>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic">
                          No assignments submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Attendance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Attendance</h2>
                <button
                  onClick={fetchAttendance}
                  title="Refresh attendance"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  <Calendar size={13} />
                  Refresh
                </button>
              </div>

              {!hasAttendanceRecords ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No attendance records yet</p>
                  <p className="text-xs text-slate-400 mt-1">Your instructor hasn't marked attendance yet.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center py-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={attendancePercent >= 75 ? 'text-green-500' : attendancePercent >= 50 ? 'text-amber-400' : 'text-red-400'}
                          strokeWidth="3"
                          strokeDasharray={`${attendancePercent}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">{attendancePercent}%</span>
                        <span className="text-xs text-slate-500">Present</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 text-center text-xs gap-1">
                    <div className="bg-green-50 rounded-lg py-2">
                      <p className="font-bold text-green-700">{attendance.filter(a => a.status === 'present').length}</p>
                      <p className="text-green-600">Present</p>
                    </div>
                    <div className="bg-red-50 rounded-lg py-2">
                      <p className="font-bold text-red-700">{attendance.filter(a => a.status === 'absent').length}</p>
                      <p className="text-red-600">Absent</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg py-2">
                      <p className="font-bold text-amber-700">{attendance.filter(a => a.status === 'late').length}</p>
                      <p className="text-amber-600">Late</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-3">
                    {attendancePercent >= 75 ? '✅ Good standing' : attendancePercent >= 50 ? '⚠️ Needs improvement' : '🔴 Low attendance'}
                  </p>
                </>
              )}
            </div>

            {/* Certificates */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 mt-[-20px] mr-[-20px]">
                <Book size={120} />
              </div>
              <h2 className="text-xl font-bold mb-4 relative z-10">Certificates Earned</h2>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-4 border border-white/20 relative z-10 text-center">
                <h3 className="font-bold mb-4 text-lg">Web Development Bootcamp</h3>
                <p className="text-sm text-indigo-200 mb-6">Completed on {new Date().toLocaleDateString()}</p>
                <button 
                  onClick={() => generateCertificate("Web Development Bootcamp")}
                  className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-sm font-bold shadow-lg transition-colors flex items-center mx-auto"
                >
                  <Download size={16} className="mr-2" /> Download PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Update Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white">
                <Upload size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Submit Assignment</h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Course *</label>
                <select 
                  required 
                  value={submitForm.courseId} 
                  onChange={e => setSubmitForm({ ...submitForm, courseId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                >
                  <option value="">Choose Enrolled Course</option>
                  {profile?.enrolledCourses?.map((enroll, idx) => (
                    <option key={idx} value={enroll.course?._id}>{enroll.course?.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title / Homework Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Redux Toolkit Exercise"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={submitForm.title}
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Submission File Link / URL *</label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://github.com/yourusername/repo"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={submitForm.fileUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {submitLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;

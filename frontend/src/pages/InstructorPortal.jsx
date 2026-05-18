import { BookOpen, Users, Video, UploadCloud, MessageSquare, Plus, FileText, X, CheckCircle } from 'lucide-react';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const InstructorPortal = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: '', fee: '', duration: '' });

  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Grading Modal State
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' });
  
  // File Upload State
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchAssignments();
    if (user) {
      setProfileForm({ name: user.name, email: user.email, password: '' });
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/assignments/instructor', config);
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('/api/auth/profile', profileForm, config);
      if (updateUser) updateUser({ name: profileForm.name, email: profileForm.email });
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setFormData({ title: '', category: '', fee: '', duration: '' });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditMode(true);
    setSelectedCourseId(course._id);
    setFormData({ title: course.title, category: course.category, fee: course.fee, duration: course.duration });
    setShowModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        fee: Number(formData.fee)
      };
      if (editMode) {
        await axios.put(`/api/courses/${selectedCourseId}`, payload, { headers: { Authorization: `Bearer ${token}` }});
        alert("Course updated successfully!");
      } else {
        await axios.post('/api/courses', {
          ...payload,
          instructor: user?.name || 'Instructor',
          level: 'Beginner',
          rating: 0
        }, { headers: { Authorization: `Bearer ${token}` }});
        alert("Course created successfully!");
      }
      setShowModal(false);
      setFormData({ title: '', category: '', fee: '', duration: '' });
      fetchCourses();
    } catch (err) {
      alert("Error saving course: " + (err.response?.data?.message || err.message));
    }
  };

  const openGradeModal = (assignment) => {
    setSelectedAssignment(assignment);
    setGradeData({ score: '', feedback: '' });
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/assignments/${selectedAssignment._id}/grade`, gradeData, config);
      alert(`Successfully graded ${selectedAssignment.studentId?.name}'s assignment.`);
      setShowGradeModal(false);
      fetchAssignments();
    } catch (err) {
      alert("Error grading assignment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // For simplicity, we'll use the first course if none selected, 
    // or better, ask user to select in real implementation.
    const courseId = courses[0]?._id; 
    if (!courseId) {
      alert("Please create a course first!");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('title', file.name);

    setUploadStatus('Uploading to Cloudinary...');
    try {
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        } 
      };
      const res = await axios.post('/api/resources/upload', formData, config);
      setUploadStatus(`Success: ${res.data.resource.title}`);
      setTimeout(() => setUploadStatus(''), 5000);
    } catch (err) {
      setUploadStatus('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({ studentId: '', courseId: '', date: new Date().toISOString().split('T')[0], status: 'present' });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchAssignments();
    fetchStudents();
    if (user) {
      setProfileForm({ name: user.name, email: user.email, password: '' });
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/users', config);
      setStudents(res.data.filter(u => u.role === 'student'));
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/attendance', attendanceForm, config);
      alert("Attendance marked successfully!");
      setShowAttendanceModal(false);
    } catch (err) {
      alert("Error marking attendance: " + (err.response?.data?.message || err.message));
    }
  };

  const openAttendanceModal = (courseId) => {
    setAttendanceForm({ ...attendanceForm, courseId });
    setShowAttendanceModal(true);
  };

  // ... (existing functions)

  return (
    <div className="bg-slate-50 min-h-screen py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name || 'Instructor'}!</h1>
            <p className="text-slate-600 mt-1">Manage your courses, students, and resources.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button onClick={() => setShowAttendanceModal(true)} className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
              Mark Attendance
            </button>
            <button onClick={() => setShowProfileModal(true)} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              Edit Profile
            </button>
            <button onClick={openCreateModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus size={20} className="mr-2" />
              Create New Course
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Active Courses</div>
                  <div className="text-2xl font-bold text-slate-900">{courses.length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mr-4">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Total Students</div>
                  <div className="text-2xl font-bold text-slate-900">1,248</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mr-4">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Unread Messages</div>
                  <div className="text-2xl font-bold text-slate-900">12</div>
                </div>
              </div>
            </div>

            {/* Course Management */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Manage Courses</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Course Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Fee</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3 rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-4 font-bold text-slate-900">{c.title}</td>
                        <td className="px-4 py-4">{c.category}</td>
                        <td className="px-4 py-4">Rs. {c.fee}</td>
                        <td className="px-4 py-4">{c.duration}</td>
                        <td className="px-4 py-4 space-x-2">
                          <button onClick={() => openEditModal(c)} className="text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No courses found. Create one above!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignment Grading */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Submissions to Grade</h2>
                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
              </div>
              <div className="space-y-4">
                {assignments.length > 0 ? assignments.map((sub, idx) => (
                  <div key={sub._id || idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-start mb-3 sm:mb-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-3">
                        {sub.studentId?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{sub.studentId?.name}</h4>
                        <p className="text-xs text-slate-500">{sub.title} • {sub.courseId?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs text-slate-400">{sub.status === 'graded' ? 'Graded' : 'Pending'}</span>
                      <button onClick={() => openGradeModal(sub)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sub.status === 'graded' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}>
                        {sub.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No student submissions yet.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Quick Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Upload Resource</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <UploadCloud size={32} className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-700 mb-1">Drag and drop files here</p>
                <p className="text-xs text-slate-500 mb-4">Videos, PDFs, or ZIP files</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Browse Files
                </button>
                {uploadStatus && (
                  <div className="mt-3 text-sm flex items-center justify-center text-green-600 font-medium">
                    {uploadStatus.includes('Success') && <CheckCircle size={16} className="mr-1" />}
                    {uploadStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Tools</h2>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => alert("Starting live session broadcast...")} className="flex items-center w-full text-left text-slate-600 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                    <Video size={18} className="mr-3 text-indigo-400" />
                    <span>Start Live Session</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => alert("Generating instructor reports...")} className="flex items-center w-full text-left text-slate-600 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                    <FileText size={18} className="mr-3 text-indigo-400" />
                    <span>Generate Reports</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => alert("Opening Student Forums...")} className="flex items-center w-full text-left text-slate-600 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                    <MessageSquare size={18} className="mr-3 text-indigo-400" />
                    <span>Student Forums</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Create / Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editMode ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. React Mastery" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. Web Development" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fee (Rs)</label>
                  <input required type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. 15000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <input required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. 12 Weeks" />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">{editMode ? 'Update Course' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {showGradeModal && selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Grade Assignment</h2>
              <button onClick={() => setShowGradeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Student</p>
              <p className="font-semibold text-slate-900 mb-3">{selectedAssignment.studentId?.name}</p>
              <p className="text-sm text-slate-500 mb-1">Task</p>
              <p className="font-medium text-slate-800">{selectedAssignment.title} ({selectedAssignment.courseId?.title})</p>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Score (0 - 100)</label>
                <input required type="number" min="0" max="100" value={gradeData.score} onChange={e => setGradeData({...gradeData, score: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. 85" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback / Remarks</label>
                <textarea required rows="3" value={gradeData.feedback} onChange={e => setGradeData({...gradeData, feedback: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" placeholder="Great job on the API integration. Just remember to handle error states gracefully."></textarea>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowGradeModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">Submit Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Mark Student Attendance</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                <select required value={attendanceForm.courseId} onChange={e => setAttendanceForm({...attendanceForm, courseId: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Choose Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                <select required value={attendanceForm.studentId} onChange={e => setAttendanceForm({...attendanceForm, studentId: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Choose Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={attendanceForm.date} onChange={e => setAttendanceForm({...attendanceForm, date: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={attendanceForm.status} onChange={e => setAttendanceForm({...attendanceForm, status: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">Submit Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Update Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password (optional)</label>
                <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={updateLoading} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorPortal;

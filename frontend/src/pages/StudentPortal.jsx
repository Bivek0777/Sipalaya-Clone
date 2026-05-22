import { Book, CheckCircle, Upload, Calendar, PieChart, Download, Eye, EyeOff, X } from 'lucide-react';
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
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ courseId: '', taskId: '', title: '', fileUrl: '' });
  const [availableTasks, setAvailableTasks] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);

  const fetchAllAssignedTasks = async (enrolledCourses) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const validEnrollments = enrolledCourses.filter(enroll => enroll && (enroll.course?._id || enroll.course));
      const tasksPromises = validEnrollments.map(enroll =>
        axios.get(`/api/assignments/tasks/course/${enroll.course?._id || enroll.course}`, config)
      );
      const responses = await Promise.all(tasksPromises);
      const allTasks = responses.flatMap(res => res.data);
      setAssignedTasks(allTasks);
    } catch (err) {
      console.error("Failed to fetch assigned tasks", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get('/api/auth/profile', config);
      setProfile(res.data);
      setEditForm({
        name: res.data.name,
        email: res.data.email,
        password: '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
      if (res.data.enrolledCourses && res.data.enrolledCourses.length > 0) {
        fetchAllAssignedTasks(res.data.enrolledCourses);
      }
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

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

  useEffect(() => {
    if (submitForm.courseId) {
      fetchCourseTasks(submitForm.courseId);
    } else {
      setAvailableTasks([]);
    }
  }, [submitForm.courseId]);

  const fetchCourseTasks = async (courseId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/assignments/tasks/course/${courseId}`, config);
      setAvailableTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch course tasks", err);
    }
  };

  const handleAssignmentFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'image/png',
      'image/jpeg'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Allowed file types: PDF, DOC, DOCX, ZIP, PNG, JPG');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Max file size is 20MB');
      return;
    }

    setUploadError('');
    setUploadLoading(true);
    setSelectedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      const res = await axios.post('/api/assignments/upload', formData, config);
      setSubmitForm({ ...submitForm, fileUrl: res.data.fileUrl });
      setUploadedFileName(res.data.fileName || file.name);
      alert('File uploaded successfully');
    } catch (err) {
      setUploadError(err.response?.data?.message || 'File upload failed');
      setSelectedFile(null);
      setUploadedFileName('');
    } finally {
      setUploadLoading(false);
    }
  };

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
      if (updateUser) {
        updateUser({ name: editForm.name, email: editForm.email, phone: editForm.phone, address: editForm.address });
      }
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
      setSubmitForm({ courseId: '', taskId: '', title: '', fileUrl: '' });
      setIsSubmitModalOpen(false);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitLoading(false);
    }
  };

  const generateCertificate = (courseName) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: 'letter' });
    const studentName = profile?.name || user?.name || 'Student';
    const W = 11, H = 8.5;

    // Background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, W, H, 'F');

    // Decorative border
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.12);
    doc.rect(0.4, 0.4, W - 0.8, H - 0.8);
    doc.setLineWidth(0.03);
    doc.rect(0.55, 0.55, W - 1.1, H - 1.1);

    // Header band
    doc.setFillColor(79, 70, 229);
    doc.rect(0.55, 0.55, W - 1.1, 1.4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('SIPALAYA INFO TECH', W / 2, 1.1, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('IT Training Institute · Koteshwor, Kathmandu, Nepal', W / 2, 1.5, { align: 'center' });

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(30, 41, 59);
    doc.text('Certificate of Completion', W / 2, 2.8, { align: 'center' });

    // Body
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(100, 116, 139);
    doc.text('This is to certify that', W / 2, 3.5, { align: 'center' });

    // Student name
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(30);
    doc.setTextColor(79, 70, 229);
    doc.text(studentName, W / 2, 4.3, { align: 'center' });
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.02);
    doc.line(W / 2 - 2.5, 4.45, W / 2 + 2.5, 4.45);

    // Course info
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(100, 116, 139);
    doc.text('has successfully completed the course', W / 2, 5.1, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(courseName, W / 2, 5.8, { align: 'center' });

    // Footer
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Issued on: ${date}`, 1.5, 7.2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.text('Director, Sipalaya Info Tech', W - 1.5, 7.2, { align: 'right' });
    doc.setDrawColor(79, 70, 229);
    doc.line(W - 3.5, 7.05, W - 0.9, 7.05);

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
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">Email</p>
                <p className="mt-2 text-sm text-slate-900">{profile?.email || user?.email || 'Not available'}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">Phone</p>
                <p className="mt-2 text-sm text-slate-900">{profile?.phone || 'Not added yet'}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">Address</p>
                <p className="mt-2 text-sm text-slate-900">{profile?.address || 'Not added yet'}</p>
              </div>
            </div>
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

            {/* Assigned Tasks / Learning Homework */}
            {assignedTasks && assignedTasks.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-900/5 to-purple-900/5 border border-indigo-100 rounded-3xl p-6 mb-7 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-655 bg-indigo-600 rounded-full animate-ping" />
                      Assigned Homework Prompts
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Please review outstanding milestones posted by your instructors.</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xxs font-extrabold uppercase tracking-wide">
                    {assignedTasks.length} Active Tasks
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {assignedTasks.map(task => (
                    <div key={task._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {task.courseId?.title || 'Course Homework'}
                          </span>
                          {task.deadline && (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 shrink-0">
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                        <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">{task.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] font-medium">Max Score: {task.maxScore || 100} pts</span>
                        <button
                          onClick={() => {
                            setSubmitForm({
                              courseId: task.courseId?._id || task.courseId || '',
                              taskId: task._id,
                              title: task.title,
                              fileUrl: ''
                            });
                            setIsSubmitModalOpen(true);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-850 font-extrabold flex items-center gap-1 cursor-pointer bg-transparent border-0"
                        >
                          Submit Solution →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Certificates — dynamic for all enrolled courses */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 mt-[-20px] mr-[-20px]">
                <Book size={120} />
              </div>
              <h2 className="text-xl font-bold mb-1 relative z-10">Certificates</h2>
              <p className="text-xs text-indigo-300 mb-4 relative z-10">Unlock at 80% progress</p>
              <div className="space-y-3 relative z-10">
                {profile?.enrolledCourses?.length > 0 ? profile.enrolledCourses.map((enroll, idx) => {
                  const title = enroll.course?.title || 'Course';
                  const progress = enroll.progress || 0;
                  const unlocked = progress >= 80;
                  return (
                    <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                      <p className="font-semibold text-sm mb-1 truncate">{title}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{width:`${progress}%`}} />
                        </div>
                        <span className="text-xs text-indigo-200 flex-shrink-0">{progress}%</span>
                      </div>
                      {unlocked ? (
                        <button
                          onClick={() => generateCertificate(title)}
                          className="w-full px-3 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-bold shadow transition-colors flex items-center justify-center gap-1"
                        >
                          <Download size={13} /> Download Certificate
                        </button>
                      ) : (
                        <div className="text-center text-xs text-indigo-300 py-1">
                          🔒 Complete {80 - progress}% more to unlock
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-sm text-indigo-300 text-center py-4">Enroll in a course to earn certificates.</p>
                )}
              </div>
            </div>

            {/* Mini Assignment Deadline Calendar */}
            {assignedTasks.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" /> Upcoming Deadlines
                </h2>
                <div className="space-y-3">
                  {assignedTasks
                    .filter(t => t.deadline)
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                    .slice(0, 5)
                    .map(task => {
                      const due = new Date(task.deadline);
                      const today = new Date();
                      const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                      const urgent = daysLeft <= 3;
                      return (
                        <div key={task._id} className={`flex items-start gap-3 p-3 rounded-xl border ${urgent ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold ${urgent ? 'bg-rose-500' : 'bg-indigo-500'}`}>
                            <span>{due.getDate()}</span>
                            <span className="text-[9px] opacity-80">{due.toLocaleString('default',{month:'short'})}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                            <p className={`text-xs mt-0.5 font-medium ${urgent ? 'text-rose-600' : 'text-slate-500'}`}>
                              {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Street address, city, district"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
              {submitForm.courseId && availableTasks.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Select Assigned Homework *</label>
                  <select
                    required
                    value={submitForm.taskId}
                    onChange={(e) => {
                      const taskId = e.target.value;
                      const selectedTask = availableTasks.find(t => t._id === taskId);
                      setSubmitForm({
                        ...submitForm,
                        taskId,
                        title: selectedTask ? selectedTask.title : ''
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                  >
                    <option value="">-- Choose Homework Prompt --</option>
                    {availableTasks.map(task => (
                      <option key={task._id} value={task._id}>
                        {task.title} ({task.maxScore} pts)
                      </option>
                    ))}
                  </select>
                  
                  {submitForm.taskId && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Task guidelines</span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {availableTasks.find(t => t._id === submitForm.taskId)?.description}
                      </p>
                      {availableTasks.find(t => t._id === submitForm.taskId)?.deadline && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-2">
                          Due Date: {new Date(availableTasks.find(t => t._id === submitForm.taskId).deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title / Homework Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Redux Toolkit Exercise"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value, taskId: '' })}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Assignment File *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                  onChange={handleAssignmentFileUpload}
                />
                {uploadError && <p className="text-xs text-rose-500 mt-2">{uploadError}</p>}
                {uploadedFileName && !uploadLoading && (
                  <div className="mt-3 text-xs text-slate-600">
                    Uploaded: <span className="font-semibold text-slate-800">{uploadedFileName}</span>
                  </div>
                )}
                {uploadLoading && (
                  <div className="mt-3 text-xs text-slate-500">Uploading file…</div>
                )}
                {submitForm.fileUrl && !uploadLoading && (
                  <a href={submitForm.fileUrl} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-indigo-600 hover:underline">Open uploaded file</a>
                )}
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

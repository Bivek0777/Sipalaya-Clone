import {
  BookOpen,
  Users,
  Video,
  UploadCloud,
  MessageSquare,
  Plus,
  FileText,
  X,
  CheckCircle,
  TrendingUp,
  FileDown,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  FileCode,
  Film,
  Award,
  ChevronRight,
  BookOpenCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const InstructorPortal = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Overview Stats
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    gradedAssignments: 0,
    totalResources: 0,
    avgStudentProgress: 0
  });

  // Course Management State
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseEditMode, setCourseEditMode] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    category: '',
    duration: '',
    fee: '',
    level: 'Beginner',
    description: '',
    prerequisites: '',
    syllabus: ''
  });

  // Students & Progress State
  const [students, setStudents] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);
  const [progressForm, setProgressForm] = useState({
    progress: 0,
    status: 'active'
  });

  // Resources State
  const [resources, setResources] = useState([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    courseId: '',
    file: null
  });
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  // Assignment Grading State
  const [assignments, setAssignments] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' });

  // Assignment Tasks (Instructor created tasks)
  const [assignmentTasks, setAssignmentTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    deadline: '',
    maxScore: 100
  });

  // Attendance State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedAttendanceCourse, setSelectedAttendanceCourse] = useState('');
  const [allStudentsList, setAllStudentsList] = useState([]); // backup student list for attendance dropdown

  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // General Loading state
  const [loading, setLoading] = useState(true);

  // Configuration for API requests
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email, password: '' });
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAttendanceCourse) {
      fetchAttendanceRecords(selectedAttendanceCourse);
    }
  }, [selectedAttendanceCourse]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch overview statistics
      const statsRes = await axios.get('/api/instructor/overview', config);
      setStats(statsRes.data);

      // Fetch instructor's courses
      const coursesRes = await axios.get('/api/instructor/courses', config);
      setCourses(coursesRes.data);

      // Fetch assignments
      const assignmentsRes = await axios.get('/api/assignments/instructor', config);
      setAssignments(assignmentsRes.data);

      // Fetch resources
      const resourcesRes = await axios.get('/api/instructor/resources', config);
      setResources(resourcesRes.data);

      // Fetch students and progress
      const studentsRes = await axios.get('/api/instructor/students', config);
      const instructorStudents = studentsRes.data.students || [];
      setStudents(instructorStudents);
      setAllStudentsList(instructorStudents);

      // Fetch assignment tasks
      const tasksRes = await axios.get('/api/assignments/tasks/instructor', config);
      setAssignmentTasks(tasksRes.data);

      if (coursesRes.data.length > 0) {
        setSelectedAttendanceCourse(coursesRes.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (courseId) => {
    try {
      const res = await axios.get(`/api/instructor/attendance/${courseId}`, config);
      setAttendanceRecords(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  // ─── Course CRUD Operations ────────────────────────────────────────────────
  const openCreateCourseModal = () => {
    setCourseEditMode(false);
    setCourseFormData({
      title: '',
      category: '',
      duration: '',
      fee: '',
      level: 'Beginner',
      description: '',
      prerequisites: '',
      syllabus: ''
    });
    setShowCourseModal(true);
  };

  const openEditCourseModal = (course) => {
    setCourseEditMode(true);
    setSelectedCourseId(course._id);
    setCourseFormData({
      title: course.title,
      category: course.category,
      duration: course.duration,
      fee: course.fee,
      level: course.level || 'Beginner',
      description: course.description || '',
      prerequisites: course.prerequisites || '',
      syllabus: Array.isArray(course.syllabus) ? course.syllabus.join(', ') : course.syllabus || ''
    });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...courseFormData,
        fee: Number(courseFormData.fee),
        syllabus: courseFormData.syllabus ? courseFormData.syllabus.split(',').map(s => s.trim()) : []
      };

      if (courseEditMode) {
        await axios.put(`/api/courses/${selectedCourseId}`, payload, config);
        alert('Course updated successfully!');
      } else {
        await axios.post('/api/courses', payload, config);
        alert('Course created successfully!');
      }
      setShowCourseModal(false);
      fetchDashboardData();
    } catch (err) {
      alert('Error saving course: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? All uploaded resources, enrolled progress, and linked assignments might be affected.')) {
      try {
        await axios.delete(`/api/courses/${courseId}`, config);
        alert('Course deleted successfully!');
        fetchDashboardData();
      } catch (err) {
        alert('Error deleting course: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // ─── Student Progress Operations ───────────────────────────────────────────
  const openProgressModal = (student, courseId, currentProgress, currentStatus) => {
    setSelectedStudentProgress({ student, courseId });
    setProgressForm({
      progress: currentProgress || 0,
      status: currentStatus || 'active'
    });
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: selectedStudentProgress.student._id,
        courseId: selectedStudentProgress.courseId,
        progress: Number(progressForm.progress),
        status: progressForm.status
      };
      await axios.put('/api/instructor/students/progress', payload, config);
      alert('Student progress updated successfully!');
      setShowProgressModal(false);
      fetchDashboardData();
    } catch (err) {
      alert('Error updating student progress: ' + (err.response?.data?.message || err.message));
    }
  };

  // ─── Resource Upload & Operations ──────────────────────────────────────────
  const handleResourceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResourceForm({
        ...resourceForm,
        file: file,
        title: resourceForm.title || file.name
      });
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    if (!resourceForm.file) {
      alert('Please select a file to upload.');
      return;
    }
    if (!resourceForm.courseId) {
      alert('Please select a course for this resource.');
      return;
    }

    const uploadPayload = new FormData();
    uploadPayload.append('file', resourceForm.file);
    uploadPayload.append('courseId', resourceForm.courseId);
    uploadPayload.append('title', resourceForm.title);

    setUploading(true);
    setUploadStatus('Uploading file...');
    try {
      await axios.post('/api/instructor/resources/upload', uploadPayload, {
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadStatus('Resource uploaded successfully!');
      setResourceForm({ title: '', courseId: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setShowResourceModal(false);
        setUploadStatus('');
      }, 1500);
      fetchDashboardData();
    } catch (err) {
      setUploadStatus('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`/api/instructor/resources/${resourceId}`, config);
        alert('Resource deleted successfully!');
        fetchDashboardData();
      } catch (err) {
        alert('Error deleting resource: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // ─── Assignment Grading Operations ─────────────────────────────────────────
  const openGradeModal = (assignment) => {
    setSelectedAssignment(assignment);
    setGradeData({
      score: assignment.grade && assignment.grade !== 'Pending' ? assignment.grade : '',
      feedback: assignment.feedback || ''
    });
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/assignments/${selectedAssignment._id}/grade`, {
        score: Number(gradeData.score),
        feedback: gradeData.feedback
      }, config);
      alert('Assignment graded successfully!');
      setShowGradeModal(false);
      fetchDashboardData();
    } catch (err) {
      alert('Error grading assignment: ' + (err.response?.data?.message || err.message));
    }
  };

  // ─── Assignment Task Operations ─────────────────────────────────────────────
  const openCreateTaskModal = () => {
    setTaskFormData({
      courseId: courses[0]?._id || '',
      title: '',
      description: '',
      deadline: '',
      maxScore: 100
    });
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...taskFormData,
        maxScore: Number(taskFormData.maxScore),
        deadline: taskFormData.deadline ? new Date(taskFormData.deadline) : undefined
      };
      const response = await axios.post('/api/assignments/tasks', payload, config);
      const createdTask = response.data.task;
      setAssignmentTasks(prev => createdTask ? [createdTask, ...prev] : prev);
      alert('Assignment task created successfully!');
      setShowTaskModal(false);
      setActiveTab('tasks');
      fetchDashboardData();
    } catch (err) {
      alert('Error creating task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this assignment? All student submissions for this task will also be deleted.')) {
      try {
        await axios.delete(`/api/assignments/tasks/${taskId}`, config);
        setAssignmentTasks(prev => prev.filter(task => task._id !== taskId));
        alert('Assignment deleted successfully!');
        fetchDashboardData();
      } catch (err) {
        alert('Error deleting task: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // ─── Attendance tracker ───────────────────────────────────────────────────
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/attendance', attendanceForm, config);
      alert('Attendance record saved successfully!');
      setShowAttendanceModal(false);
      if (selectedAttendanceCourse === attendanceForm.courseId) {
        fetchAttendanceRecords(selectedAttendanceCourse);
      }
    } catch (err) {
      alert('Error marking attendance: ' + (err.response?.data?.message || err.message));
    }
  };

  const openMarkAttendanceModal = () => {
    setAttendanceForm({
      studentId: '',
      courseId: courses[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'present'
    });
    setShowAttendanceModal(true);
  };

  // ─── Profile Update ────────────────────────────────────────────────────────
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await axios.put('/api/auth/profile', profileForm, config);
      if (updateUser) updateUser({ name: profileForm.name, email: profileForm.email });
      alert('Profile updated successfully!');
      setShowProfileModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Helpers
  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <Film className="text-pink-500" size={20} />;
      case 'pdf': return <FileText className="text-rose-500" size={20} />;
      case 'zip': return <FileCode className="text-amber-500" size={20} />;
      default: return <FileText className="text-indigo-500" size={20} />;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-10 relative selection:bg-indigo-500 selection:text-white">
      {/* Dynamic colorful blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Upper Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                Instructor Console
              </span>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Welcome, {user?.name || 'Instructor'}
            </h1>
            <p className="text-slate-400 mt-1">Design courses, evaluate student progress, grade submissions, and upload course resources.</p>
          </div>
          
          <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
            <button
              onClick={openMarkAttendanceModal}
              className="flex items-center px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all font-semibold shadow-lg shadow-amber-500/5 cursor-pointer"
            >
              <Calendar size={18} className="mr-2" />
              Mark Attendance
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-all font-semibold cursor-pointer"
            >
              Update Profile
            </button>
            <button
              onClick={openCreateCourseModal}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all font-semibold shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={20} className="mr-1.5" />
              Create Course
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-850 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
            { id: 'courses', label: 'My Courses', icon: <BookOpen size={18} /> },
            { id: 'students', label: 'Student Progress', icon: <Users size={18} /> },
            { id: 'resources', label: 'Resources & Uploads', icon: <UploadCloud size={18} /> },
            { id: 'tasks', label: 'Assign Homework', icon: <FileText size={18} /> },
            { id: 'assignments', label: `Grading Portal (${stats.pendingAssignments})`, icon: <Award size={18} /> },
            { id: 'attendance', label: 'Attendance Tracker', icon: <Calendar size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-300 gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-650 to-indigo-600 text-white shadow-md shadow-indigo-600/10 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 animate-pulse font-medium">Fetching instructor data, please wait...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex items-center">
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mr-4 border border-indigo-500/20">
                      <BookOpen size={26} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Courses</div>
                      <div className="text-3xl font-extrabold text-white mt-0.5">{stats.totalCourses}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex items-center">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mr-4 border border-emerald-500/20">
                      <Users size={26} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
                      <div className="text-3xl font-extrabold text-white mt-0.5">{stats.totalStudents}</div>
                    </div>
                  </div>

                  <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex items-center">
                    <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mr-4 border border-rose-500/20">
                      <Award size={26} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Submissions</div>
                      <div className="text-3xl font-extrabold text-white mt-0.5">{stats.pendingAssignments}</div>
                    </div>
                  </div>

                  <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex items-center">
                    <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mr-4 border border-purple-500/20">
                      <TrendingUp size={26} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Progress</div>
                      <div className="text-3xl font-extrabold text-white mt-0.5">{stats.avgStudentProgress}%</div>
                    </div>
                  </div>
                </div>

                {/* Subsections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Quick Course View */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <BookOpen className="text-indigo-400" />
                          My Academic Courses
                        </h2>
                        <button onClick={() => setActiveTab('courses')} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center gap-1">
                          Manage <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.slice(0, 4).map(course => (
                          <div key={course._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] bg-slate-850 text-indigo-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {course.category}
                              </span>
                              <h3 className="font-bold text-white text-lg mt-2 line-clamp-1">{course.title}</h3>
                              <p className="text-slate-400 text-sm mt-1">Duration: {course.duration}</p>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-4 text-xs text-slate-400">
                              <span>Fee: Rs. {course.fee}</span>
                              <span className="bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-lg font-medium">{course.level || 'Beginner'}</span>
                            </div>
                          </div>
                        ))}
                        {courses.length === 0 && (
                          <div className="col-span-2 text-center py-8 text-slate-500">
                            No courses available yet. Create one to get started!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Resources Summary */}
                    <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <UploadCloud className="text-indigo-400" />
                          Recently Uploaded Materials
                        </h2>
                        <button onClick={() => setActiveTab('resources')} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center gap-1">
                          Resources <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {resources.slice(0, 3).map(res => (
                          <div key={res._id} className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-850 rounded-xl hover:bg-slate-900 transition-all">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                                {getResourceIcon(res.type)}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-200 line-clamp-1">{res.title}</h4>
                                <p className="text-xs text-slate-500">{res.courseId?.title || 'General'}</p>
                              </div>
                            </div>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-all"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                        {resources.length === 0 && (
                          <p className="text-center py-6 text-slate-500">No resources uploaded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pending Grading Side-panel */}
                  <div className="space-y-6">
                    <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Award className="text-rose-400" />
                            To Grade
                          </h2>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {stats.pendingAssignments} Action Required
                          </span>
                        </div>

                        <div className="space-y-4">
                          {assignments.filter(a => a.status !== 'graded').slice(0, 4).map(sub => (
                            <div key={sub._id} className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                    {sub.courseId?.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-200 line-clamp-1">{sub.studentId?.name || 'Student'}</h4>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{sub.title}</p>
                              </div>
                              <div className="flex justify-between items-center border-t border-slate-850 pt-3 mt-3">
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-slate-400 hover:text-slate-350 hover:underline flex items-center gap-1"
                                >
                                  <FileDown size={14} /> View Submission
                                </a>
                                <button
                                  onClick={() => openGradeModal(sub)}
                                  className="px-2.5 py-1 text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 rounded-lg transition-all cursor-pointer"
                                >
                                  Grade
                                </button>
                              </div>
                            </div>
                          ))}
                          {assignments.filter(a => a.status !== 'graded').length === 0 && (
                            <div className="text-center py-12">
                              <BookOpenCheck className="mx-auto text-emerald-400 mb-2" size={32} />
                              <p className="text-slate-400 font-bold text-sm">All caught up!</p>
                              <p className="text-slate-500 text-xs mt-1">No pending student assignments.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {assignments.filter(a => a.status !== 'graded').length > 0 && (
                        <button
                          onClick={() => setActiveTab('assignments')}
                          className="w-full mt-6 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold hover:bg-slate-750 transition-all cursor-pointer"
                        >
                          View All Pending Submissions
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: COURSES */}
            {activeTab === 'courses' && (
              <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Course Management Dashboard</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Define detailed course syllabus, adjust tuition fees, specify duration details, and manage listings.</p>
                  </div>
                  <button
                    onClick={openCreateCourseModal}
                    className="flex items-center justify-center px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <Plus size={18} className="mr-1.5" /> Create Course
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-xl">Course Title & Category</th>
                        <th className="px-6 py-4">Fee Structure</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Difficulty Level</th>
                        <th className="px-6 py-4 rounded-tr-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {courses.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">
                            <div>
                              <div className="text-base font-bold text-slate-200">{c.title}</div>
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                                {c.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-300">
                            Rs. {c.fee?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-slate-400">{c.duration}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300">
                              {c.level || 'Beginner'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button
                              onClick={() => openEditCourseModal(c)}
                              className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 size={15} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c._id)}
                              className="text-rose-400 hover:text-rose-350 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={15} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {courses.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                            <BookOpen size={48} className="mx-auto text-slate-600 mb-3" />
                            <p className="font-semibold text-slate-400">No courses listed under your profile.</p>
                            <p className="text-sm text-slate-500 mt-1">Start by clicking "Create Course" above.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: STUDENTS */}
            {activeTab === 'students' && (
              <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                <div className="border-b border-slate-800 pb-5 mb-6">
                  <h2 className="text-2xl font-bold text-white">Student Progress & Analytics</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Track individual progress indicators, enrollment date details, status updates, and manually modify scores/performance values.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-xl">Student Name</th>
                        <th className="px-6 py-4">Enrolled Course</th>
                        <th className="px-6 py-4">Enrollment Date</th>
                        <th className="px-6 py-4">Completion Progress</th>
                        <th className="px-6 py-4">Current Status</th>
                        <th className="px-6 py-4 rounded-tr-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {students.map((student) => 
                        student.enrollments.map((enrollment, idx) => {
                          const courseObj = courses.find(c => c._id === enrollment.course) || { title: 'Unknown Course' };
                          return (
                            <tr key={`${student._id}-${idx}`} className="hover:bg-slate-900/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center font-bold text-sm">
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{student.name}</div>
                                    <div className="text-xs text-slate-500">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-250 font-semibold">{courseObj.title}</td>
                              <td className="px-6 py-4 text-slate-400">
                                {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-full max-w-[140px]">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="font-medium text-indigo-400">{enrollment.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                                    <div 
                                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${enrollment.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                  enrollment.status === 'completed' 
                                    ? 'bg-emerald-550/15 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-indigo-550/15 text-indigo-400 border border-indigo-500/20'
                                }`}>
                                  {enrollment.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => openProgressModal(student, enrollment.course, enrollment.progress, enrollment.status)}
                                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm cursor-pointer"
                                >
                                  Update Status
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                            <Users size={48} className="mx-auto text-slate-600 mb-3" />
                            <p className="font-semibold text-slate-400">No student enrollments mapped yet.</p>
                            <p className="text-sm text-slate-500 mt-1">Students will appear here once they enroll in your courses.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: RESOURCES */}
            {activeTab === 'resources' && (
              <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Course Materials & Document Repository</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Upload syllabus documents, video lectures, source code ZIP archives, or reference PDFs directly to courses.</p>
                  </div>
                  <button
                    onClick={() => {
                      setResourceForm({ title: '', courseId: courses[0]?._id || '', file: null });
                      setShowResourceModal(true);
                    }}
                    className="flex items-center justify-center px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <UploadCloud size={18} className="mr-1.5" /> Upload File
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map(res => (
                    <div key={res._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 bg-slate-850 rounded-xl flex items-center justify-center border border-slate-800">
                            {getResourceIcon(res.type)}
                          </div>
                          <span className="text-[10px] bg-slate-850 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {res.type || 'document'}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base mt-4 line-clamp-1">{res.title}</h3>
                        <p className="text-slate-500 text-xs mt-1">Course: <span className="text-slate-400">{res.courseId?.title || 'General'}</span></p>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-5">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-350 font-bold flex items-center gap-1"
                        >
                          <FileDown size={14} /> Open Material
                        </a>
                        <button
                          onClick={() => handleDeleteResource(res._id)}
                          className="text-xs text-rose-400 hover:text-rose-350 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {resources.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      <UploadCloud size={48} className="mx-auto text-slate-600 mb-3" />
                      <p className="font-semibold text-slate-400">No resources uploaded yet.</p>
                      <p className="text-sm text-slate-500 mt-1">Upload syllabus checklists, resource lists, slides or video lessons to courses.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ASSIGN TASKS */}
            {activeTab === 'tasks' && (
              <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <FileText className="text-indigo-400" />
                      Assigned Homework & Course Projects
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">Define learning milestones, write task prompts, specify grading thresholds, and set absolute deadlines.</p>
                  </div>
                  <button
                    onClick={openCreateTaskModal}
                    className="flex items-center justify-center px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <Plus size={18} className="mr-1.5" /> Assign Homework
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignmentTasks.map(task => (
                    <div key={task._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-slate-850 text-indigo-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {task.courseId?.title || 'General'}
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold uppercase">
                            Max: {task.maxScore || 100} pts
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base mt-4 line-clamp-1">{task.title}</h3>
                        <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">{task.description}</p>
                        
                        {task.deadline && (
                          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/5 px-2.5 py-1.5 rounded-lg border border-rose-500/10 w-max">
                            <Calendar size={13} />
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-5">
                        <span className="text-xs text-slate-500">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-xs text-rose-400 hover:text-rose-350 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Cancel Task
                        </button>
                      </div>
                    </div>
                  ))}

                  {assignmentTasks.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      <FileText size={48} className="mx-auto text-slate-600 mb-3" />
                      <p className="font-semibold text-slate-400">No active homework assignments assigned yet.</p>
                      <p className="text-sm text-slate-500 mt-1">Assign reading worksheets, code repositories, design mockups, or project files.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ASSIGNMENTS / GRADING */}
            {activeTab === 'assignments' && (
              <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                <div className="border-b border-slate-800 pb-5 mb-6">
                  <h2 className="text-2xl font-bold text-white">Grading & Evaluation Control</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Review, verify and grade all task submissions sent in by students. Add custom performance feedback remarks.</p>
                </div>

                <div className="space-y-4">
                  {assignments.map(sub => (
                    <div key={sub._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                          {sub.studentId?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{sub.studentId?.name || 'Student User'}</h4>
                          <p className="text-slate-400 text-xs mt-0.5">
                            Course: <span className="font-semibold text-slate-200">{sub.courseId?.title}</span> • Assigned Task: <span className="text-indigo-400 font-medium">"{sub.title}"</span>
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                            >
                              <FileDown size={14} /> Download/View Submission File
                            </a>
                            <span className="text-xs text-slate-500">Submitted on: {new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-slate-800/60 md:border-none pt-4 md:pt-0">
                        <div className="text-left sm:text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider block w-max ${
                            sub.status === 'graded' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {sub.status === 'graded' ? `Graded: ${sub.grade || '0'}/100` : 'Awaiting Grade'}
                          </span>
                          {sub.status === 'graded' && sub.feedback && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-[200px]">"{sub.feedback}"</p>
                          )}
                        </div>
                        <button
                          onClick={() => openGradeModal(sub)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all w-full sm:w-auto cursor-pointer ${
                            sub.status === 'graded' 
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                              : 'bg-indigo-650 hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                          }`}
                        >
                          {sub.status === 'graded' ? 'Modify Score' : 'Evaluate Now'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {assignments.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Award size={48} className="mx-auto text-slate-600 mb-3" />
                      <p className="font-semibold text-slate-400">No assignment submissions listed yet.</p>
                      <p className="text-sm text-slate-500 mt-1">Assignments submitted by your students will appear here for grading.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === 'attendance' && (
              <div className="bg-slate-850 rounded-2xl border border-slate-800 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Daily Student Attendance Registry</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Select a course to view previous attendance logs. Mark new daily records for students in your program.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedAttendanceCourse}
                      onChange={e => setSelectedAttendanceCourse(e.target.value)}
                      className="bg-slate-900 border border-slate-850 text-slate-350 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all font-semibold"
                    >
                      <option value="">Choose Course to filter</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                    <button
                      onClick={openMarkAttendanceModal}
                      className="flex items-center justify-center px-4 py-2.5 bg-amber-500 text-slate-950 text-sm font-semibold rounded-xl hover:bg-amber-450 transition-all cursor-pointer"
                    >
                      <Plus size={18} className="mr-1" /> Mark Attendance
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-xl">Student Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Logged Date</th>
                        <th className="px-6 py-4 rounded-tr-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {attendanceRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">
                            {record.student?.name || 'Unknown Student'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {record.student?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              record.status === 'present' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : record.status === 'absent' 
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {attendanceRecords.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                            <Calendar size={48} className="mx-auto text-slate-600 mb-3" />
                            <p className="font-semibold text-slate-400">No attendance logs mapped for this course.</p>
                            <p className="text-sm text-slate-500 mt-1">Create a new entry by clicking "Mark Attendance" above.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* MODAL: CREATE / EDIT COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowCourseModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-extrabold text-white mb-6 bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent flex items-center gap-2">
              <BookOpen className="text-indigo-400" />
              {courseEditMode ? 'Modify Academic Course' : 'Create Academic Course'}
            </h2>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Course Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={courseFormData.title} 
                    onChange={e => setCourseFormData({...courseFormData, title: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                    placeholder="e.g. MERN Full-stack Development" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Category *</label>
                  <input 
                    required 
                    type="text" 
                    value={courseFormData.category} 
                    onChange={e => setCourseFormData({...courseFormData, category: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                    placeholder="e.g. Web Development" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Tuition Fee (Rs) *</label>
                  <input 
                    required 
                    type="number" 
                    value={courseFormData.fee} 
                    onChange={e => setCourseFormData({...courseFormData, fee: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                    placeholder="e.g. 15000" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Duration Structure *</label>
                  <input 
                    required 
                    type="text" 
                    value={courseFormData.duration} 
                    onChange={e => setCourseFormData({...courseFormData, duration: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                    placeholder="e.g. 12 Weeks (Daily)" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Difficulty Level</label>
                  <select 
                    value={courseFormData.level} 
                    onChange={e => setCourseFormData({...courseFormData, level: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-350 text-sm transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Description</label>
                <textarea 
                  rows="3" 
                  value={courseFormData.description} 
                  onChange={e => setCourseFormData({...courseFormData, description: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all resize-none" 
                  placeholder="Summarize course content and goals..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Prerequisites</label>
                  <input 
                    type="text" 
                    value={courseFormData.prerequisites} 
                    onChange={e => setCourseFormData({...courseFormData, prerequisites: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                    placeholder="e.g. Basic JS Knowledge" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Syllabus Chapters (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={courseFormData.syllabus} 
                    onChange={e => setCourseFormData({...courseFormData, syllabus: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                    placeholder="HTML Basics, CSS Flexbox, Node.js APIs" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowCourseModal(false)} 
                  className="px-4 py-2.5 text-slate-450 hover:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  {courseEditMode ? 'Update Details' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STUDENT PROGRESS */}
      {showProgressModal && selectedStudentProgress && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
            <button 
              onClick={() => setShowProgressModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Update Completion Progress</h2>
            
            <div className="mb-5 p-4 bg-slate-850 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Student</span>
              <p className="font-bold text-slate-200 text-sm">{selectedStudentProgress.student?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{selectedStudentProgress.student?.email}</p>
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Progress Percentage (0 - 100) *</label>
                <div className="flex items-center gap-4">
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={progressForm.progress} 
                    onChange={e => setProgressForm({...progressForm, progress: e.target.value})} 
                    className="w-24 px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 text-center font-bold text-sm" 
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progressForm.progress} 
                    onChange={e => setProgressForm({...progressForm, progress: e.target.value})} 
                    className="flex-1 accent-indigo-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Program Enrollment Status</label>
                <select 
                  value={progressForm.status} 
                  onChange={e => setProgressForm({...progressForm, status: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-350 text-sm transition-all"
                >
                  <option value="active">Active Study</option>
                  <option value="completed">Completed / Graduated</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowProgressModal(false)} 
                  className="px-4 py-2.5 text-slate-450 hover:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD FILE MATERIAL */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowResourceModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UploadCloud className="text-indigo-400" />
              Upload Materials
            </h2>
            
            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Link to Academic Course *</label>
                <select 
                  required
                  value={resourceForm.courseId} 
                  onChange={e => setResourceForm({...resourceForm, courseId: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-350 text-sm transition-all"
                >
                  <option value="">Select Target Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Resource Display Name</label>
                <input 
                  type="text" 
                  value={resourceForm.title} 
                  onChange={e => setResourceForm({...resourceForm, title: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                  placeholder="e.g. Chapter 1 PDF or Lecture Video" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">File Attachment *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-indigo-550/45 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-850/40 hover:bg-slate-850/70"
                >
                  <UploadCloud size={32} className="mx-auto text-slate-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-350">
                    {resourceForm.file ? resourceForm.file.name : 'Drag files here or Browse'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Supports PDF, ZIP, lectures or image files</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleResourceFileChange} 
                    className="hidden" 
                  />
                </div>
              </div>

              {uploadStatus && (
                <div className={`p-3 rounded-xl text-center text-xs font-bold border ${
                  uploadStatus.includes('failed') 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {uploadStatus}
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-850">
                <button 
                  type="button" 
                  disabled={uploading}
                  onClick={() => setShowResourceModal(false)} 
                  className="px-4 py-2.5 text-slate-450 hover:text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : 'Start Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EVALUATE & GRADE ASSIGNMENT */}
      {showGradeModal && selectedAssignment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowGradeModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Grade Submission</h2>
            
            <div className="mb-5 p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Student</span>
                <p className="font-bold text-slate-200 text-sm">{selectedAssignment.studentId?.name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Task Title</span>
                <p className="font-bold text-slate-350 text-sm">"{selectedAssignment.title}"</p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <a
                  href={selectedAssignment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <FileDown size={14} /> Open Assignment Solution File
                </a>
              </div>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Evaluation Score (0 - 100) *</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  max="100"
                  value={gradeData.score} 
                  onChange={e => setGradeData({...gradeData, score: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm font-bold transition-all" 
                  placeholder="e.g. 85" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Remarks & Feedback</label>
                <textarea 
                  rows="3" 
                  value={gradeData.feedback} 
                  onChange={e => setGradeData({...gradeData, feedback: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all resize-none" 
                  placeholder="Great task execution. Be careful to structure backend API routing parameters appropriately..." 
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowGradeModal(false)} 
                  className="px-4 py-2.5 text-slate-450 hover:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MARK STUDENT ATTENDANCE */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
            <button 
              onClick={() => setShowAttendanceModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Mark Student Attendance</h2>
            
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Select Course Program *</label>
                <select 
                  required
                  value={attendanceForm.courseId} 
                  onChange={e => setAttendanceForm({...attendanceForm, courseId: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-350 text-sm transition-all"
                >
                  <option value="">Choose Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Select Student *</label>
                <select 
                  required
                  value={attendanceForm.studentId} 
                  onChange={e => setAttendanceForm({...attendanceForm, studentId: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-350 text-sm transition-all"
                >
                  <option value="">Choose Student</option>
                  {allStudentsList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Logged Date</label>
                  <input 
                    type="date" 
                    value={attendanceForm.date} 
                    onChange={e => setAttendanceForm({...attendanceForm, date: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 text-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Attendance Status</label>
                  <select 
                    value={attendanceForm.status} 
                    onChange={e => setAttendanceForm({...attendanceForm, status: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-350 text-sm transition-all"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowAttendanceModal(false)} 
                  className="px-4 py-2.5 text-slate-450 hover:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE PROFILE */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
            <button 
              onClick={() => setShowProfileModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Modify Profile Info</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Full Display Name *</label>
                <input 
                  required 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Email Address *</label>
                <input 
                  required 
                  type="email" 
                  value={profileForm.email} 
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">New Password (Leave blank to keep current)</label>
                <div className="relative">
                  <input 
                    type={showProfilePassword ? 'text' : 'password'} 
                    value={profileForm.password} 
                    onChange={e => setProfileForm({...profileForm, password: e.target.value})} 
                    className="w-full px-4 py-2.5 pr-11 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showProfilePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowProfileModal(false)} 
                  className="px-4 py-2.5 text-slate-450 hover:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={profileLoading}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {profileLoading ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: ASSIGN HOMEWORK / CREATE TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowTaskModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="text-indigo-400" />
              Assign Course Homework
            </h2>
            
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Select Course Program *</label>
                <select 
                  required
                  value={taskFormData.courseId} 
                  onChange={e => setTaskFormData({...taskFormData, courseId: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-350 text-sm transition-all"
                >
                  <option value="">Select Target Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Homework Title *</label>
                <input 
                  required
                  type="text" 
                  value={taskFormData.title} 
                  onChange={e => setTaskFormData({...taskFormData, title: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all" 
                  placeholder="e.g. Node.js API Mini Project" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Task Guidelines & Prompt *</label>
                <textarea 
                  required
                  rows="4"
                  value={taskFormData.description} 
                  onChange={e => setTaskFormData({...taskFormData, description: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all resize-none" 
                  placeholder="Describe the tasks, specifications, expected folder structure, and submit requirements..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Max Score (pts)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="1000"
                    value={taskFormData.maxScore} 
                    onChange={e => setTaskFormData({...taskFormData, maxScore: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 text-sm font-bold transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">Due Date</label>
                  <input 
                    type="date" 
                    value={taskFormData.deadline} 
                    onChange={e => setTaskFormData({...taskFormData, deadline: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-100 text-sm transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowTaskModal(false)} 
                  className="px-4 py-2.5 text-slate-450 hover:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Post Homework
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

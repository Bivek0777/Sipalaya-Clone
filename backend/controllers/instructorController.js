const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Resource = require('../models/Resource');

// ─── Get instructor's own courses ────────────────────────────────────────────
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all students enrolled in instructor's courses ───────────────────────
exports.getMyStudents = async (req, res) => {
  try {
    // Get all courses taught by this instructor
    const instructorCourses = await Course.find({ instructorId: req.user.id }).select('_id title');
    const courseIds = instructorCourses.map(c => c._id);

    // Find all students enrolled in those courses
    const students = await User.find({
      role: 'student',
      'enrolledCourses.course': { $in: courseIds }
    }).select('name email enrolledCourses createdAt');

    // Shape response with per-course progress
    const result = students.map(student => {
      const enrollments = student.enrolledCourses.filter(e =>
        courseIds.some(id => id.equals(e.course))
      );
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        joinedAt: student.createdAt,
        enrollments: enrollments.map(e => ({
          course: e.course,
          progress: e.progress,
          status: e.status
        }))
      };
    });

    res.json({ students: result, courses: instructorCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get performance overview for instructor dashboard ───────────────────────
exports.getPerformanceOverview = async (req, res) => {
  try {
    const instructorCourses = await Course.find({ instructorId: req.user.id });
    const courseIds = instructorCourses.map(c => c._id);

    const totalStudents = await User.countDocuments({
      role: 'student',
      'enrolledCourses.course': { $in: courseIds }
    });

    const totalAssignments = await Assignment.countDocuments({ courseId: { $in: courseIds } });
    const gradedAssignments = await Assignment.countDocuments({
      courseId: { $in: courseIds },
      status: 'graded'
    });
    const pendingAssignments = totalAssignments - gradedAssignments;

    const totalResources = await Resource.countDocuments({ instructorId: req.user.id });

    // Average progress across enrolled students
    const studentsWithProgress = await User.find({
      role: 'student',
      'enrolledCourses.course': { $in: courseIds }
    }).select('enrolledCourses');

    let totalProgress = 0;
    let progressCount = 0;
    studentsWithProgress.forEach(s => {
      s.enrolledCourses.forEach(e => {
        if (courseIds.some(id => id.equals(e.course))) {
          totalProgress += e.progress || 0;
          progressCount++;
        }
      });
    });
    const avgProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

    res.json({
      totalCourses: instructorCourses.length,
      totalStudents,
      totalAssignments,
      pendingAssignments,
      gradedAssignments,
      totalResources,
      avgStudentProgress: avgProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get resources uploaded by this instructor ───────────────────────────────
exports.getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ instructorId: req.user.id })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete a resource ───────────────────────────────────────────────────────
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // Only allow instructor who owns it or admin
    if (resource.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update student progress (instructor can manually update) ─────────────────
exports.updateStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId, progress, status } = req.body;

    // Strict Course instructor check
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update student progress for this course' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const enrollment = student.enrolledCourses.find(e => e.course.toString() === courseId);
    if (!enrollment) return res.status(404).json({ message: 'Student not enrolled in this course' });

    if (progress !== undefined) enrollment.progress = Math.min(100, Math.max(0, Number(progress)));
    if (status) enrollment.status = status;

    await student.save();
    res.json({ message: 'Progress updated successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get attendance records for instructor's courses ─────────────────────────
exports.getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Strict Course instructor check
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view attendance records for this course' });
    }

    const records = await Attendance.find({ course: courseId })
      .populate('student', 'name email')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

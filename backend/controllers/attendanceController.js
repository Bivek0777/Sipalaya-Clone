const Attendance = require('../models/Attendance');

const Course = require('../models/Course');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;
    
    // Strict Course instructor check
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
    }

    const attendance = new Attendance({
      student: studentId,
      course: courseId,
      date,
      status,
      instructor: req.user.id
    });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance for a course
exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Strict Course instructor check
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this course' });
    }

    const attendance = await Attendance.find({ course: courseId }).populate('student', 'name email');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's own attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id }).populate('course', 'title');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

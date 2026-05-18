const Attendance = require('../models/Attendance');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;
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

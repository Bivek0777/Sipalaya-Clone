const Assignment = require('../models/Assignment');
const User = require('../models/User');

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { courseId, title, fileUrl } = req.body;
    const assignment = new Assignment({
      courseId,
      studentId: req.user.id,
      title,
      fileUrl
    });
    await assignment.save();
    res.status(201).json({ message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments for instructor (by course)
exports.getInstructorAssignments = async (req, res) => {
  try {
    // In a real app, we'd filter by courses taught by this instructor
    const assignments = await Assignment.find().populate('studentId', 'name email').populate('courseId', 'title');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grade assignment
exports.gradeAssignment = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, status: 'graded' },
      { new: true }
    );
    res.json({ message: 'Assignment graded successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's assignments
exports.getStudentAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ studentId: req.user.id }).populate('courseId', 'title');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Course = require('../models/Course');
const AssignmentTask = require('../models/AssignmentTask');

// ─── ASSIGNMENT TASKS (CREATED BY INSTRUCTORS) ────────────────────────────────

// Create a new Assignment Task
exports.createAssignmentTask = async (req, res) => {
  try {
    const { courseId, title, description, deadline, maxScore } = req.body;
    if (!courseId || !title || !description) {
      return res.status(400).json({ message: 'Course, title and description are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Enforce that instructors can only create tasks for their own courses
    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
    }

    const task = new AssignmentTask({
      courseId,
      instructorId: req.user.id,
      title,
      description,
      deadline,
      maxScore: Number(maxScore) || 100
    });

    await task.save();
    const populatedTask = await AssignmentTask.findById(task._id).populate('courseId', 'title');
    res.status(201).json({ message: 'Assignment task created successfully', task: populatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Assignment Tasks for instructor's courses
exports.getInstructorAssignmentTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'instructor') {
      query.instructorId = req.user.id;
    }
    const tasks = await AssignmentTask.find(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Assignment Tasks for a specific course (Student / Instructor / Admin)
exports.getCourseAssignmentTasks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tasks = await AssignmentTask.find({ courseId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Assignment Task
exports.deleteAssignmentTask = async (req, res) => {
  try {
    const task = await AssignmentTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Assignment task not found' });

    // Validate ownership
    if (req.user.role === 'instructor' && task.instructorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment task' });
    }

    await AssignmentTask.findByIdAndDelete(req.params.id);
    // Also remove any student submissions associated with this task (optional, but keeps database clean)
    await Assignment.deleteMany({ taskId: req.params.id });

    res.json({ message: 'Assignment task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ─── ASSIGNMENT SUBMISSIONS (SUBMITTED BY STUDENTS) ──────────────────────────

// Submit assignment solution
exports.submitAssignment = async (req, res) => {
  try {
    const { courseId, taskId, title, fileUrl } = req.body;
    
    let resolvedTitle = title;
    
    // If student provided a taskId, resolve the title automatically from the task
    if (taskId) {
      const task = await AssignmentTask.findById(taskId);
      if (task) {
        resolvedTitle = task.title;
      }
    }

    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Assignment title or task is required' });
    }

    if (!fileUrl) {
      return res.status(400).json({ message: 'Assignment file upload is required' });
    }

    const assignment = new Assignment({
      courseId,
      taskId: taskId || undefined,
      studentId: req.user.id,
      title: resolvedTitle,
      fileUrl
    });

    await assignment.save();
    res.status(201).json({ message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload an assignment file to Cloudinary
exports.uploadAssignmentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(201).json({
      fileUrl: req.file.path || req.file.secure_url || '',
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments for instructor (by course)
exports.getInstructorAssignments = async (req, res) => {
  try {
    let query = {};
    
    // If instructor, filter by their courses
    if (req.user.role === 'instructor') {
      const myCourses = await Course.find({ instructorId: req.user.id }).select('_id');
      const courseIds = myCourses.map(c => c._id);
      query = { courseId: { $in: courseIds } };
    }
    
    const assignments = await Assignment.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .populate('taskId', 'title description maxScore deadline')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grade assignment
exports.gradeAssignment = async (req, res) => {
  try {
    const { score, grade, feedback } = req.body;
    const finalGrade = score !== undefined ? String(score) : grade;
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    // Ownership check
    const course = await Course.findById(assignment.courseId);
    if (!course) return res.status(404).json({ message: 'Linked course not found' });
    
    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to grade assignments for this course' });
    }

    assignment.grade = finalGrade;
    assignment.feedback = feedback || '';
    assignment.status = 'graded';
    await assignment.save();

    res.json({ message: 'Assignment graded successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's assignments
exports.getStudentAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ studentId: req.user.id })
      .populate('courseId', 'title')
      .populate('taskId', 'title description maxScore deadline')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

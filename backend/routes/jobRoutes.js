const express = require('express');
const router = express.Router();
const { getJobs, postJob, deleteJob } = require('../controllers/jobController');
const { adminAuth } = require('../middleware/auth');

// Public: Get all job listings
router.get('/', getJobs);
// Admin: Post a new job
router.post('/', adminAuth, postJob);
// Admin: Delete a job
router.delete('/:id', adminAuth, deleteJob);

module.exports = router;

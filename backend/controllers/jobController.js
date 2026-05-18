// Job Controller
const Job = require('../models/Job');

exports.getJobs = async (req, res) => {
  const jobs = await Job.find().sort({ postedAt: -1 });
  res.json(jobs);
};

exports.postJob = async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.status(201).json(job);
};

exports.deleteJob = async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'Job deleted' });
};

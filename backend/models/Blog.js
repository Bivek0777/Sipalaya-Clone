const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  category: { type: String },
  author: { type: String },
  image: { type: String },
  readTime: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);

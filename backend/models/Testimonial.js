const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  quote: { type: String, required: true },
  image: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);

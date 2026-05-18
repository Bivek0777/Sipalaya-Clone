const Testimonial = require('../models/Testimonial');

// Get all testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(testimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

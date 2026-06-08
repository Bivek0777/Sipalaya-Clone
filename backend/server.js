
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

const app = express();
// Middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
const blogRoutes = require("./routes/blogRoutes");
const jobRoutes = require("./routes/jobRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const demoRoutes = require("./routes/demoRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const paymentRoutes = require("./routes/paymentRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const instructorRoutes = require("./routes/instructorRoutes");

app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/demos", demoRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/testimonials", testimonialRoutes);

app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/instructor", instructorRoutes);

app.use('/api/invoices/files', express.static(path.join(__dirname, 'invoices')));

app.get("/", (req, res) => {
  res.send("Sipalaya IT Training API is running");
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

// Start server first so it binds to the port immediately and stays active
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Use the standard env variable name MONGODB_URI (or fallback to MONGO_URI for legacy)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ Critical: No MongoDB connection string found. Define MONGODB_URI in your .env file.");
  // Exit the process after a short delay to allow the server to start logs
  setTimeout(() => process.exit(1), 1000);
} else {
  console.log('🔗 Connecting to MongoDB...');
  mongoose
    .connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message || err);
      setTimeout(() => process.exit(1), 1000);
    });
}

module.exports = app;

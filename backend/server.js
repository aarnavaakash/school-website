const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://hnp-school.vercel.app",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(origin => origin.trim()) : [])
].filter(Boolean);

app.get("/", (req, res) => {
  res.send("HNP Institute Backend Running Successfully");
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const bcrypt = require("bcryptjs");
const User = require("./models/User");

app.get("/seed-admin", async (req, res) => {
  const exists = await User.findOne({ email: "admin@hnp.edu" });
  if (exists) return res.send("Admin already exists");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin",
    email: "admin@hnp.edu",
    password: hashedPassword,
    role: "admin"
  });

  res.send("Admin created successfully");
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/admissions', require('./routes/admissionRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/homework', require('./routes/homeworkRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

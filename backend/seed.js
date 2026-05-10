const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Notice = require('./models/Notice');
const Gallery = require('./models/Gallery');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hnp_school');

const seedData = async () => {
  try {
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Notice.deleteMany();
    await Gallery.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    // Create Admin
    await User.create({
      name: 'Admin User',
      email: 'admin@hnp.edu',
      password: adminPassword,
      role: 'admin'
    });

    // Create Student User
    const studentUser = await User.create({
      name: 'John Doe',
      email: 'john@student.hnp.edu',
      password: studentPassword,
      role: 'student'
    });

    // Create Student Record
    await Student.create({
      name: 'John Doe',
      class: '10th Grade',
      rollNumber: '1001',
      parentName: 'Richard Doe',
      phone: '1234567890',
      email: 'john@student.hnp.edu',
      address: '123 School Lane, City',
      attendance: 95,
      result: 'Pass'
    });

    // Create Teacher
    await Teacher.create({
      name: 'Jane Smith',
      subject: 'Mathematics',
      qualification: 'M.Sc. Mathematics',
      experience: '5 Years',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    });

    // Create Notice
    await Notice.create({
      title: 'Annual Sports Day',
      description: 'The annual sports day will be held on the 25th of next month. All students must participate.',
      category: 'Events'
    });

    // Create Gallery Items
    await Gallery.create({
      title: 'School Building',
      imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Campus'
    });

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();

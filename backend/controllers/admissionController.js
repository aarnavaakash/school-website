const Admission = require('../models/Admission');
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createAdmission = async (req, res) => {
  try {
    const admissionData = { ...req.body };
    if (req.file) {
      admissionData.photo = req.file.path;
    }
    const admission = await Admission.create(admissionData);
    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.enrollAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission application not found' });
    }

    const existingStudent = await Student.findOne({ email: admission.email });
    if (existingStudent) {
      return res.status(400).json({ message: 'A student with this email already exists' });
    }

    const existingUser = await User.findOne({ email: admission.email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash('student123', 10);
    await User.create({
      name: admission.studentName,
      email: admission.email,
      password: hashedPassword,
      role: 'student'
    });

    const rollNumber = `HNP${Date.now().toString().slice(-8)}`;
    const student = await Student.create({
      name: admission.studentName,
      class: admission.classApplying,
      rollNumber,
      parentName: admission.parentName,
      phone: admission.phone,
      email: admission.email,
      address: admission.address,
      dateOfBirth: admission.dateOfBirth,
      admissionDate: new Date(),
      photo: admission.photo
    });

    await Admission.findByIdAndDelete(admission._id);

    res.status(201).json({
      message: 'Student enrolled successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (admission) {
      res.json({ message: 'Admission application removed' });
    } else {
      res.status(404).json({ message: 'Admission application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

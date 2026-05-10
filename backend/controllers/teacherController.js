const Teacher = require('../models/Teacher');

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const teacherData = { ...req.body };
    if (req.file) {
      teacherData.photo = `/uploads/${req.file.filename}`;
    }
    const teacher = await Teacher.create(teacherData);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacherData = { ...req.body };
    if (req.file) {
      teacherData.photo = `/uploads/${req.file.filename}`;
    }
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, teacherData, { new: true });
    if (teacher) {
      res.json(teacher);
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (teacher) {
      res.json({ message: 'Teacher removed' });
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

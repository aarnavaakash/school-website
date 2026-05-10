const Homework = require('../models/Homework');

exports.getHomeworks = async (req, res) => {
  try {
    const homeworks = await Homework.find().sort({ dueDate: 1 });
    res.json(homeworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createHomework = async (req, res) => {
  try {
    const homework = await Homework.create(req.body);
    res.status(201).json(homework);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findByIdAndDelete(req.params.id);
    if (homework) {
      res.json({ message: 'Homework removed' });
    } else {
      res.status(404).json({ message: 'Homework not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

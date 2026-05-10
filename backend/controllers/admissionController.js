const Admission = require('../models/Admission');

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
      admissionData.photo = `/uploads/${req.file.filename}`;
    }
    const admission = await Admission.create(admissionData);
    res.status(201).json(admission);
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

const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: String, required: true },
  photo: { type: String, default: '' },
  pdf: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);

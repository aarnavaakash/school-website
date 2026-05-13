const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  class: { type: String, required: true },
  routine: [{
    subject: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);

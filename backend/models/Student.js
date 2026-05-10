const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  parentName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date },
  admissionDate: { type: Date },
  photo: { type: String },
  attendance: { type: Number, default: 0 },
  result: { type: String, default: 'Pending' },
  marks: [{
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, default: 100 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);

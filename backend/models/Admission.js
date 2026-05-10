const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  classApplying: { type: String, required: true },
  parentName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date },
  previousSchool: { type: String },
  photo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);

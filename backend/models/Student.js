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
  examName: { type: String, default: '' },
  marks: [{
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, default: 100 }
  }],
  admissionNo: { type: String, default: '' },
  reportCard: {
    session: { type: String, default: '2026-2027' },
    examTitle: { type: String, default: 'HALF YEARLY EXAMINATION REPORT CARD' },
    examType: { type: String, default: 'Half Yearly Examination' },
    admissionNo: { type: String, default: '' },
    subjects: [{
      subject: { type: String, required: true },
      maxMarks: { type: Number, default: 80 },
      obtained: { type: Number, default: 0 },
      grade: { type: String, default: '' }
    }],
    totalMaxMarks: { type: Number, default: 640 },
    totalObtained: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    overallGrade: { type: String, default: '' },
    finalResult: { type: String, default: 'PASS' },
    coScholastic: [{
      trait: { type: String, required: true },
      grade: { type: String, default: 'A' }
    }],
    remarks: { type: String, default: '' },
    published: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
  },
  reportCards: [{
    examName: { type: String, default: 'Half Yearly Examination' },
    session: { type: String, default: '2026-2027' },
    examTitle: { type: String, default: 'HALF YEARLY EXAMINATION REPORT CARD' },
    examType: { type: String, default: 'Half Yearly Examination' },
    admissionNo: { type: String, default: '' },
    subjects: [{
      subject: { type: String, required: true },
      maxMarks: { type: Number, default: 80 },
      obtained: { type: Number, default: 0 },
      grade: { type: String, default: '' }
    }],
    totalMaxMarks: { type: Number, default: 640 },
    totalObtained: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    overallGrade: { type: String, default: '' },
    finalResult: { type: String, default: 'PASS' },
    coScholastic: [{
      trait: { type: String, required: true },
      grade: { type: String, default: 'A' }
    }],
    remarks: { type: String, default: '' },
    published: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
  }],
  examResults: [{
    examName: { type: String, required: true },
    marks: [{
      subject: { type: String, required: true },
      score: { type: Number, required: true },
      maxScore: { type: Number, default: 100 }
    }],
    result: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);

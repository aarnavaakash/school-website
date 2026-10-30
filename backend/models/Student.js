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
  udiseNo: { type: String, default: '10024104018' },
  registrationNo: { type: String, default: '2041041202669153433' },
  reportCard: {
    udiseNo: { type: String, default: '10024104018' },
    registrationNo: { type: String, default: '2041041202669153433' },
    session: { type: String, default: '2026-2027' },
    examTitle: { type: String, default: 'HALF YEARLY EXAMINATION REPORT CARD' },
    examType: { type: String, default: 'Half Yearly Examination' },
    examName: { type: String, default: 'Half Yearly Examination' },
    admissionNo: { type: String, default: '' },
    subjects: [{
      subject: { type: String, required: true },
      maxMarks: { type: mongoose.Schema.Types.Mixed, default: 80 },
      obtained: { type: mongoose.Schema.Types.Mixed, default: '' },
      grade: { type: String, default: '' }
    }],
    totalMaxMarks: { type: mongoose.Schema.Types.Mixed, default: 640 },
    totalObtained: { type: mongoose.Schema.Types.Mixed, default: '' },
    percentage: { type: mongoose.Schema.Types.Mixed, default: '' },
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
    udiseNo: { type: String, default: '10024104018' },
    registrationNo: { type: String, default: '2041041202669153433' },
    examName: { type: String, default: 'Half Yearly Examination' },
    session: { type: String, default: '2026-2027' },
    examTitle: { type: String, default: 'HALF YEARLY EXAMINATION REPORT CARD' },
    examType: { type: String, default: 'Half Yearly Examination' },
    admissionNo: { type: String, default: '' },
    subjects: [{
      subject: { type: String, required: true },
      maxMarks: { type: mongoose.Schema.Types.Mixed, default: 80 },
      obtained: { type: mongoose.Schema.Types.Mixed, default: '' },
      grade: { type: String, default: '' }
    }],
    totalMaxMarks: { type: mongoose.Schema.Types.Mixed, default: 640 },
    totalObtained: { type: mongoose.Schema.Types.Mixed, default: '' },
    percentage: { type: mongoose.Schema.Types.Mixed, default: '' },
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

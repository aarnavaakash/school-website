const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const calculateGrade = (score, maxScore) => {
  if (score === '' || score === null || score === undefined || isNaN(score)) return '-';
  const pct = (Number(score) / (Number(maxScore) || 100)) * 100;
  if (pct >= 90) return 'A1';
  if (pct >= 80) return 'A2';
  if (pct >= 70) return 'B1';
  if (pct >= 60) return 'B2';
  if (pct >= 50) return 'C1';
  if (pct >= 40) return 'C2';
  if (pct >= 33) return 'D';
  return 'E';
};

const isExamMatch = (examA, examB) => {
  if (!examA || !examB) return false;
  const a = String(examA).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const b = String(examB).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const isPt1 = (s) => s.includes('periodic1') || s.includes('periodictest1') || s.includes('pt1');
  const isPt2 = (s) => s.includes('periodic2') || s.includes('periodictest2') || s.includes('pt2');
  const isHalf = (s) => s.includes('halfyearly') || s.includes('halfyear') || s.includes('midterm');
  const isAnnual = (s) => s.includes('annual') || s.includes('final');
  if (isPt1(a) && isPt1(b)) return true;
  if (isPt2(a) && isPt2(b)) return true;
  if (isHalf(a) && isHalf(b)) return true;
  if (isAnnual(a) && isAnnual(b)) return true;
  return false;
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  let createdUser = null;
  try {
    const { name, class: studentClass, rollNumber, parentName, phone, email, address, dateOfBirth, admissionDate, photo, admissionNo } = req.body;
    
    // Validate required fields
    if (!name || (!studentClass && !req.body.class) || !rollNumber || !parentName || !phone || !email) {
      return res.status(400).json({ message: 'Name, Class, Roll Number, Parent Name, Phone, and Email are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanRoll = String(rollNumber).trim();
    const cleanClass = String(studentClass || req.body.class).trim();

    // Check duplicate roll number
    const existingRoll = await Student.findOne({ rollNumber: cleanRoll });
    if (existingRoll) {
      return res.status(400).json({ message: `A student with Roll Number "${cleanRoll}" already exists (${existingRoll.name}).` });
    }

    // Check duplicate student email
    const existingStudentEmail = await Student.findOne({ email: cleanEmail });
    if (existingStudentEmail) {
      return res.status(400).json({ message: `A student with Email "${cleanEmail}" already exists (${existingStudentEmail.name}).` });
    }

    // Check existing User account
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      // If user exists but no student is linked (orphaned user record), safely clean it up
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create User for student portal login (default password: student123)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student123', salt);
    createdUser = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'student'
    });

    // Create Student profile
    const studentData = {
      name: String(name).trim(),
      class: cleanClass,
      rollNumber: cleanRoll,
      parentName: String(parentName).trim(),
      phone: String(phone).trim(),
      email: cleanEmail,
      address: address ? String(address).trim() : '',
      admissionNo: admissionNo ? String(admissionNo).trim() : `HNP-${cleanRoll}`,
      udiseNo: '10024104018',
      registrationNo: '2041041202669153433'
    };

    if (dateOfBirth) studentData.dateOfBirth = dateOfBirth;
    if (admissionDate) studentData.admissionDate = admissionDate;

    if (req.file) {
      studentData.photo = req.file.path;
    } else if (photo && typeof photo === 'string' && photo !== '[object Object]') {
      studentData.photo = photo;
    }

    const student = await Student.create(studentData);
    return res.status(201).json(student);
  } catch (error) {
    // If student creation failed, rollback User creation so it doesn't leave orphan accounts
    if (createdUser && createdUser._id) {
      try {
        await User.deleteOne({ _id: createdUser._id });
      } catch (cleanupErr) {
        console.error('Error rolling back user:', cleanupErr);
      }
    }
    console.error('Create student error:', error);
    return res.status(error.code === 11000 ? 400 : 500).json({ 
      message: error.code === 11000 ? 'A student with this Roll Number or Email already exists.' : (error.message || 'Server error'),
      error: error.message 
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Check email uniqueness if email is changed
    if (req.body.email && req.body.email.trim().toLowerCase() !== student.email.toLowerCase()) {
      const newEmail = req.body.email.trim().toLowerCase();
      const existingStudent = await Student.findOne({ email: newEmail, _id: { $ne: req.params.id } });
      if (existingStudent) {
        return res.status(400).json({ message: `Another student already uses the email "${newEmail}".` });
      }
      await User.findOneAndUpdate({ email: student.email }, { email: newEmail, name: req.body.name ? req.body.name.trim() : student.name });
    } else if (req.body.name && req.body.name.trim() !== student.name) {
      await User.findOneAndUpdate({ email: student.email }, { name: req.body.name.trim() });
    }

    // Check rollNumber uniqueness if rollNumber is changed
    if (req.body.rollNumber && String(req.body.rollNumber).trim() !== String(student.rollNumber).trim()) {
      const newRoll = String(req.body.rollNumber).trim();
      const existingRoll = await Student.findOne({ rollNumber: newRoll, _id: { $ne: req.params.id } });
      if (existingRoll) {
        return res.status(400).json({ message: `Another student already uses Roll Number "${newRoll}".` });
      }
    }

    // Build top-level updates
    const updateFields = {
      udiseNo: '10024104018',
      registrationNo: '2041041202669153433'
    };

    if (req.body.name !== undefined) updateFields.name = String(req.body.name).trim();
    if (req.body.class !== undefined) updateFields.class = String(req.body.class).trim();
    if (req.body.rollNumber !== undefined) updateFields.rollNumber = String(req.body.rollNumber).trim();
    if (req.body.parentName !== undefined) updateFields.parentName = String(req.body.parentName).trim();
    if (req.body.phone !== undefined) updateFields.phone = String(req.body.phone).trim();
    if (req.body.email !== undefined) updateFields.email = String(req.body.email).trim().toLowerCase();
    if (req.body.address !== undefined) updateFields.address = String(req.body.address).trim();
    if (req.body.dateOfBirth !== undefined) updateFields.dateOfBirth = req.body.dateOfBirth;
    if (req.body.admissionDate !== undefined) updateFields.admissionDate = req.body.admissionDate;
    if (req.body.admissionNo !== undefined) updateFields.admissionNo = String(req.body.admissionNo).trim();

    if (req.file) {
      updateFields.photo = req.file.path;
    } else if (req.body.photo && typeof req.body.photo === 'string' && req.body.photo !== '[object Object]') {
      updateFields.photo = req.body.photo;
    }

    // Handle Report Card if a valid reportCard object was sent
    let reportCardData = req.body.reportCard;
    if (typeof reportCardData === 'string') {
      if (reportCardData === '[object Object]') {
        reportCardData = null; // discard corrupted string
      } else {
        try {
          reportCardData = JSON.parse(reportCardData);
        } catch (e) {
          reportCardData = null;
        }
      }
    }

    if (reportCardData && typeof reportCardData === 'object' && !Array.isArray(reportCardData) && (reportCardData.subjects || reportCardData.examType || reportCardData.examName)) {
      const examType = String(reportCardData.examType || reportCardData.examName || reportCardData.examTitle || 'Half Yearly Examination').trim();
      reportCardData.examType = examType;
      reportCardData.examName = examType;
      reportCardData.udiseNo = '10024104018';
      reportCardData.registrationNo = '2041041202669153433';
      reportCardData.session = reportCardData.session || '2026-2027';

      // Clean subjects: ensure subject name exists
      const rawSubjects = Array.isArray(reportCardData.subjects) ? reportCardData.subjects : [];
      const subjects = rawSubjects
        .filter(s => s && s.subject && String(s.subject).trim() !== '')
        .map(s => {
          const obt = (s.obtained !== '' && s.obtained !== null && s.obtained !== undefined && !isNaN(s.obtained))
            ? Number(s.obtained)
            : '';
          const maxM = Number(s.maxMarks) || 80;
          return {
            subject: String(s.subject).trim(),
            maxMarks: maxM,
            obtained: obt,
            grade: s.grade || (obt !== '' ? calculateGrade(obt, maxM) : '')
          };
        });
      reportCardData.subjects = subjects;

      const validMarks = subjects.filter(s => s.obtained !== '' && !isNaN(s.obtained));
      const hasAnyMarks = validMarks.length > 0;
      const totalMax = subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0) || Number(reportCardData.totalMaxMarks) || 640;
      const totalObt = hasAnyMarks ? validMarks.reduce((sum, s) => sum + Number(s.obtained), 0) : '';
      const pctNumber = hasAnyMarks && totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '';
      const pctString = hasAnyMarks ? `${pctNumber}%` : '';

      reportCardData.totalMaxMarks = totalMax;
      reportCardData.totalObtained = reportCardData.totalObtained !== undefined && reportCardData.totalObtained !== '' ? reportCardData.totalObtained : totalObt;
      reportCardData.percentage = reportCardData.percentage ? String(reportCardData.percentage) : pctString;
      reportCardData.overallGrade = reportCardData.overallGrade || (hasAnyMarks ? calculateGrade(totalObt, totalMax) : '-');
      reportCardData.finalResult = reportCardData.finalResult || (hasAnyMarks ? (Number(pctNumber) >= 33 ? 'PASS' : 'NEEDS IMPROVEMENT') : 'PASS');

      // Create marksArray for legacy marks and examResults
      const marksArray = subjects.map(s => ({
        subject: s.subject,
        score: s.obtained !== '' && !isNaN(s.obtained) ? Number(s.obtained) : 0,
        maxScore: Number(s.maxMarks) || 80
      }));

      // Update or add to reportCards array
      let existingReportCards = Array.isArray(student.reportCards) ? [...student.reportCards] : [];
      const existingIdx = existingReportCards.findIndex(rc => rc && (isExamMatch(rc.examType, examType) || isExamMatch(rc.examName, examType)));

      const updatedRcEntry = {
        ...reportCardData,
        updatedAt: new Date()
      };

      if (existingIdx >= 0) {
        existingReportCards[existingIdx] = updatedRcEntry;
      } else {
        existingReportCards.push(updatedRcEntry);
      }

      // Also update or add to examResults
      let existingExamResults = Array.isArray(student.examResults) ? [...student.examResults] : [];
      const examIdx = existingExamResults.findIndex(er => er && isExamMatch(er.examName, examType));
      const newExamResult = {
        examName: examType,
        marks: marksArray,
        result: reportCardData.finalResult || 'PASS',
        date: new Date()
      };
      if (examIdx >= 0) {
        existingExamResults[examIdx] = newExamResult;
      } else {
        existingExamResults.push(newExamResult);
      }

      updateFields.reportCards = existingReportCards;
      updateFields.reportCard = reportCardData;
      updateFields.examResults = existingExamResults;
      if (marksArray.length > 0) updateFields.marks = marksArray;
      updateFields.result = reportCardData.finalResult || student.result;
      updateFields.examName = examType;
      if (reportCardData.admissionNo) updateFields.admissionNo = reportCardData.admissionNo;
    }

    // Handle marks/exam save (if marks array and examName provided)
    if (req.body.marks && Array.isArray(req.body.marks) && req.body.examName) {
      const examType = String(req.body.examName).trim();
      const rawMarks = req.body.marks;
      const marksArray = rawMarks
        .filter(m => m && m.subject && String(m.subject).trim() !== '')
        .map(m => ({
          subject: String(m.subject).trim(),
          score: Number(m.score) || 0,
          maxScore: Number(m.maxScore) || 100
        }));

      const totalObt = marksArray.reduce((sum, m) => sum + m.score, 0);
      const totalMax = marksArray.reduce((sum, m) => sum + m.maxScore, 0);
      const pct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : 0;
      const pctStr = `${pct}%`;
      const resultStr = req.body.result || (Number(pct) >= 33 ? 'Pass' : 'Fail');

      // Update existing examResults
      let existingExamResults = Array.isArray(student.examResults) ? [...student.examResults] : [];
      const examIdx = existingExamResults.findIndex(er => er && isExamMatch(er.examName, examType));
      const examResult = {
        examName: examType,
        marks: marksArray,
        result: resultStr,
        date: new Date()
      };
      if (examIdx >= 0) {
        existingExamResults[examIdx] = examResult;
      } else {
        existingExamResults.push(examResult);
      }

      // Synchronize into reportCards
      let existingReportCards = Array.isArray(student.reportCards) ? [...student.reportCards] : [];
      const rcIdx = existingReportCards.findIndex(rc => rc && (isExamMatch(rc.examType, examType) || isExamMatch(rc.examName, examType)));
      const newRc = {
        session: student.reportCard?.session || '2026-2027',
        examTitle: examType.toUpperCase().includes('REPORT') ? examType.toUpperCase() : `${examType.toUpperCase()} REPORT CARD`,
        examType: examType,
        examName: examType,
        admissionNo: student.admissionNo || (student.rollNumber ? `HNP-${student.rollNumber}` : 'HNP-001'),
        subjects: marksArray.map(m => ({
          subject: m.subject,
          maxMarks: m.maxScore,
          obtained: m.score,
          grade: calculateGrade(m.score, m.maxScore)
        })),
        totalMaxMarks: totalMax,
        totalObtained: totalObt,
        percentage: pctStr,
        overallGrade: calculateGrade(totalObt, totalMax),
        finalResult: resultStr.toUpperCase(),
        coScholastic: student.reportCard?.coScholastic || [
          { trait: 'Discipline & Conduct', grade: 'A' },
          { trait: 'Attendance & Regularity', grade: 'A' },
          { trait: 'Cleanliness & Uniform', grade: 'A' },
          { trait: 'Co-Curricular Participation', grade: 'A' },
        ],
        remarks: student.reportCard?.remarks || 'Good academic performance and disciplined conduct.',
        published: true,
        updatedAt: new Date()
      };

      if (rcIdx >= 0) {
        existingReportCards[rcIdx] = { ...existingReportCards[rcIdx], ...newRc };
      } else {
        existingReportCards.push(newRc);
      }

      updateFields.marks = marksArray;
      updateFields.result = resultStr;
      updateFields.examName = examType;
      updateFields.examResults = existingExamResults;
      updateFields.reportCards = existingReportCards;
      updateFields.reportCard = newRc;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.json(updatedStudent);
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(error.code === 11000 ? 400 : 500).json({ 
      message: error.code === 11000 ? 'Another student already uses this Roll Number or Email.' : (error.message || 'Server error'),
      error: error.message 
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Delete linked User account
    if (student.email) {
      await User.deleteMany({ email: student.email.trim().toLowerCase() });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const student = await Student.findOne({ email: user.email.toLowerCase() }).lean();
        if (!student) return res.status(404).json({ message: "Student record not found" });

        // Calculate School Rank and Class Rank
        const allStudents = await Student.find().lean();
        
        // Calculate percentage for each student
        const studentsWithPercentage = allStudents.map(s => {
            let totalScore = 0;
            let totalMax = 0;
            if (s.marks && s.marks.length > 0) {
                s.marks.forEach(m => {
                    totalScore += Number(m.score);
                    totalMax += Number(m.maxScore);
                });
            }
            const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
            return { ...s, percentage };
        });

        // Sort by percentage descending
        studentsWithPercentage.sort((a, b) => b.percentage - a.percentage);

        // Find School Rank
        const schoolRank = studentsWithPercentage.findIndex(s => s._id.toString() === student._id.toString()) + 1;

        // Find Class Rank with flexible class matching
        const classGroups = {
          'Play Group': ['play group', 'playgroup', 'play', 'pg', 'p.g.', 'p.g'],
          'Nursery': ['nursery', 'nur', 'nursury'],
          'LKG': ['lkg', 'l.k.g.'],
          'UKG': ['ukg', 'u.k.g.'],
          'Class I': ['1', 'i', 'class i', 'class 1', 'std 1', 'std i'],
          'Class II': ['2', 'ii', 'class ii', 'class 2', 'std 2', 'std ii'],
          'Class III': ['3', 'iii', 'class iii', 'class 3', 'std 3', 'std iii'],
          'Class IV': ['4', 'iv', 'class iv', 'class 4', 'std 4', 'std iv'],
          'Class V': ['5', 'v', 'class v', 'class 5', 'std 5', 'std v'],
          'Class VI': ['6', 'vi', 'class vi', 'class 6', 'std 6', 'std vi'],
          'Class VII': ['7', 'vii', 'class vii', 'class 7', 'std 7', 'std vii'],
          'Class VIII': ['8', 'viii', 'class viii', 'class 8', 'std 8', 'std viii']
        };

        const isSameClass = (c1, c2) => {
          if (!c1 || !c2) return false;
          const s1 = String(c1).trim().toLowerCase();
          const s2 = String(c2).trim().toLowerCase();
          if (s1 === s2) return true;
          for (const [key, aliases] of Object.entries(classGroups)) {
            const keyClean = key.toLowerCase();
            const allVariants = [keyClean, ...aliases.map(a => a.toLowerCase())];
            if (allVariants.includes(s1) && allVariants.includes(s2)) return true;
          }
          return s1.includes(s2) || s2.includes(s1);
        };

        const classStudents = studentsWithPercentage.filter(s => isSameClass(s.class, student.class));
        const classRank = classStudents.findIndex(s => s._id.toString() === student._id.toString()) + 1;
        const classTopper = classStudents.length > 0 ? classStudents[0] : null;

        res.json({
            ...student,
            schoolRank,
            classRank,
            totalStudents: studentsWithPercentage.length,
            classTotalStudents: classStudents.length,
            classTopper
        });
    } catch(error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

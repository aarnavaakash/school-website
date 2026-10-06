const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, class: studentClass, rollNumber, parentName, phone, email, address, dateOfBirth, admissionDate, photo } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create User for login (default password: student123)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student123', salt);
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student'
    });

    // Create Student profile
    const studentData = {
      name, class: studentClass, rollNumber, parentName, phone, email, address, dateOfBirth, admissionDate
    };
    if (photo) {
      studentData.photo = photo;
    }
    if (req.file) {
      studentData.photo = req.file.path;
    }
    const student = await Student.create(studentData);
    
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    if (req.body.email && req.body.email !== student.email) {
      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) return res.status(400).json({ message: 'User with this email already exists' });
      await User.findOneAndUpdate({ email: student.email }, { email: req.body.email, name: req.body.name });
    } else if (req.body.name) {
      await User.findOneAndUpdate({ email: student.email }, { name: req.body.name });
    }

    // Check if this is a marks/exam save (has marks array and examName)
    if (req.body.marks && req.body.examName) {
      const examResult = {
        examName: req.body.examName,
        marks: req.body.marks,
        result: req.body.result || 'Pending',
        date: new Date()
      };

      // Push to examResults history AND update latest marks/result/examName
      const updatedStudent = await Student.findByIdAndUpdate(req.params.id, {
        $push: { examResults: examResult },
        $set: {
          marks: req.body.marks,
          result: req.body.result,
          examName: req.body.examName
        }
      }, { new: true });

      return res.json(updatedStudent);
    }

    // Regular profile update (no marks)
    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo = req.file.path;
    }
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      await User.findOneAndDelete({ email: student.email });
      await Student.findByIdAndDelete(req.params.id);
      res.json({ message: 'Student removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
    try {
        // Find the student record based on the user's email
        // We assume User.email matches Student.email
        const userEmail = req.user.email; // From authMiddleware if we set it, or fetch user first.
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        const student = await Student.findOne({ email: user.email }).lean();
        if(!student) return res.status(404).json({ message: "Student record not found" });

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
}

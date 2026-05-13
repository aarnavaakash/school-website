const Exam = require('../models/Exam');

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const classGroups = {
  'Play Group': ['play group', 'pg'],
  'Nursery': ['nursery', 'nur'],
  'LKG': ['lkg'],
  'UKG': ['ukg'],
  'Class I': ['1', 'i', 'class i', 'class 1'],
  'Class II': ['2', 'ii', 'class ii', 'class 2'],
  'Class III': ['3', 'iii', 'class iii', 'class 3'],
  'Class IV': ['4', 'iv', 'class iv', 'class 4'],
  'Class V': ['5', 'v', 'class v', 'class 5'],
  'Class VI': ['6', 'vi', 'class vi', 'class 6'],
  'Class VII': ['7', 'vii', 'class vii', 'class 7'],
  'Class VIII': ['8', 'viii', 'class viii', 'class 8']
};

const isClassMatch = (itemClass, targetClass) => {
  if (!itemClass || !targetClass) return false;
  if (itemClass === targetClass) return true;
  
  const itemLower = String(itemClass).toLowerCase();
  const targetLower = String(targetClass).toLowerCase();
  
  if (itemLower === targetLower) return true;

  // Check if targetClass is a key in classGroups and itemClass is in its values
  for (const [key, values] of Object.entries(classGroups)) {
    if (key === targetClass && values.includes(itemLower)) return true;
    if (key === itemClass && values.includes(targetLower)) return true;
    // Check if both are in the same group
    if (values.includes(itemLower) && values.includes(targetLower)) return true;
  }
  
  return false;
};

exports.getExamByClass = async (req, res) => {
  try {
    const targetClass = req.params.className;
    const allExams = await Exam.find().sort({ createdAt: -1 });
    
    // Find first exam that matches the class name flexibly
    const exam = allExams.find(e => isClassMatch(e.class, targetClass));

    if (exam) {
      res.json(exam);
    } else {
      res.status(404).json({ message: 'No exam routine found for this class' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrUpdateExam = async (req, res) => {
  const { examName, class: className, routine } = req.body;
  try {
    let exam = await Exam.findOne({ class: className });
    if (exam) {
      exam.examName = examName;
      exam.routine = routine;
      await exam.save();
    } else {
      exam = new Exam({ examName, class: className, routine });
      await exam.save();
    }
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam routine deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

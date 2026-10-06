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

const isClassMatch = (itemClass, targetClass) => {
  if (!itemClass || !targetClass) return false;

  const itemClean = String(itemClass).trim().toLowerCase();
  const targetClean = String(targetClass).trim().toLowerCase();

  if (itemClean === targetClean) return true;

  for (const [key, aliases] of Object.entries(classGroups)) {
    const keyClean = key.toLowerCase();
    const allVariants = [keyClean, ...aliases.map(a => a.toLowerCase())];
    
    if (allVariants.includes(itemClean) && allVariants.includes(targetClean)) {
      return true;
    }
  }
  
  return itemClean.includes(targetClean) || targetClean.includes(itemClean);
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

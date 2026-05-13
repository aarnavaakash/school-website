const express = require('express');
const router = express.Router();
const { getExams, getExamByClass, createOrUpdateExam, deleteExam } = require('../controllers/examController');

router.get('/', getExams);
router.get('/class/:className', getExamByClass);
router.post('/', createOrUpdateExam);
router.delete('/:id', deleteExam);

module.exports = router;
